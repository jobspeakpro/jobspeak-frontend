// src/components/VoiceRecorder.jsx
import React, { useRef, useState, useEffect } from "react";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { usePro } from "../contexts/ProContext.jsx";
import { getUserKey } from "../utils/userKey.js";
import { gaEvent } from "../utils/ga.js";

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

export default function VoiceRecorder({ onTranscript, onStateChange, onUpgradeNeeded, onAttemptsRefresh, renderButton }) {
  const { isPro } = usePro();
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef(null);
  const attemptIdRef = useRef(null); // Store attemptId for the current recording
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3, blocked: false });
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60); // Default 60s limit
  const timerRef = useRef(null);
  const maxDuration = 60; // Hard limit in seconds

  // Load usage from backend on mount
  useEffect(() => {
    const loadUsage = async () => {
      const currentUsage = await fetchUsage();
      setUsage(currentUsage);
    };
    if (!isPro) {
      loadUsage();
    }
  }, [isPro]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ recording, transcribing });
    }
  }, [recording, transcribing, onStateChange]);

  const startRecording = async () => {
    // Usage check REMOVED: Frontend paywall must NEVER gate based on STT usage.
    // Gating is now controlled solely by practiceQuestionsUsed in the parent component.

    setError("");
    setPermissionDenied(false);
    chunksRef.current = [];

    // Reset timer
    setTimeLeft(maxDuration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording(); // Auto-stop at 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Generate attemptId on mic click (STT ONLY)
    attemptIdRef.current = crypto.randomUUID();
    console.log("[STT] Generated attemptId:", attemptIdRef.current);

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

          const formData = new FormData();
          formData.append("audio", audioFile);

          // Add userKey to FormData for compatibility (apiClient already sends it in header)
          const userKey = getUserKey();
          formData.append("userKey", userKey);

          // Add attemptId to FormData (STT ONLY)
          if (attemptIdRef.current) {
            formData.append("attemptId", attemptIdRef.current);
          }

          try {
            const endpoint = "/api/stt";
            console.log("STT endpoint:", endpoint);
            console.log("STT attemptId:", attemptIdRef.current);
            // Use relative path - Vercel proxy handles routing
            const response = await apiClient(endpoint, {
              method: "POST",
              body: formData,
              headers: {
                // Send x-attempt-id header (STT ONLY)
                ...(attemptIdRef.current ? { 'x-attempt-id': attemptIdRef.current } : {}),
              },
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
              // Refresh usage after failed STT
              if (!isPro) {
                const currentUsage = await fetchUsage();
                setUsage(currentUsage);
                if (onAttemptsRefresh) {
                  onAttemptsRefresh();
                }
              }
              return;
            }

            // Refresh usage from backend after successful STT
            // Backend increments the count, so we fetch latest
            if (!isPro) {
              const currentUsage = await fetchUsage();
              setUsage(currentUsage);
              // Note: STT usage is separate from practice question quota
              // This is informational only - paywall gates on practice submissions
              console.log(`[STT Daily Usage] ${currentUsage.used}/${currentUsage.limit === Infinity ? "∞" : currentUsage.limit} (informational only, not practice quota)`);
              // Notify parent to refresh its counter if callback provided
              if (onAttemptsRefresh) {
                onAttemptsRefresh();
              }
            }

            onTranscript(transcript, audioBlob);
          } catch (err) {
            // Refresh usage from backend after failed STT (success OR 429)
            if (!isPro) {
              const currentUsage = await fetchUsage();
              setUsage(currentUsage);
              // Notify parent to refresh its counter if callback provided
              if (onAttemptsRefresh) {
                onAttemptsRefresh();
              }
            }

            // Handle 429 (rate limit) - show paywall, stop flow, refresh usage
            if (err instanceof ApiError && err.status === 429) {
              setError("You've reached your daily limit. Upgrade to Pro for unlimited practice.");
              if (onUpgradeNeeded) {
                onUpgradeNeeded("mic");
              }
              return; // Stop the flow - don't proceed to transcript-dependent steps
            }

            // Handle 402 (upgrade needed)
            if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true && onUpgradeNeeded) {
              setError("You've reached your daily limit. Upgrade to Pro for unlimited practice.");
              onUpgradeNeeded("mic");
              return; // Stop the flow
            }

            throw new Error(err.data?.error || err.message || "Transcription failed");
          }
        } catch (err) {
          if (isNetworkError(err)) {
            setError("We're temporarily unavailable. Give us a moment and try again.");
          } else {
            setError(err.message);
          }
          if (!err.message.includes("Transcription failed") && !isNetworkError(err)) {
          }
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      gaEvent("practice_start", { page: "practice" });
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      gaEvent("practice_stop", { page: "practice" });
    }
  };

  // If renderButton is provided, use it instead of default UI
  if (renderButton) {
    return renderButton({ startRecording, stopRecording, recording, transcribing, error, permissionDenied });
  }

  // Default UI (unchanged)
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={transcribing}
            className="flex items-center justify-center h-20 w-20 rounded-full shadow-xl border-2 bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 relative ring-4 ring-emerald-200/50"
            title="Start recording"
            style={{
              boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4), 0 0 20px 8px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 32 }}>mic</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            disabled={transcribing}
            className="flex items-center justify-center h-20 w-20 rounded-full bg-rose-500 text-white disabled:opacity-60 disabled:cursor-not-allowed ring-2 ring-red-500/55 shadow-[0_0_0_8px_rgba(239,68,68,0.18)] shadow-red-500/10 transition-all duration-200 ease-out"
            title="Stop recording"
            aria-label="Stop recording"
          >
            <span className="material-icons-outlined" style={{ fontSize: 32 }}>stop</span>
          </button>
        )}

        {/* Recording indicator - always visible when recording */}
        {recording && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 shadow-sm animate-in fade-in zoom-in duration-200">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs text-rose-700 font-bold tabular-nums">
              Recording… {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {transcribing && (
        <p className="text-[10px] text-slate-600 font-medium">Transcribing...</p>
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

