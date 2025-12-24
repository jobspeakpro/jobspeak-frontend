// src/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const navigate = useNavigate();

  const handlePracticeNow = () => {
    navigate("/practice");
  };

  const handleWatchDemo = () => {
    setShowDemoModal(true);
  };
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#181111] dark:text-white font-display overflow-x-hidden">
      <div className="relative flex min-h-screen w-full flex-col group/design-root">
        {/* HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5dcdc] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-6 py-4 lg:px-40">
          <div className="flex items-center gap-4 text-primary">
            <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 24 }}
              >
                graphic_eq
              </span>
            </div>
            <h2 className="text-[#181111] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              JobSpeak Pro
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a
                className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#pricing"
              >
                Pricing
              </a>
              <a
                className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#methodology"
              >
                Methodology
              </a>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors shadow-lg shadow-primary/20">
              <span className="truncate">Log In</span>
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        <div className="relative w-full overflow-hidden px-6 py-16 lg:px-40 lg:py-32 bg-background-light dark:bg-background-dark">
          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center relative z-10">
            {/* Centered Hero */}
            <div className="flex flex-col gap-6 items-center max-w-4xl">
              <h1 className="text-[#181111] dark:text-white text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-[-0.02em]">
                Speak confidently in job interviews,<br />
                <span className="text-primary">even if English isn't your first language.</span>
              </h1>

              <h2 className="text-xl sm:text-2xl lg:text-3xl text-[#5c4a4a] dark:text-gray-300 font-normal leading-relaxed max-w-3xl">
                Get instant AI feedback on your answers. Practice until you sound natural and professional—no accent coaching needed.
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                <button 
                  onClick={handlePracticeNow}
                  className="flex min-w-[260px] cursor-pointer items-center justify-center rounded-full h-16 px-10 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/30 hover:bg-red-600 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined mr-2" style={{ fontSize: 24 }}>mic</span>
                  Start Speaking (Free)
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('methodology');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-full h-16 px-10 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 text-[#181111] dark:text-white text-lg font-bold hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all"
                >
                  How it works
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="w-full border-y border-[#f0f0f0] bg-white dark:bg-[#1a1a1a] dark:border-[#333] py-8">
          <div className="flex justify-center px-6 lg:px-40">
            <div className="flex flex-col items-center gap-6 max-w-[960px] w-full">
              <h4 className="text-[#886364] dark:text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] text-center uppercase">
                As seen in
              </h4>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {["TechCrunch", "Product Hunt", "Hacker News", "Indie Hackers"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-xl font-bold text-gray-400 font-sans tracking-tight"
                    >
                      {name}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE CALLOUT SECTION */}
        <section className="w-full bg-background-light dark:bg-background-dark py-20 px-6 lg:px-40 border-b border-[#e5dcdc] dark:border-[#333] relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left text */}
            <div className="flex flex-col gap-6 items-start text-left">
              <h2 className="text-[#181111] dark:text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.02em]">
                Used by learners from{" "}
                <span className="text-primary">20+ countries</span> to land
                their dream jobs
              </h2>
              <p className="text-lg text-[#5c4a4a] dark:text-gray-300 font-normal leading-relaxed">
                Get instant AI feedback on your answers. Practice until you sound natural and professional—no accent coaching needed.
              </p>
              <ul className="text-lg text-[#181111] dark:text-gray-200 space-y-4">
                <li className="flex items-start gap-4">
                  <span className="text-emerald-600 font-bold mt-0.5 text-2xl">✓</span>
                  <span>Fix your English instantly with AI rewrites</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-emerald-600 font-bold mt-0.5 text-2xl">✓</span>
                  <span>Practice with natural voice playback</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-emerald-600 font-bold mt-0.5 text-2xl">✓</span>
                  <span>Build confidence in minutes</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 pt-4">
                <span className="text-yellow-500 font-bold text-xl">
                  4.9/5
                </span>
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-[#886364] dark:text-gray-400 text-sm font-medium ml-2">
                  from 2,000+ reviews
                </span>
              </div>
            </div>

            {/* Right image/card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full aspect-[4/5] max-w-[500px] rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a1a1a] p-3 border border-gray-100 dark:border-gray-800">
                <div
                  className="w-full h-full rounded-2xl bg-cover bg-center relative"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBG6lR6rD7OWFkzWxxqozcUavUNIV1PXkLcoomKh1UVOMqje5Q5N3B-Fy48vOVI9sVaO8-2jdbHNjvKKJD_i3UuDm3_vIYbwJq6VXD4D3IVEAPmgVDsn1XVOSpynlb2CPDQgAzBpUyR-F8n3HXkcceoIUfCgTATKgLSYGWgZInM7RIeZmIGhK-NDHsUiBOYneqMSV5QDuseaDVztOOLQBUsRehZGl8_5rKaalJmBp797NY2MUeJg5FoZcRKuMvW984MU0z6sgZGjIMO")',
                  }}
                >
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <span className="material-symbols-outlined">
                          graphic_eq
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          Real-time Feedback
                        </p>
                        <p className="text-base font-bold text-[#181111] dark:text-white leading-tight">
                          "Great intonation on that answer!"
                        </p>
                        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full w-[92%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="methodology"
          className="px-6 py-16 lg:px-40 bg-white dark:bg-background-dark"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#181111] dark:text-white text-center mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-3xl font-bold text-primary">1</div>
                </div>
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Record Your Answer
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Speak or type your interview answer. Our AI transcribes and processes your response instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-3xl font-bold text-primary">2</div>
                </div>
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Get AI Feedback
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Receive a rewritten version that's clearer, more professional, and easier to say out loud.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-3xl font-bold text-primary">3</div>
                </div>
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Practice & Improve
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Listen to the improved answer, practice speaking it, and track your progress over time.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* CTA / PRICING TEASER */}
        <section
          id="pricing"
          className="w-full bg-white dark:bg-background-dark py-20 px-6 lg:px-40"
        >
          <div className="max-w-[1024px] mx-auto rounded-3xl bg-primary relative overflow-hidden px-6 py-16 md:px-20 md:py-20 text-center shadow-2xl shadow-primary/30">
            <div
              className="absolute top-0 left-0 w-full h-full opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 2px, transparent 2.5px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.02em] max-w-[700px]">
                Ready to speak with confidence?
              </h2>
              <p className="text-white/90 text-lg md:text-xl font-medium max-w-[600px]">
                Join professionals transforming their careers with better English.
              </p>
              <button 
                onClick={handlePracticeNow}
                className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-white text-primary text-lg font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                <span className="truncate">Start practicing free</span>
              </button>
              <p className="text-white/70 text-sm font-medium">
                No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full bg-background-light dark:bg-background-dark py-16 px-6 lg:px-40">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#181111] dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  How does it work?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Record or type your interview answer. Get instant AI feedback and improvements. Practice with voice playback and track your progress.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Yes! Try our free practice tools first. No credit card needed. Free users get 3 practice attempts per day.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Absolutely. Cancel anytime and keep access until your billing period ends. No questions asked.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Is my audio data secure?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Yes. Your audio is processed securely and is not stored permanently. We use industry-standard encryption and comply with data privacy regulations.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  We accept all major credit cards via Stripe's secure payment processing. Your payment information is never stored on our servers.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Yes. We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  What's the difference between free and Pro?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Free users get 3 practice attempts per day. Pro users get unlimited practice, full resume analysis, voice playback, and progress tracking.
                </p>
              </div>
              <div className="bg-white dark:bg-[#2a1a1a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#181111] dark:text-white mb-2">
                  Can I use this on mobile?
                </h3>
                <p className="text-sm text-[#5c4a4a] dark:text-gray-400 leading-relaxed">
                  Yes! JobSpeak Pro works on any device with a web browser. Practice on your phone, tablet, or computer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & SAFETY MICROCOPY */}
        <section className="w-full bg-gray-50 dark:bg-[#1a1a1a] py-12 px-6 lg:px-40 border-t border-[#e5dcdc] dark:border-[#333]">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-sm font-semibold text-[#181111] dark:text-white">
                Secure & Private
              </h3>
            </div>
            <p className="text-xs text-[#5c4a4a] dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Your audio is processed securely using industry-standard encryption. We don't store your recordings permanently, and your data is never shared with third parties. All payments are processed securely through Stripe.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full bg-background-light dark:bg-[#150a0a] border-t border-[#e5dcdc] dark:border-[#333] py-16 px-6 lg:px-40">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="size-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  graphic_eq
                </span>
              </div>
              <span className="text-[#181111] dark:text-white font-bold text-lg">
                JobSpeak Pro
              </span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-[#5c4a4a] dark:text-gray-400">
              <a 
                className="hover:text-primary transition-colors" 
                href="#pricing"
              >
                Pricing
              </a>
              <a 
                className="hover:text-primary transition-colors" 
                href="mailto:support@jobspeakpro.com"
              >
                Support
              </a>
              <a 
                className="hover:text-primary transition-colors" 
                href="/privacy"
              >
                Privacy
              </a>
            </div>
            <div className="text-sm text-[#886364] dark:text-gray-600">
              © 2023 JobSpeak Pro. All rights reserved.
            </div>
          </div>
        </footer>

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
    </div>
  );
}

