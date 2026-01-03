import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SupportPage() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-[#e7ecf3] dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0d131b] dark:text-white">JobSpeak Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/support" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Support
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthed ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/interview"
                  className="hidden sm:flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-blue-600"
                >
                  Start Practicing
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="hidden sm:flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/interview"
                  className="hidden sm:flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-blue-600"
                >
                  Start Practicing
                </Link>
              </>
            )}
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>


      <main className="flex-1 flex justify-center py-12 px-4 md:px-8">
        <div className="flex flex-col max-w-[960px] w-full gap-10">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
              Support
            </h1>
            <p className="text-[#617289] dark:text-gray-400 text-lg font-normal leading-normal">
              We’re here to help you practice with confidence.
            </p>
          </div>

          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              Quick Help
            </h2>

            <div className="flex flex-col gap-3">
              <details className="group flex flex-col rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-6 p-5">
                  <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">
                    How do I start practicing?
                  </p>
                  <span className="material-symbols-outlined text-[#617289] dark:text-gray-400 group-open:rotate-180 transition-transform duration-300">
                    expand_more
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-[#617289] dark:text-gray-400 text-base leading-relaxed">
                  Simply navigate to the "Practice" tab in the main menu. Select a
                  module that fits your needs, check your microphone settings, and
                  click "Begin Session". You can pause or stop at any time.
                </div>
              </details>

              <details className="group flex flex-col rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-6 p-5">
                  <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">
                    Why can’t I hear audio playback?
                  </p>
                  <span className="material-symbols-outlined text-[#617289] dark:text-gray-400 group-open:rotate-180 transition-transform duration-300">
                    expand_more
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-[#617289] dark:text-gray-400 text-base leading-relaxed">
                  Please check that your browser has permission to access your
                  speakers and microphone. You can usually find these settings in
                  your browser's address bar icon. Also, ensure your system volume
                  is turned up.
                </div>
              </details>

              <details className="group flex flex-col rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-6 p-5">
                  <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">
                    What happens when I reach the free limit?
                  </p>
                  <span className="material-symbols-outlined text-[#617289] dark:text-gray-400 group-open:rotate-180 transition-transform duration-300">
                    expand_more
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-[#617289] dark:text-gray-400 text-base leading-relaxed">
                  When you reach the free limit, your current progress is saved,
                  but you won't be able to start new practice sessions until the
                  limit resets or you upgrade your plan. You can view your usage
                  on your dashboard.
                </div>
              </details>

              <details className="group flex flex-col rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between gap-6 p-5">
                  <p className="text-base font-medium leading-normal text-slate-900 dark:text-white">
                    How do I cancel or change my plan?
                  </p>
                  <span className="material-symbols-outlined text-[#617289] dark:text-gray-400 group-open:rotate-180 transition-transform duration-300">
                    expand_more
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-[#617289] dark:text-gray-400 text-base leading-relaxed">
                  You can manage your subscription directly from the "Settings"{" "}
                  &gt; "Billing" page. Cancellations are effective immediately with
                  no hidden fees or lock-in contracts.
                </div>
              </details>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between gap-6 rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-primary mb-1">
                  <span className="material-symbols-outlined">school</span>
                  <p className="text-sm font-bold uppercase tracking-wide">
                    Getting Started
                  </p>
                </div>
                <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">
                  New to JobSpeak Pro?
                </h3>
                <ul className="flex flex-col gap-2 text-[#617289] dark:text-gray-400 text-base">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-500 text-xl">
                      check_circle
                    </span>
                    <span>Start practicing at your own pace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-500 text-xl">
                      check_circle
                    </span>
                    <span>No setup required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-500 text-xl">
                      check_circle
                    </span>
                    <span>Practice is private and judgment-free</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate("/start")}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold leading-normal transition-colors duration-200 shadow-sm"
              >
                Start Practicing
              </button>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[#617289] dark:text-gray-400 mb-1">
                  <span className="material-symbols-outlined">receipt_long</span>
                  <p className="text-sm font-bold uppercase tracking-wide">
                    Account
                  </p>
                </div>
                <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">
                  Billing Questions?
                </h3>
                <p className="text-[#617289] dark:text-gray-400 text-base leading-relaxed">
                  We believe in transparency. You can cancel anytime, and there
                  are absolutely no long-term contracts holding you back.
                </p>
              </div>

              <Link
                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-[#dbe0e6] dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111418] dark:text-white text-sm font-bold leading-normal transition-colors duration-200"
                to="/pricing"
              >
                View Pricing
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-8 items-center pt-4">
            <div className="text-center flex flex-col gap-2">
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Need more help?</h3>
              <p className="text-[#617289] dark:text-gray-400">
                Email us at{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:jobspeakpro@gmail.com"
                >
                  jobspeakpro@gmail.com
                </a>
              </p>
              <p className="text-sm text-[#617289] dark:text-gray-500">
                We usually reply within one business day.
              </p>
            </div>

            <div className="w-full rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 p-6 text-center">
              <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
                  sentiment_satisfied
                </span>
                <p className="text-[#111418] dark:text-white font-medium">
                  JobSpeak Pro is built to support your learning. If something
                  isn’t working as expected, we’re happy to help.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
