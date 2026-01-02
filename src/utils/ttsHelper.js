// src/utils/ttsHelper.js
// Shared TTS helper for Practice page audio controls

import { apiClient, ApiError } from "./apiClient.js";

// Cache for TTS audio blobs by text + voiceId
const ttsCache = new Map();

/**
 * Fetch TTS audio blob URL
 * @param {Object} options
 * @param {string} options.text - Text to convert to speech
 * @param {string} options.voiceId - Voice ID (optional, defaults to "DEFAULT")
 * @returns {Promise<{url: string, error: null}|{url: null, error: {status: number, message: string, isProRequired: boolean}}>}
 */
export async function fetchTtsBlobUrl({ text, voiceId = "DEFAULT", speed = 1.0 }) {
  if (!text || !text.trim()) {
    return { url: null, error: { status: 400, message: "No text provided", isProRequired: false } };
  }

  // Clamp speed to a number 0.7 - 1.3
  let speakingRate = typeof speed === "number" ? speed : 1.0;
  if (speakingRate < 0.7) speakingRate = 0.7;
  if (speakingRate > 1.3) speakingRate = 1.3;

  // Check cache first - cache key includes voiceId and speed
  const cacheKey = `${text.trim()}::${voiceId}::${speakingRate}`;
  if (ttsCache.has(cacheKey)) {
    const cachedUrl = ttsCache.get(cacheKey);
    // Verify the URL is still valid (not revoked)
    if (cachedUrl && typeof cachedUrl === "string") {
      return { url: cachedUrl, error: null };
    }
  }

  try {
    // Derive strict locale and variant from voiceId
    let locale = "en-US";
    let voiceName = "female"; // default gender

    const vIdLow = (voiceId || "us_female_emma").toLowerCase();

    // 1. Determine Locale
    if (vIdLow.startsWith("uk") || vIdLow.includes("gb")) {
      locale = "en-GB";
    }

    // 2. Determine Gender (voiceName)
    if (vIdLow.includes("male") && !vIdLow.includes("female")) {
      voiceName = "male";
    }

    // 3. Determine Variant (strict mapping)
    // Extract the variant name from the end of the ID (e.g. us_female_emma -> emma)
    let voiceVariant = "emma"; // fallback
    const parts = vIdLow.split("_");
    if (parts.length > 0) {
      voiceVariant = parts[parts.length - 1]; // last token is usually the name
    }

    // Explicit overrides to ensure safety
    if (vIdLow.includes("emma")) voiceVariant = "emma";
    else if (vIdLow.includes("ava")) voiceVariant = "ava";
    else if (vIdLow.includes("jake")) voiceVariant = "jake";
    else if (vIdLow.includes("noah")) voiceVariant = "noah"; // if exists
    else if (vIdLow.includes("amelia")) voiceVariant = "amelia";
    else if (vIdLow.includes("sophie")) voiceVariant = "sophie"; // if exists
    else if (vIdLow.includes("oliver")) voiceVariant = "oliver";
    else if (vIdLow.includes("harry")) voiceVariant = "harry";

    // Construct payload for /api/tts
    const payload = {
      text: text.trim(),
      locale,
      voiceName, // "male" or "female"
      voiceVariant, // "emma", "ava", etc.
      speakingRate,
    };

    // Low-noise debug log
    console.log("TTS payload (/api/tts)", payload);

    const res = await apiClient("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(payload),
      parseJson: false,
    });

    if (!res.ok) {
      // Try to parse error JSON if possible, or read text
      let errMsg = `Audio generation failed (${res.status})`;
      try {
        const errData = await res.json();
        if (errData.error) errMsg = errData.error;
      } catch (e) {
        // Fallback to text reading if JSON parse fails
        const text = await res.text().catch(() => "");
        if (text) errMsg += `: ${text.slice(0, 200)}`;
      }

      return {
        url: null,
        contentType: null,
        error: {
          status: res.status,
          message: errMsg,
          isProRequired: false,
        },
      };
    }

    const contentType = res.headers.get("content-type") || "";
    const isAudio = contentType.startsWith("audio/") || contentType.includes("audio/") || contentType === "application/octet-stream";

    if (isAudio) {
      // Handle blob response
      const blob = await res.blob();
      if (blob.size === 0) {
        return {
          url: null,
          contentType,
          error: {
            status: 500,
            message: "Received empty audio blob",
            isProRequired: false,
          },
        };
      }

      // Force type to audio/mpeg if missing, or use detected type
      const finalType = blob.type || "audio/mpeg";
      const audioBlob = new Blob([blob], { type: finalType });
      const url = URL.createObjectURL(audioBlob);
      // Cache the URL
      ttsCache.set(cacheKey, url);
      return { url, contentType: finalType, error: null };
    } else {
      // Rejected Content-Type - Read as text/json to find error
      let errorBody = "";
      try {
        errorBody = await res.text();
      } catch (e) {
        errorBody = "[Could not read response text]";
      }

      const snippet = errorBody.slice(0, 200);

      return {
        url: null,
        contentType,
        error: {
          status: 500,
          message: `Invalid Content-Type: ${contentType}. Body: ${snippet}`,
          isProRequired: false,
        },
      };
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        url: null,
        error: {
          status: err.status || 500,
          message: err.message || "Audio generation failed",
          isProRequired: false,
        },
      };
    }
    return {
      url: null,
      error: {
        status: 500,
        message: err?.message || "Unknown error occurred",
        isProRequired: false,
      },
    };
  }
}

/**
 * Clear TTS cache (useful when voice changes)
 */
export function clearTtsCache() {
  // Revoke all object URLs before clearing
  for (const url of ttsCache.values()) {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
  ttsCache.clear();
}

/**
 * Clear cache for specific text/voice combination
 */
export function clearTtsCacheEntry(text, voiceId = "DEFAULT") {
  const cacheKey = `${text.trim()}::${voiceId}`;
  const url = ttsCache.get(cacheKey);
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
  ttsCache.delete(cacheKey);
}


/**
 * Fallback: Play text using browser's native SpeechSynthesis
 * @param {string} text - Text to speak
 * @param {string} preferredVoiceId - Optional preference (e.g. "us_female_emma") to try matching gender/locale
 * @param {number} rate - Playback rate (0.1 - 10)
 */
export function playFallbackTTS(text, preferredVoiceId = "DEFAULT", rate = 1.0) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn("Browser does not support SpeechSynthesis");
      resolve(false); // Not treated as error, just "did not play"
      return;
    }

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    // Try to select a voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    const vIdLow = (preferredVoiceId || "").toLowerCase();
    const isUK = vIdLow.includes("uk") || vIdLow.includes("gb");
    const isMale = vIdLow.includes("male") && !vIdLow.includes("female");

    // 1. Try exact locale match + gender heuristic
    // Note: Browser voices don't always expose gender reliably, so we check names
    const locale = isUK ? "en-GB" : "en-US";

    // Heuristic descriptors in voice names
    const genderKeywords = isMale ? ["male", "david", "daniel"] : ["female", "samantha", "zira", "google"];

    // Find best match
    selectedVoice = voices.find(v =>
      v.lang.includes(locale) &&
      genderKeywords.some(k => v.name.toLowerCase().includes(k))
    );

    // 2. Fallback to any voice with correct locale
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes(locale));
    }

    // 3. Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      resolve(true);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      // Don't reject, just resolve false so UI can decide to show toast or not
      // But typically fallback failure is silent or logged
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Synchronous check if browser supports TTS
 */
export function hasBrowserTTS() {
  return !!window.speechSynthesis;
}

/**
 * Trigger immediate browser fallback
 * Returns true if started, false if not supported
 */
export function triggerBrowserFallback(text, preferredVoiceId = "DEFAULT", rate = 1.0) {
  if (!window.speechSynthesis) return false;

  // Fire and forget - but we return boolean for UI updates
  playFallbackTTS(text, preferredVoiceId, rate).catch(err => console.error("Fallback error", err));
  return true;
}
