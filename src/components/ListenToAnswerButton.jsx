// jobspeak-frontend/src/components/ListenToAnswerButton.jsx

import React, { useState, useRef, useEffect } from "react";
import { getUserKey } from "../utils/userKey.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { isNetworkError } from "../utils/networkError.js";

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Best-effort "pro" detection without touching other files.
// If any of these flags exist, we treat user as Pro and skip the daily limit.
function isProbablyPro() {
  try {
    const plan =
      (localStorage.getItem("plan") || "").toLowerCase().trim() ||
      (localStorage.getItem("jobspeak_plan") || "").toLowerCase().trim();

    const proFlags = [
      localStorage.getItem("isPro"),
      localStorage.getItem("jobspeak_is_pro"),
      localStorage.getItem("pro"),
      localStorage.getItem("jobspeak_pro"),
      localStorage.getItem("paid"),
      localStorage.getItem("jobspeak_paid"),
    ]
      .map((v) => (typeof v === "string" ? v.toLowerCase().trim() : ""))
      .filter(Boolean);

    if (plan === "pro" || plan === "annual" || plan === "premium") return true;
    if (proFlags.includes("true") || proFlags.includes("1") || proFlags.includes("yes")) return true;

    return false;
  } catch {
    return false;
  }
}

function getSpeakingAttemptsKey(userKey) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `speaking_attempts_${yyyy}_${mm}_${dd}_${userKey || "anon"}`;
}

function getDailySpeakingAttempts(userKey) {
  try {
    const k = getSpeakingAttemptsKey(userKey);
    const raw = localStorage.getItem(k);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function incrementDailySpeakingAttempts(userKey) {
  try {
    const k = getSpeakingAttemptsKey(userKey);
    const current = getDailySpeakingAttempts(userKey);
    localStorage.setItem(k, String(current + 1));
    return current + 1;
  } catch {
    return null;
  }
}

// Export increment function to be called after successful STT response
// Should be called when: HTTP 200 and transcript string length > 0
export { incrementDailySpeakingAttempts, getDailySpeakingAttempts };

export default function ListenToAnswerButton({ improvedText, onUpgradeNeeded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsToday, setAttemptsToday] = useState(0);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Load attempts on mount and when userKey might change
  useEffect(() => {
    const userKey = getUserKey();
    const attempts = getDailySpeakingAttempts(userKey);
    setAttemptsToday(attempts);
  }, []);

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
    
    // Determine the text to speak
    const textToSpeak = improvedText || "";

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

    const userKey = getUserKey();
    const pro = isProbablyPro();

    // Check speaking limit BEFORE starting request (only for non-Pro users)
    if (!pro) {
      const attempts = getDailySpeakingAttempts(userKey);
      setAttemptsToday(attempts);
      
      // Block if attemptsToday >= 3 (this is attempt #4)
      if (attempts >= 3) {
        setError("You've used today's free practice (3/3). Upgrade to Pro for unlimited practice.");
        if (typeof onUpgradeNeeded === "function") {
          onUpgradeNeeded();
        }
        return;
      }
    }

    setIsLoading(true);
    setError("");

    // Always call the backend endpoint
    const endpoint = "/voice/generate";
    console.log("[TTS] endpoint", endpoint);

    try {
      const res = await apiClient(endpoint, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg, application/json",
        },
        body: {
          text: textToSpeak,
          userKey,
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
        onUpgradeNeeded();
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

  const userKey = getUserKey();
  const pro = isProbablyPro();
  const attempts = pro ? 0 : attemptsToday;

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

      {!pro && (
        <p className="text-xs text-gray-600">
          Free attempts today: {attempts}/3
        </p>
      )}

      {error && <p className="text-xs text-gray-600 max-w-md">{error}</p>}
    </div>
  );
}
