// jobspeak-frontend/src/components/ListenToAnswerButton.jsx

import React, { useState, useRef } from "react";
import { getUserKey } from "../utils/userKey.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { isNetworkError } from "../utils/networkError.js";

export default function ListenToAnswerButton({ improvedText, onUpgradeNeeded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  const handleClick = async () => {
    if (!improvedText || !improvedText.trim()) {
      setError("Improve your answer first, then you can listen to it.");
      return;
    }

    // stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    setError("");

    try {
      const userKey = getUserKey();
      const res = await apiClient("/voice/generate", {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
        },
        body: {
          text: improvedText,
          improvedAnswer: improvedText,
          userKey,
        },
        parseJson: false, // Need blob response
      });

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play().catch((err) => {
        console.error("Audio play error:", err);
        setError(
          "Tap the button again to play, or read the answer aloud to practice."
        );
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true && onUpgradeNeeded) {
        onUpgradeNeeded();
        return;
      }
      console.error("Voice error:", err);
      if (isNetworkError(err)) {
        setError("We're temporarily unavailable. Give us a moment and try again.");
      } else {
        setError(
          "Audio isn't ready yet. Check your connection and try again."
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

      {error && <p className="text-xs text-gray-600 max-w-md">{error}</p>}
    </div>
  );
}

