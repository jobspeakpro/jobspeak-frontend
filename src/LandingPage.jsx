// src/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gaEvent } from "./utils/ga.js";
import MarketingLayout from "./layouts/MarketingLayout.jsx";

export default function LandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const navigate = useNavigate();

  const handlePracticeNow = () => {
    navigate("/start");
  };

  const handleWatchDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <MarketingLayout>
      <div className="relative w-full overflow-x-hidden">

        {/* HERO SECTION */}
        <div className="relative w-full overflow-hidden px-6 py-16 lg:px-40 lg:py-32 bg-white">
          {/* Gradient glow behind hero */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 opacity-50 -z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-blue-200/30 rounded-full blur-3xl -z-0"></div>
          
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
            {/* Centered Hero */}
            <div className="flex flex-col gap-6 items-center max-w-4xl">
              {/* Badge pill */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
                Trusted by professionals worldwide
              </div>

              <h1 className="text-slate-900 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-[-0.02em]">
                Speak confidently in job interviews,<br />
                <span className="text-blue-600">even if English isn't your first language.</span>
              </h1>

              <h2 className="text-xl sm:text-2xl text-slate-600 font-normal leading-relaxed max-w-3xl">
                Get instant AI feedback on your answers. Practice until you sound natural and professional—no accent coaching needed.
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                <button 
                  onClick={() => {
                    gaEvent("start_speaking_click", { page: "landing" });
                    handlePracticeNow();
                  }}
                  className="flex min-w-[260px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-blue-600 text-white text-lg font-bold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Start Speaking (Free)
                </button>
                <button 
                  onClick={() => {
                    gaEvent("how_it_works_click", { page: "landing" });
                    navigate("/how-it-works");
                  }}
                  className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-white border border-slate-200 text-slate-900 text-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  How it works
                </button>
              </div>
              
              {/* Helper text */}
              <p className="text-sm text-slate-500 mt-2">
                No credit card required • Free to start
              </p>
            </div>
          </div>
        </div>

        {/* LOGO STRIP */}
        <div className="w-full border-y border-slate-200 bg-white py-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-40">
            <div className="flex flex-col items-center gap-8">
              <h4 className="text-slate-500 text-xs font-semibold leading-normal tracking-wider text-center uppercase">
                TRUSTED BY
              </h4>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
                {["TechCrunch", "Product Hunt", "Hacker News", "Indie Hackers", "Y Combinator"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-lg font-semibold text-slate-400 font-sans tracking-tight"
                    >
                      {name}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE SECTION */}
        <section className="w-full bg-white py-20 px-6 lg:px-40">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div className="flex flex-col gap-6 items-start text-left">
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                Features
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Used by learners from{" "}
                <span className="text-blue-600">20+ countries</span> to land
                their dream jobs
              </h2>
              <p className="text-lg text-slate-600 font-normal leading-relaxed">
                Get instant AI feedback on your answers. Practice until you sound natural and professional—no accent coaching needed.
              </p>
              <ul className="text-base text-slate-700 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">✓</span>
                  <span>Fix your English instantly with AI rewrites</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">✓</span>
                  <span>Practice with natural voice playback</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">✓</span>
                  <span>Build confidence in minutes</span>
                </li>
              </ul>
            </div>

            {/* Right illustration card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8">
                {/* Simple chart placeholder */}
                <div className="space-y-4">
                  <div className="flex items-end gap-2 h-32">
                    <div className="flex-1 bg-blue-100 rounded-t" style={{ height: '60%' }}></div>
                    <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '80%' }}></div>
                    <div className="flex-1 bg-blue-300 rounded-t" style={{ height: '100%' }}></div>
                    <div className="flex-1 bg-blue-400 rounded-t" style={{ height: '70%' }}></div>
                    <div className="flex-1 bg-blue-500 rounded-t" style={{ height: '90%' }}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900">Progress Tracking</p>
                    <p className="text-xs text-slate-500 mt-1">See your improvement over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="px-6 py-20 lg:px-40 bg-white"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                How JobSpeak works
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Get better at interviews in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                    mic
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Record Your Answer
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Speak or type your interview answer. Our AI transcribes and processes your response instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                    auto_awesome
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Get AI Feedback
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Receive a rewritten version that's clearer, more professional, and easier to say out loud.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                    trending_up
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Practice & Improve
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Listen to the improved answer, practice speaking it, and track your progress over time.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* BOTTOM CTA */}
        <section className="w-full bg-white py-20 px-6 lg:px-40">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to speak with confidence?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join professionals transforming their careers with better English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button 
                onClick={() => {
                  gaEvent("start_speaking_now_click", { page: "landing" });
                  handlePracticeNow();
                }}
                className="inline-flex items-center justify-center rounded-full h-14 px-8 bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Start practicing free
              </button>
              <button 
                onClick={() => {
                  gaEvent("view_pricing_click", { page: "landing" });
                  navigate("/pricing");
                }}
                className="inline-flex items-center justify-center rounded-full h-14 px-8 bg-white border-2 border-blue-600 text-blue-600 text-lg font-bold hover:bg-blue-50 transition-colors"
              >
                View Pricing
              </button>
            </div>
          </div>
        </section>

        {/* Demo Modal */}
        {showDemoModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDemoModal(false)}
          >
            <div 
              className="bg-white dark:bg-[#2a1a1a] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-[#2a1a1a] border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-[#181111] dark:text-white">
                  Product Demo
                </h2>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 md:p-8">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                      Demo Video Coming Soon
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                      See how JobSpeak Pro helps you practice and improve your interview answers
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-[#181111] dark:text-white mb-2">
                      What you'll see in the demo:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Record your interview answer using voice or text</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Get instant AI-powered feedback and improvements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Listen to the improved version with natural voice playback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Track your progress over time</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handlePracticeNow}
                      className="flex-1 px-6 py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                      Try It Now (Free)
                    </button>
                    <button
                      onClick={() => setShowDemoModal(false)}
                      className="flex-1 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-[#181111] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketingLayout>
  );
}

