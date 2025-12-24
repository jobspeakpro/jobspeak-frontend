// src/components/UpgradeModal.jsx
import React, { useEffect, useRef, useState } from "react";
import UpgradeToProButton from "./UpgradeToProButton.jsx";
import { gaEvent } from "../utils/ga.js";

// Pricing constants - easy to update later
const PRICING = {
  monthly: { price: 9.99, label: "$9.99 / mo" },
  annual: { price: 79.99, label: "$79.99 / yr", savings: "33%" },
};

// source can be:
// - "fix_answer" → Unlock unlimited answer rewrites
// - "mic"        → Practice speaking without limits
// - "listen"     → Hear every answer spoken naturally
// - anything else / undefined → generic copy
export default function UpgradeModal({ onClose, isPro = false, source }) {
  const hasTrackedOpen = useRef(false);
  const [billingPeriod, setBillingPeriod] = useState("annual");
  const paywallSource = source || "unknown";

  // Track modal open ONCE per mount
  useEffect(() => {
    if (!hasTrackedOpen.current) {
      gaEvent("free_limit_reached", { page: "practice" });
      gaEvent("paywall_modal_open", { page: "practice", source: paywallSource });
      hasTrackedOpen.current = true;
    }
  }, [paywallSource]);

  // Auto-close modal if user becomes Pro
  useEffect(() => {
    if (isPro) {
      onClose();
    }
  }, [isPro, onClose]);

  const getHeadline = () => {
    if (source === "fix_answer") {
      return "Unlock unlimited answer rewrites";
    }
    if (source === "mic") {
      return "Practice speaking without limits";
    }
    if (source === "listen") {
      return "Hear every answer spoken naturally";
    }
    return "Free Limit Reached";
  };

  const getSubcopy = () => {
    if (source === "fix_answer") {
      return "You've used your free answer improvements. Upgrade to keep getting instant rewrites for every interview question.";
    }
    if (source === "mic") {
      return "You've used your free speaking attempts. Upgrade to keep practicing out loud as much as you want.";
    }
    if (source === "listen") {
      return "You've used your free listening attempts. Upgrade to hear every answer spoken in natural, clear English.";
    }
    return "You've practiced hard today. Unlock your full potential and keep the momentum going with JobSpeak Pro.";
  };

  const handleBillingToggle = (period) => {
    setBillingPeriod(period);
    gaEvent("paywall_billing_toggle", { page: "practice", period });
  };

  const handleClose = () => {
    gaEvent("paywall_modal_close", { page: "practice", source: paywallSource });
    onClose();
  };

  const handleUpgradeClick = () => {
    gaEvent("paywall_upgrade_click", { page: "practice", period: billingPeriod, source: paywallSource });
    // Store paywallSource in localStorage for GA tracking on Stripe return
    try {
      localStorage.setItem("jobspeak_upgrade_source", paywallSource);
    } catch (err) {
      console.warn("Failed to store upgrade source:", err);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Lock icon in light blue circle */}
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 32 }}>
                lock
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {getHeadline()}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {getSubcopy()}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Keep your momentum going — practice again in seconds.
            </p>
          </div>

          {/* Feature checklist */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-900">Unlimited interview answer rewrites</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-900">Full Resume Doctor access</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-900">Practice speaking with natural voice</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-900">Track your progress over time</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3">
            {/* Plan Picker Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => handleBillingToggle("monthly")}
                className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold transition ${
                  billingPeriod === "monthly"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Monthly</span>
                  <span className={`text-[10px] mt-0.5 ${billingPeriod === "monthly" ? "text-emerald-50" : "text-slate-500"}`}>
                    {PRICING.monthly.label}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleBillingToggle("annual")}
                className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold transition ${
                  billingPeriod === "annual"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span>Annual</span>
                    {billingPeriod === "annual" && (
                      <span className="px-1 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded">
                        Save {PRICING.annual.savings}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 ${billingPeriod === "annual" ? "text-emerald-50" : "text-slate-500"}`}>
                    {PRICING.annual.label}
                  </span>
                </div>
              </button>
            </div>

            {/* Primary CTA Button - Centered with max-width */}
            <div className="flex justify-center">
              <div className="max-w-sm w-full [&_button]:w-full [&_button]:h-12 [&_button]:rounded-xl [&_button]:font-bold [&_button]:text-base">
                <UpgradeToProButton 
                  showPlanPicker={false} 
                  priceType={billingPeriod}
                  onUpgradeClick={handleUpgradeClick}
                />
              </div>
            </div>
            {/* Trust reducers */}
            <div className="flex flex-col items-center gap-1 mt-2">
              <p className="text-xs text-slate-500">Secure checkout via Stripe</p>
              <p className="text-xs text-slate-500">Cancel anytime</p>
            </div>
            {/* Secondary "Come back tomorrow" button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="bg-transparent hover:bg-slate-100 text-slate-600 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Come back tomorrow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

