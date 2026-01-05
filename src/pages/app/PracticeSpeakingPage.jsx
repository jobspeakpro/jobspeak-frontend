// src/pages/app/PracticeSpeakingPage.jsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "../../components/VoiceRecorder.jsx";
import InlineError from "../../components/InlineError.jsx";
import PaywallModal from "../../components/PaywallModal.jsx";
import MockInterviewPaywallCard from "../../components/MockInterviewPaywallCard.jsx";
import { usePracticeSession } from "../../hooks/usePracticeSession.js";
import { getUserKey } from "../../utils/userKey.js";
import { requestServerTTS, playAudioFromServer, speakBrowserTTS, stopAllTTS } from "../../utils/ttsClient.js";
import PracticeTour from "../../components/PracticeTour.jsx";
import OnboardingWizard from "../../components/OnboardingWizard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";
import ReferralSurveyModal from "../../components/ReferralSurveyModal.jsx";

// ========================================
// DEFENSIVE RENDERING HELPERS
// ========================================

/**
 * Safely converts any value to a string
 * Handles null, undefined, objects, arrays
 */
const toText = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join(" ");
  if (typeof v === "object") {
    return v.text || v.answer || v.content || v.message || JSON.stringify(v);
  }
  return String(v);
};

/**
 * Safely converts any value to an array
 * Handles null, undefined, single values
 */
const safeArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v) return [v];
  return [];
};

export default function PracticeSpeakingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Need user to check missing fields if possible, or just rely on local/flag
  
  // Debug mode: Check for ?debug=1 in URL
  const [isDebugMode, setIsDebugMode] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDebugMode(params.get('debug') === '1');
  }, []);
  
  // Debug state tracking
  const [debugState, setDebugState] = useState({
    lastApiStatus: null,
    lastApiTimestamp: null,
    referralModalTriggered: false,
    referralModalTimestamp: null,
    paywallOpened: false,
    paywallTimestamp: null,
  });

  // --- STATE DECLARATIONS (MUST BE FIRST) ---

  // 1. Onboarding State
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return !!localStorage.getItem("jsp_onboarding_complete_v1");
  });

  // 1b. Tutorial State (Database for logged-in, localStorage for guests)
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const [tutorialLoading, setTutorialLoading] = useState(true); // Prevent flicker

  // Load tutorial seen status from profile (logged-in) or localStorage (guest)
  useEffect(() => {
    const loadTutorialStatus = async () => {
      setTutorialLoading(true);

      if (user) {
        // Logged-in user: Check database profile
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('has_seen_practice_onboarding')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setTutorialSeen(!!data.has_seen_practice_onboarding);
          } else {
            // Fallback to false if profile not found
            setTutorialSeen(false);
          }
        } catch (err) {
          console.error('[Tutorial] Profile fetch error:', err);
          setTutorialSeen(false);
        }
      } else {
        // Guest user: Check localStorage
        const guestKey = 'practice_onboarding_seen';
        setTutorialSeen(!!localStorage.getItem(guestKey));
      }

      setTutorialLoading(false);
    };

    loadTutorialStatus();
  }, [user]);

  const handleTutorialComplete = async () => {
    if (user) {
      // Logged-in user: Update database
      try {
        await supabase
          .from('profiles')
          .update({ has_seen_practice_onboarding: true })
          .eq('id', user.id);

        console.log('[Tutorial] Marked as seen in database for user:', user.id);
      } catch (err) {
        console.error('[Tutorial] Failed to update profile:', err);
      }
    } else {
      // Guest user: Set localStorage
      localStorage.setItem('practice_onboarding_seen', 'true');
      console.log('[Tutorial] Marked as seen in localStorage for guest');
    }

    setTutorialSeen(true);
  };

  // 2. Profile Context State (Required for Practice Hook)
  const [profileContext, setProfileContext] = useState(null);

  // 3. Practice Session Hook (CRITICAL: Must be called before effects using its return values)
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
    handleTryAnotherQuestion: originalHandleTryAnotherQuestion, // RENAME to wrap it
    fetchFreeAttempts,
    lastApiStatus,
    lastApiTimestamp,
  } = usePracticeSession({ profileContext });

  // SINGLE SOURCE OF TRUTH for question text
  const questionText = currentQuestion?.question ?? currentQuestion?.prompt ?? "";

  // WRAPPER: Stop audio before switching question
  const handleTryAnotherQuestion = () => {
    stopAllAudio();
    originalHandleTryAnotherQuestion();
  };

  // HELPER: Vocab Highlighter with DEFENSIVE RENDERING
  // HELPER: Strip HTML tags (for Vocab Cards & Audio Text)
  const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "");

  // HELPER: Vocab Highlighter (Returns HTML String)
  const renderImprovedAnswerHtml = (text2, vocabList) => {
    // 1. Safe text conversion
    const safeText = text2 || "";
    if (!safeText || !safeText.trim()) return "";

    // 2. Safe Vocab List
    const safeVocabList = Array.isArray(vocabList) ? vocabList : [];

    // 3. Extract words
    const wordsToHighlight = safeVocabList
      .map(v => v?.word || v?.term || v?.vocab)
      .filter(w => typeof w === 'string' && w.length > 0)
      .map(w => w.toLowerCase());

    // 4. Console Warn if words missing
    if (wordsToHighlight.length > 0) {
      const lowerText = safeText.toLowerCase();
      wordsToHighlight.forEach(w => {
        if (!lowerText.includes(w)) {
          console.warn(`[Vocabulary Fix] Word "${w}" not found in clearer rewrite.`);
        }
      });
    }

    // 5. Trust existing tags
    if (safeText.includes("<u>")) return safeText;

    // 6. Inject tags if needed
    if (wordsToHighlight.length === 0) return safeText;

    // Escape regex chars
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b(${wordsToHighlight.map(escapeRegExp).join('|')})\\b`, 'gi');

    return safeText.replace(pattern, (match) => `<u>${match}</u>`);
  };

  // 4. UI State
  const [textInputMode, setTextInputMode] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showMockSelection, setShowMockSelection] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [showFixToast, setShowFixToast] = useState(false);
  const [ttsErrorToast, setTtsErrorToast] = useState(false); // Default error toast
  const [fallbackToast, setFallbackToast] = useState(false); // "Using browser voice fallback"
  const [ttsStatus, setTtsStatus] = useState({ mode: "server", message: "" }); // TTS status for UI feedback

  // 5. Referral Survey State
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  // 6. Debug State (only when ?debug=1)
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugState, setDebugState] = useState({
    lastApiStatus: null,
    lastApiTimestamp: null,
    referralModalTriggered: false,
    referralModalTimestamp: null,
    paywallOpened: false,
    paywallTimestamp: null,
  });
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDebugMode(params.get('debug') === '1');
  }, []);

  // --- EFFECTS ---

  // SYNC HOOK PAYWALL STATE TO PAGE STATE
  // Logic: when hook sets showUpgradeModal=true, we must open our local PaywallModal
  useEffect(() => {
    if (showUpgradeModal) {
      setShowPaywall(true);
      // Debug tracking
      if (isDebugMode) {
        setDebugState(prev => ({
          ...prev,
          paywallOpened: true,
          paywallTimestamp: new Date().toISOString(),
        }));
      }
    }
  }, [showUpgradeModal, isDebugMode]);

  // Auto-dismiss TTS error toast
  useEffect(() => {
    if (ttsErrorToast) {
      const timer = setTimeout(() => setTtsErrorToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [ttsErrorToast]);

  // Auto-dismiss Fallback toast
  useEffect(() => {
    if (fallbackToast) {
      const timer = setTimeout(() => setFallbackToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fallbackToast]);

  // Voice loading guard (prevent empty voice list)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.getVoices();
    const handler = () => synth.getVoices();
    synth.onvoiceschanged = handler;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // ONBOARDING HANDLERS
  const showWizard = !onboardingComplete;
  const handleWizardComplete = useCallback(() => {
    setOnboardingComplete(true);
    // The wizard component sets the localStorage flag "jsp_onboarding_complete_v1" = "1"
  }, []);

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
    let stored = localStorage.getItem("tts_question_voiceId");

    // Migration for legacy IDs
    const legacyMap = {
      // Oldest IDs
      "nova": "us_female_emma",
      "onyx": "us_male_jake",
      "shimmer": "us_female_ava",
      "echo": "uk_male_oliver",
      "fable": "uk_female_amelia",
      "ash": "uk_male_harry",
      // Intermediate IDs (from recent edits)
      "us_female_nova": "us_female_emma",
      "us_male_onyx": "us_male_jake",
      "us_female_shimmer": "us_female_ava",
      "uk_male_echo": "uk_male_oliver",
      "uk_female_fable": "uk_female_amelia",
      "uk_male_ash": "uk_male_harry"
    };

    if (stored && legacyMap[stored]) {
      stored = legacyMap[stored];
      localStorage.setItem("tts_question_voiceId", stored);
    }

    return stored || "us_female_emma";
  });

  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);


  // Voice options with real voice IDs supported by backend (Google TTS mapping)
  const QUESTION_VOICES = useMemo(
    () => [
      { id: "us_female_emma", label: "US Female — Emma" },
      { id: "us_female_ava", label: "US Female — Ava" },
      { id: "us_male_jake", label: "US Male — Jake" },
      { id: "uk_female_amelia", label: "UK Female — Amelia" },
      { id: "uk_male_oliver", label: "UK Male — Oliver" },
      { id: "uk_male_harry", label: "UK Male — Harry" },
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

  // Auto-play question audio on load if enabled
  useEffect(() => {
    localStorage.setItem("tts_question_autoplay", String(questionAutoplay));
  }, [questionAutoplay]);

  useEffect(() => {
    localStorage.setItem("tts_question_speed", String(questionSpeed));
  }, [questionSpeed]);

  useEffect(() => {
    localStorage.setItem("tts_question_voiceId", questionVoiceId);
  }, [questionVoiceId]);

  // Cleanup object URLs on unmount using refs (always current)
  useEffect(() => {
    return () => {
      if (questionAudioUrlRef.current) URL.revokeObjectURL(questionAudioUrlRef.current);
      if (guidanceAudioUrlRef.current) URL.revokeObjectURL(guidanceAudioUrlRef.current);
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

  // Force regenerate when voice changes to ensure different voices are actually different
  useEffect(() => {
    if (questionText && questionVoiceId) {
      // Clear current audio and force regenerate with new voice
      if (questionAudioUrlRef.current) {
        URL.revokeObjectURL(questionAudioUrlRef.current);
        questionAudioUrlRef.current = null;
      }
      setQuestionAudioUrl(null);
      setQuestionIsPlaying(false);

      // Auto-play if enabled
      if (questionAutoplay) {
        handlePlayQuestion({ forceRegenerate: true });
      }
    }
  }, [questionVoiceId]); // Only trigger when voice changes

  // HELPER: Stop all playing audio (Question & Guidance)
  const stopAllAudio = useCallback(() => {
    // 1. Question Audio
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      questionAudioRef.current.currentTime = 0;
    }
    setQuestionIsPlaying(false);

    // 2. Guidance Audio
    if (guidanceAudioRef.current) {
      guidanceAudioRef.current.pause();
      guidanceAudioRef.current.currentTime = 0;
    }
    setGuidanceIsPlaying(false);
  }, []);

  // AUTOPLAY EFFECT: Watch for new questionText
  // Triggers ONLY if autoplay is ON and text changes (and isn't empty)
  useEffect(() => {
    if (questionAutoplay && questionText && !isRecording && !isTranscribing) {
      // Prevent double-play if already playing (though questionText change implies new Q)
      // Use a small timeout to let the UI settle or strict check
      const timer = setTimeout(() => {
        // Force regenerate ensures we fetch new audio for the new text
        handlePlayQuestion({ forceRegenerate: true });
      }, 300); // 300ms delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [questionText]); // Run when text changes (new question)

  // Load Profile Effect
  useEffect(() => {
    // Helper to load context with prioritization: DB -> Local -> Default
    const loadContext = async () => {
      let context = {};

      // 1. Base: Try Local Storage (Wizard Data)
      try {
        const stored = localStorage.getItem("jsp_onboarding_v1");
        if (stored) {
          const localData = JSON.parse(stored);
          context = { ...localData };
        }
      } catch (e) {
        console.error("Error parsing local context", e);
      }

      // 2. Override: Authenticated User Profile (Supabase)
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            // Merge DB data on top (prioritize cloud over local)
            context = { ...context, ...data };
          }
        } catch (err) {
          console.error("Profile fetch error", err);
        }
      }

      setProfileContext(context);

      // Initialize Speed Pref
      if (context.tts_speed_pref) {
        // Map "slow"->"0.75", "normal"->"1.0", "fast"->"1.25"
        const speedMap = { "slow": 0.75, "normal": 1.0, "fast": 1.25 };
        const s = speedMap[context.tts_speed_pref] || 1.0;
        setGuidanceSpeed(s);
        setQuestionSpeed(s);
      }
    };
    loadContext();
  }, [user, onboardingComplete]); // reload if onboarding finishes

  // SYNC: Use backend-provided audio URL if avail (optimization)
  // This avoids a second fetch if the backend already generated usage
  useEffect(() => {
    if (result) {
      if (result.clearerRewriteAudioUrl) {
        // Use provided URL
        setGuidanceAudioUrl(result.clearerRewriteAudioUrl);
        guidanceAudioUrlRef.current = result.clearerRewriteAudioUrl;

        // Pre-load into audio element
        if (guidanceAudioRef.current) {
          guidanceAudioRef.current.src = result.clearerRewriteAudioUrl;
          guidanceAudioRef.current.playbackRate = guidanceSpeed;
        }
      } else {
        // Clear if not provided (so we generate on-the-fly)
        setGuidanceAudioUrl(null);
        guidanceAudioUrlRef.current = null;
      }
    }
  }, [result]);

  // REFERRAL SURVEY TRIGGER EFFECT
  // Trigger on FIRST completed practice for BOTH guests and logged-in users
  useEffect(() => {
    // Requirements: Result Visible + Not Loading + Not already answered
    const hasValidResult = result && !result.error && (result.improved || result.clearerRewrite || result.analysis);
    
    if (!hasValidResult || loading || isTranscribing) return;
    
    // Check if already answered (prevent double-trigger)
    const alreadyShown = localStorage.getItem("jsp_referral_done");
    if (alreadyShown) {
      console.log("[Referral Modal] Already shown in this session");
      return;
    }
    
    // For logged-in users: Check database
    if (user && profileContext) {
      const heardAboutUs = profileContext.heard_about_us;
      const isNull = heardAboutUs === null || heardAboutUs === undefined || heardAboutUs === "";
      
      console.log("[Referral Modal] Logged-in check:", {
        heardAboutUs,
        isNull,
        alreadyShown: !!alreadyShown
      });
      
      if (isNull) {
        console.log("[Referral Modal] Triggering modal (logged-in, DB NULL)");
        setShowReferralModal(true);
        localStorage.setItem("jsp_referral_done", "true");
        // Debug tracking
        if (isDebugMode) {
          setDebugState(prev => ({
            ...prev,
            referralModalTriggered: true,
            referralModalTimestamp: new Date().toISOString(),
          }));
        }
      } else {
        console.log("[Referral Modal] Already answered in DB:", heardAboutUs);
      }
    } 
    // For guests: Check localStorage
    else if (!user) {
      const guestAnswered = localStorage.getItem("jsp_heard_about_answered");
      const guestValue = localStorage.getItem("jsp_heard_about_value");
      
      console.log("[Referral Modal] Guest check:", {
        guestAnswered,
        guestValue,
        alreadyShown: !!alreadyShown
      });
      
      if (!guestAnswered || !guestValue) {
        console.log("[Referral Modal] Triggering modal (guest, not answered)");
        setShowReferralModal(true);
        localStorage.setItem("jsp_referral_done", "true");
        // Debug tracking
        if (isDebugMode) {
          setDebugState(prev => ({
            ...prev,
            referralModalTriggered: true,
            referralModalTimestamp: new Date().toISOString(),
          }));
        }
      } else {
        console.log("[Referral Modal] Guest already answered:", guestValue);
      }
    }
  }, [user, result, loading, isTranscribing, profileContext]);

  // Handler for question audio - centralized with proper blob URL management
  const handlePlayQuestion = useCallback(async (options = {}) => {
    const { forceRegenerate = false } = options;
    const token = ++questionPlayTokenRef.current;

    // Toggle Logic (if already has URL and not forced)
    if (questionAudioUrl && !forceRegenerate) {
      if (questionIsPlaying) {
        questionAudioRef.current?.pause();
        window.speechSynthesis.cancel(); // Stop browser TTS if active
        setQuestionIsPlaying(false);
      } else {
        try {
          if (questionAudioRef.current) {
            questionAudioRef.current.playbackRate = questionSpeed;
            await questionAudioRef.current.play();
            if (token === questionPlayTokenRef.current) setQuestionIsPlaying(true);
          }
        } catch (e) {
          console.error("Resume error", e);
          if (token === questionPlayTokenRef.current) setQuestionIsPlaying(false);
        }
      }
      return;
    }

    const textToPlay = questionText || "Tell me about yourself";

    // CRITICAL: Stop all TTS before starting new playback
    stopAllTTS();
    setTtsStatus({ mode: "server", message: "Generating voice..." });

    // Try SERVER TTS first
    const server = await requestServerTTS({ text: textToPlay, voiceId: questionVoiceId, speed: questionSpeed });

    // Token check: stop if request is stale
    if (token !== questionPlayTokenRef.current) {
      return;
    }

    if (server.ok && (server.audioBase64 || server.audioUrl)) {
      try {
        const url = server.audioUrl || `data:audio/mp3;base64,${server.audioBase64}`;

        const a = questionAudioRef.current;
        if (!a) return;

        // Revoke old blob URL before setting new one
        if (questionAudioUrlRef.current && questionAudioUrlRef.current !== url) {
          URL.revokeObjectURL(questionAudioUrlRef.current);
        }

        questionAudioUrlRef.current = url;
        setQuestionAudioUrl(url);

        a.src = url;
        a.playbackRate = questionSpeed;

        await a.play();
        if (token === questionPlayTokenRef.current) {
          setQuestionIsPlaying(true);
          setTtsStatus({ mode: "server", message: "" });
        }
        return; // CRITICAL: Exit early to prevent fallback
      } catch (err) {
        console.warn("Server playback failed, falling back", err);
        // Fall through to browser
      }
    }

    // ONLY reach here if server failed - use browser TTS
    if (token === questionPlayTokenRef.current) {
      setTtsStatus({ mode: "browser", message: "Using browser voice" });
      setQuestionIsPlaying(true);

      await speakBrowserTTS({ text: textToPlay, rate: questionSpeed });

      if (token === questionPlayTokenRef.current) {
        setQuestionIsPlaying(false);
        setTtsStatus({ mode: "server", message: "" });
      }
    }
  }, [questionText, questionVoiceId, questionSpeed, questionAudioUrl, questionIsPlaying]);

  // Handler for guidance audio (improved answer)
  const handlePlayGuidance = useCallback(async () => {
    const token = ++guidancePlayTokenRef.current;
    const textToPlay = stripHtml(improvedAnswerText);

    if (!textToPlay) return;

    // Toggle if already loaded
    if (guidanceAudioUrl) {
      if (guidanceIsPlaying) {
        guidanceAudioRef.current?.pause();
        window.speechSynthesis.cancel(); // Stop browser TTS if active
        setGuidanceIsPlaying(false);
      } else {
        try {
          if (guidanceAudioRef.current) {
            guidanceAudioRef.current.playbackRate = guidanceSpeed;
            await guidanceAudioRef.current.play();
            if (token === guidancePlayTokenRef.current) setGuidanceIsPlaying(true);
          }
        } catch (e) {
          console.error("Guidance resume error", e);
          if (token === guidancePlayTokenRef.current) setGuidanceIsPlaying(false);
        }
      }
      return;
    }

    setTtsStatus({ mode: "server", message: "Generating voice..." });

    // Try SERVER TTS first
    const server = await requestServerTTS({ text: textToPlay, voiceId: questionVoiceId, speed: guidanceSpeed });

    if (token !== guidancePlayTokenRef.current) {
      return;
    }

    if (server.ok && (server.audioBase64 || server.audioUrl)) {
      try {
        const url = server.audioUrl || `data:audio/mp3;base64,${server.audioBase64}`;

        const a = guidanceAudioRef.current;
        if (!a) return;

        // Revoke old blob URL before setting new one
        if (guidanceAudioUrlRef.current && guidanceAudioUrlRef.current !== url) {
          URL.revokeObjectURL(guidanceAudioUrlRef.current);
        }

        guidanceAudioUrlRef.current = url;
        setGuidanceAudioUrl(url);

        a.src = url;
        a.playbackRate = guidanceSpeed;

        await a.play();
        if (token === guidancePlayTokenRef.current) {
          setGuidanceIsPlaying(true);
          setTtsStatus({ mode: "server", message: "" });
        }
        return; // CRITICAL: Exit early to prevent fallback
      } catch (err) {
        console.warn("Guidance playback failed, falling back", err);
        // Fall through to browser
      }
    }

    // ONLY reach here if server failed - use browser TTS
    if (token === guidancePlayTokenRef.current) {
      setTtsStatus({ mode: "browser", message: "Using browser voice" });
      setGuidanceIsPlaying(true);

      await speakBrowserTTS({ text: textToPlay, rate: guidanceSpeed });

      if (token === guidancePlayTokenRef.current) {
        setGuidanceIsPlaying(false);
        setTtsStatus({ mode: "server", message: "" });
      }
    }
  }, [improvedAnswerText, questionVoiceId, guidanceSpeed, guidanceAudioUrl, guidanceIsPlaying]);

  // Handler for "Practice again" button - resets to allow re-answering same question
  const handlePracticeAgain = useCallback(() => {
    // Reset answer and results to allow practicing the same question again
    setText("");
    setError("");
    setTextInputMode(false);

    // Clear guidance audio
    if (guidanceAudioRef.current) {
      guidanceAudioRef.current.pause();
      guidanceAudioRef.current.currentTime = 0;
    }
    if (guidanceAudioUrlRef.current) {
      URL.revokeObjectURL(guidanceAudioUrlRef.current);
      guidanceAudioUrlRef.current = null;
    }
    setGuidanceAudioUrl(null);
    setGuidanceIsPlaying(false);

    // Note: result state is managed by usePracticeSession hook
    // It will be cleared when handleImproveAnswer is called next
  }, [setText, setError]);

  // ... (rest of render)

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased transition-colors duration-200">
      {/* Debug Panel - Only visible when ?debug=1 */}
      {isDebugMode && (
        <div className="fixed top-4 right-4 z-[10000] bg-black/90 text-white p-4 rounded-lg shadow-xl font-mono text-xs max-w-md border border-yellow-500">
          <div className="font-bold text-yellow-400 mb-2">🔍 DEBUG PANEL</div>
          
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">User State:</span> {user ? `Logged-in (${user.id?.substring(0, 8)}...)` : 'Guest'}
            </div>
            
            <div>
              <span className="text-gray-400">Fix My Answer Attempts:</span> {freeImproveUsage.count} / {freeImproveUsage.limit}
            </div>
            
            <div>
              <span className="text-gray-400">Last API Status:</span> {lastApiStatus || 'N/A'} {lastApiTimestamp && `(${new Date(lastApiTimestamp).toLocaleTimeString()})`}
            </div>
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-yellow-400 font-bold mb-1">Referral State:</div>
              <div className="pl-2 space-y-1">
                <div>
                  <span className="text-gray-400">localStorage jsp_heard_about_answered:</span> {localStorage.getItem("jsp_heard_about_answered") || 'null'}
                </div>
                <div>
                  <span className="text-gray-400">localStorage jsp_heard_about_value:</span> {localStorage.getItem("jsp_heard_about_value") || 'null'}
                </div>
                <div>
                  <span className="text-gray-400">profile heard_about_us:</span> {profileContext?.heard_about_us || 'null'}
                </div>
                <div>
                  <span className="text-gray-400">Referral modal triggered:</span> {debugState.referralModalTriggered ? 'YES' : 'NO'} {debugState.referralModalTimestamp && `(${new Date(debugState.referralModalTimestamp).toLocaleTimeString()})`}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-yellow-400 font-bold mb-1">Paywall State:</div>
              <div className="pl-2">
                <div>
                  <span className="text-gray-400">Paywall opened:</span> {debugState.paywallOpened ? 'YES' : 'NO'} {debugState.paywallTimestamp && `(${new Date(debugState.paywallTimestamp).toLocaleTimeString()})`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Referral Modal - Highest Priority Overlay */}
      {showReferralModal && (
        <ReferralSurveyModal
          onComplete={() => {
            setShowReferralModal(false);
            // Mark as done to prevent showing again (already set in trigger logic, but ensure it's set)
            localStorage.setItem("jsp_referral_done", "true");
          }}
        />
      )}

      {/* Paywall Modal - Show when limit reached */}
      {showPaywall && (
        <PaywallModal
          onClose={() => {
            setShowPaywall(false);
            setShowUpgradeModal(false);
          }}
          onNotNow={() => {
            setShowPaywall(false);
            setShowUpgradeModal(false);
          }}
        />
      )}

      {/* Strict Gating: Show Wizard first. Block Tour until complete. */}
      {showWizard && (
        <OnboardingWizard onComplete={handleWizardComplete} />
      )}

      {/* Tour only shows if Onboarding is NOT showing (completed) AND not seen yet AND not loading */}
      {!showWizard && !tutorialLoading && !tutorialSeen && (
        <PracticeTour
          onComplete={handleTutorialComplete}
          onClose={handleTutorialComplete} // Treat close as complete to avoid spam
        />
      )}

      {/* Use shared header */}
      <UniversalHeader />

      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 md:px-6 pb-20">

        <div className="w-full max-w-[900px] flex flex-col gap-8">
          {/* Title and subtitle */}
          <div className="text-center space-y-2 pt-4">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Practice Speaking</h1>
            <p className="text-text-secondary dark:text-gray-400 text-base md:text-lg font-light">Take your time. Practice is private and judgment-free.</p>
          </div>

          {/* Question Card */}
          <div className="w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div
              className="relative w-full bg-cover bg-center flex flex-col min-h-[400px] md:min-h-[450px]"
              style={{ backgroundImage: "linear-gradient(135deg, rgba(19, 109, 236, 0.8) 0%, rgba(16, 24, 34, 0.9) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuBe5ft9h7R5hRXjmGP00v19h7Hyg6FG-sBHO3a_wHZOqYyb1mwpub1Eh1XZ9AfTAiJ2Qfcs13PRgmLHiHZ9hDBzJTjWq8BNHbW6Mv2ZvrBKxT1yxaRAGW-cDTv-lzifrxJX68MCE0K9CAhcmPBKzxYuBhuzlDKewC7hVWviiKjqeBXaI9wC9d7NRJI6C26vmZ0yvqw_QX7D3bIoQIwixlQIeRWtOpGFgxI-E9kHlks3YCZ9Bufn_5yr66WTiOMharmAjYlI5iEkI9')" }}
            >
              {/* Centered Question Content */}
              <div className="flex-1 flex items-center justify-center p-6 md:p-8">
                <div className="max-w-3xl w-full text-center">
                  <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-snug drop-shadow-md">
                    {questionText}
                  </h3>
                  {currentQuestion?.hint && (
                    <p className="text-white/90 text-sm md:text-base mt-4 font-medium">
                      {currentQuestion.hint}
                    </p>
                  )}
                </div>
              </div>

              {/* Docked Control Bar at Bottom */}
              <div className="relative z-10 w-full bg-black/20 backdrop-blur-sm border-t border-white/10 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Left: Play + Autoplay */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayQuestion}
                      className="inline-flex items-center justify-center size-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all"
                      title={questionIsPlaying ? "Pause" : "Play question"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {questionIsPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 text-white/90 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={questionAutoplay}
                        onChange={(e) => setQuestionAutoplay(e.target.checked)}
                        className="size-3.5 rounded border-white/30 bg-white/20 checked:bg-primary focus:ring-2 focus:ring-white/50"
                      />
                      <span>Autoplay</span>
                    </label>
                  </div>

                  {/* Middle: Speed + Voice */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={String(questionSpeed)}
                      onChange={(e) => setQuestionSpeed(Number(e.target.value))}
                      className="h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white text-xs px-2 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[70px]"
                    >
                      {SPEEDS.map(s => (
                        <option key={s.value} value={String(s.value)} style={{ background: "#1e293b", color: "white" }}>{s.label}</option>
                      ))}
                    </select>
                    <select
                      data-tour="voice-select"
                      value={questionVoiceId}
                      onChange={(e) => setQuestionVoiceId(e.target.value)}
                      className="h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white text-xs px-2 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[140px]"
                    >
                      {QUESTION_VOICES.map(v => (
                        <option key={v.id} value={v.id} style={{ background: "#1e293b", color: "white" }}>{v.label}</option>
                      ))}
                    </select>

                    {/* TTS Status Feedback */}
                    {ttsStatus?.mode === "browser" && ttsStatus?.message && (
                      <div className="text-xs text-white/80 px-2 py-1 bg-white/10 rounded">
                        {ttsStatus.message}
                      </div>
                    )}
                  </div>

                  {/* Right: Next Question */}
                  <button
                    type="button"
                    data-tour="next-question"
                    onClick={handleTryAnotherQuestion}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold transition-all border border-white/30 shadow-sm"
                  >
                    <span>Next question</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
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
                        data-tour="mic-button"
                        onClick={recording ? stopRecording : startRecording}
                        disabled={transcribing}
                        className={`group relative flex items-center justify-center size-20 rounded-full shadow-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                            ${recording
                            ? "animate-pulse bg-red-600 hover:bg-red-700 shadow-red-600/30 ring-2 ring-red-600/50 shadow-[0_0_0_6px_rgba(220,38,38,0.3)]"
                            : "bg-primary hover:bg-primary-hover shadow-primary/30"}`}
                      >
                        <span className="material-symbols-outlined text-white text-4xl group-hover:animate-pulse">
                          {recording ? "stop" : "mic"}
                        </span>
                        <span className="absolute -bottom-8 text-sm font-semibold text-text-secondary dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {recording ? "Stop Recording" : "Record Voice"}
                        </span>
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

                {/* Transcription Status Feedback */}
                {isTranscribing && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-3 animate-pulse">
                    Transcribing… please wait
                  </div>
                )}
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
                    // FAILSAFE: Handle ANY error that escapes handleImproveAnswer
                    console.error("[PracticeSpeakingPage] Error in handleImproveAnswer:", err);
                    
                    // Ensure loading is cleared
                    setLoading(false);
                    
                    // Handle "Fix unavailable" error with toast
                    if (err.isFixUnavailable || err.message === "FIX_UNAVAILABLE") {
                      setShowFixToast(true);
                      setError("");
                    } else {
                      // Show error message for any other error (NO SILENT FAILURES)
                      setError(err.message || "Something went wrong. Please try again.");
                    }
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

        {/* Guidance Card - Same Width as Above */}
        <div className="w-full max-w-[900px]">
          {/* Note: In expanded view, we use the detailed results block above */}
          {/* Placeholder state logic managed inside Guidance Results */}
          {loading ? (
            <div className="w-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : result && !result.error ? (() => {
            // -- ROBUST DATA MAPPING --

            // Check if backend actually returned the extended analysis fields
            // -- ROBUST DATA MAPPING --

            // Check if backend actually returned the extended analysis fields
            // Handle varied shapes: result.analysis, result.guidance, or flat result
            const analysisObj = result?.analysis ?? result?.guidance ?? result ?? {};

            // PROFANITY CHECK (Frontend)
            const PROFANITY_LIST = ["fuck", "shit", "bitch", "asshole", "damn", "crap", "bastard", "dick", "pussy", "cock", "slut"];
            const containsProfanity = (str) => {
              if (!str) return false;
              const lower = str.toLowerCase();
              return PROFANITY_LIST.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
            };
            const hasProfanity = result?.metadata?.professionalism?.flagged || containsProfanity(text);

            const score = analysisObj?.score ?? null;

            // COMPREHENSIVE FALLBACK CHAINS for all feedback fields
            const whatWorkedRaw = analysisObj?.whatWorked ?? analysisObj?.strengths ?? [];

            const improveNextRaw =
              analysisObj?.improvements ??
              analysisObj?.improveNext ??
              analysisObj?.feedback?.improvements ??
              analysisObj?.feedback?.weaknesses ??
              analysisObj?.summary?.improvements ??
              result?.improvements ??
              [];

            const hiringManagerHeard =
              analysisObj?.interpretation ??
              analysisObj?.hiringManagerHeard ??
              analysisObj?.hmHeard ??
              analysisObj?.feedback?.interpretation ??
              analysisObj?.feedback?.whatHiringManagerHeard ??
              analysisObj?.summary?.interpretation ??
              result?.interpretation ??
              "";

            const vocabRaw =
              analysisObj?.vocabulary ??
              analysisObj?.vocab ??
              analysisObj?.feedback?.vocabulary ??
              analysisObj?.feedback?.vocab ??
              analysisObj?.summary?.vocabulary ??
              result?.vocabulary ??
              [];

            // Helper to clean bullets - DEFENSIVE
            const cleanList = (raw) => {
              const safeRaw = safeArray(raw); // Use defensive helper
              if (safeRaw.length > 0 && typeof safeRaw[0] === 'string') return safeRaw;
              if (typeof raw === "string") return raw.split(/\n/).map(s => s.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
              return [];
            };

            let whatWorked = cleanList(whatWorkedRaw);
            const improveNext = cleanList(improveNextRaw);

            // PROFANITY OVERRIDE
            if (hasProfanity) {
              // Replace praise with neutral statement
              whatWorked = ["You responded quickly under pressure."];
              // Ensure no misleading praise in improveNext if any (though usually Improve is specific)
              // We keep Improve Next actionable as per requirements
            }

            // Limited to 2 cards - DEFENSIVE
            const vocabulary = safeArray(vocabRaw).slice(0, 2);

            // Improved Answer / Clearer Rewrite
            const improvedAnswerText =
              analysisObj?.clearerRewrite ??
              analysisObj?.improved ??
              analysisObj?.improvedAnswer ??
              analysisObj?.rewrite ??
              analysisObj?.betterAnswer ??
              analysisObj?.feedback?.clearerRewrite ??
              analysisObj?.feedback?.rewrite ??
              analysisObj?.summary?.rewrite ??
              result?.clearerRewrite ??
              result?.improved ??
              "";

            // DEFENSIVE: Extract audio URL for clearer rewrite
            const clearerRewriteAudioUrl =
              analysisObj?.clearerRewriteAudioUrl ??
              analysisObj?.clearerRewrite?.audioUrl ??
              analysisObj?.audioUrl ??
              analysisObj?.feedback?.clearerRewriteAudioUrl ??
              analysisObj?.feedback?.audioUrl ??
              result?.clearerRewriteAudioUrl ??
              result?.audioUrl ??
              null;

            // DEBUG: Log what we extracted
            console.log("[PRACTICE] Extracted feedback:", {
              score,
              whatWorked: whatWorked.length,
              improveNext: improveNext.length,
              hiringManagerHeard: hiringManagerHeard ? "present" : "missing",
              vocabulary: vocabulary.length,
              improvedAnswerText: improvedAnswerText ? "present" : "missing"
            });

            return (
              <div className="w-full flex flex-col gap-6 animate-fade-in">

                {/* Profanity Warning Banner */}
                {hasProfanity && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 mt-0.5">warning</span>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Professionalism Alert</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        We rewrote this professionally because the original contained unprofessional language.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Transcript Accordion */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-0 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                    className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">YOUR ANSWER (TRANSCRIPT)</h3>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isTranscriptOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {isTranscriptOpen && (
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-text-main dark:text-gray-300 leading-relaxed text-sm md:text-base mt-4 break-words [overflow-wrap:anywhere]">
                        {text}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Score Block */}
                {typeof score === "number" && (
                  <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-6">
                      <div className="relative size-16 flex items-center justify-center rounded-full border-4 border-primary/20 text-primary font-bold text-xl">
                        {score}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-text-main dark:text-white">Okay, let's look at this.</h4>
                        <p className="text-sm text-text-secondary dark:text-gray-400">Score: {score}/100</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Feedback Columns - ALWAYS VISIBLE */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* What Worked */}
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-6 border border-green-100 dark:border-green-900/30">
                    <h4 className="font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      What you did well
                    </h4>
                    {whatWorked.length > 0 ? (
                      <ul className="space-y-3">
                        {whatWorked.map((item, i) => (
                          <li key={i} className="text-sm text-text-main dark:text-gray-300 flex gap-2 items-start break-words [overflow-wrap:anywhere]">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">This feedback will appear once analysis completes.</p>
                    )}
                  </div>

                  {/* Improve Next */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-6 border border-amber-100 dark:border-amber-900/30">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined">lightbulb</span>
                      Tips for next time
                    </h4>
                    {improveNext.length > 0 ? (
                      <ul className="space-y-3">
                        {improveNext.map((item, i) => (
                          <li key={i} className="text-sm text-text-main dark:text-gray-300 flex gap-2 items-start break-words [overflow-wrap:anywhere]">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">This feedback will appear once analysis completes.</p>
                    )}
                  </div>
                </div>

                {/* 4. Hiring Manager Box - ALWAYS VISIBLE */}
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-900/30">
                  <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">psychology</span>
                    How you came across
                  </h4>
                  <p className="text-purple-900 dark:text-purple-200 italic text-sm leading-relaxed">
                    "{hiringManagerHeard ? hiringManagerHeard.replace(/seems junior/gi, "signals early-career level") : "This feedback will appear once analysis completes."}"
                  </p>
                </div>



                {/* 6. Vocabulary Section - Show exactly 2 words */}
                {vocabulary.length > 0 && (
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined">book_2</span>
                      Vocabulary to level up your answer
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vocabulary.slice(0, 2).map((item, i) => {
                        const word = item.word ?? item.term ?? item.vocab ?? "";
                        const definition = stripHtml(item.definition ?? item.meaning ?? "");
                        const example = stripHtml(item.usage ?? item.example ?? item.sentence ?? "");
                        const partOfSpeech = item.partOfSpeech ?? item.pos ?? "";
                        const ipa = item.ipa ?? item.phonetic ?? "";

                        // Only render if we have both word and definition
                        if (!word || !definition) return null;

                        return (
                          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-left h-full flex flex-col gap-2">
                            {/* Row 1: Word + Part of Speech */}
                            <div className="flex items-baseline gap-2 mb-1">
                              <h5 className="font-bold text-xl dark:text-white text-left text-slate-900">{word}</h5>
                              {partOfSpeech && (
                                <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                                  ({partOfSpeech.toLowerCase()})
                                </span>
                              )}
                            </div>

                            {/* Row 2: IPA Phonetic + US Button (only if IPA exists) */}
                            {ipa && (
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{ipa}</span>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!word) return;
                                    try {
                                      const result = await requestServerTTS({
                                        text: word,
                                        voiceId: questionVoiceId,
                                        speed: 1.0
                                      });

                                      if (result.ok && (result.audioBase64 || result.audioUrl)) {
                                        const audio = new Audio();
                                        if (result.audioUrl) {
                                          audio.src = result.audioUrl;
                                        } else if (result.audioBase64) {
                                          audio.src = `data:audio/mp3;base64,${result.audioBase64}`;
                                        }
                                        await audio.play();
                                      } else {
                                        // Fallback to browser TTS
                                        await speakBrowserTTS({ text: word, rate: 1.0 });
                                      }
                                    } catch (e) {
                                      console.error("Vocab play error", e);
                                      // Try browser fallback on error
                                      try {
                                        await speakBrowserTTS({ text: word, rate: 1.0 });
                                      } catch (fallbackError) {
                                        console.error("Browser TTS fallback failed", fallbackError);
                                      }
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-colors tracking-wide"
                                  title="Play US pronunciation"
                                >
                                  <span className="material-symbols-outlined text-[14px]">volume_up</span>
                                  US
                                </button>
                              </div>
                            )}

                            {/* Row 3: Definition */}
                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                              <span className="font-semibold text-slate-900 dark:text-white">Definition:</span> {definition}
                            </div>

                            {/* Row 4: Example Usage */}
                            {example && (
                              <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                                <span className="font-medium not-italic text-slate-500">Example:</span> "{example}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Guidance (Improved Answer) - ALWAYS VISIBLE */}
                <div className="w-full bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 p-6 shadow-sm">
                  <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Here's a clearer way to say this:
                  </h4>
                  {/* Question Display */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white leading-tight">
                      {currentQuestion.question}
                    </h2>

                    {/* Personalization Indicator */}
                    {profileContext && (profileContext.job_title || profileContext.industry || profileContext.seniority) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        <span>
                          Personalized for:
                          {profileContext.job_title && <span className="font-medium text-slate-700 dark:text-slate-300"> {profileContext.job_title}</span>}
                          {profileContext.industry && <> • {profileContext.industry}</>}
                          {profileContext.seniority && <> • {profileContext.seniority}</>}
                        </span>
                      </div>
                    )}

                    {currentQuestion.hint && (
                      <p className="text-sm text-text-secondary dark:text-gray-400 italic">
                        💡 {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                  {improvedAnswerText ? (
                    <div className="relative">
                      {/* Audio Controls - Always show if text exists */}
                      <div
                        className="text-text-main dark:text-gray-200 leading-relaxed mb-4 break-words [overflow-wrap:anywhere]"
                        dangerouslySetInnerHTML={{ __html: renderImprovedAnswerHtml(improvedAnswerText, vocabulary) }}
                      />

                      <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          disabled={!improvedAnswerText}
                          onClick={handlePlayGuidance}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-sm font-medium transition-all shadow-sm flex-shrink-0 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {guidanceIsPlaying ? "pause" : "play_arrow"}
                          </span>
                          <span>{guidanceIsPlaying ? "Pause" : "Play audio"}</span>
                        </button>

                        <select
                          value={guidanceSpeed}
                          onChange={(e) => setGuidanceSpeed(parseFloat(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="h-[34px] rounded-lg border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          <option value={0.8}>0.8×</option>
                          <option value={1.0}>1.0×</option>
                          <option value={1.2}>1.2×</option>
                          <option value={1.5}>1.5×</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic mt-4">This feedback will appear once analysis completes.</p>
                  )}
                  {/* Guidance Audio Element */}
                  <audio
                    ref={guidanceAudioRef}
                    onPlay={() => setGuidanceIsPlaying(true)}
                    onPause={() => setGuidanceIsPlaying(false)}
                    onEnded={() => setGuidanceIsPlaying(false)}
                    onError={(e) => {
                      console.error("Guidance audio error", e);
                      setGuidanceIsPlaying(false);
                    }}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Placeholder for Mock Interview Modal is not here, it's a separate component or route */}

                {/* Action Buttons */}
                <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handlePracticeAgain}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Practice Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTryAnotherQuestion}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all shadow-md"
                  >
                    <span>Next Question</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

              </div>
            );
          })() : result?.error ? (

            <InlineError
              title="Something went wrong"
              message={result.error}
            />
          ) : (
            /* Placeholder State - Render "Guidance" header but empty content */
            <div data-tour="guidance" className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm opacity-60">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-main dark:text-white">Guidance</h4>
                  <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">Submit an answer to see detailed feedback.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mock Interview CTA - Unified Component */}
          <div className="w-full max-w-lg mx-auto mt-6">
            <MockInterviewPaywallCard />
          </div>

          {/* Free Plan Info Card */}
          {!isPro && (
            <div data-tour="free-banner" className="w-full max-w-lg mx-auto mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 flex gap-4 items-start">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">info</span>
              <div className="flex-1">
                <p className="text-sm text-text-secondary dark:text-slate-400 leading-relaxed">
                  You've used <span className="font-medium text-text-main dark:text-slate-200">{usage.used} of {usage.limit === Infinity ? "∞" : usage.limit}</span> free practice questions for today. You can continue tomorrow or upgrade for unlimited practice.
                </p>
                <a className="inline-block mt-2 text-sm font-semibold text-primary hover:underline" href="#" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>
                  View upgrade options
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">lock</span>
            Practice is private. You're here to learn, not perform.
          </p>
        </footer>
      </main>

      {/* Notification Toast */}
      {
        showNotificationToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Notifications coming soon</p>
              </div>
              <button
                onClick={() => setShowNotificationToast(false)}
                className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ✕
              </button>
            </div>
          </div>
        )
      }

      {/* Fallback Toast */}
      {
        fallbackToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
            Using browser voice fallback.
          </div>
        )
      }

      {/* TTS Error Toast */}
      {
        ttsErrorToast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">volume_off</span>
              <div>
                <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Audio unavailable right now</p>
              </div>
              <button
                onClick={() => setTtsErrorToast(false)}
                className="ml-auto text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200"
              >
                ✕
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}
