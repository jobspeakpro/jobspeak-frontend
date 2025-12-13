// src/components/PricingPage.jsx
import React, { useState } from "react";
import { initiateUpgrade } from "../utils/upgrade.js";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // 'monthly' | 'annual'
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (priceType) => {
    await initiateUpgrade({
      priceType,
      source: "pricing_page",
      onLoadingChange: setLoading,
    });
  };

  const features = [
    "Unlimited interview answer rewrites",
    "Full Resume Doctor access",
    "Practice speaking with natural voice",
    "Track your progress over time",
    "AI-powered feedback on your English",
    "Access from any device",
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Cancel anytime and keep access until your billing period ends.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "All major credit cards via Stripe's secure payment processing.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Try our free practice tools first. No credit card needed.",
    },
  ];

  return (
    <section id="pricing" className="mt-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Choose your plan. All plans include full access to all features.
        </p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              selectedPlan === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan("annual")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              selectedPlan === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual
            <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Primary CTA Above Fold */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-6 md:p-8 text-center shadow-lg">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            Ready to improve your English?
          </h3>
          <p className="text-sm md:text-base text-rose-50 mb-6 max-w-lg mx-auto">
            Join thousands landing their dream jobs with confidence.
          </p>
          <button
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-base font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Opening checkout...</span>
              </>
            ) : (
              <>
                <span>Start Your Pro Journey</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          <p className="text-xs text-rose-100 mt-4">
            No credit card required to start • Cancel anytime
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Monthly Card */}
        {selectedPlan === "monthly" && (
          <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Monthly Plan
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">$19</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Billed monthly, cancel anytime
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade("monthly")}
              disabled={loading}
              className="w-full px-5 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition mb-3"
            >
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
            </button>
            
            {/* Secure payments badge */}
            <div className="text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure payments by Stripe
              </p>
            </div>
          </div>
        )}

        {/* Annual Card */}
        {selectedPlan === "annual" && (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
              BEST VALUE
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Annual Plan
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">$15</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Billed $180 annually, save 20%
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade("annual")}
              disabled={loading}
              className="w-full px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition mb-3"
            >
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
            </button>
            
            {/* Secure payments badge */}
            <div className="text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure payments by Stripe
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Money-back guarantee */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-emerald-900">30-day money-back guarantee</h4>
          </div>
          <p className="text-xs text-emerald-700">
            Not satisfied? Full refund within 30 days. No questions asked.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-rose-100 rounded-lg p-4"
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary CTA Below FAQ */}
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-white border-2 border-rose-200 rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Try it risk-free. Start free practice now, or upgrade for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => handleUpgrade(selectedPlan)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Opening checkout...</span>
                </>
              ) : (
                <>
                  <span>Upgrade to Pro</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-xs text-slate-500">
              or <span className="font-semibold text-slate-700">try free practice first</span>
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-slate-600 font-medium">
            Secure payments by Stripe • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

