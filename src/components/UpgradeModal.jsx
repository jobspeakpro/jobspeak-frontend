// src/components/UpgradeModal.jsx
import React, { useEffect } from "react";
import UpgradeToProButton from "./UpgradeToProButton.jsx";

// source can be:
// - "fix_answer" → Unlock unlimited answer rewrites
// - "mic"        → Practice speaking without limits
// - "listen"     → Hear every answer spoken naturally
// - anything else / undefined → generic copy
export default function UpgradeModal({ onClose, isPro = false, source }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {getHeadline()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            {getSubcopy()}
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-emerald-900 mb-2">
              JobSpeak Pro includes:
            </h3>
            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
              <li>Unlimited interview answer rewrites</li>
              <li>Full Resume Doctor access</li>
              <li>Practice speaking with natural voice</li>
              <li>Track your progress over time</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <UpgradeToProButton showPlanPicker={true} />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Come back tomorrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

