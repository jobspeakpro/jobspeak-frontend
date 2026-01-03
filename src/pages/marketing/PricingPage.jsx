// src/pages/marketing/PricingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UniversalHeader from "../../components/UniversalHeader.jsx";
import { initiateUpgrade } from "../../utils/upgrade.js";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle canceled and success params from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const canceled = params.get("canceled");
    const success = params.get("success");

    if (canceled === "true") {
      setToast("canceled");
      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else if (success === "true") {
      setToast("success");
      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.search]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpgrade = async (priceType) => {
    // Map priceType to interval for backend API
    const interval = priceType === "annual" ? "annual" : "monthly";
    await initiateUpgrade({
      interval,
      source: "pricing_page",
      onLoadingChange: setLoading,
    });
  };

  return (
    <>
      <UniversalHeader />
      {/* Toast notification */}
      {toast === "canceled" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Checkout canceled</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
      {toast === "success" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">Welcome to Pro!</p>
              <p className="text-xs text-green-700 dark:text-green-300">Your subscription is active.</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
      {/* === STITCH MAIN CONTENT ONLY (no extra header/footer) === */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-20 flex flex-col items-center font-display">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl md:text-4xl font-black leading-tight mb-4">
            Pricing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-normal mb-2">
            Choose the plan that fits your practice needs.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-normal leading-relaxed max-w-lg mx-auto">
            JobSpeak Pro offers flexible plans so you can practice speaking
            confidently at your own pace.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Practice */}
          <div className="flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Free Practice
              </h3>
              <p className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-black tracking-tight">$0</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                  /forever
                </span>
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                Perfect for getting started.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/start")}
              className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-bold transition-colors"
            >
              Continue with Free
            </button>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Basic interview questions</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Standard timer</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Self-review playback</span>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div className="flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Monthly
              </h3>
              <p className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-black tracking-tight">$9.99</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                  /month
                </span>
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                Flexible month-to-month.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade("monthly")}
              disabled={loading}
              className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Opening checkout..." : "Start Monthly"}
            </button>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Unlimited questions</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>AI Speech Feedback</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Private recording library</span>
              </div>
            </div>
          </div>

          {/* Annual */}
          <div className="flex relative flex-col gap-6 rounded-xl border-2 border-primary bg-white dark:bg-slate-800 p-6 shadow-xl shadow-blue-100 dark:shadow-none transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-sm">
              Best Value
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Annual
              </h3>
              <p className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-black tracking-tight">$79.99</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                  /year
                </span>
              </p>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Just{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    $6.67/month
                  </span>
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs font-bold">
                  Save ~33% compared to monthly
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade("annual")}
              disabled={loading}
              className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-md shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
            </button>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Everything in Monthly</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Priority email support</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Early access to new features</span>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <span className="text-green-500 text-[20px] leading-none">✓</span>
                <span>Commit to your growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Row */}
        <div className="w-full max-w-5xl mx-auto mb-16">
          <div className="flex flex-wrap gap-6 justify-center items-center py-4 border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 px-2">
              <span className="text-slate-400 dark:text-slate-500">🔒</span>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-semibold">
                Secure checkout via Stripe
              </p>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-green-500">✅</span>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-semibold">
                Cancel anytime
              </p>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-slate-400 dark:text-slate-500">📄</span>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-semibold">
                No contracts
              </p>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-slate-400 dark:text-slate-500">🤍</span>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-semibold">
                No pressure to continue
              </p>
            </div>
          </div>
        </div>

        {/* Compare Plans */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <h3 className="text-xl font-bold text-center mb-8 text-slate-900 dark:text-white">
            Compare Plans
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Feature</th>
                  <th className="px-6 py-4 font-medium text-center w-1/4">Free</th>
                  <th className="px-6 py-4 font-medium text-center w-1/4 text-primary">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    Question Library
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    Basic only
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center justify-center gap-1">
                      Unlimited <span className="text-green-500 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    AI Feedback
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400 dark:text-slate-600">
                    -
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center justify-center gap-1">
                      Detailed <span className="text-green-500 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    Recordings
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    Temporary
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center justify-center gap-1">
                      Private Library{" "}
                      <span className="text-green-500 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    Support
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    Community
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center justify-center gap-1">
                      Priority <span className="text-green-500 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-3xl mx-auto mb-16">
          <h3 className="text-xl font-bold text-center mb-8 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold">
                Can I cancel anytime?
                <span className="text-slate-400 transition duration-300 group-open:-rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
                Absolutely. You can cancel your subscription with a single click
                from your account settings. You will retain access until the end
                of your billing cycle.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold">
                Is my practice private?
                <span className="text-slate-400 transition duration-300 group-open:-rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
                Yes. Your recordings are strictly private and are not shared
                with anyone. Our AI processes audio securely to provide feedback
                and does not retain the audio for training purposes.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 dark:text-white font-semibold">
                Is this a contract?
                <span className="text-slate-400 transition duration-300 group-open:-rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
                No, there are no long-term contracts. JobSpeak Pro is a
                subscription service. You can choose to pay monthly or annually,
                but you are never locked in beyond the period you've paid for.
              </p>
            </details>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto text-center px-6 py-10 rounded-2xl bg-primary/5 dark:bg-slate-800/50">
          <p className="text-slate-800 dark:text-slate-200 font-medium text-base md:text-lg mb-2">
            You can upgrade when you’re ready.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            JobSpeak Pro is here to support your practice, not pressure you.
          </p>
        </div>
      </main>
    </>
  );
}
