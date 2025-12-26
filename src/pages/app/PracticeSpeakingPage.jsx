// src/pages/app/PracticeSpeakingPage.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "../../components/VoiceRecorder.jsx";
import ListenToAnswerButton from "../../components/ListenToAnswerButton.jsx";
import InlineError from "../../components/InlineError.jsx";
import PaywallModal from "../../components/PaywallModal.jsx";
import { usePracticeSession } from "../../hooks/usePracticeSession.js";

export default function PracticeSpeakingPage() {
  const navigate = useNavigate();
  const listenButtonRef = useRef(null);
  const [textInputMode, setTextInputMode] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [showFixToast, setShowFixToast] = useState(false);
  const {
    text,
    setText,
    result,
    loading,
    error,
    setError,
    isTranscribing,
    setIsTranscribing,
    isRecording,
    setIsRecording,
    showUpgradeModal,
    setShowUpgradeModal,
    paywallSource,
    setPaywallSource,
    serverUnavailable,
    setServerUnavailable,
    freeImproveUsage,
    usage,
    currentQuestion,
    questionNumber,
    isPro,
    isPaywalled,
    improvedAnswerText,
    handleImproveAnswer,
    handleTryAnotherQuestion,
    fetchFreeAttempts,
  } = usePracticeSession();

  // Map question fields to match Stitch structure
  const questionPrompt = currentQuestion?.question || "Tell me about a time you handled a difficult situation at work.";
  const questionHint = currentQuestion?.hint || "Focus on the actions you took and the result.";

  // Handler for "Practice again" - resets the current question
  const handlePracticeAgain = () => {
    setText("");
    setError("");
    // Note: result and loading state are managed by the hook
    // Result will be cleared on next submission
  };

  // Handler for "Listen to example" - triggers audio playback via ref
  const handleListenToExample = () => {
    if (listenButtonRef.current) {
      listenButtonRef.current.play();
    }
  };

  // Get "Why this works better" text from result
  const whyThisWorksBetter = result?.message || result?.why || "Using active verbs like 'prioritized' and 'created' shows ownership and decisive action.";

  // Sync showUpgradeModal from hook to local showPaywall state
  useEffect(() => {
    if (showUpgradeModal) {
      setShowPaywall(true);
    }
  }, [showUpgradeModal]);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (showNotificationToast) {
      const timer = setTimeout(() => {
        setShowNotificationToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationToast]);

  // Auto-dismiss fix toast
  useEffect(() => {
    if (showFixToast) {
      const timer = setTimeout(() => {
        setShowFixToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFixToast]);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4 text-text-main dark:text-white">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6_330)">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </g>
              <defs>
                <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight">JobSpeak Pro</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-text-main dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/practice")}
              className="text-primary text-sm font-bold border-b-2 border-primary pb-0.5"
            >
              Practice
            </button>
            <button
              onClick={() => navigate("/progress")}
              className="text-text-main dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors"
            >
              My Progress
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isPro && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">bolt</span>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Free Plan</span>
            </div>
          )}
          <button 
            onClick={() => setShowNotificationToast(true)}
            className="flex items-center justify-center rounded-full size-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-main dark:text-white"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden cursor-pointer" data-alt="User profile avatar placeholder">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7OSQFZhF2rG-VynZ6WAzVggeYqM2KK1RlKBfcxtnvZ5wkKoNZYvIS78KvIQ3MguF106L9mdFmP61Mwv15fIJoq76Q-YtND9b1xiNMqREBjzXc1nnwTuBt64OuVT7ibePkxl2_MeM962jFqlOoLEp7YiYBSU_nBemtkqQzzSreOhqr2o2PSEC0MRgD_2ub6WjYS2-hQsYRrXXjhdDxtV8TCUgo8vHrXP_F_sLUgYVoUOTL3jYcfcb17z-Z6iWow8YIVVSxbDifNfMU"/>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 md:px-6">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Title and subtitle */}
          <div className="text-center space-y-2 pt-4">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Practice Speaking</h1>
            <p className="text-text-secondary dark:text-gray-400 text-base md:text-lg font-light">Take your time. Practice is private and judgment-free.</p>
          </div>

            {/* Question Card */}
          <div className="w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="relative h-48 w-full bg-cover bg-center" style={{backgroundImage: "linear-gradient(135deg, rgba(19, 109, 236, 0.8) 0%, rgba(16, 24, 34, 0.9) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuBe5ft9h7R5hRXjmGP00v19h7Hyg6FG-sBHO3a_wHZOqYyb1mwpub1Eh1XZ9AfTAiJ2Qfcs13PRgmLHiHZ9hDBzJTjWq8BNHbW6Mv2ZvrBKxT1yxaRAGW-cDTv-lzifrxJX68MCE0K9CAhcmPBKzxYuBhuzlDKewC7hVWviiKjqeBXaI9wC9d7NRJI6C26vmZ0yvqw_QX7D3bIoQIwixlQIeRWtOpGFgxI-E9kHlks3YCZ9Bufn_5yr66WTiOMharmAjYlI5iEkI9')"}}>
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-white uppercase bg-white/20 backdrop-blur-sm rounded-full w-fit">Behavioral Question</span>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-bold leading-snug drop-shadow-md">{questionPrompt}</h3>
                <p className="text-white/90 text-sm md:text-base mt-2 font-medium">{questionHint}</p>
              </div>
            </div>

            {/* Recording/Input Section */}
            <div className="p-6 md:p-10 flex flex-col items-center justify-center gap-6 bg-surface-light dark:bg-surface-dark">
              {!textInputMode ? (
                <>
                  {/* Recording visualization */}
                  {isRecording && (
                    <div className="h-12 w-full max-w-sm flex items-center justify-center gap-1 relative">
                      <div className="w-1 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75"></div>
                      <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-1 h-6 bg-primary rounded-full animate-pulse delay-150"></div>
                      <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75"></div>
                      <div className="w-1 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-full h-px bg-slate-200 dark:bg-slate-700 absolute"></div>
                    </div>
                  )}

                  {/* Mic Button - VoiceRecorder handles recording */}
                  <VoiceRecorder 
                    onTranscript={(transcript) => {
                      setText(transcript);
                    }} 
                    onStateChange={({ recording, transcribing }) => {
                      setIsRecording(recording);
                      setIsTranscribing(transcribing);
                    }}
                    onUpgradeNeeded={(source) => {
                      setPaywallSource(source || "mic");
                      setShowUpgradeModal(true);
                      setShowPaywall(true);
                    }}
                    onAttemptsRefresh={() => fetchFreeAttempts()}
                    renderButton={({ startRecording, stopRecording, recording, transcribing, error, permissionDenied }) => (
                      <>
                        <button
                          type="button"
                          onClick={recording ? stopRecording : startRecording}
                          disabled={transcribing}
                          className={`group relative flex items-center justify-center size-20 rounded-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                            ${recording ? "ring-2 ring-primary/50 shadow-[0_0_0_6px_rgba(19,109,236,0.3)] shadow-primary/40" : ""}`}
                        >
                          <span className="material-symbols-outlined text-white text-4xl group-hover:animate-pulse">mic</span>
                          <span className="absolute -bottom-8 text-sm font-semibold text-text-secondary dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Record Voice</span>
                        </button>
                        {permissionDenied && (
                          <p className="text-xs text-primary mt-2">Microphone permission denied</p>
                        )}
                      </>
                    )}
                  />

                  {/* Type answer instead button */}
                  <div className="flex items-center gap-6 mt-2">
                    <button
                      type="button"
                      onClick={() => setTextInputMode(true)}
                      className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-lg">keyboard</span>
                      <span>Type answer instead</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Text input area */}
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[120px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 text-sm text-text-main dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTextInputMode(false)}
                    className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">mic</span>
                    <span>Record voice instead</span>
                  </button>
                </>
              )}

              <p className="text-text-secondary dark:text-gray-500 text-xs font-normal text-center max-w-xs mt-2">
                There's no rush. You can record again if you want.
              </p>

              {/* Submit button */}
              {text && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await handleImproveAnswer();
                    } catch (err) {
                      // Handle "Fix unavailable" error with toast
                      if (err.isFixUnavailable || err.message === "FIX_UNAVAILABLE") {
                        setShowFixToast(true);
                        setError("");
                      }
                      // Other errors are handled by handleImproveAnswer internally
                    }
                  }}
                  className="w-full"
                >
                  <button
                    type="submit"
                    disabled={loading || isTranscribing || !text.trim()}
                    className="w-full px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Improving..." : "✨ Fix my answer"}
                  </button>
                </form>
              )}

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
            </div>
          </div>

          {/* Guidance Card */}
          {loading ? (
            <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-fade-in shadow-sm">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          ) : result && !result.error ? (
            <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-fade-in shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-main dark:text-white">Guidance</h4>
                  <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">Based on typical responses to this question.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-lg border border-green-100 dark:border-green-900/30 flex flex-col items-start justify-center">
                  <h5 className="text-green-800 dark:text-green-300 font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Here's a clearer way to say this:
                  </h5>
                  <p className="text-text-main dark:text-gray-200 text-base leading-relaxed">
                    {improvedAnswerText || "Your improved answer will appear here."}
                  </p>
                  {improvedAnswerText && (
                    <button
                      type="button"
                      onClick={handleListenToExample}
                      className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 text-sm font-medium transition-all shadow-sm group"
                    >
                      <span className="material-symbols-outlined text-lg group-hover:text-green-800 dark:group-hover:text-green-200">volume_up</span>
                      <span>Listen to example</span>
                    </button>
                  )}
                  {/* Hidden ListenToAnswerButton for ref access - button is shown above */}
                  {improvedAnswerText && (
                    <div className="hidden">
                      <ListenToAnswerButton
                        ref={listenButtonRef}
                        improvedText={improvedAnswerText}
                        onUpgradeNeeded={(source) => {
                          setPaywallSource(source || "listen");
                          setShowUpgradeModal(true);
                          setShowPaywall(true);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">Why this works better:</p>
                  <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed">
                    {whyThisWorksBetter}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePracticeAgain}
                  className="px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-text-main dark:text-white font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">replay</span>
                  Practice again
                </button>
                <button
                  type="button"
                  onClick={handleTryAnotherQuestion}
                  className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Try another question</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : result?.error ? (
            <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <InlineError
                title="Something went wrong"
                message={result.error}
              />
            </div>
          ) : null}

          {/* Free Plan Info Card */}
          {!isPro && (
            <div className="w-full max-w-lg mx-auto mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 flex gap-4 items-start">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">info</span>
              <div className="flex-1">
                <p className="text-sm text-text-secondary dark:text-slate-400 leading-relaxed">
                  You've used <span className="font-medium text-text-main dark:text-slate-200">{freeImproveUsage.count} of {freeImproveUsage.limit === Infinity ? "∞" : freeImproveUsage.limit}</span> free practice questions for today. You can continue tomorrow or upgrade for unlimited practice.
                </p>
                <a className="inline-block mt-2 text-sm font-semibold text-primary hover:underline" href="#" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>
                  View upgrade options
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">lock</span>
          Practice is private. You're here to learn, not perform.
        </p>
      </footer>

      {/* Notification Toast */}
      {showNotificationToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Notifications coming soon</p>
            </div>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Fix Button Toast */}
      {showFixToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Backend unavailable</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">We can't reach our servers right now. Please check your connection and try again.</p>
            </div>
            <button
              onClick={() => setShowFixToast(false)}
              className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          onClose={() => {
            setShowPaywall(false);
            setShowUpgradeModal(false);
            setPaywallSource(null);
          }}
          onNotNow={() => {
            setShowPaywall(false);
            setShowUpgradeModal(false);
            setPaywallSource(null);
          }}
        />
      )}
    </div>
  );
}
