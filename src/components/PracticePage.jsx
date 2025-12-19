// src/components/PracticePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "./VoiceRecorder.jsx";
import ListenToAnswerButton from "./ListenToAnswerButton.jsx";
import InlineError from "./InlineError.jsx";
import UpgradeModal from "./UpgradeModal.jsx";
import { trackEvent } from "../analytics";
import { getUserKey } from "../utils/userKey.js";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { usePro } from "../contexts/ProContext.jsx";

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
  const [serverUnavailable, setServerUnavailable] = useState(false);

  // Free limit helpers (same as App.jsx)
  const FREE_IMPROVE_LIMIT_PER_DAY = 1;

  const getTodayKey = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  };

  const hasFreeImproveLeft = () => {
    if (isPro) return true;
    const key = "jobspeak_free_improve_usage";
    const today = getTodayKey();
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    try {
      const data = JSON.parse(raw);
      if (data.date !== today) return true;
      return data.count < FREE_IMPROVE_LIMIT_PER_DAY;
    } catch {
      return true;
    }
  };

  const incrementFreeImproveUsage = () => {
    const key = "jobspeak_free_improve_usage";
    const today = getTodayKey();
    const raw = localStorage.getItem(key);
    let data;
    try {
      data = raw ? JSON.parse(raw) : { date: today, count: 0 };
    } catch {
      data = { date: today, count: 0 };
    }
    if (data.date !== today) {
      data = { date: today, count: 0 };
    }
    data.count += 1;
    localStorage.setItem(key, JSON.stringify(data));
  };

  function getImprovedAnswerText() {
    if (!result) return "";
    return result.improved || "";
  }

  const handleImproveAnswer = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    // Free limit gating
    if (!hasFreeImproveLeft()) {
      setError(
        "You've used your free answer today. Upgrade to Pro for unlimited practice."
      );
      setLoading(false);
      trackEvent("micro_demo_limit_hit", { source: "practice_page" });
      return;
    }

    if (typeof text !== "string" || !text.trim()) {
      setError("Type or record your answer to begin.");
      setLoading(false);
      return;
    }

    try {
      trackEvent("interview_submit", { textLength: text.length, source: "practice_page" });

      const userKey = getUserKey();
      try {
        const data = await apiClient("/ai/micro-demo", {
          method: "POST",
          body: { text, userKey },
        });
        setResult(data);
        trackEvent("interview_submit_success", { textLength: text.length });
        if (!isPro) {
          incrementFreeImproveUsage();
        }

        // Save session to backend
        try {
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
            setShowUpgradeModal(true);
            trackEvent("free_limit_reached", { source: "session_save" });
          } else {
            console.error("Failed to save session:", saveErr);
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true) {
          setError("");
          setShowUpgradeModal(true);
          trackEvent("free_limit_reached", { source: "practice_page" });
          trackEvent("interview_submit_fail", { reason: "free_limit", status: err.status });
          setLoading(false);
          return;
        }
        console.error("Micro-demo error status:", err.status || err.message);
        setError("Something went wrong. Try again in a moment.");
        trackEvent("interview_submit_fail", { reason: "api_error", status: err.status });
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
      trackEvent("interview_submit_fail", { reason: "network_error", error: err.message });
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        {/* Question header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
              Tell me about a time you faced a challenge at work.
            </h2>
            <p className="text-xs text-slate-600">
              Focus on the STAR method: Situation, Task, Action, Result.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-4 md:grid-cols-2 mt-2">
          {/* LEFT: User answer with VoiceRecorder */}
          <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col h-full">
            <p className="text-[11px] font-semibold text-rose-500 mb-1">
              Your Answer
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Record your answer or type it below. Aim for 45–90 seconds when spoken.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImproveAnswer();
              }}
              className="flex flex-col gap-3 flex-1"
            >
              <div className="flex items-start gap-3">
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
                  onUpgradeNeeded={() => setShowUpgradeModal(true)}
                />
                <div className="flex-1 text-[11px] text-slate-600">
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
                className="w-full flex-1 min-h-[140px] border border-rose-100 bg-rose-50 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="submit"
                  disabled={loading || isTranscribing || (typeof text !== "string" || !text.trim())}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
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
          <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col h-full">
            <p className="text-[11px] font-semibold text-emerald-600 mb-1">
              Better way to say it
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
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
                <div className="flex flex-col gap-3 flex-1">
                  <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-sm text-slate-900 whitespace-pre-wrap break-words">
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
                      onUpgradeNeeded={() => setShowUpgradeModal(true)}
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
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

