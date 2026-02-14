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
      voiceId, // Critical: Pass the exact voice ID to backend
      locale,
      voiceName, // "male" or "female"
      voiceVariant, // "emma", "ava", etc.
      speakingRate,
    };

    // Low-noise debug log
    console.log("[TTS Debug] Payload:", payload);

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
    const isJson = contentType.includes("application/json") || contentType.includes("json");

    // Handle JSON response (production format: {audioUrl: "data:audio/mpeg;base64..."})
    if (isJson) {
      try {
        const jsonData = await res.json();

        // Check if response contains audioUrl field
        if (jsonData.audioUrl) {
          console.log("[TTS Debug] Response:", jsonData);
          console.log("[TTS Debug] Resolved audioUrl:", jsonData.audioUrl);
          // Cache the data URI directly
          ttsCache.set(cacheKey, jsonData.audioUrl);
          return { url: jsonData.audioUrl, contentType: "audio/mpeg", error: null };
        }

        // If no audioUrl, treat as error
        return {
          url: null,
          contentType,
          error: {
            status: 500,
            message: `JSON response missing audioUrl field. Keys: ${Object.keys(jsonData).join(", ")}`,
            isProRequired: false,
          },
        };
      } catch (e) {
        return {
          url: null,
          contentType,
          error: {
            status: 500,
            message: `Failed to parse JSON response: ${e.message}`,
            isProRequired: false,
          },
        };
      }
    }

    if (isAudio) {
      // Handle blob response (local/dev format)
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


// Fallback functions are strictly disabled per requirements.
export function playFallbackTTS() {
  console.warn("Browser TTS fallback is disabled.");
  return Promise.resolve(false);
}

export function hasBrowserTTS() {
  return false;
}

export function triggerBrowserFallback() {
  console.warn("Browser TTS fallback is disabled.");
  return false;
}
