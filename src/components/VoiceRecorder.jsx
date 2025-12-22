// src/components/VoiceRecorder.jsx
import React, { useRef, useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { getUserKey } from "../utils/userKey.js";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { usePro } from "../contexts/ProContext.jsx";

const FREE_DAILY_SPEAKING_LIMIT = 3;

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}_${mm}_${dd}`;
}

function getSpeakingAttemptsKey(userKey) {
  const day = getTodayKey();
  return `speaking_attempts_${day}_${userKey || "anon"}`;
}

function getDailyAttempts(userKey) {
  try {
    const k = getSpeakingAttemptsKey(userKey);
    const raw = localStorage.getItem(k);
    const n = Number(raw);
    // Clamp to 0-3 range
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, 3);
  } catch {
    return 0;
  }
}

function incrementDailyAttempts(userKey) {
  try {
    const k = getSpeakingAttemptsKey(userKey);
    const current = getDailyAttempts(userKey);
    const next = Math.min(current + 1, 3);
    localStorage.setItem(k, String(next));
    return next;
  } catch {
    return null;
  }
}

export default function VoiceRecorder({ onTranscript, onStateChange, onUpgradeNeeded }) {
  const { isPro } = usePro();
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [attemptsToday, setAttemptsToday] = useState(0);
  const hasIncrementedRef = useRef(false); // Prevent double increment per recording

  // Load attempts on mount and when userKey changes
  useEffect(() => {
    const userKey = getUserKey();
    const attempts = getDailyAttempts(userKey);
    setAttemptsToday(attempts);
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ recording, transcribing });
    }
  }, [recording, transcribing, onStateChange]);

  const startRecording = async () => {
    setError("");
    setPermissionDenied(false);
    chunksRef.current = [];
    hasIncrementedRef.current = false; // Reset increment flag for new recording

    // Check daily limit BEFORE starting recording (only for non-Pro users)
    if (!isPro) {
      const userKey = getUserKey();
      const attempts = getDailyAttempts(userKey);
      setAttemptsToday(attempts);
      
      // Block if attemptsToday >= 3 (this is attempt #4)
      if (attempts >= 3) {
        setError("You've used your 3 free attempts today. Upgrade to Pro for unlimited practice.");
        if (onUpgradeNeeded) {
          onUpgradeNeeded();
        }
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Choose mimeType in priority order
      let mimeType = null;
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }
      // Otherwise fallback with no mimeType (mimeType remains null)
      
      mimeTypeRef.current = mimeType;
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          setTranscribing(true);
          const mimeType = mimeTypeRef.current || mediaRecorder.mimeType || "audio/webm";
          const audioBlob = new Blob(chunksRef.current, {
            type: mimeType,
          });

          // Determine file extension based on mimeType
          let fileName = "audio.webm"; // default fallback
          if (mimeType && mimeType.includes("webm")) {
            fileName = "audio.webm";
          } else if (mimeType && mimeType.includes("ogg")) {
            fileName = "audio.ogg";
          }

          const audioFile = new File([audioBlob], fileName, { type: mimeType });

          console.log({ mimeType, fileName, fileType: audioFile.type, fileSize: audioFile.size });

          const userKey = getUserKey();
          const formData = new FormData();
          formData.append("audio", audioFile);
          formData.append("userKey", userKey);

          try {
            const endpoint = "/api/stt";
            console.log("STT endpoint:", endpoint);
            // Use relative path - Vercel proxy handles routing
            const response = await apiClient(endpoint, {
              method: "POST",
              body: formData,
              parseJson: false, // Get raw response to safely handle non-JSON responses
            });

            // Check response status first
            const status = response.status;

            // Safely parse response - don't assume it's always JSON
            let data = null;
            const contentType = response.headers.get("content-type") || "";
            
            if (contentType.includes("application/json")) {
              try {
                data = await response.json();
              } catch (parseErr) {
                console.error("[STT] Failed to parse JSON response:", parseErr);
                setError("Invalid response from server. Please try again.");
                return;
              }
            } else {
              // If not JSON, try to parse as text or handle gracefully
              const text = await response.text().catch(() => "");
              console.warn("[STT] Non-JSON response received:", text);
              setError("Unexpected response format. Please try again.");
              return;
            }

            // Safely extract transcript - never call .trim() on undefined
            let transcript = "";
            if (data && typeof data === "object") {
              if (typeof data.transcript === "string" && data.transcript.length > 0) {
                transcript = data.transcript.trim();
              } else if (typeof data.text === "string" && data.text.length > 0) {
                transcript = data.text.trim();
              }
            }

            // Return empty string if transcript is missing or empty (don't crash)
            if (!transcript) {
              setError("No speech detected. Please try again.");
              return;
            }

            // Only increment attempts when STT returns 200 AND transcript exists (non-empty string)
            // Also prevent double increment per single recording
            if (!isPro && status === 200 && transcript && !hasIncrementedRef.current) {
              const userKey = getUserKey();
              const nextAttempts = incrementDailyAttempts(userKey);
              setAttemptsToday(nextAttempts || 0);
              hasIncrementedRef.current = true; // Mark as incremented to prevent double increment
              console.log(`[STT] free daily speaking attempts: ${nextAttempts}/${FREE_DAILY_SPEAKING_LIMIT}`);
            }

            trackEvent("stt_success", { textLength: transcript.length });
            onTranscript(transcript);
          } catch (err) {
            if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true && onUpgradeNeeded) {
              onUpgradeNeeded();
              return;
            }
            trackEvent("stt_fail", { error: err.data?.error || err.message || "Transcription failed" });
            throw new Error(err.data?.error || err.message || "Transcription failed");
          }
        } catch (err) {
          if (isNetworkError(err)) {
            setError("We're temporarily unavailable. Give us a moment and try again.");
          } else {
            setError(err.message);
          }
          if (!err.message.includes("Transcription failed") && !isNetworkError(err)) {
            trackEvent("stt_fail", { error: err.message });
          }
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      trackEvent("start_recording");
    } catch (err) {
      console.error("Microphone access error:", err);
      setPermissionDenied(true);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Allow microphone access in your browser settings");
      } else {
        setError("We need microphone access to record. Check your browser settings.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      trackEvent("stop_recording");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={transcribing}
            className="flex items-center justify-center h-12 w-12 rounded-full shadow-sm border bg-white border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            title="Start recording"
          >
            <span className="material-icons-outlined text-xl">mic</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            disabled={transcribing}
            className="flex items-center justify-center h-12 w-12 rounded-full shadow-sm border bg-rose-500 border-rose-500 text-white animate-pulse disabled:opacity-60 disabled:cursor-not-allowed transition"
            title="Stop recording"
            aria-label="Stop recording"
          >
            <span className="material-icons-outlined text-xl">stop</span>
          </button>
        )}
        
        {/* Recording indicator - always visible when recording */}
        {recording && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-100 border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[10px] text-rose-700 font-semibold">Recording…</span>
          </div>
        )}
      </div>

      {transcribing && (
        <p className="text-[10px] text-slate-600 font-medium">Transcribing...</p>
      )}
      
      {/* Free attempts label - only show for non-Pro users */}
      {!isPro && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-700">
            <span className="font-semibold">Free attempts today:</span>{" "}
            <span className="text-rose-600 font-bold">{attemptsToday}/3</span>
          </p>
        </div>
      )}
      
      {error && (
        <div className="max-w-[140px] text-center">
          <p className="text-[10px] text-rose-600 font-medium mb-1">{error}</p>
          {permissionDenied && (
            <p className="text-[9px] text-rose-500">
              Tap the lock icon in your browser address bar to allow microphone access
            </p>
          )}
        </div>
      )}
    </div>
  );
}

