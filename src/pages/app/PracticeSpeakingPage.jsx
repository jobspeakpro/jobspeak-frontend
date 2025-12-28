// src/pages/app/PracticeSpeakingPage.jsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "../../components/VoiceRecorder.jsx";
import InlineError from "../../components/InlineError.jsx";
import PaywallModal from "../../components/PaywallModal.jsx";
import { usePracticeSession } from "../../hooks/usePracticeSession.js";
import { getUserKey } from "../../utils/userKey.js";
import { fetchTtsBlobUrl, clearTtsCacheEntry } from "../../utils/ttsHelper.js";

export default function PracticeSpeakingPage() {
  const navigate = useNavigate();
  const [textInputMode, setTextInputMode] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [showFixToast, setShowFixToast] = useState(false);

  // Guidance section audio state (for improved answer)
  const guidanceAudioRef = useRef(null);
  const guidanceAudioUrlRef = useRef(null);   // holds current live blob URL
  const guidancePlayTokenRef = useRef(0);     // prevents stale async play from older clicks
  const [guidanceAudioUrl, setGuidanceAudioUrl] = useState(null);
  const [guidanceIsPlaying, setGuidanceIsPlaying] = useState(false);
  const [guidanceSpeed, setGuidanceSpeed] = useState(1.0);

  // Question audio state (for question text)
  const questionAudioRef = useRef(null);
  const lastAutoplayKeyRef = useRef(null);
  const questionAudioUrlRef = useRef(null);   // holds current live blob URL
  const questionPlayTokenRef = useRef(0);     // prevents stale async play from older clicks
  const [questionAudioUrl, setQuestionAudioUrl] = useState(null);
  const [questionIsPlaying, setQuestionIsPlaying] = useState(false);
  const [questionAutoplay, setQuestionAutoplay] = useState(() => {
    const stored = localStorage.getItem("tts_question_autoplay");
    return stored === "true";
  });
  const [questionSpeed, setQuestionSpeed] = useState(() => {
    const stored = localStorage.getItem("tts_question_speed");
    return stored ? Number(stored) : 1.0;
  });
  const [questionVoiceId, setQuestionVoiceId] = useState(() => {
    const stored = localStorage.getItem("tts_question_voiceId");
    return stored || "nova";
  });

  // Voice options with real voice IDs
  const QUESTION_VOICES = useMemo(
    () => [
      { id: "nova", label: "US Female — Emma" },
      { id: "onyx", label: "US Male — Jake" },
      { id: "shimmer", label: "US Female — Ava" },
      { id: "echo", label: "UK Male — Oliver" },
      { id: "fable", label: "UK Female — Amelia" },
      { id: "ash", label: "UK Male — Harry" },
    ],
    []
  );

  const SPEEDS = useMemo(
    () => [
      { value: 0.7, label: "0.70×" },
      { value: 0.75, label: "0.75×" },
      { value: 1.0, label: "1.0×" },
      { value: 1.25, label: "1.25×" },
      { value: 1.5, label: "1.5×" },
    ],
    []
  );

  // Persist question audio preferences
  useEffect(() => {
    localStorage.setItem("tts_question_autoplay", String(questionAutoplay));
  }, [questionAutoplay]);

  useEffect(() => {
    localStorage.setItem("tts_question_speed", String(questionSpeed));
  }, [questionSpeed]);

  useEffect(() => {
    localStorage.setItem("tts_question_voiceId", questionVoiceId);
  }, [questionVoiceId]);

  // Safe URL setter for question audio - only revokes previous URL after new one is set
  function setQuestionAudioUrlSafe(newUrl) {
    const prev = questionAudioUrlRef.current;
    questionAudioUrlRef.current = newUrl;
    setQuestionAudioUrl(newUrl);
    if (prev && prev !== newUrl) {
      // revoke previous AFTER we swapped to new
      setTimeout(() => URL.revokeObjectURL(prev), 500);
    }
  }

  // Safe URL setter for guidance audio - only revokes previous URL after new one is set
  function setGuidanceAudioUrlSafe(newUrl) {
    const prev = guidanceAudioUrlRef.current;
    guidanceAudioUrlRef.current = newUrl;
    setGuidanceAudioUrl(newUrl);
    if (prev && prev !== newUrl) {
      // revoke previous AFTER we swapped to new
      setTimeout(() => URL.revokeObjectURL(prev), 500);
    }
  }

  // Cleanup object URLs on unmount using refs (always current)
  useEffect(() => {
    return () => {
      const qUrl = questionAudioUrlRef.current;
      const gUrl = guidanceAudioUrlRef.current;
      if (qUrl) URL.revokeObjectURL(qUrl);
      if (gUrl) URL.revokeObjectURL(gUrl);
    };
  }, []);

  // Update playback rates when speed changes
  useEffect(() => {
    if (guidanceAudioRef.current) {
      guidanceAudioRef.current.playbackRate = guidanceSpeed;
    }
  }, [guidanceSpeed]);

  useEffect(() => {
    if (questionAudioRef.current) {
      questionAudioRef.current.playbackRate = questionSpeed;
    }
  }, [questionSpeed]);
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

  // Reliable autoplay key - prefer questionNumber, fallback to questionPrompt
  const autoplayKey = useMemo(() => {
    // prefer questionNumber if available; else use prompt text
    return questionNumber || questionPrompt || null;
  }, [questionNumber, questionPrompt]);

  // Handler for "Practice again" - resets the current question
  const handlePracticeAgain = () => {
    setText("");
    setError("");
    // Note: result and loading state are managed by the hook
    // Result will be cleared on next submission
  };

  // Handler for Guidance section audio (improved answer)
  async function handlePlayGuidance(exampleText) {
    try {
      const token = ++guidancePlayTokenRef.current;
      const a = guidanceAudioRef.current;

      if (!a) return;

      // If we already have audio loaded, just toggle play/pause
      if (guidanceAudioUrl) {
        if (guidanceIsPlaying) {
          a.pause();
          setGuidanceIsPlaying(false);
        } else {
          a.playbackRate = guidanceSpeed;
          try {
            await a.play();
            if (token === guidancePlayTokenRef.current) {
              setGuidanceIsPlaying(true);
            }
          } catch (err) {
            // Ignore AbortError (can happen on rapid toggles)
            if (err.name !== "AbortError") {
              console.error("Guidance audio play error:", err);
            }
          }
        }
        return;
      }

      // Fetch TTS audio using shared helper
      const { url, error } = await fetchTtsBlobUrl({
        text: exampleText,
        voiceId: "us_female_emma", // Guidance section uses default voice
      });

      if (error) {
        console.error("Guidance audio error:", error);
        setGuidanceIsPlaying(false);
        return;
      }

      if (url) {
        // Check if this play was cancelled
        if (token !== guidancePlayTokenRef.current) return;

        // Set URL safely (revokes previous only after new is set)
        setGuidanceAudioUrlSafe(url);
        a.src = url;
        a.playbackRate = guidanceSpeed;

        try {
          await a.play();
          // Check again after play (might have been cancelled)
          if (token === guidancePlayTokenRef.current) {
            setGuidanceIsPlaying(true);
          }
        } catch (err) {
          // Ignore AbortError (can happen on rapid toggles)
          if (err.name !== "AbortError") {
            console.error("Guidance audio play error:", err);
          }
          setGuidanceIsPlaying(false);
        }
      }
    } catch (e) {
      console.error("Guidance audio error:", e);
      setGuidanceIsPlaying(false);
    }
  }

  // Handler for question audio
  const handlePlayQuestion = useCallback(async (options = {}) => {
    try {
      const { forceRegenerate = false } = options;
      const token = ++questionPlayTokenRef.current;
      const a = questionAudioRef.current;

      if (!a) return;

      // If we have a URL AND not forceRegenerate, toggle play/pause
      if (questionAudioUrl && !forceRegenerate) {
        if (questionIsPlaying) {
          a.pause();
          setQuestionIsPlaying(false);
        } else {
          a.playbackRate = questionSpeed;
          try {
            await a.play();
            if (token === questionPlayTokenRef.current) {
              setQuestionIsPlaying(true);
            }
          } catch (err) {
            // Ignore AbortError (can happen on rapid toggles)
            if (err.name !== "AbortError") {
              console.error("Question audio play error:", err);
            }
          }
        }
        return;
      }

      // If forceRegenerate OR no URL, fetch new blob URL with CURRENT voiceId
      const { url, error } = await fetchTtsBlobUrl({
        text: questionPrompt,
        voiceId: questionVoiceId,
      });

      if (error) {
        console.error("Question audio error:", error);
        setQuestionIsPlaying(false);
        return;
      }

      if (url) {
        // Check if this play was cancelled
        if (token !== questionPlayTokenRef.current) return;

        // Set URL safely (revokes previous only after new is set)
        setQuestionAudioUrlSafe(url);
        a.src = url;
        a.playbackRate = questionSpeed;

        try {
          await a.play();
          // Check again after play (might have been cancelled)
          if (token === questionPlayTokenRef.current) {
            setQuestionIsPlaying(true);
          }
        } catch (err) {
          // Ignore AbortError (can happen on rapid toggles)
          if (err.name !== "AbortError") {
            console.error("Question audio play error:", err);
          }
          setQuestionIsPlaying(false);
        }
      }
    } catch (e) {
      console.error("Question audio error:", e);
      setQuestionIsPlaying(false);
    }
  }, [questionPrompt, questionVoiceId, questionSpeed, questionAudioUrl, questionIsPlaying]);

  // Auto-play question audio on load if enabled
  // Only trigger once per question - track last autoplayed key
  useEffect(() => {
    if (!questionAutoplay) return;
    if (!autoplayKey) return;
    if (lastAutoplayKeyRef.current === autoplayKey) return;

    lastAutoplayKeyRef.current = autoplayKey;

    // delay 250ms so audio ref exists and UI is mounted
    const t = setTimeout(() => {
      handlePlayQuestion({ forceRegenerate: true, reason: "autoplay" });
    }, 250);

    return () => clearTimeout(t);
  }, [questionAutoplay, autoplayKey, handlePlayQuestion]);

  // Clear question audio when voice changes - stop audio and force regeneration
  useEffect(() => {
    const a = questionAudioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      // DO NOT blank src here (it triggers load failures / races)
    }
    // clear state so next play regenerates
    setQuestionIsPlaying(false);
    setQuestionAudioUrl(null);
    // IMPORTANT: do NOT revoke here; revoke happens when we successfully set a new URL
  }, [questionVoiceId]);

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
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7OSQFZhF2rG-VynZ6WAzVggeYqM2KK1RlKBfcxtnvZ5wkKoNZYvIS78KvIQ3MguF106L9mdFmP61Mwv15fIJoq76Q-YtND9b1xiNMqREBjzXc1nnwTuBt64OuVT7ibePkxl2_MeM962jFqlOoLEp7YiYBSU_nBemtkqQzzSreOhqr2o2PSEC0MRgD_2ub6WjYS2-hQsYRrXXjhdDxtV8TCUgo8vHrXP_F_sLUgYVoUOTL3jYcfcb17z-Z6iWow8YIVVSxbDifNfMU" />
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
            <div className="relative h-48 w-full bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, rgba(19, 109, 236, 0.8) 0%, rgba(16, 24, 34, 0.9) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuBe5ft9h7R5hRXjmGP00v19h7Hyg6FG-sBHO3a_wHZOqYyb1mwpub1Eh1XZ9AfTAiJ2Qfcs13PRgmLHiHZ9hDBzJTjWq8BNHbW6Mv2ZvrBKxT1yxaRAGW-cDTv-lzifrxJX68MCE0K9CAhcmPBKzxYuBhuzlDKewC7hVWviiKjqeBXaI9wC9d7NRJI6C26vmZ0yvqw_QX7D3bIoQIwixlQIeRWtOpGFgxI-E9kHlks3YCZ9Bufn_5yr66WTiOMharmAjYlI5iEkI9')" }}>
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-white uppercase bg-white/20 backdrop-blur-sm rounded-full w-fit">Behavioral Question</span>
                  {/* Question Audio Controls */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={handlePlayQuestion}
                      className="inline-flex items-center justify-center size-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all"
                      title={questionIsPlaying ? "Pause" : "Play question"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {questionIsPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 text-white/90 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionAutoplay}
                        onChange={(e) => setQuestionAutoplay(e.target.checked)}
                        className="size-3.5 rounded border-white/30 bg-white/20 checked:bg-primary focus:ring-2 focus:ring-white/50"
                      />
                      <span>Autoplay</span>
                    </label>
                    <select
                      value={String(questionSpeed)}
                      onChange={(e) => setQuestionSpeed(Number(e.target.value))}
                      className="h-7 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white text-xs px-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {SPEEDS.map(s => (
                        <option key={s.value} value={String(s.value)} style={{ background: "#1e293b", color: "white" }}>{s.label}</option>
                      ))}
                    </select>
                    <select
                      value={questionVoiceId}
                      onChange={(e) => setQuestionVoiceId(e.target.value)}
                      className="h-7 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white text-xs px-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {QUESTION_VOICES.map(v => (
                        <option key={v.id} value={v.id} style={{ background: "#1e293b", color: "white" }}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-bold leading-snug drop-shadow-md">{questionPrompt}</h3>
                <p className="text-white/90 text-sm md:text-base mt-2 font-medium">{questionHint}</p>
              </div>
              {/* Hidden audio element for question */}
              <audio
                ref={questionAudioRef}
                onEnded={() => setQuestionIsPlaying(false)}
                onPause={() => setQuestionIsPlaying(false)}
                onPlay={() => setQuestionIsPlaying(true)}
                style={{ display: "none" }}
              />
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

          {/* Guidance Card - Always render */}
          <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : result && !result.error ? (
              <div className="animate-fade-in">
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
                      {improvedAnswerText || "Submit an answer to see improved guidance."}
                    </p>
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => improvedAnswerText && handlePlayGuidance(improvedAnswerText)}
                        disabled={!improvedAnswerText}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 text-sm font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-green-900/40"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {guidanceIsPlaying ? "pause" : "play_arrow"}
                        </span>
                        <span>{guidanceIsPlaying ? "Pause" : improvedAnswerText ? "Play audio" : "Submit an answer to see improved guidance."}</span>
                      </button>

                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-text-secondary dark:text-gray-400">Speed</span>
                        <select
                          value={String(guidanceSpeed)}
                          onChange={(e) => setGuidanceSpeed(Number(e.target.value))}
                          className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-text-main dark:text-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {SPEEDS.map(s => (
                            <option key={s.value} value={String(s.value)}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Hidden audio element for guidance */}
                    <audio
                      ref={guidanceAudioRef}
                      onEnded={() => setGuidanceIsPlaying(false)}
                      onPause={() => setGuidanceIsPlaying(false)}
                      onPlay={() => setGuidanceIsPlaying(true)}
                      style={{ display: "none" }}
                    />
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
              <InlineError
                title="Something went wrong"
                message={result.error}
              />
            ) : (
              // Placeholder when no result yet
              <>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                  <div className="flex-1">
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
                      Submit an answer to see improved guidance.
                    </p>
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">Why this works better:</p>
                    <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed">
                      Submit an answer to see detailed guidance on how to improve your response.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

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

      {/* DEV-ONLY: Reset Onboarding Button (MVP BLOCKER FIX) */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            localStorage.removeItem('onboarding_complete');
            localStorage.removeItem('onboarding_role');
            localStorage.removeItem('onboarding_level');
            localStorage.removeItem('onboarding_type');
            window.location.reload();
          }}
          className="fixed bottom-4 left-4 z-[9999] bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono"
          title="Clear onboarding state and reload (DEV only)"
        >
          🔄 Reset Onboarding
        </button>
      )}
    </div>
  );
}
