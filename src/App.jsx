// src/App.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UpgradeToProButton from "./components/UpgradeToProButton.jsx";
import UpgradeModal from "./components/UpgradeModal.jsx";
import ListenToAnswerButton from "./components/ListenToAnswerButton.jsx";
import VoiceRecorder from "./components/VoiceRecorder.jsx";
import RecentSessions from "./components/RecentSessions.jsx";
import ProgressPage from "./components/ProgressPage.jsx";
import PricingPage from "./components/PricingPage.jsx";
import ProGuard from "./components/ProGuard.jsx";
import Navigation from "./components/Navigation.jsx";
import InlineError from "./components/InlineError.jsx";
import { trackEvent } from "./analytics";
import { getUserKey } from "./utils/userKey.js";
import { usePro } from "./contexts/ProContext.jsx";
import { isNetworkError } from "./utils/networkError.js";
import { apiClient, ApiError, isApiBaseConfigured } from "./utils/apiClient.js";

export default function App({ defaultTab = "interview" }) {
  const { isPro, refreshProStatus } = usePro();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'interview' | 'resume' | 'progress' | 'pricing'

  // Simple free limits (front-end only for MVP)
  const [showPaywall, setShowPaywall] = useState(false);

  const FREE_IMPROVE_LIMIT_PER_DAY = 1;
  const FREE_RESUME_LIMIT_TOTAL = 1; // strict MVP: one free resume analysis ever

  // Interview coach state
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionRefreshTrigger, setSessionRefreshTrigger] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 2, remaining: 2 });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);

  // Resume doctor state
  const [resumeText, setResumeText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  // Stripe banner
  const [banner, setBanner] = useState(null); // 'success' | 'canceled' | null

  // Check API base configuration on mount
  const [apiBaseMissing, setApiBaseMissing] = useState(!isApiBaseConfigured());

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
        setBanner("success");
        trackEvent("stripe_payment_success", { location: "landing" });
        // Immediately refresh Pro status
        refreshProStatus();
        
        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else if (canceled === "true" || pathCancel) {
        setBanner("canceled");
        trackEvent("stripe_payment_canceled", { location: "landing" });
        
        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    } catch (err) {
      console.error("URL param parse error", err);
    }
  }, [refreshProStatus]);

  // Auto-dismiss banner after 6 seconds
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => {
        setBanner(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  // Sync activeTab with URL pathname
  useEffect(() => {
    const path = location.pathname;
    if (path === "/interview") {
      setActiveTab("interview");
    } else if (path === "/resume") {
      setActiveTab("resume");
    } else if (path === "/progress") {
      setActiveTab("progress");
    } else if (path === "/pricing") {
      setActiveTab("pricing");
    }
  }, [location.pathname]);

  // Close upgrade modal if user becomes Pro
  useEffect(() => {
    if (isPro && showUpgradeModal) {
      setShowUpgradeModal(false);
    }
  }, [isPro, showUpgradeModal]);

  // Fetch usage when interview tab is active
  const fetchUsage = async () => {
    try {
      const userKey = getUserKey();
      const data = await apiClient(`/api/usage/today?userKey=${encodeURIComponent(userKey)}`);
      setUsage({
        used: data.used || 0,
        limit: data.limit === -1 ? Infinity : data.limit || 2,
        remaining: data.remaining === -1 ? Infinity : data.remaining || 0,
      });
      setServerUnavailable(false);
    } catch (err) {
      console.error("Error fetching usage:", err);
      if (isNetworkError(err)) {
        setServerUnavailable(true);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "interview") {
      fetchUsage();
    }
  }, [activeTab]);

  // Listen for navigation events from LandingPage
  useEffect(() => {
    const handleNavigateToTab = (event) => {
      const tab = event.detail?.tab;
      if (tab && ['interview', 'resume', 'progress', 'pricing'].includes(tab)) {
        setActiveTab(tab);
        navigate(`/${tab}`);
        // Scroll to practice section if interview tab
        if (tab === 'interview') {
          setTimeout(() => {
            const el = document.getElementById('practice-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      }
    };

    // Check hash on mount
    if (window.location.hash === '#app-interview') {
      setActiveTab('interview');
      navigate('/interview');
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById('practice-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    window.addEventListener('navigateToTab', handleNavigateToTab);
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  // Smooth scroll helper
  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Helpers for simple free usage tracking (front-end only)
  const getTodayKey = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
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

  const incrementFreeResumeUsage = () => {
    const key = "jobspeak_free_resume_usage";
    const raw = localStorage.getItem(key);
    let count = 0;
    try {
      count = raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      count = 0;
    }
    count += 1;
    localStorage.setItem(key, String(count));
  };

  const hasFreeResumeLeft = () => {
    if (isPro) return true;
    const key = "jobspeak_free_resume_usage";
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    try {
      const count = parseInt(raw, 10) || 0;
      return count < FREE_RESUME_LIMIT_TOTAL;
    } catch {
      return true;
    }
  };

  const handleHeroFixAnswerClick = () => {
    setActiveTab("interview");
    navigate("/interview");
    scrollToElement("micro-demo");
    trackEvent("hero_fix_answer_click", { source: "hero" });
  };

  const handleHeroSeePricingClick = () => {
    scrollToElement("pricing");
    trackEvent("hero_pricing_click", { source: "hero" });
  };

  // --- Interview Coach: Micro-demo ---
  function getImprovedAnswerText() {
    if (!result) return "";
    return result.improved || "";
  }

  const handleImproveAnswer = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    // Free limit gating for interview coach
    if (!hasFreeImproveLeft()) {
      setError(
        "You've used your free answer today. Upgrade to Pro for unlimited practice."
      );
      setShowPaywall(true);
      setLoading(false);
      trackEvent("micro_demo_limit_hit", { source: "interview_tab" });
      return;
    }

    if (!text.trim()) {
      setError("Type your answer to begin.");
      setLoading(false);
      return;
    }

    try {

      trackEvent("interview_submit", { textLength: text.length, source: "interview_tab" });
      trackEvent("micro_demo_used", { source: "interview_tab" });

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

        // Refresh usage after successful submission
        fetchUsage();

        // Save session to backend
        try {
          const aiResponse = JSON.stringify(data);
          await apiClient("/api/sessions", {
            method: "POST",
            body: {
              userKey,
              transcript: text,
              aiResponse,
              score: null, // Can be added later if scoring is implemented
            },
          });
          // Trigger refresh of RecentSessions
          setSessionRefreshTrigger((prev) => prev + 1);
          // Refresh usage after successful save
          fetchUsage();
        } catch (saveErr) {
          if (saveErr instanceof ApiError && saveErr.status === 402 && saveErr.data?.upgrade === true) {
            setShowUpgradeModal(true);
            fetchUsage();
            trackEvent("free_limit_reached", { source: "session_save" });
          } else {
            console.error("Failed to save session:", saveErr);
            // Don't show error to user, session saving is non-critical
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true) {
          setError("");
          setShowUpgradeModal(true);
          fetchUsage();
          trackEvent("free_limit_reached", { source: "interview_tab" });
          trackEvent("interview_submit_fail", { reason: "free_limit", status: err.status });
          setLoading(false);
          return;
        }
        console.error("Micro-demo error status:", err.status || err.message);
        setError(
          "Something went wrong. Try again in a moment."
        );
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


  // --- Resume Doctor ---
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setResumeError("Paste your resume text to begin.");
      return;
    }

    if (!hasFreeResumeLeft()) {
      setResumeError(
        "You've used your free preview. Upgrade to Pro for full access."
      );
      setResumeResult(null);
      setShowPaywall(true);
      trackEvent("resume_limit_hit", { source: "resume_tab" });
      return;
    }

    try {
      setResumeLoading(true);
      setResumeResult(null);
      setResumeError("");

      trackEvent("resume_doctor_used", { source: "resume_tab" });

      const userKey = getUserKey();
      const data = await apiClient("/resume/analyze", {
        method: "POST",
        body: { text: resumeText, userKey },
      });
      setResumeResult(data);
      if (!isPro) {
        incrementFreeResumeUsage();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 402 && err.data?.upgrade === true) {
        setResumeError("");
        setShowUpgradeModal(true);
        trackEvent("free_limit_reached", { source: "resume_tab" });
        setResumeLoading(false);
        return;
      }
      console.error("Resume doctor exception", err);
      if (isNetworkError(err)) {
        setServerUnavailable(true);
        setResumeError("We're temporarily unavailable. Give us a moment and try again.");
      } else {
        setResumeError("Connection issue. Check your internet and try again.");
      }
      setResumeResult(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleClearResume = () => {
    setResumeText("");
    setResumeResult(null);
    setResumeError("");
  };

  const handleCopySuggestions = () => {
    if (!resumeResult || resumeResult.error) return;

    const suggestions = [];
    if (resumeResult.topIssues && resumeResult.topIssues.length > 0) {
      suggestions.push("Top Issues:");
      resumeResult.topIssues.forEach((issue, idx) => {
        suggestions.push(`${idx + 1}. ${issue}`);
      });
    }
    if (resumeResult.improvedSummary) {
      suggestions.push("\nImproved Summary:");
      suggestions.push(resumeResult.improvedSummary);
    }
    if (resumeResult.roleTip) {
      suggestions.push("\nTip:");
      suggestions.push(resumeResult.roleTip);
    }

    const textToCopy = suggestions.join("\n");
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Show temporary feedback
      const btn = document.getElementById("copy-suggestions-btn");
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Copied!
        `;
        btn.classList.remove("bg-slate-100", "hover:bg-emerald-100", "hover:text-emerald-700", "text-slate-700");
        btn.classList.add("bg-emerald-500", "text-white");
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove("bg-emerald-500", "text-white");
          btn.classList.add("bg-slate-100", "hover:bg-emerald-100", "hover:text-emerald-700", "text-slate-700");
        }, 2000);
      }
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  const improvedAnswerText = getImprovedAnswerText();

  return (
    <div className="min-h-screen bg-rose-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-rose-100">
        <div className="px-6 py-5 border-b border-rose-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white">
            JS
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              JobSpeak Pro
            </div>
            <div className="text-[11px] text-slate-500">
              AI Interview Coach
            </div>
          </div>
        </div>

        <Navigation activeTab={activeTab} onTabChange={handleTabClick} />

        <div className="px-5 pb-5">
          {isPro ? (
            <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-3 py-2 text-[11px] text-emerald-800">
              <div className="font-semibold flex items-center gap-1 text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Pro Plan Active
              </div>
              <p className="mt-1">
                You have unlimited practice sessions remaining.
              </p>
            </div>
          ) : (
            <div className="border border-rose-100 bg-rose-50 rounded-xl px-3 py-2 text-[11px] text-slate-700">
              <p className="font-semibold mb-1">Free preview</p>
              <p className="mb-2">
                Upgrade to unlock unlimited AI speaking practice and resume
                coaching.
              </p>
              <UpgradeToProButton />
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 bg-rose-50">
        {/* Mobile Navigation */}
        <Navigation activeTab={activeTab} onTabChange={handleTabClick} variant="mobile" />

        {/* Top bar */}
        <header className="border-b border-rose-100 bg-white/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-rose-500 font-semibold">
                {activeTab === "interview"
                  ? "Speaking Practice"
                  : activeTab === "resume"
                  ? "Resume Doctor"
                  : activeTab === "progress"
                  ? "Progress"
                  : "Pricing"}
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-semibold text-slate-900">
                  JobSpeak Pro — AI Interview Coach
                </h1>
                {isPro ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold uppercase tracking-wide">
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase tracking-wide">
                    FREE
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {banner === "success" && (
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✅ Pro active
                </span>
              )}
              <span className="hidden sm:inline text-[11px] text-slate-500">
                Secure checkout with Stripe
              </span>
            </div>
          </div>
        </header>

        {/* Stripe banners */}
        {banner === "success" && (
          <div className="bg-emerald-50 border-b border-emerald-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 text-xs text-emerald-800">
              Payment successful — Pro unlocked
            </div>
          </div>
        )}
        {banner === "canceled" && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 text-xs text-amber-800">
              Checkout canceled
            </div>
          </div>
        )}

        {/* API base missing - blocking banner */}
        {apiBaseMissing && (
          <div className="bg-red-600 border-b border-red-700 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-lg">⚠️</span>
                  <p className="text-sm font-semibold text-white">
                    Configuration Error: VITE_API_BASE environment variable is missing. API calls are disabled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server unavailable banner */}
        {serverUnavailable && !apiBaseMissing && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
              <p className="text-xs text-red-800">
                We're temporarily unavailable. Give us a moment and try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setServerUnavailable(false);
                  if (activeTab === "interview") {
                    fetchUsage();
                  }
                }}
                className="text-xs px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 font-semibold transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          {/* Hero / Home section */}
          <section className="mb-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* Headline with strong hook */}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Stop losing job offers because of your English.
              </h1>
              
              {/* Subheadline */}
              <p className="text-base md:text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                Get instant AI feedback on your interview answers. Practice until you speak with confidence.
              </p>

              {/* 3 Benefit Bullets */}
              <ul className="text-sm text-slate-700 mb-8 space-y-2 max-w-xl mx-auto text-left md:text-center">
                <li className="flex items-start md:justify-center gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Fix broken English in seconds with AI-powered rewrites</span>
                </li>
                <li className="flex items-start md:justify-center gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Practice speaking with natural voice playback</span>
                </li>
                <li className="flex items-start md:justify-center gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Build confidence in 2–3 minutes per day</span>
                </li>
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/practice");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm"
                >
                  Try Interview Practice (Free)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pricing");
                    navigate("/pricing");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-rose-500 text-rose-600 text-sm font-semibold bg-white hover:bg-rose-50"
                >
                  Upgrade to Pro
                </button>
              </div>

              {/* Social Proof Placeholder */}
              <div className="border-t border-rose-100 pt-6">
                <p className="text-xs text-slate-500 mb-2">Trusted by professionals worldwide</p>
                <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                  <div>⭐ 4.8/5 rating</div>
                  <div>•</div>
                  <div>1,000+ users</div>
                  <div>•</div>
                  <div>20+ countries</div>
                </div>
              </div>
            </div>
          </section>

          {/* Paywall callout */}
          {showPaywall && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <div className="font-semibold mb-1">
                You've reached the free limit.
              </div>
              <p className="mb-2">
                Upgrade to Pro for unlimited practice and full resume support.
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <UpgradeToProButton />
                <button
                  type="button"
                  className="text-[11px] underline text-slate-600"
                  onClick={() => setShowPaywall(false)}
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* INTERVIEW TAB */}
          {activeTab === "interview" && (
            <section id="practice-section" className="space-y-4">
              {/* Usage display */}
              {!isPro && (
                <div className="bg-white border border-rose-100 rounded-xl px-4 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Today&apos;s interviews:</span>
                    <span className="font-semibold text-slate-900">
                      {usage.used} / {usage.limit === Infinity ? "∞" : usage.limit}
                      {usage.remaining !== Infinity && (
                        <span className="text-slate-500 font-normal ml-1">
                          ({usage.remaining} remaining)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Question header */}
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                    Tell me about a time you faced a challenge at work.
                  </h2>
                  <p className="text-xs text-slate-600">
                    Focus on the STAR method: Situation, Task, Action, Result.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">
                    Question 1
                  </span>{" "}
                  <span className="text-slate-400">of 5</span>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="grid gap-4 md:grid-cols-2 mt-2">
                {/* LEFT: User answer */}
                <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col h-full">
                  <p className="text-[11px] font-semibold text-rose-500 mb-1">
                    Your Answer
                  </p>
                    <p className="text-[11px] text-slate-500 mb-3">
                    Type or speak your answer. Aim for 45–90 seconds when spoken.
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

                {/* Transcript preview */}
                {text && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
                    <div className="font-semibold mb-1">
                      {isTranscribing ? "Transcribing..." : "Preview:"}
                    </div>
                    <div className={isTranscribing ? "opacity-60" : ""}>
                      {isTranscribing ? (
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                          <span>Processing audio...</span>
                        </div>
                      ) : (
                        <div className="line-clamp-2">{text}</div>
                      )}
                    </div>
                  </div>
                )}

                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Type your interview answer here..."
                  disabled={isTranscribing}
                  className="w-full flex-1 min-h-[140px] border border-rose-100 bg-rose-50 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        type="submit"
                        disabled={loading || isTranscribing || !text.trim()}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {isTranscribing 
                          ? "Transcribing..." 
                          : loading 
                          ? "Improving..." 
                          : "✨ Improve my answer"}
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
                              click "Improve my answer".
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
                        After you click "Improve my answer", you'll see a more
                        confident version of your answer here with audio
                        playback.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="mt-6">
                <RecentSessions refreshTrigger={sessionRefreshTrigger} />
              </div>
            </section>
          )}

          {/* RESUME TAB */}
          {activeTab === "resume" && (
            <section
              id="resume-section"
              className="mt-2 space-y-6"
            >
              {/* Header */}
              <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-2">
                  Resume Doctor
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste your resume. Get instant feedback on weak areas and improvements to describe your experience clearly.
                </p>
              </div>

              {/* Input Form */}
              <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setResumeError("");
                      }}
                      placeholder="Paste your resume text here..."
                      disabled={resumeLoading}
                      className="w-full min-h-[200px] border border-rose-100 bg-rose-50 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 disabled:opacity-60 disabled:cursor-not-allowed resize-y"
                    />
                    {resumeText && !resumeLoading && (
                      <button
                        type="button"
                        onClick={handleClearResume}
                        className="absolute top-3 right-3 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white/90 hover:bg-white border border-rose-100 rounded-md transition shadow-sm"
                        title="Clear"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={resumeLoading || !resumeText.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {resumeLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <span>📄</span>
                          Analyze my resume
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Error State */}
              {resumeError && (
                <InlineError
                  title="Oops"
                  message={resumeError}
                  variant="expanded"
                  onRetry={
                    resumeError.includes("temporarily unavailable")
                      ? () => {
                          setResumeError("");
                          setServerUnavailable(false);
                          handleResumeSubmit(new Event("submit"));
                        }
                      : undefined
                  }
                />
              )}

              {/* Loading State */}
              {resumeLoading && !resumeResult && (
                <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <svg
                      className="animate-spin h-8 w-8 text-rose-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Analyzing your resume...
                      </p>
                      <p className="text-xs text-slate-500">
                        This may take a few seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {resumeResult && !resumeResult.error && (
                <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Analysis Results
                    </h3>
                    <button
                      id="copy-suggestions-btn"
                      type="button"
                      onClick={handleCopySuggestions}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Suggestions
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Top Issues Section */}
                    {resumeResult.topIssues &&
                      resumeResult.topIssues.length > 0 && (
                        <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-rose-900 mb-3 flex items-center gap-2">
                            <span>🔍</span>
                            Top Issues Found
                          </h4>
                          <ul className="space-y-2 ml-6">
                            {resumeResult.topIssues.map((issue, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-slate-700 list-disc leading-relaxed"
                              >
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Improved Summary Section */}
                    {resumeResult.improvedSummary && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                          <span>✨</span>
                          Improved Summary
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-md p-3 border border-emerald-200">
                          {resumeResult.improvedSummary}
                        </p>
                      </div>
                    )}

                    {/* Role Tip Section */}
                    {resumeResult.roleTip && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <span>💡</span>
                          Pro Tip
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-md p-3 border border-blue-200">
                          {resumeResult.roleTip}
                        </p>
                      </div>
                    )}

                    {/* Fallback for unexpected data */}
                    {!resumeResult.topIssues &&
                      !resumeResult.improvedSummary &&
                      !resumeResult.roleTip && (
                        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(resumeResult, null, 2)}
                          </pre>
                        </div>
                      )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-900">💡 Next steps:</span> Use these suggestions to
                      improve your resume. Practice explaining these points in
                      English for your interviews.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* PROGRESS TAB */}
          {activeTab === "progress" && (
            <ProGuard message="Track your progress over time with JobSpeak Pro. Upgrade to see detailed analytics and improvement trends.">
              <ProgressPage onNavigateToInterview={() => {
                setActiveTab("interview");
                navigate("/interview");
              }} />
            </ProGuard>
          )}

          {/* PRICING TAB */}
          {activeTab === "pricing" && (
            <section id="pricing-section">
              <PricingPage />
            </section>
          )}
        </main>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

