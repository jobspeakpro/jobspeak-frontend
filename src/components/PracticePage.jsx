// src/components/PracticePage.jsx
import React, { useState, useEffect, useRef } from "react";
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
  const { isPro, refreshProStatus } = usePro();
  
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
  
  // Ref to track if GA events have been fired for this page load (prevent duplicates)
  const hasTrackedStripeReturn = useRef(false);
  
  // Practice questions array
  const practiceQuestions = [
    {
      question: "Tell me about a time you faced a challenge at work.",
      hint: "Focus on the STAR method: Situation, Task, Action, Result."
    },
    {
      question: "Describe a situation where you had to work under pressure.",
      hint: "Explain how you managed your time and priorities effectively."
    },
    {
      question: "Tell me about a time you disagreed with a colleague or manager.",
      hint: "Show how you handled conflict professionally and found a resolution."
    },
    {
      question: "Give me an example of when you went above and beyond for a project.",
      hint: "Highlight your initiative and commitment to excellence."
    },
    {
      question: "Describe a time when you had to learn something new quickly.",
      hint: "Demonstrate your adaptability and learning ability."
    },
    {
      question: "Tell me about a mistake you made and how you handled it.",
      hint: "Show accountability and what you learned from the experience."
    },
    {
      question: "Describe a time when you had to persuade someone to see your point of view.",
      hint: "Explain your communication and negotiation skills."
    },
    {
      question: "Tell me about a time you had to work with a difficult team member.",
      hint: "Show your teamwork and interpersonal skills."
    }
  ];
  
  // Initialize with random question
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    return practiceQuestions[Math.floor(Math.random() * practiceQuestions.length)];
  });
  const [questionNumber, setQuestionNumber] = useState(1);

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

  // Handle Stripe redirect params (query params or path)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      
      // Check query params
      const success = params.get("success");
      const canceled = params.get("canceled");
      
      // Check pathname for success/cancel patterns
      const pathSuccess = pathname.includes("/success") || pathname.includes("/checkout/success");
      const pathCancel = pathname.includes("/cancel") || pathname.includes("/checkout/cancel");

      if (success === "true" || pathSuccess) {
        // Immediately refresh Pro status
        if (refreshProStatus) {
          refreshProStatus();
        }
        
        // Fire GA event for successful upgrade (once per return)
        if (!hasTrackedStripeReturn.current) {
          try {
            // Read period and source from localStorage (stored before redirect)
            const period = localStorage.getItem("jobspeak_upgrade_period") || "unknown";
            const source = localStorage.getItem("jobspeak_upgrade_source") || "unknown";
            
            gaEvent("paywall_upgrade_success", {
              page: "practice",
              period: period,
              source: source,
            });
            
            // Clean up localStorage after tracking
            localStorage.removeItem("jobspeak_upgrade_period");
            localStorage.removeItem("jobspeak_upgrade_source");
            
            hasTrackedStripeReturn.current = true;
          } catch (err) {
            console.error("Error tracking upgrade success:", err);
          }
        }
        
        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else if (canceled === "true" || pathCancel) {
        // Fire GA event for canceled upgrade (once per return)
        if (!hasTrackedStripeReturn.current) {
          try {
            // Read period and source from localStorage (stored before redirect)
            const period = localStorage.getItem("jobspeak_upgrade_period") || "unknown";
            const source = localStorage.getItem("jobspeak_upgrade_source") || "unknown";
            
            gaEvent("paywall_upgrade_cancel", {
              page: "practice",
              period: period,
              source: source,
            });
            
            // Clean up localStorage after tracking
            localStorage.removeItem("jobspeak_upgrade_period");
            localStorage.removeItem("jobspeak_upgrade_source");
            
            hasTrackedStripeReturn.current = true;
          } catch (err) {
            console.error("Error tracking upgrade cancel:", err);
          }
        }
        
        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    } catch (err) {
      console.error("URL param parse error", err);
    }
  }, [refreshProStatus]);

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
        const data = await apiClient("/api/ai/micro-demo", {
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

  const handleTryAnotherQuestion = () => {
    gaEvent("try_another_question_click", {
      page: "practice"
    });
    
    // Reset practice state
    setText("");
    setResult(null);
    setError("");
    setLoading(false);
    
    // Load a new random question (avoid same question if possible)
    let newQuestion;
    do {
      newQuestion = practiceQuestions[Math.floor(Math.random() * practiceQuestions.length)];
    } while (newQuestion.question === currentQuestion.question && practiceQuestions.length > 1);
    
    setCurrentQuestion(newQuestion);
    setQuestionNumber(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-semibold">
              Voice Practice
            </p>
            <h1 className="text-sm md:text-base font-semibold text-slate-900">
              JobSpeak Pro — Voice Practice
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-slate-600 hover:text-blue-600 underline"
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
        {/* Free improve attempts counter - rounded pill with dots */}
        {!isPro && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200/60 rounded-full px-4 py-2 shadow-sm">
              <span className="text-xs text-slate-600 font-medium">Free attempts today:</span>
              <span className="text-xs font-bold text-slate-900">
                {freeImproveUsage.count} / {freeImproveUsage.limit === Infinity ? "∞" : freeImproveUsage.limit}
              </span>
              <div className="flex items-center gap-1 ml-1">
                {Array.from({ length: Math.min(freeImproveUsage.limit, 10) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      idx < freeImproveUsage.count
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Question card - centered */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            {/* Practice Question badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full">
                Practice Question #{questionNumber}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
              {currentQuestion.question}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              {currentQuestion.hint}
            </p>
            {/* Try another question link */}
            <button
              type="button"
              onClick={handleTryAnotherQuestion}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline transition-colors"
            >
              Try another question
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: User answer with VoiceRecorder */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold text-slate-900">
                  Your Response
                </p>
              </div>
              {result && (
                <span className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImproveAnswer();
              }}
              className="flex flex-col gap-6 flex-1"
            >
              {/* Recording CTA - centered with large green mic button */}
              <div className="flex flex-col items-center gap-4 mb-4">
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
                <p className="text-sm text-slate-600 font-medium text-center">
                  Tap microphone to start speaking
                </p>
              </div>

              {/* Transcript textarea (auto-filled) */}
              <div className="flex-1">
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Your transcript will appear here after recording, or type your answer directly..."
                  disabled={isTranscribing}
                  className="w-full min-h-[160px] border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all leading-relaxed resize-none"
                />
              </div>
              
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
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
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
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
                    {improvedAnswerText || (
                      <span className="text-slate-400">
                        Your improved answer will appear here after you
                        click "Fix my answer".
                      </span>
                    )}
                  </div>
                  {improvedAnswerText && (
                    <div className="mt-2">
                      <ListenToAnswerButton
                        improvedText={improvedAnswerText}
                        onUpgradeNeeded={(source) => {
                          setPaywallSource(source || "listen");
                          setShowUpgradeModal(true);
                        }}
                      />
                    </div>
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

