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
export async function fetchTtsBlobUrl({ text, voiceId = "DEFAULT" }) {
  if (!text || !text.trim()) {
    return { url: null, error: { status: 400, message: "No text provided", isProRequired: false } };
  }

  // Check cache first - cache key includes voiceId
  const cacheKey = `${text.trim()}::${voiceId}`;
  if (ttsCache.has(cacheKey)) {
    const cachedUrl = ttsCache.get(cacheKey);
    // Verify the URL is still valid (not revoked)
    if (cachedUrl && typeof cachedUrl === "string") {
      return { url: cachedUrl, error: null };
    }
  }

  try {
    // Always include voiceId in payload
    const payload = {
      text: text.trim(),
      voiceId: voiceId,
    };

    const res = await apiClient("/voice/generate", {
      method: "POST",
      headers: {
        Accept: "audio/mpeg, application/json",
      },
      body: payload,
      parseJson: false, // Get raw response to handle blob
    });

    // Handle 402 (Payment Required) - treat as regular error
    if (res.status === 402) {
      return {
        url: null,
        error: {
          status: 402,
          message: "Audio generation failed. Please try again.",
          isProRequired: false,
        },
      };
    }

    if (!res.ok) {
      return {
        url: null,
        error: {
          status: res.status,
          message: `Audio generation failed (${res.status})`,
          isProRequired: false,
        },
      };
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.startsWith("audio/")) {
      // Handle blob response
      const blob = await res.blob();
      if (blob.size === 0) {
        return {
          url: null,
          error: {
            status: 500,
            message: "Received empty audio blob",
            isProRequired: false,
          },
        };
      }

      const url = URL.createObjectURL(blob);
      // Cache the URL
      ttsCache.set(cacheKey, url);
      return { url, error: null };
    } else {
      // Handle JSON response with audioUrl or base64 audio
      const data = await res.json();
      let audioUrl = null;

      if (data.audioUrl) {
        audioUrl = data.audioUrl;
      } else if (data.url) {
        audioUrl = data.url;
      } else if (data.audio) {
        // Base64 audio data - convert to Blob
        const base64Data = data.audio.replace(/^data:audio\/[^;]+;base64,/, "");
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        audioUrl = URL.createObjectURL(blob);
      } else {
        return {
          url: null,
          error: {
            status: 500,
            message: "No audio data found in response",
            isProRequired: false,
          },
        };
      }

      // Cache the URL (for blob URLs only, not external URLs)
      if (audioUrl.startsWith("blob:")) {
        ttsCache.set(cacheKey, audioUrl);
      }
      return { url: audioUrl, error: null };
    }
  } catch (err) {
    // Handle ApiError with 402 status
    if (err instanceof ApiError && err.status === 402) {
      return {
        url: null,
        error: {
          status: 402,
          message: "Audio generation failed. Please try again.",
          isProRequired: false,
        },
      };
    }

    // Handle network errors
    if (err instanceof ApiError) {
      return {
        url: null,
        error: {
          status: err.status || 500,
          message: err.message || "Audio generation failed",
          isProRequired: err.status === 402,
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

