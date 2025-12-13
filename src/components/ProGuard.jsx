// src/components/ProGuard.jsx
import React from "react";
import { usePro } from "../contexts/ProContext.jsx";
import UpgradeToProButton from "./UpgradeToProButton.jsx";

export default function ProGuard({ children, message = "This feature requires JobSpeak Pro." }) {
  const { isPro, loading } = usePro();

  // Show loading state while checking Pro status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  // If not Pro, show upgrade screen
  if (!isPro) {
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-sm">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-slate-600">
              {message}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3">
              JobSpeak Pro includes:
            </h3>
            <ul className="text-xs text-emerald-800 space-y-2 list-disc list-inside">
              <li>Unlimited interview answer rewrites</li>
              <li>Full Resume Doctor access</li>
              <li>Practice speaking with natural voice</li>
              <li>Track your progress over time</li>
              <li>AI-powered feedback on your English</li>
            </ul>
          </div>

          <div className="space-y-3">
            <UpgradeToProButton showPlanPicker={true} />
            <p className="text-xs text-slate-500">
              Secure checkout with Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If Pro, render children
  return <>{children}</>;
}

