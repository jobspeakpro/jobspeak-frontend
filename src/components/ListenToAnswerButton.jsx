// jobspeak-frontend/src/components/ListenToAnswerButton.jsx

import React, { useState, useRef, useEffect } from "react";
import { getUserKey } from "../utils/userKey.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { isNetworkError } from "../utils/networkError.js";
import { usePro } from "../contexts/ProContext.jsx";
import { isBlocked } from "../utils/usage.js";

// Fetch usage from backend API
async function fetchUsage() {
  try {
    const data = await apiClient(`/api/usage/today`);
    // Backend returns standardized format: { usage: { used, limit, remaining, blocked } }
    if (data.usage) {
      return {
        used: data.usage.used || 0,
        limit: data.usage.limit === -1 ? Infinity : data.usage.limit || 3,
        remaining: data.usage.remaining === -1 ? Infinity : data.usage.remaining || 0,
        blocked: data.usage.blocked || false,
      };
    }
    // Fallback for backward compatibility
    return { used: 0, limit: 3, remaining: 3, blocked: false };
  } catch (err) {
    console.error("Error fetching usage:", err);
    return { used: 0, limit: 3, remaining: 3, blocked: false };
  }
}

export default function ListenToAnswerButton({ improvedText, onUpgradeNeeded }) {
  const { isPro } = usePro();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3, blocked: false });
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Load usage from backend on mount
  useEffect(() => {
    if (!isPro) {
      fetchUsage().then(setUsage);
    }
  }, [isPro]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const handleClick = async () => {
    console.log("[TTS] CLICKED");
    
    // Check usage FIRST - if blocked, open paywall modal and return early (do NOT make API call)
    if (!isPro) {
      // Refresh usage from backend
      const currentUsage = await fetchUsage();
      setUsage(currentUsage);
      
      // Block if usage is blocked or remaining <= 0
      if (isBlocked(currentUsage)) {
        if (typeof onUpgradeNeeded === "function") {
          // Gate at handler level: always open paywall when limit reached
          onUpgradeNeeded("listen");
        }
        return; // Return early - do NOT make API call
      }
    }

    // Determine the text to speak
    const textToSpeak = improvedText || "";

    // Validate that text is non-empty before making request
    if (!textToSpeak || textToSpeak.trim().length === 0) {
      setError("No text available to generate audio. Please generate an answer first.");
      return;
    }

    // stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Clean up previous object URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setIsLoading(true);
    setError("");

    // Always call the backend endpoint
    const endpoint = "/voice/generate";
    console.log("[TTS] endpoint", endpoint);
    // apiClient automatically includes 'x-user-key' header for all requests
    // Do NOT send 'x-attempt-id' on voice/generate (only STT uses it)

    try {
      const res = await apiClient(endpoint, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg, application/json",
          // x-user-key is automatically added by apiClient
          // x-attempt-id is NOT sent (only for STT)
        },
        body: {
          text: textToSpeak.trim(), // Ensure non-empty text field
        },
        parseJson: false, // Get raw response to check content type
      });

      const contentType = res.headers.get("content-type") || "";
      console.log("[TTS] status", res.status);
      console.log("[TTS] content-type", contentType);

      // Only proceed if status is 200
      if (res.status !== 200) {
        throw new Error(`Unexpected status: ${res.status}`);
      }

      // Handle BOTH response types
      if (contentType.startsWith("audio/")) {
        // A) If Content-Type starts with audio/ → treat as blob, create object URL, play
        const blob = await res.blob();
        console.log(`[TTS] blob size: ${blob.size} bytes`);

        if (blob.size === 0) {
          throw new Error("Received empty audio blob");
        }

        const audioUrl = URL.createObjectURL(blob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Revoke object URL after playback ends
        audio.addEventListener("ended", () => {
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        });

        audio.play().catch((err) => {
          console.error("[TTS] Audio play error:", err);
          setError("Tap the button again to play, or read the answer aloud to practice.");
        });
      } else {
        // B) Else parse JSON and support audioUrl, url, or audio (base64)
        const data = await res.json();
        console.log("[TTS] Received JSON response:", data);

        let audioUrl = null;
        let blobToPlay = null;

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
          blobToPlay = new Blob([bytes], { type: "audio/mpeg" });
          audioUrl = URL.createObjectURL(blobToPlay);
          audioUrlRef.current = audioUrl;
        } else {
          throw new Error("No audio data found in JSON response");
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Revoke object URL after playback ends (if we created one)
        if (blobToPlay) {
          audio.addEventListener("ended", () => {
            if (audioUrlRef.current) {
              URL.revokeObjectURL(audioUrlRef.current);
              audioUrlRef.current = null;
            }
          });
        }

        audio.play().catch((err) => {
          console.error("[TTS] Audio play error:", err);
          setError("Tap the button again to play, or read the answer aloud to practice.");
        });
      }
    } catch (err) {
      // Log detailed error information
      console.error("[TTS] Request failed:", {
        endpoint,
        error: err,
        status: err instanceof ApiError ? err.status : null,
        message: err?.message,
        data: err instanceof ApiError ? err.data : null,
      });

      // Step 3: upgrade flow from backend (402 + upgrade flag)
      if (
        err instanceof ApiError &&
        err.status === 402 &&
        err.data?.upgrade === true &&
        typeof onUpgradeNeeded === "function"
      ) {
        onUpgradeNeeded("listen");
        return;
      }

      if (isNetworkError(err)) {
        setError("We're temporarily unavailable. Give us a moment and try again.");
      } else if (err instanceof ApiError) {
        const status = err.status;
        const errorMsg = err.data?.error || err.message || "Unknown error";
        console.error(`[TTS] HTTP ${status} error:`, errorMsg);
        setError(`Audio generation failed (${status}). ${errorMsg}`);
      } else {
        setError(
          `Audio generation failed: ${err?.message || "Unknown error"}. Check your connection and try again.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm ${
          isLoading
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Preparing audio…</span>
          </>
        ) : (
          <>
            <span role="img" aria-label="speaker">
              🔊
            </span>
            <span>Listen to this answer</span>
          </>
        )}
      </button>

      {!isPro && (
        <p className="text-xs text-gray-600">
          Free attempts today: {usage.used}/{usage.limit === Infinity ? "∞" : usage.limit}
        </p>
      )}

      {error && <p className="text-xs text-gray-600 max-w-md">{error}</p>}
    </div>
  );
}
