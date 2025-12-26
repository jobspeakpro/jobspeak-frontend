// src/pages/marketing/PricingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { initiateUpgrade } from "../../utils/upgrade.js";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async (priceType) => {
    await initiateUpgrade({
      priceType,
      source: "pricing_page",
      onLoadingChange: setLoading,
    });
  };

  return (
    <MarketingLayout>
      {/* match Stitch page background */}
      <div className="w-full bg-offwhite">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-slate-900 tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-4">
              Pricing
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-normal mb-2">
              Choose the plan that fits your practice needs.
            </p>
            <p className="text-slate-400 text-sm font-normal leading-relaxed max-w-lg mx-auto">
              JobSpeak Pro offers flexible plans so you can practice speaking
              confidently at your own pace.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
            {/* Free Practice */}
            <div className="flex flex-col gap-6 rounded-[0.75rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-1">
                <h3 className="text-slate-900 text-lg font-bold">Free Practice</h3>
                <p className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-black tracking-tight">$0</span>
                  <span className="text-slate-500 text-sm font-bold">/forever</span>
                </p>
                <p className="text-slate-400 text-xs mt-1">Perfect for getting started.</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/start")}
                className="flex items-center justify-center rounded-[0.5rem] h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold transition-colors"
              >
                Continue with Free
              </button>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Basic interview questions</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Standard timer</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Self-review playback</span>
                </div>
              </div>
            </div>

            {/* Monthly */}
            <div className="flex flex-col gap-6 rounded-[0.75rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-1">
                <h3 className="text-slate-900 text-lg font-bold">Monthly</h3>
                <p className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-black tracking-tight">$9.99</span>
                  <span className="text-slate-500 text-sm font-bold">/month</span>
                </p>
                <p className="text-slate-400 text-xs mt-1">Flexible month-to-month.</p>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade("monthly")}
                disabled={loading}
                className="flex items-center justify-center rounded-[0.5rem] h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-bold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Opening checkout..." : "Start Monthly"}
              </button>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Unlimited questions</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>AI Speech Feedback</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Private recording library</span>
                </div>
              </div>
            </div>

            {/* Annual (Best Value) */}
            <div className="flex relative flex-col gap-6 rounded-[0.75rem] border-2 border-blue-600 bg-white p-6 shadow-xl shadow-blue-100 transform md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-sm">
                Best Value
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <h3 className="text-slate-900 text-lg font-bold">Annual</h3>
                <p className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-black tracking-tight">$79.99</span>
                  <span className="text-slate-500 text-sm font-bold">/year</span>
                </p>

                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-slate-500 text-sm font-medium">
                    Just <span className="font-bold text-slate-700">$6.67/month</span>
                  </p>
                  <p className="text-green-600 text-xs font-bold">
                    Save ~33% compared to monthly
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade("annual")}
                disabled={loading}
                className="flex items-center justify-center rounded-[0.5rem] h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-bold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Opening checkout..." : "Upgrade to Pro"}
              </button>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Everything in Monthly</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Priority email support</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Early access to new features</span>
                </div>
                <div className="text-sm font-medium text-slate-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  <span>Commit to your growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="flex flex-wrap gap-6 justify-center items-center py-4 border-y border-slate-200 bg-white/50 rounded-[0.75rem]">
              <div className="flex items-center gap-2 px-2">
                <span className="material-symbols-outlined text-slate-400">lock</span>
                <p className="text-slate-600 text-xs md:text-sm font-semibold">
                  Secure checkout via Stripe
                </p>
              </div>
              <div className="flex items-center gap-2 px-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <p className="text-slate-600 text-xs md:text-sm font-semibold">Cancel anytime</p>
              </div>
              <div className="flex items-center gap-2 px-2">
                <span className="material-symbols-outlined text-slate-400">description</span>
                <p className="text-slate-600 text-xs md:text-sm font-semibold">No contracts</p>
              </div>
              <div className="flex items-center gap-2 px-2">
                <span className="material-symbols-outlined text-slate-400">favorite</span>
                <p className="text-slate-600 text-xs md:text-sm font-semibold">
                  No pressure to continue
                </p>
              </div>
            </div>
          </div>

          {/* Compare Plans */}
          <div className="w-full max-w-4xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-center mb-8 text-slate-900">Compare Plans</h3>
            <div className="overflow-x-auto rounded-[0.75rem] border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Feature</th>
                    <th className="px-6 py-4 font-medium text-center w-1/4">Free</th>
                    <th className="px-6 py-4 font-medium text-center w-1/4 text-blue-600">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-900">Question Library</td>
                    <td className="px-6 py-4 text-center text-slate-600">Basic only</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center gap-1">
                        Unlimited
                        <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-900">AI Feedback</td>
                    <td className="px-6 py-4 text-center text-slate-400">-</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center gap-1">
                        Detailed
                        <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-900">Recordings</td>
                    <td className="px-6 py-4 text-center text-slate-600">Temporary</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center gap-1">
                        Private Library
                        <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-900">Support</td>
                    <td className="px-6 py-4 text-center text-slate-600">Community</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center gap-1">
                        Priority
                        <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="w-full max-w-3xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-center mb-8 text-slate-900">
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              <details className="group rounded-[0.5rem] border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 font-semibold">
                  Can I cancel anytime?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180 text-slate-400">
                    expand_more
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-600 text-sm">
                  Absolutely. You can cancel your subscription with a single click
                  from your account settings. You will retain access until the end
                  of your billing cycle.
                </p>
              </details>

              <details className="group rounded-[0.5rem] border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 font-semibold">
                  Is my practice private?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180 text-slate-400">
                    expand_more
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-600 text-sm">
                  Yes. Your recordings are strictly private and are not shared with
                  anyone. Our AI processes audio securely to provide feedback and
                  does not retain the audio for training purposes.
                </p>
              </details>

              <details className="group rounded-[0.5rem] border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 font-semibold">
                  Is this a contract?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180 text-slate-400">
                    expand_more
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-600 text-sm">
                  No, there are no long-term contracts. JobSpeak Pro is a subscription
                  service. You can choose to pay monthly or annually, but you are never
                  locked in beyond the period you've paid for.
                </p>
              </details>
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto text-center px-6 py-10 rounded-[1rem] bg-blue-600/5">
            <p className="text-slate-800 font-medium text-base md:text-lg mb-2">
              You can upgrade when you’re ready.
            </p>
            <p className="text-slate-500 text-sm">
              JobSpeak Pro is here to support your practice, not pressure you.
            </p>
          </div>
        </main>
      </div>
    </MarketingLayout>
  );
}
