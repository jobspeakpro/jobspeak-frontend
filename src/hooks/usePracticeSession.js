// src/hooks/usePracticeSession.js
import { useState, useEffect, useRef } from "react";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient, ApiError } from "../utils/apiClient.js";
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

export function usePracticeSession() {
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

  // Initialize with random question
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    return practiceQuestions[Math.floor(Math.random() * practiceQuestions.length)];
  });
  const [questionNumber, setQuestionNumber] = useState(1);

  const isPaywalled = !isPro && isBlocked(usage);

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
      console.error('[FAIL-SOFT] /api/usage/today failed, using defaults:', err);
      // FAIL-SOFT: Default to safe values if backend is down (MVP BLOCKER FIX)
      setFreeImproveUsage({ count: 0, limit: 3 });
      setUsage({ used: 0, limit: 3, remaining: 3, blocked: false });
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

        // Handle network errors (backend unreachable) - show toast
        if (isNetworkError(err)) {
          console.error("Micro-demo network error:", err.message);
          setLoading(false);
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        // Handle 404 or other endpoint errors gracefully
        if (err instanceof ApiError && (err.status === 404 || err.status >= 500)) {
          // Don't set error - let the component show a toast instead
          console.error("Micro-demo endpoint error:", err.status, err.message);
          setLoading(false);
          // Throw a special error to indicate we should show toast
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        // Handle JSON parse errors or other unexpected errors
        // Check if error is from JSON parsing
        if (err.message && (err.message.includes("JSON") || err.message.includes("parse") || err.message.includes("Unexpected token"))) {
          console.error("Micro-demo parse error:", err.message);
          setLoading(false);
          const fixError = new Error("FIX_UNAVAILABLE");
          fixError.isFixUnavailable = true;
          throw fixError;
        }

        console.error("Micro-demo error status:", err.status || err.message);
        setError("Something went wrong. Try again in a moment.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Micro-demo error:", err);
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
    usage,
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

