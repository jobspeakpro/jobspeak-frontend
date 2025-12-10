import UpgradeToProButton from "./components/UpgradeToProButton";
import React, { useState, useEffect } from "react";

const API_BASE = "https://jobspeak-backend-production.up.railway.app";

export default function App() {
  const [activeTab, setActiveTab] = useState("interview");

  // INTERVIEW COACH STATE
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // RESUME DOCTOR STATE
  const [resumeText, setResumeText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  // PAYMENT STATUS (Stripe redirect)
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPaymentStatus("success");
    } else if (params.get("canceled") === "true") {
      setPaymentStatus("canceled");
    }
  }, []);

  const handleMicroDemo = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/ai/micro-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Check backend or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAnalyze = async () => {
    setResumeLoading(true);
    setResumeError("");
    setResumeResult(null);
    try {
      const res = await fetch(`${API_BASE}/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setResumeResult(data);
    } catch (e) {
      console.error(e);
      setResumeError("Could not analyze your resume. Check backend or API key.");
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* PAYMENT STATUS BANNER (BIG + OBVIOUS) */}
      {paymentStatus === "success" && (
        <div className="bg-emerald-100 border-b border-emerald-300">
          <div className="max-w-5xl mx-auto px-4 py-4 text-sm sm:text-base text-emerald-900 font-semibold text-center">
            ✅ Payment successful!  
            <span className="font-normal block text-emerald-800">
              Thank you for supporting JobSpeak Pro. Your PRO access is now active.
            </span>
          </div>
        </div>
      )}

      {paymentStatus === "canceled" && (
        <div className="bg-amber-100 border-b border-amber-300">
          <div className="max-w-5xl mx-auto px-4 py-4 text-sm sm:text-base text-amber-900 font-semibold text-center">
            ⚠️ Payment canceled.  
            <span className="font-normal block text-amber-800">
              No charges were made. You can upgrade to PRO anytime when you feel ready.
            </span>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <div>
              <div className="font-semibold text-navy text-sm sm:text-base">
                JobSpeak Pro
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500">
                AI ESL Interview Coach
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline text-xs sm:text-sm text-slate-600 hover:text-navy">
              Log in
            </button>
            <button className="btn-primary text-xs sm:text-sm">
              Start Free Practice
            </button>
          </div>
        </div>

        {/* SIMPLE TABS */}
        <div className="border-t border-slate-200 bg-white/80">
          <div className="max-w-5xl mx-auto px-4 flex gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab("interview")}
              className={`py-2 border-b-2 ${
                activeTab === "interview"
                  ? "border-teal text-navy font-semibold"
                  : "border-transparent text-slate-500 hover:text-navy"
              }`}
            >
              🎤 Interview Coach
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`py-2 border-b-2 ${
                activeTab === "resume"
                  ? "border-teal text-navy font-semibold"
                  : "border-transparent text-slate-500 hover:text-navy"
              }`}
            >
              📄 Resume Doctor
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {activeTab === "interview" && (
          <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 items-center">
            {/* LEFT: HERO TEXT */}
            <section>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Fix your interview English in minutes, not months.
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-3 leading-tight">
                Turn nervous <span className="text-teal">ESL answers</span> into{" "}
                <span className="text-accent">hire-ready English</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 mb-4">
                JobSpeak Pro listens to your answer, fixes your English, and
                shows you what a real recruiter wants to hear – in simple, clear
                language you can actually say out loud.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mb-5">
                <div className="glass-card">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    Pain #1 &amp; #5
                  </div>
                  <div className="font-semibold text-navy mb-1">
                    Afraid of making mistakes?
                  </div>
                  <div className="text-slate-600">
                    See your “before &amp; after” in seconds. We turn your real
                    answer into a clean, natural English version.
                  </div>
                </div>
                <div className="glass-card">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    Pain #2 &amp; #3
                  </div>
                  <div className="font-semibold text-navy mb-1">
                    No practice, no feedback?
                  </div>
                  <div className="text-slate-600">
                    Practice as much as you want. Every answer gets AI feedback
                    based on what recruiters actually listen for.
                  </div>
                </div>
                <div className="glass-card">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    Pain #4 &amp; #8
                  </div>
                  <div className="font-semibold text-navy mb-1">
                    Resume rejected before interview?
                  </div>
                  <div className="text-slate-600">
                    Paste your resume and get a clearer, US-style summary without
                    searching YouTube for “magic templates”.
                  </div>
                </div>
                <div className="glass-card">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    Pain #9 &amp; #10
                  </div>
                  <div className="font-semibold text-navy mb-1">
                    Need a coach but can’t afford one?
                  </div>
                  <div className="text-slate-600">
                    Get 24/7 AI coaching and a simple next-step plan – for less
                    than one private lesson per month.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <button className="btn-primary text-xs sm:text-sm">
                  Try Free Interview Practice
                </button>
                <button className="text-xs sm:text-sm text-slate-600 hover:text-navy underline underline-offset-4">
                  See PRO benefits
                </button>
                <div className="text-[11px] text-slate-500">
                  No credit card for free practice.
                </div>
              </div>
            </section>

            {/* RIGHT: MICRO DEMO CARD */}
            <section>
              <div className="glass-card shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-navy">
                      30-Second Interview Fix (Micro Demo)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Paste what you would really say in an interview.
                    </p>
                  </div>
                  <span className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    🔒 Your answers stay private
                  </span>
                </div>

                <textarea
                  className="w-full border border-slate-200 rounded-lg p-2 mb-3 h-28 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal/60"
                  placeholder="Example: I am not good in interviews and my English is bad, I get very nervous and forget words..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <button
                  onClick={handleMicroDemo}
                  disabled={loading || !text.trim()}
                  className="btn-primary w-full mb-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {loading ? "Improving your answer..." : "Fix My Answer"}
                </button>

                {error && (
                  <div className="text-red-600 text-xs mb-2">{error}</div>
                )}

                {result && (
                  <div className="mt-2 space-y-2 text-xs sm:text-sm">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Your original answer
                      </div>
                      <p className="text-slate-700 bg-slate-50 rounded-md p-2">
                        {result.original}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Hire-ready version
                      </div>
                      <p className="text-emerald-800 bg-emerald-50 rounded-md p-2">
                        {result.improved}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {result.message || "This already sounds more natural."}
                    </div>
                    <div className="pt-1 border-t border-slate-100 mt-1 text-[11px] text-slate-500">
                      ⭐ In PRO, you unlock full coaching, job readiness scores,
                      and resume rewrites.
                    </div>
                  </div>
                )}

                {!result && !error && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    Tip: Paste a real answer you might say to “Tell me about
                    yourself” or “Why should we hire you?”.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "resume" && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-navy mb-1">
                Resume Doctor (Free Preview)
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Paste your resume (or a job experience section). JobSpeak Pro will
                highlight top problems and give you a clearer, US-style summary.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Free users see top issues + new summary. PRO unlocks full rewrite.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Your current resume text
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-2 mb-2 h-64 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal/60"
                  placeholder="Paste your resume or one job experience section here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />

                <button
                  onClick={handleResumeAnalyze}
                  disabled={resumeLoading || !resumeText.trim()}
                  className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {resumeLoading ? "Analyzing..." : "Analyze My Resume (Free)"}
                </button>

                {resumeError && (
                  <div className="text-red-600 text-xs mt-2">{resumeError}</div>
                )}

                {!resumeResult && !resumeError && (
                  <div className="text-[11px] text-slate-500 mt-2">
                    Tip: Start with just your SUMMARY or one job. You don't need a full
                    resume to see improvements.
                  </div>
                )}
              </div>

              <div>
                <div className="glass-card h-full flex flex-col">
                  <h2 className="text-sm sm:text-base font-semibold text-navy mb-2">
                    AI Feedback
                  </h2>

                  {resumeResult ? (
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                          Top issues (what hurts you now)
                        </div>
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                          {Array.isArray(resumeResult.topIssues)
                            ? resumeResult.topIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))
                            : null}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                          Improved summary (US-style, ESL-friendly)
                        </div>
                        <p className="text-emerald-800 bg-emerald-50 rounded-md p-2 whitespace-pre-line">
                          {resumeResult.improvedSummary}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {resumeResult.roleTip ||
                          "Keep your resume short, clear, and focused on results."}
                      </div>

                      <div className="pt-1 border-t border-slate-100 mt-1 text-[11px] text-slate-500">
                        ⭐ In PRO, you unlock a full resume rewrite and multiple
                        versions for different jobs.
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      Paste your resume on the left and click “Analyze My Resume”
                      to see issues and a stronger summary.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRO STRIP */}
        <section className="border-t border-slate-200 bg-navy text-offwhite mt-4">
          <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-accent mb-1 uppercase">
                Ready for your first job offer?
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">
                Go PRO to unlock full interview coaching & resume rewrites.
              </h2>
              <p className="text-[12px] sm:text-sm text-slate-200 max-w-xl">
                Unlimited speaking feedback, full answer rewrites, job readiness scores,
                and complete resume upgrades — designed for global ESL job seekers.
              </p>
            </div>
            <div className="glass-card bg-white/5 border-white/10 text-[12px] sm:text-sm">
              <div className="font-semibold mb-1">JobSpeak Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-accent">$9.99</span>
                <span className="text-xs text-slate-200">/ month</span>
              </div>
              <div className="text-[11px] text-slate-200 mb-2">
                or $79.99 per year (save 33%)
              </div>
              <ul className="text-[11px] text-slate-100 space-y-1 mb-3">
                <li>✓ Unlimited interview answer fixes</li>
                <li>✓ Full “Tell me about yourself” coaching</li>
                <li>✓ Job readiness scores for every session</li>
                <li>✓ Resume Doctor full rewrites</li>
              </ul>
              <UpgradeToProButton />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} JobSpeak Pro. Built for global ESL job seekers.
          </div>
          <div className="flex gap-3 text-[11px] text-slate-500">
            <button className="hover:text-navy">Privacy</button>
            <button className="hover:text-navy">Terms</button>
            <button className="hover:text-navy">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
