// src/components/VoiceRecorder.jsx
import React, { useRef, useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { usePro } from "../contexts/ProContext.jsx";
import { getUserKey } from "../utils/userKey.js";
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

export default function VoiceRecorder({ onTranscript, onStateChange, onUpgradeNeeded, onAttemptsRefresh }) {
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
    setError("");
    setPermissionDenied(false);
    chunksRef.current = [];
    
    // Generate attemptId on mic click (STT ONLY)
    attemptIdRef.current = crypto.randomUUID();
    console.log("[STT] Generated attemptId:", attemptIdRef.current);

    // Check daily limit BEFORE starting recording (only for non-Pro users)
    if (!isPro) {
      // Fetch latest from backend to ensure accuracy
      const currentUsage = await fetchUsage();
      setUsage(currentUsage);
      
      // Block if blocked or remaining <= 0
      if (isBlocked(currentUsage)) {
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
              console.log(`[STT] usage: ${currentUsage.used}/${currentUsage.limit === Infinity ? "∞" : currentUsage.limit}`);
              // Notify parent to refresh its counter if callback provided
              if (onAttemptsRefresh) {
                onAttemptsRefresh();
              }
            }

            trackEvent("stt_success", { textLength: transcript.length });
            onTranscript(transcript);
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
                onUpgradeNeeded();
              }
              trackEvent("stt_fail", { error: "rate_limit_429", status: 429 });
              return; // Stop the flow - don't proceed to transcript-dependent steps
            }
            
            // Handle 402 (upgrade needed)
            if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true && onUpgradeNeeded) {
              setError("You've reached your daily limit. Upgrade to Pro for unlimited practice.");
              onUpgradeNeeded();
              trackEvent("stt_fail", { error: "upgrade_needed_402", status: 402 });
              return; // Stop the flow
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

  const isUsageBlocked = !isPro && isBlocked(usage);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={transcribing || isUsageBlocked}
            className="flex items-center justify-center h-12 w-12 rounded-full shadow-sm border bg-white border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            title={isUsageBlocked ? "You've used your 3 free attempts today. Upgrade to continue." : "Start recording"}
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
            <span className="text-rose-600 font-bold">{usage.used}/{usage.limit === Infinity ? "∞" : usage.limit}</span>
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

