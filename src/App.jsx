// src/App.jsx
import React, { useState, useEffect } from "react";
import UpgradeToProButton from "./components/UpgradeToProButton.jsx";
import { trackEvent } from "./analytics";

const API_BASE = "https://jobspeak-backend-production.up.railway.app";

export default function App() {
  const [activeTab, setActiveTab] = useState("interview"); // 'interview' | 'resume'
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const [banner, setBanner] = useState(null); // 'success' | 'canceled' | null

  // Detect Stripe success/cancel from query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const canceled = params.get("canceled");

      if (success === "true") {
        setBanner("success");
        trackEvent("stripe_payment_success", { location: "landing" });
      } else if (canceled === "true") {
        setBanner("canceled");
        trackEvent("stripe_payment_canceled", { location: "landing" });
      }
    } catch (err) {
      console.error("URL param parse error", err);
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // ---- Micro-demo: Fix my answer ----
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    try {
      setAnswerLoading(true);
      setAnswerResult(null);

      // Track usage
      trackEvent("micro_demo_used", { source: "interview_tab" });

      const res = await fetch(`${API_BASE}/ai/micro-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // BACKEND expects { text }
        body: JSON.stringify({ text: answerText }),
      });

      if (!res.ok) {
        console.error("Micro-demo error", await res.text());
        setAnswerResult({
          error: "Error: Failed to improve your answer. Please try again.",
        });
        setAnswerLoading(false);
        return;
      }

      const data = await res.json();
      setAnswerResult(data);
    } catch (err) {
      console.error("Micro-demo exception", err);
      setAnswerResult({
        error: "Something went wrong. Please try again.",
      });
    } finally {
      setAnswerLoading(false);
    }
  };

  // ---- Resume Doctor ----
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    try {
      setResumeLoading(true);
      setResumeResult(null);

      // Track usage
      trackEvent("resume_doctor_used", { source: "resume_tab" });

      const res = await fetch(`${API_BASE}/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Try matching micro-demo style: { text } instead of { resumeText }
        body: JSON.stringify({ text: resumeText }),
      });

      if (!res.ok) {
        console.error("Resume doctor error", await res.text());
        setResumeResult({
          error: "Failed to analyze resume. Please try again.",
        });
        setResumeLoading(false);
        return;
      }

      const data = await res.json();
      setResumeResult(data);
    } catch (err) {
      console.error("Resume doctor exception", err);
      setResumeResult({
        error: "Something went wrong. Please try again.",
      });
    } finally {
      setResumeLoading(false);
    }
  };

  // Helper: clean micro-demo display
  const getImprovedAnswerText = () => {
    if (!answerResult) return "";
    // Backend currently returns: { original, improved, message }
    if (answerResult.improved) return answerResult.improved;
    if (answerResult.improvedAnswer) return answerResult.improvedAnswer;
    if (answerResult.answer) return answerResult.answer;
    return JSON.stringify(answerResult, null, 2);
  };

  return (
    <div className="min-h-screen bg-offwhite text-slate-800">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              JobSpeak Pro <span className="text-emerald-600">MVP</span>
            </h1>
            <p className="text-xs text-slate-500">
              AI interview coach + resume doctor for ESL job seekers
            </p>
          </div>
          <UpgradeToProButton />
        </div>
      </header>

      {/* Stripe success / cancel banner */}
      {banner === "success" && (
        <div className="bg-emerald-50 border-b border-emerald-200">
          <div className="mx-auto max-w-5xl px-4 py-2 text-sm text-emerald-800">
            ✅ Thank you! Your JobSpeakPro PRO subscription is active.
          </div>
        </div>
      )}
      {banner === "canceled" && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-5xl px-4 py-2 text-sm text-amber-800">
            ⚠️ Payment canceled. You can continue using the free tools or
            upgrade anytime.
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 mb-4">
          <button
            className={`pb-2 text-sm font-semibold border-b-2 -mb-px ${
              activeTab === "interview"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
            onClick={() => handleTabClick("interview")}
          >
            Interview Coach
          </button>
          <button
            className={`pb-2 text-sm font-semibold border-b-2 -mb-px ${
              activeTab === "resume"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
            onClick={() => handleTabClick("resume")}
          >
            Resume Doctor
          </button>
        </div>

        {/* Panels */}
        {activeTab === "interview" && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-semibold mb-1">
              Micro-demo: Fix my answer
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Paste your interview answer in English. The AI will rewrite it to
              sound more confident and professional for US-style interviews.
            </p>

            <form onSubmit={handleAnswerSubmit} className="space-y-3">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type or paste your interview answer here..."
                className="w-full min-h-[120px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={answerLoading}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {answerLoading ? "Fixing..." : "Fix my answer"}
              </button>
            </form>

            {answerResult && (
              <div className="mt-4">
                {answerResult.error ? (
                  <p className="text-sm text-red-600">{answerResult.error}</p>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    <strong>Improved answer:</strong>
                    <div className="mt-1">{getImprovedAnswerText()}</div>
                    {answerResult.message && (
                      <div className="mt-2 text-xs text-slate-500">
                        {answerResult.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "resume" && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-semibold mb-1">
              Resume Doctor (Preview)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Paste your resume text. The AI will point out weak areas and
              suggest improvements.
            </p>

            <form onSubmit={handleResumeSubmit} className="space-y-3">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume here..."
                className="w-full min-h-[160px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={resumeLoading}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resumeLoading ? "Analyzing..." : "Analyze my resume"}
              </button>
            </form>

            {resumeResult && (
              <div className="mt-4">
                {resumeResult.error ? (
                  <p className="text-sm text-red-600">{resumeResult.error}</p>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm whitespace-pre-wrap space-y-2">
                    {resumeResult.summary && (
                      <div>
                        <strong>Summary:</strong>
                        <div className="mt-1">{resumeResult.summary}</div>
                      </div>
                    )}
                    {resumeResult.issues && (
                      <div>
                        <strong>Issues found:</strong>
                        <div className="mt-1">{resumeResult.issues}</div>
                      </div>
                    )}
                    {resumeResult.suggestions && (
                      <div>
                        <strong>Suggestions:</strong>
                        <div className="mt-1">
                          {resumeResult.suggestions}
                        </div>
                      </div>
                    )}
                    {!resumeResult.summary &&
                      !resumeResult.issues &&
                      !resumeResult.suggestions && (
                        <pre className="text-xs">
                          {JSON.stringify(resumeResult, null, 2)}
                        </pre>
                      )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
