// src/components/PaywallModal.jsx
import React, { useState } from "react";
import { initiateUpgrade } from "../utils/upgrade.js";

export default function PaywallModal({ onClose, onNotNow }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    await initiateUpgrade({
      priceType: "monthly",
      source: "paywall_modal",
      onLoadingChange: setLoading,
    });
  };

  const handleNotNowClick = () => {
    if (onNotNow) {
      onNotNow();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Simulated App Background (Blurred/Obscured context) */}
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-white p-8 opacity-20 pointer-events-none hidden md:block">
        {/* Abstract UI placeholder to simulate depth */}
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 h-full">
          <div className="col-span-1 bg-slate-100 rounded-xl h-full"></div>
          <div className="col-span-3 bg-slate-50 rounded-xl h-full flex flex-col gap-4 p-4">
            <div className="h-16 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal Container */}
        <div 
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] sm:max-h-none transform transition-all scale-100 opacity-100 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="flex flex-col items-center pt-10 pb-8 px-6 sm:px-10 w-full">
            {/* Warning Pill */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-lg icon-filled">lock</span>
              <span className="text-xs font-semibold tracking-wide uppercase">Daily Limit Reached</span>
            </div>

            {/* Text Content */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                Upgrade to Pro
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed font-normal">
                Unlock unlimited practice and advanced feedback to help you speak confidently.
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[800px] mb-8 items-start">
              {/* Free Plan Card */}
              <div className="group relative flex flex-col bg-white border border-slate-200 rounded-xl p-6 h-full transition-colors">
                <div className="mb-5">
                  <h3 className="text-slate-900 font-bold text-lg">Free Plan</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">$0</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-semibold text-sm rounded-lg border border-transparent cursor-not-allowed mb-6 text-center select-none"
                >
                  Current Plan
                </button>
                <ul className="flex flex-col gap-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">check</span>
                    <span>3 practice questions/day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">check</span>
                    <span>Basic feedback</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">check</span>
                    <span>Limited audio examples</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan Card */}
              <div className="relative flex flex-col bg-white border-2 border-primary rounded-xl p-6 h-full shadow-soft ring-4 ring-primary/5">
                {/* Floating Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                  Recommended
                </div>
                <div className="mb-5">
                  <h3 className="text-slate-900 font-bold text-lg">Pro Plan</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">$9.99</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all mb-6 text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Opening checkout..." : "Upgrade to Pro"}
                </button>
                <ul className="flex flex-col gap-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0 icon-filled">check_circle</span>
                    <span>Unlimited practice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0 icon-filled">check_circle</span>
                    <span>Advanced rewrites & AI suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0 icon-filled">check_circle</span>
                    <span>Unlimited audio examples</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0 icon-filled">check_circle</span>
                    <span>Priority generation speed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Trust Row */}
            <div className="w-full max-w-[800px] border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-500 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                <span className="text-xs font-medium">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                <span className="text-xs font-medium">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">support_agent</span>
                <span className="text-xs font-medium">Support included</span>
              </div>
            </div>

            {/* Dismiss Action */}
            <button
              type="button"
              onClick={handleNotNowClick}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors hover:underline decoration-dotted underline-offset-4"
            >
              Not now, continue tomorrow
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

