// jobspeak-frontend/src/components/ListenToAnswerButton.jsx

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
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

const ListenToAnswerButton = forwardRef(function ListenToAnswerButton({ improvedText, onUpgradeNeeded }, ref) {
  const { isPro } = usePro();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3, blocked: false });
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Load usage from backend on mount
  useEffect(() => {
    if (!isPro) {
      fetchUsage().then(setUsage);
    }
  }, [isPro]);

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
      // no-op or log
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
    setShowToast(false);

    // Always call the backend endpoint
    const endpoint = "/voice/generate";
    console.log("[TTS] endpoint", endpoint);
    // apiClient automatically includes 'x-user-key' header for all requests

    try {
      const res = await apiClient(endpoint, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg, application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSpeak.trim(),
          voiceId: "uk_female_amelia", // Default to UK Female (Amelia)
          speed: 1.0,
        }),
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
          setShowToast(true);
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
          setShowToast(true);
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
        setShowToast(true);
      } else if (err instanceof ApiError) {
        setShowToast(true);
      } else {
        setShowToast(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Expose handleClick method via ref
  useImperativeHandle(ref, () => ({
    play: handleClick,
  }));

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all ${isLoading
          ? "bg-slate-300 text-slate-700 cursor-not-allowed"
          : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
          }`}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Preparing audio…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343l-.707-.707m13.728 0l-.707.707M6.343 17.657l-.707.707m13.728 0l-.707-.707M5 12h.01M19 12h.01M12 5v.01M12 19v.01" />
            </svg>
            <span>Listen to this answer</span>
          </>
        )}
      </button>

      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">volume_off</span>
            <div>
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Audio unavailable right now</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ListenToAnswerButton;
