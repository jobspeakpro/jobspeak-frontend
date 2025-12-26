// src/pages/marketing/UpgradePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { initiateUpgrade } from "../../utils/upgrade.js";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    await initiateUpgrade({
      priceType: "monthly",
      source: "upgrade_page",
      onLoadingChange: setLoading,
    });
  };

  return (
    <MarketingLayout>
      <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white min-h-screen flex flex-col items-center py-10 px-4 md:px-8 overflow-x-hidden">
        {/* Warning Pill */}
        <div className="mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-sm font-medium shadow-sm dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>You've used all 3 free practice questions for today.</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Unlock unlimited practice and advanced feedback to help you speak confidently.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start mb-12">
          {/* Free Plan Card */}
          <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-soft dark:bg-card-dark dark:border-slate-700 order-2 md:order-1">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Free Plan</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">$0</span>
                <span className="text-base font-medium text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Forever free for casual learners.</p>
            </div>
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-slate-100 py-3 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed mb-8 dark:bg-slate-800 dark:text-slate-500 transition-colors"
            >
              Current Plan
            </button>
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">check</span>
                <span>3 practice questions/day</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">check</span>
                <span>Basic feedback</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">check</span>
                <span>Limited audio examples</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan Card */}
          <div className="relative flex flex-col h-full rounded-2xl border-2 border-primary bg-white p-6 md:p-8 shadow-xl dark:bg-card-dark dark:border-primary order-1 md:order-2">
            {/* Floating Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wide py-1.5 px-3 rounded-full shadow-sm">
              Recommended
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pro Plan</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">$9.99</span>
                <span className="text-base font-medium text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Maximum progress, minimum limits.</p>
            </div>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white py-3 px-4 text-sm font-bold shadow-md shadow-blue-500/20 mb-8 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
            </button>
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>Unlimited practice</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>Advanced rewrites & AI suggestions</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>Unlimited audio examples</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>Priority generation speed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Row */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-slate-500 dark:text-slate-400 text-sm font-medium mb-16">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Support included</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 open:ring-1 open:ring-slate-200 dark:open:ring-slate-700">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-slate-900 dark:text-white select-none">
                <span>Can I cancel anytime?</span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-transform duration-300 expand-icon">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Yes, absolutely. You can cancel your subscription at any time directly from your account settings. You'll keep access until the end of your billing period.
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 open:ring-1 open:ring-slate-200 dark:open:ring-slate-700">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-slate-900 dark:text-white select-none">
                <span>Do I lose my progress if I downgrade?</span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-transform duration-300 expand-icon">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                No, your data is safe with us. Your practice history, saved responses, and feedback are preserved securely even if you switch back to the free plan.
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 open:ring-1 open:ring-slate-200 dark:open:ring-slate-700">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-slate-900 dark:text-white select-none">
                <span>What happens immediately after I upgrade?</span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-transform duration-300 expand-icon">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                You'll get instant access to unlimited practice questions, premium AI feedback, and audio examples. The limit on your account will be lifted immediately.
              </div>
            </details>
          </div>
        </div>

        {/* Footer Space */}
        <div className="h-20"></div>
      </div>
    </MarketingLayout>
  );
}

