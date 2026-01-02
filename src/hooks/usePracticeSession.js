// src/hooks/usePracticeSession.js
import { useState, useEffect, useRef } from "react";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
import { normalizePracticeFeedback } from "../utils/apiNormalizers.js";
import { usePro } from "../contexts/ProContext.jsx";
import { getUserKey } from "../utils/userKey.js";
import { isBlocked } from "../utils/usage.js";
import { gaEvent } from "../utils/ga.js";

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

export function usePracticeSession({ profileContext } = {}) {
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

  // Track seen questions to avoid repetition (Last 20)
  const [seenQuestionIds, setSeenQuestionIds] = useState(() => {
    try {
      const stored = localStorage.getItem("jsp_seen_questions");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // CRITICAL: Separate counter for PRACTICE QUESTIONS ONLY (not STT, not onboarding)
  // This is the counter that drives paywall gating
  const [practiceQuestionsUsed, setPracticeQuestionsUsed] = useState(() => {
    try {
      const stored = localStorage.getItem("jsp_practice_questions_used");
      return stored ? parseInt(stored, 10) : 0;
    } catch { return 0; }
  });

  // Guard to prevent double-counting same question
  const lastConsumedQuestionIdRef = useRef(null);

  const [questionNumber, setQuestionNumber] = useState(1);

  // Paywall logic based on PRACTICE QUESTIONS, not STT usage
  const PRACTICE_QUESTION_LIMIT = 3;
  const isPaywalled = !isPro && practiceQuestionsUsed >= PRACTICE_QUESTION_LIMIT;

  // Save practice questions used to localStorage
  useEffect(() => {
    localStorage.setItem("jsp_practice_questions_used", String(practiceQuestionsUsed));
  }, [practiceQuestionsUsed]);

  // Save seen questions
  useEffect(() => {
    localStorage.setItem("jsp_seen_questions", JSON.stringify(seenQuestionIds));
  }, [seenQuestionIds]);

  // Helper to pick a random question excluding seen ones
  const pickRandomQuestion = (excludeIds, questionPool = practiceQuestions) => {
    // Generate simple hash/ID for static questions if they don't have one
    const getQId = (q) => q.id || q.question.substring(0, 20);

    const available = questionPool.filter(q => !excludeIds.includes(getQId(q)));
    // If all seen, reset availability to all (minus current if separate) or just all
    const pool = available.length > 0 ? available : questionPool;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Personalized questions state
  const [personalizedQuestions, setPersonalizedQuestions] = useState(null);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);

  // Fetch personalized demo questions based on onboarding data
  const fetchPersonalizedQuestions = async (profileContext) => {
    if (!profileContext || loadingPersonalized) return;

    try {
      setLoadingPersonalized(true);
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

      const params = new URLSearchParams({
        jobTitle: profileContext.job_title || '',
        industry: profileContext.industry || '',
        seniority: profileContext.seniority || '',
        focusAreas: Array.isArray(profileContext.focus_areas)
          ? profileContext.focus_areas.join(',')
          : (profileContext.focus_areas || '')
      });

      const response = await fetch(`${API_BASE}/api/practice/demo-questions?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          // Cache in localStorage
          localStorage.setItem('jsp_personalized_questions', JSON.stringify(data.questions));
          setPersonalizedQuestions(data.questions);
          console.log('[PERSONALIZATION] Loaded', data.questions.length, 'personalized questions');
          return data.questions;
        }
      }
    } catch (err) {
      console.error('[PERSONALIZATION] Failed to fetch personalized questions:', err);
    } finally {
      setLoadingPersonalized(false);
    }
    return null;
  };

  // Load personalized questions from cache or fetch on mount
  useEffect(() => {
    // Try to load from cache first
    try {
      const cached = localStorage.getItem('jsp_personalized_questions');
      if (cached) {
        const questions = JSON.parse(cached);
        if (Array.isArray(questions) && questions.length > 0) {
          setPersonalizedQuestions(questions);
          console.log('[PERSONALIZATION] Loaded from cache:', questions.length, 'questions');
        }
      }
    } catch (err) {
      console.error('[PERSONALIZATION] Cache load error:', err);
    }

    // Fetch fresh personalized questions if profileContext is available
    if (profileContext && profileContext.job_title) {
      fetchPersonalizedQuestions(profileContext);
    }
  }, [profileContext?.job_title, profileContext?.industry, profileContext?.seniority]);

  // Use personalized questions if available, otherwise fall back to static
  const activeQuestionPool = personalizedQuestions || practiceQuestions;

  // Initialize with random question from active pool
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    return pickRandomQuestion(seenQuestionIds, activeQuestionPool);
  });

  // Track current question when it changes
  useEffect(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id || currentQuestion.question.substring(0, 20);

    setSeenQuestionIds(prev => {
      const newDocs = prev.filter(id => id !== qId); // move to end
      newDocs.push(qId);
      if (newDocs.length > 20) newDocs.shift();
      return newDocs;
    });
  }, [currentQuestion]);

  // Fetch free attempts from backend API (for display only, not gating)
  const fetchFreeAttempts = async ({ silent = false } = {}) => {
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

      // If we successfully fetched usage, we know server is available
      setServerUnavailable(false);
    } catch (err) {
      console.error("Error fetching free attempts:", err);
      if (!silent && isNetworkError(err)) {
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

    // DEFENSIVE GUARD: Validate input before proceeding
    if (typeof text !== "string" || !text.trim()) {
      setError("Record or type an answer first.");
      setLoading(false);
      return;
    }

    gaEvent("practice_submit", { page: "practice" });
    setError("");
    setResult(null);
    setLoading(true);

    try {
      try {
        const sessionId = `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const payload = {
          sessionId,
          questionId: currentQuestion?.id || `q_${Date.now()}`, // Ensure ID is present
          questionText: currentQuestion?.question || currentQuestion?.prompt || currentQuestion?.text || "Practice Question",
          answerText: text
        };

        // Inject profile context if available
        if (profileContext) {
          payload.jobTitle = profileContext.job_title;
          payload.seniority = profileContext.seniority;
          payload.focusAreas = profileContext.focus_areas;
          payload.industry = profileContext.industry;
          payload.difficulty = profileContext.difficulty;
        }

        const data = await apiClient("/api/practice/answer", {
          method: "POST",
          body: payload,
        });
        const normalized = normalizePracticeFeedback(data);
        setResult(normalized);

        // INCREMENT PRACTICE QUESTION COUNTER (only on successful answer submission)
        // Guard against double-counting same question
        const currentQId = currentQuestion?.id || currentQuestion?.question?.substring(0, 20);
        if (currentQId && lastConsumedQuestionIdRef.current !== currentQId) {
          lastConsumedQuestionIdRef.current = currentQId;
          setPracticeQuestionsUsed(prev => prev + 1);
          console.log("[PRACTICE] Question answered, count:", practiceQuestionsUsed + 1, "/", PRACTICE_QUESTION_LIMIT);
        }

        // Refresh free attempts from backend after successful submission (for display only)
        // Silent update to avoid "Backend unavailable" if usage service is flaky but answer succeeded
        fetchFreeAttempts({ silent: true });

        // Explicitly clear server unavailable since we just had a success
        setServerUnavailable(false);

        // Session is saved by the /api/practice/answer endpoint now
        // No need for separate /api/sessions call
      } catch (err) {
        // Refresh attempts from backend after failed call
        fetchFreeAttempts();

        // Enhanced error logging for debugging
        console.error("[Fix My Answer] API Error:", {
          status: err.status,
          message: err.message,
          data: err.data,
          stack: err.stack
        });

        if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true) {
          setError("");
          // Immediately update UI to 3/3 when limit reached
          setFreeImproveUsage({ count: 3, limit: 3 });
          setPaywallSource("fix_answer");
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }

        // Log response body for debugging
        if (err.status) {
          console.error("[Fix My Answer] Response status:", err.status);
        }
        if (err.data) {
          console.error("[Fix My Answer] Response body:", err.data);
        }

        // Handle network errors (backend unreachable) - show toast
        if (isNetworkError(err)) {
          console.error("[Fix My Answer] Network error:", err.message);
          setLoading(false);
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        // Handle 404 or other endpoint errors gracefully
        if (err instanceof ApiError && (err.status === 404 || err.status >= 500)) {
          // Don't set error - let the component show a toast instead
          console.error("[Fix My Answer] Endpoint error:", err.status, err.message);
          setLoading(false);
          // Throw a special error to indicate we should show toast
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        // Handle JSON parse errors or other unexpected errors
        // Check if error is from JSON parsing
        if (err.message && (err.message.includes("JSON") || err.message.includes("parse") || err.message.includes("Unexpected token"))) {
          console.error("[Fix My Answer] Parse error:", err.message);
          setLoading(false);
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        // Show non-blocking error message instead of crashing
        console.error("[Fix My Answer] Unexpected error:", err.status || err.message);
        setError("Something went wrong. Try again in a moment.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("[Fix My Answer] Outer catch error:", err);
      // Re-throw FIX_UNAVAILABLE errors to be handled by component
      if (err.isFixUnavailable) {
        throw err;
      }
      // Handle other unexpected errors
      if (isNetworkError(err)) {
        setServerUnavailable(true);
        const fixError = new Error("FIX_UNAVAILABLE");
        fixError.isFixUnavailable = true;
        throw fixError;
      } else {
        setError("Connection issue. Check your internet and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const improvedAnswerText = getImprovedAnswerTextHelper(result);

  const handleTryAnotherQuestion = () => {
    gaEvent("try_another_question_click", {
      page: "practice"
    });

    // Reset practice state
    setText("");
    setResult(null);
    setError("");
    setLoading(false);

    // Load a new random question from active pool (avoiding seen ones)
    const newQuestion = pickRandomQuestion(seenQuestionIds, activeQuestionPool);

    setCurrentQuestion(newQuestion);
    setQuestionNumber(prev => prev + 1);
  };

  return {
    // State
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
    usage: {
      used: practiceQuestionsUsed,
      limit: PRACTICE_QUESTION_LIMIT,
      remaining: Math.max(0, PRACTICE_QUESTION_LIMIT - practiceQuestionsUsed),
      blocked: practiceQuestionsUsed >= PRACTICE_QUESTION_LIMIT
    },
    currentQuestion,
    questionNumber,
    isPro,
    isPaywalled,
    improvedAnswerText,

    // Handlers
    handleImproveAnswer,
    handleTryAnotherQuestion,
    fetchFreeAttempts,
  };
}

// Renamed helper to avoid conflict with var name if I used function hoisting but cleaner this way
function getImprovedAnswerTextHelper(result) {
  return (
    result?.improved ??
    result?.improvedAnswer ??
    result?.message?.improved ??
    result?.analysis?.improved ??
    result?.guidance?.improved ??
    ""
  );
}
