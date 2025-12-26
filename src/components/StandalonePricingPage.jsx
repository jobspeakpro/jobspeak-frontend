// src/components/StandalonePricingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initiateUpgrade } from "../utils/upgrade.js";

export default function StandalonePricingPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async (priceType) => {
    await initiateUpgrade({
      priceType,
      source: "pricing_page",
      onLoadingChange: setLoading,
    });
  };

  const handleContinueFree = () => {
    navigate("/");
  };

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#111621] font-display text-[#0e121b] dark:text-white overflow-x-hidden antialiased">
      <div className="relative flex min-h-screen flex-col">
        {/* Navigation */}
        <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-solid border-[#e7ebf3] bg-white/80 dark:bg-[#111621]/80 backdrop-blur-md px-6 py-4 md:px-10 lg:px-40">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined">graphic_eq</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeak Pro</h2>
          </div>
          <div className="hidden sm:flex gap-3">
            <button 
              onClick={() => navigate("/start")}
              className="flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium text-[#0e121b] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate("/start")}
              className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign Up
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center pb-20">
          {/* Page Header */}
          <section className="w-full max-w-[960px] px-6 py-12 md:py-16 text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0e121b] dark:text-white mb-4">Pricing</h1>
            <p className="text-lg md:text-xl text-[#4e6797] dark:text-[#94a3b8] font-normal mb-6">Choose the plan that fits your practice needs.</p>
            <div className="mx-auto max-w-2xl">
              <p className="text-base text-[#4e6797] dark:text-[#94a3b8]">
                JobSpeak Pro offers flexible plans so you can practice speaking confidently at your own pace.
              </p>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="w-full max-w-[1100px] px-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Free Card */}
              <div className="relative flex flex-col rounded-xl border border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-[#1a202c] p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0e121b] dark:text-white">Free Practice</h3>
                  <p className="mt-2 text-sm text-[#4e6797] dark:text-[#94a3b8]">Trying JobSpeak or practicing occasionally.</p>
                </div>
                <div className="mb-6 flex items-baseline">
                  <span className="text-3xl font-bold text-[#0e121b] dark:text-white">Free</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 20 }}>check</span>
                    <span>Limited daily practice</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 20 }}>check</span>
                    <span>Basic feedback</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 20 }}>check</span>
                    <span>Voice playback</span>
                  </div>
                </div>
                <button 
                  onClick={handleContinueFree}
                  className="w-full rounded-lg bg-[#e7ebf3] dark:bg-gray-700 h-10 px-4 text-sm font-bold text-[#0e121b] dark:text-white hover:bg-[#dbe0ea] dark:hover:bg-gray-600 transition-colors"
                >
                  Continue with Free
                </button>
              </div>

              {/* Monthly Card */}
              <div className="relative flex flex-col rounded-xl border border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-[#1a202c] p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0e121b] dark:text-white">Monthly</h3>
                  <p className="mt-2 text-sm text-[#4e6797] dark:text-[#94a3b8]">Focused interview preparation over a short period.</p>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#0e121b] dark:text-white">$9.99</span>
                  <span className="text-sm font-medium text-[#4e6797] dark:text-[#94a3b8]">/month</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Unlimited speaking practice</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Answer rewrites</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Voice playback</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Structured feedback</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpgrade("monthly")}
                  disabled={loading}
                  className="w-full rounded-lg border-2 border-blue-600 dark:border-blue-500 bg-transparent h-10 px-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Opening checkout..." : "Start Monthly"}
                </button>
              </div>

              {/* Annual Card (Recommended) */}
              <div className="relative flex flex-col rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-[#1a202c] p-6 shadow-md ring-1 ring-blue-100 dark:ring-blue-900/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wide">
                  Recommended
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0e121b] dark:text-white">Annual</h3>
                  <p className="mt-2 text-sm text-[#4e6797] dark:text-[#94a3b8]">For consistent practice and long-term confidence.</p>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#0e121b] dark:text-white">$79.99</span>
                  <span className="text-sm font-medium text-[#4e6797] dark:text-[#94a3b8]">/year</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Unlimited speaking practice</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Answer rewrites</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>Structured feedback</span>
                  </div>
                  <div className="flex gap-3 text-sm text-[#0e121b] dark:text-gray-200">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>check</span>
                    <span>No daily limits</span>
                  </div>
                  <p className="text-xs text-[#4e6797] italic mt-2">Most users choose this to practice without interruptions.</p>
                </div>
                <button 
                  onClick={() => handleUpgrade("annual")}
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 h-10 px-4 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Opening checkout..." : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          </section>

          {/* Reassurance Block */}
          <section className="w-full max-w-[960px] px-6 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-transparent">
                <span className="material-symbols-outlined text-[#4e6797]">lock</span>
                <div className="text-sm text-[#4e6797] font-medium">Secure checkout via Stripe</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-transparent">
                <span className="material-symbols-outlined text-[#4e6797]">cancel</span>
                <div className="text-sm text-[#4e6797] font-medium">Cancel anytime</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-transparent">
                <span className="material-symbols-outlined text-[#4e6797]">article</span>
                <div className="text-sm text-[#4e6797] font-medium">No contracts</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-transparent">
                <span className="material-symbols-outlined text-[#4e6797]">sentiment_satisfied</span>
                <div className="text-sm text-[#4e6797] font-medium">No pressure to continue</div>
              </div>
            </div>
          </section>

          {/* Plan Comparison Table */}
          <section className="w-full max-w-[800px] px-6 mb-16">
            <h3 className="text-xl font-bold text-[#0e121b] dark:text-white mb-6 text-center">Plan Comparison</h3>
            <div className="overflow-hidden rounded-xl border border-[#e7ebf3] dark:border-gray-700 bg-white dark:bg-[#1a202c]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fc] dark:bg-gray-800">
                  <tr>
                    <th className="p-4 font-semibold text-[#4e6797] dark:text-[#94a3b8]">Feature</th>
                    <th className="p-4 font-semibold text-[#0e121b] dark:text-white text-center w-1/4">Free</th>
                    <th className="p-4 font-semibold text-blue-600 dark:text-blue-400 text-center w-1/4">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3] dark:divide-gray-700">
                  <tr>
                    <td className="p-4 font-medium text-[#0e121b] dark:text-gray-200">Speaking practice</td>
                    <td className="p-4 text-center text-[#4e6797] dark:text-[#94a3b8]">Limited</td>
                    <td className="p-4 text-center font-semibold text-[#0e121b] dark:text-white">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#0e121b] dark:text-gray-200">Answer rewrites</td>
                    <td className="p-4 text-center text-[#4e6797] dark:text-[#94a3b8]">Limited</td>
                    <td className="p-4 text-center font-semibold text-[#0e121b] dark:text-white">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#0e121b] dark:text-gray-200">Voice playback</td>
                    <td className="p-4 text-center">
                      <span className="material-symbols-outlined text-[#4e6797] text-lg">check_circle</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">check_circle</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#0e121b] dark:text-gray-200">Daily limits</td>
                    <td className="p-4 text-center text-[#4e6797] dark:text-[#94a3b8]">Yes</td>
                    <td className="p-4 text-center font-semibold text-[#0e121b] dark:text-white">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="w-full max-w-[800px] px-6 mb-16">
            <h3 className="text-xl font-bold text-[#0e121b] dark:text-white mb-8 text-center">Common Questions</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-lg p-4 bg-white dark:bg-[#1a202c] border border-transparent dark:border-gray-700">
                <h4 className="font-bold text-[#0e121b] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4e6797] text-xl">help</span>
                  Can I cancel anytime?
                </h4>
                <p className="text-sm text-[#4e6797] dark:text-[#94a3b8] pl-8">Yes. You can cancel at any time from your account settings.</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-4 bg-white dark:bg-[#1a202c] border border-transparent dark:border-gray-700">
                <h4 className="font-bold text-[#0e121b] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4e6797] text-xl">lock_person</span>
                  Will my practice be private?
                </h4>
                <p className="text-sm text-[#4e6797] dark:text-[#94a3b8] pl-8">Yes. Your sessions are completely private and not shared with anyone.</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-4 bg-white dark:bg-[#1a202c] border border-transparent dark:border-gray-700 md:col-span-2">
                <h4 className="font-bold text-[#0e121b] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4e6797] text-xl">description</span>
                  Is this a contract?
                </h4>
                <p className="text-sm text-[#4e6797] dark:text-[#94a3b8] pl-8">No. Plans are flexible. You are not locked into any long-term commitment and can stop whenever you want.</p>
              </div>
            </div>
          </section>

          {/* Final Confirmation */}
          <section className="w-full max-w-[600px] px-6 text-center">
            <p className="text-[#4e6797] dark:text-[#94a3b8] text-base leading-relaxed">
              You can upgrade when you're ready. <br className="hidden sm:block"/>JobSpeak Pro is here to support your practice, not pressure you.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

