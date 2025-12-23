// src/components/UpgradeModal.jsx
import React, { useEffect } from "react";
import UpgradeToProButton from "./UpgradeToProButton.jsx";
import { trackEvent } from "../utils/analytics";

// source can be:
// - "fix_answer" → Unlock unlimited answer rewrites
// - "mic"        → Practice speaking without limits
// - "listen"     → Hear every answer spoken naturally
// - anything else / undefined → generic copy
export default function UpgradeModal({ onClose, isPro = false, source }) {
  // Track when modal is shown
  useEffect(() => {
    trackEvent("upgrade_modal_shown", { source: "paywall" });
  }, []);

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
    return "You've used your 3 free attempts today. Upgrade to continue practicing.";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 32 }}>
              upgrade
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {getHeadline()}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {getSubcopy()}
          </p>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-emerald-900 mb-3 uppercase tracking-wide">
            JobSpeak Pro includes:
          </h3>
          <ul className="text-sm text-emerald-800 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold mt-0.5 text-lg">✓</span>
              <span>Unlimited interview answer rewrites</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold mt-0.5 text-lg">✓</span>
              <span>Full Resume Doctor access</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold mt-0.5 text-lg">✓</span>
              <span>Practice speaking with natural voice</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold mt-0.5 text-lg">✓</span>
              <span>Track your progress over time</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <div className="[&>div]:space-y-3 [&>div>button:last-child]:h-12 [&>div>button:last-child]:text-base [&>div>button:last-child]:font-bold [&>div>button:last-child]:shadow-lg [&>div>button:last-child]:hover:shadow-xl">
            <UpgradeToProButton showPlanPicker={true} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Come back tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}

