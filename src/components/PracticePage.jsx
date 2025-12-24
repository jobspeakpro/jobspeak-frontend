// src/components/PracticePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "./VoiceRecorder.jsx";
import ListenToAnswerButton from "./ListenToAnswerButton.jsx";
import InlineError from "./InlineError.jsx";
import UpgradeModal from "./UpgradeModal.jsx";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { usePro } from "../contexts/ProContext.jsx";
import { getUserKey } from "../utils/userKey.js";
import { isBlocked } from "../utils/usage.js";
import { gaEvent } from "../utils/ga.js";

export default function PracticePage() {
  const navigate = useNavigate();
  const { isPro } = usePro();
  
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [paywallSource, setPaywallSource] = useState(null); // "mic" | "fix_answer" | "listen" | null
  const [serverUnavailable, setServerUnavailable] = useState(false);
  const [freeImproveUsage, setFreeImproveUsage] = useState({ count: 0, limit: 3 });
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3, blocked: false });

  const isPaywalled =
    !isPro && isBlocked(usage);

  // Fetch free attempts from backend API
  const fetchFreeAttempts = async () => {
    if (isPro) {
      setFreeImproveUsage({ count: 0, limit: 3 });
      setUsage({ used: 0, limit: 3, remaining: 3, blocked: false });
      return;
    }
    try {
      const data = await apiClient(`/api/usage/today`);
      // Backend returns standardized format: { usage: { used, limit, remaining, blocked } }
      if (data.usage) {
        setFreeImproveUsage({
          count: data.usage.used || 0,
          limit: data.usage.limit === -1 ? Infinity : data.usage.limit || 3,
        });
        setUsage({
          used: data.usage.used || 0,
          limit: data.usage.limit === -1 ? Infinity : data.usage.limit || 3,
          remaining: data.usage.remaining === -1 ? Infinity : data.usage.remaining || 0,
          blocked: data.usage.blocked || false,
        });
      } else {
        // Fallback for backward compatibility
        if (data.freeAttempts !== undefined) {
          setFreeImproveUsage({
            count: data.freeAttempts.count || 0,
            limit: data.freeAttempts.limit || 3,
          });
        } else if (data.sttAttempts !== undefined) {
          setFreeImproveUsage({
            count: data.sttAttempts.count || 0,
            limit: data.sttAttempts.limit || 3,
          });
        } else if (data.freeAttemptsUsed !== undefined && data.freeAttemptsLimit !== undefined) {
          setFreeImproveUsage({
            count: data.freeAttemptsUsed || 0,
            limit: data.freeAttemptsLimit || 3,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching free attempts:", err);
      if (isNetworkError(err)) {
        setServerUnavailable(true);
      }
    }
  };

  // Clean up ALL legacy free usage keys on mount - remove all localStorage tracking
  // Backend is now the source of truth
  useEffect(() => {
    try {
      // Remove all localStorage keys related to free usage tracking
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith("jobspeak_free_improve_usage") ||
          key.startsWith("speaking_attempts_")
        )) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
        console.log("[Cleanup] Removed legacy free usage key:", key);
      });
    } catch (err) {
      console.error("Error cleaning up legacy keys:", err);
    }
  }, []);

  // Load free improve usage count from backend on mount
  useEffect(() => {
    fetchFreeAttempts();
  }, [isPro]);

  function getImprovedAnswerText() {
    if (!result) return "";
    return result.improved || "";
  }

  const handleImproveAnswer = async () => {
    // Gate at handler level using backend usage as source of truth
    if (isPaywalled) {
      setError("");
      setPaywallSource("fix_answer");
      setShowUpgradeModal(true);
      return; // Return early - do NOT make API call when paywalled
    }

    gaEvent("practice_submit", { page: "practice" });
    setError("");
    setResult(null);
    setLoading(true);

    if (typeof text !== "string" || !text.trim()) {
      setError("Type or record your answer to begin.");
      setLoading(false);
      return;
    }


    try {

      try {
        const data = await apiClient("/ai/micro-demo", {
          method: "POST",
          body: { text },
        });
        setResult(data);
        
        // Refresh free attempts from backend after successful submission
        fetchFreeAttempts();

        // Save session to backend
        try {
          const userKey = getUserKey();
          const aiResponse = JSON.stringify(data);
          await apiClient("/api/sessions", {
            method: "POST",
            body: {
              userKey,
              transcript: text,
              aiResponse,
              score: null,
            },
          });
        } catch (saveErr) {
          if (saveErr instanceof ApiError && saveErr.status === 402 && saveErr.data?.upgrade === true) {
            // Update UI to reflect limit reached, but don't open modal
            // Session save is non-critical - user should complete their current attempt
            fetchFreeAttempts(); // Refresh to get latest from backend
          } else {
            console.error("Failed to save session:", saveErr);
          }
        }
      } catch (err) {
        // Refresh attempts from backend after failed call
        fetchFreeAttempts();
        
        if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true) {
          setError("");
          // Immediately update UI to 3/3 when limit reached
          setFreeImproveUsage({ count: 3, limit: 3 });
          setPaywallSource("fix_answer");
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }
        console.error("Micro-demo error status:", err.status || err.message);
        setError("Something went wrong. Try again in a moment.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Micro-demo error:", err);
      if (isNetworkError(err)) {
        setServerUnavailable(true);
        setError("We're temporarily unavailable. Try again in a moment.");
      } else {
        setError("Connection issue. Check your internet and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const improvedAnswerText = getImprovedAnswerText();

  return (
    <div className="min-h-screen bg-rose-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-rose-100 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-rose-500 font-semibold">
              Voice Practice
            </p>
            <h1 className="text-sm md:text-base font-semibold text-slate-900">
              JobSpeak Pro — Voice Practice
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-slate-600 hover:text-rose-600 underline"
          >
            ← Back to Demo
          </button>
        </div>
      </header>

      {/* Server unavailable banner */}
      {serverUnavailable && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-800">
              We're temporarily unavailable. Give us a moment and try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setServerUnavailable(false);
              }}
              className="text-xs px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 font-semibold transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Free improve attempts counter */}
        {!isPro && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 text-xs mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Free attempts today:</span>
              <span className="font-semibold text-slate-900">
                {freeImproveUsage.count} / {freeImproveUsage.limit}
              </span>
            </div>
            {isPaywalled && (
              <div className="mt-2 text-[11px] text-amber-700">
                Free limit reached — upgrade to continue practicing.
              </div>
            )}
          </div>
        )}
        {/* Question card - centered */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
              Tell me about a time you faced a challenge at work.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Focus on the STAR method: Situation, Task, Action, Result.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: User answer with VoiceRecorder */}
          <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-md flex flex-col h-full">
            <p className="text-sm font-bold text-rose-500 mb-1 uppercase tracking-wide">
              Your Answer
            </p>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Record your answer or type it below. Aim for 45–90 seconds when spoken.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImproveAnswer();
              }}
              className="flex flex-col gap-4 flex-1"
            >
              <div className="flex items-start gap-4">
                <VoiceRecorder 
                  onTranscript={(transcript) => {
                    setText(transcript);
                    setError("");
                  }} 
                  onStateChange={({ recording, transcribing }) => {
                    setIsRecording(recording);
                    setIsTranscribing(transcribing);
                    if (transcribing) setError("");
                  }}
                  onUpgradeNeeded={(source) => {
                    setPaywallSource(source || "mic");
                    setShowUpgradeModal(true);
                  }}
                  onAttemptsRefresh={() => fetchFreeAttempts()}
                />
                <div className="flex-1 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800 mb-1">
                    {isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Speak your answer"}
                  </div>
                  <div>
                    {isRecording 
                      ? "Click stop when finished"
                      : isTranscribing
                      ? "Processing your audio..."
                      : "Click the mic to speak or type below."}
                  </div>
                </div>
              </div>

              {/* Transcript textarea (auto-filled) */}
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Your transcript will appear here after recording, or type your answer directly..."
                disabled={isTranscribing}
                className="w-full flex-1 min-h-[160px] border-2 border-rose-100 bg-rose-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              />
              
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="submit"
                  disabled={loading || isTranscribing || (typeof text !== "string" || !text.trim())}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {isTranscribing 
                    ? "Transcribing..." 
                    : loading 
                    ? "Improving..." 
                    : "✨ Fix my answer"}
                </button>
              </div>
              
              {error && (
                <InlineError
                  message={error}
                  onRetry={
                    error.includes("temporarily unavailable")
                      ? () => {
                          setError("");
                          setServerUnavailable(false);
                          handleImproveAnswer();
                        }
                      : undefined
                  }
                />
              )}
            </form>
          </div>

          {/* RIGHT: Improved answer */}
          <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-md flex flex-col h-full">
            <p className="text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wide">
              Better way to say it
            </p>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Optimized for speaking naturally. Use it as a guide and adapt it to your story.
            </p>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <p className="text-xs text-slate-600">Improving your answer...</p>
              </div>
            ) : result ? (
              result.error ? (
                <InlineError
                  title="Something went wrong"
                  message={result.error}
                />
              ) : (
                <div className="flex flex-col gap-4 flex-1">
                  <div className="bg-rose-50 border-2 border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
                    {improvedAnswerText || (
                      <span className="text-slate-400">
                        Your improved answer will appear here after you
                        click "Fix my answer".
                      </span>
                    )}
                  </div>
                  {improvedAnswerText && (
                    <ListenToAnswerButton
                      improvedText={improvedAnswerText}
                      onUpgradeNeeded={(source) => {
                        setPaywallSource(source || "listen");
                        setShowUpgradeModal(true);
                      }}
                    />
                  )}
                  {result.message && (
                    <div className="text-[11px] text-slate-500">
                      {result.message}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-700">
                    💡 Practice tip: Read this answer out loud 2–3 times,
                    then listen and repeat with the audio to build muscle
                    memory.
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  After you click "Fix my answer", you'll see a more
                  confident version of your answer here with audio
                  playback.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => {
            setShowUpgradeModal(false);
            setPaywallSource(null);
          }}
          source={paywallSource}
        />
      )}
    </div>
  );
}

