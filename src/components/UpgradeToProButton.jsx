// src/components/UpgradeToProButton.jsx
import React, { useState } from "react";
import { initiateUpgrade } from "../utils/upgrade.js";
import { gaEvent } from "../utils/ga.js";

export default function UpgradeToProButton({ showPlanPicker = false, defaultPriceType = "monthly" }) {
  const [loading, setLoading] = useState(false);
  const [priceType, setPriceType] = useState(defaultPriceType);

  const handleUpgradeClick = async () => {
    gaEvent("upgrade_click", { source: "free_limit_modal" });
    await initiateUpgrade({
      priceType,
      source: "button",
      onLoadingChange: setLoading,
    });
  };

  if (showPlanPicker) {
    return (
      <div className="space-y-3">
        {/* Plan Picker */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setPriceType("monthly")}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition ${
              priceType === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPriceType("annual")}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition ${
              priceType === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual
          </button>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgradeClick}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Opening Stripe...</span>
            </>
          ) : (
            "Upgrade to Pro"
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleUpgradeClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Opening Stripe...</span>
        </>
      ) : (
        "Upgrade to Pro"
      )}
    </button>
  );
}
