// src/components/PricingPage.jsx
import React, { useState } from "react";
import { initiateUpgrade } from "../utils/upgrade.js";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (priceType) => {
    await initiateUpgrade({
      priceType,
      source: "pricing_page",
      onLoadingChange: setLoading,
    });
  };

  const faqs = [
    {
      question: "Will this actually help me?",
      answer: "JobSpeak helps you practice speaking clearly and confidently so you sound natural under pressure.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Cancel in one click.",
    },
  ];

  return (
    <section id="pricing" className="mt-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Practice with confidence. Walk into interviews prepared.
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
          JobSpeak helps you practice real interview answers, hear how you sound, and improve without judgment so you do not freeze when it matters.
        </p>
        
        {/* Empathy block */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-2xl mx-auto">
          <p className="text-sm text-slate-700 leading-relaxed">
            Interviews are stressful, even for qualified people.<br />
            Most candidates do not fail because they are unprepared.<br />
            They fail because they did not get enough real practice.
          </p>
        </div>
      </div>

      {/* Pricing Cards - All three plans visible */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Free Practice
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Great for trying JobSpeak, not ideal for serious preparation.
            </p>
          </div>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>3 answer rewrites per day</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Basic feedback</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Limited practice</span>
            </li>
          </ul>

          <button
            onClick={() => window.location.href = "/"}
            className="w-full px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition"
          >
            Continue with Free
          </button>
        </div>

        {/* Monthly Plan */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Monthly Plan
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">$9.99</span>
              <span className="text-sm text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500">
              Best for short-term interview prep.
            </p>
          </div>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Unlimited answer rewrites</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Voice practice and playback</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Structured feedback</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Cancel anytime</span>
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade("monthly")}
            disabled={loading}
            className="w-full px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition mb-2"
          >
            {loading ? "Opening checkout..." : "Start Monthly"}
          </button>
          
          <p className="text-xs text-slate-500 text-center">
            Flexible. Cancel anytime.
          </p>
        </div>

        {/* Annual Plan - Recommended */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            Save 33%
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Annual Plan
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">$79.99</span>
              <span className="text-sm text-slate-500">/ year</span>
            </div>
            <p className="text-xs text-slate-500">
              Best for consistent confidence and stress-free practice.
            </p>
          </div>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Unlimited answer rewrites</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Voice practice and playback</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Structured feedback</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Resume and answer improvement</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Progress without daily limits</span>
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade("annual")}
            disabled={loading}
            className="w-full px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition mb-2"
          >
            {loading ? "Opening checkout..." : "Upgrade to Pro"}
          </button>
          
          <p className="text-xs text-slate-500 text-center">
            Most users choose this for uninterrupted practice.
          </p>
        </div>
      </div>

      {/* Trust + Reassurance */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
          <p>Secure checkout via Stripe</p>
          <p>Cancel anytime</p>
          <p>No contracts. No pressure.</p>
        </div>
      </div>

      {/* Gentle Urgency */}
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-base md:text-lg text-slate-700 font-medium">
          You were making progress. Do not lose momentum now.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <h4 className="text-base font-semibold text-slate-900 mb-2">
                {faq.question}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Reassurance */}
      <div className="max-w-3xl mx-auto text-center pb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
          <p className="text-base text-slate-700 leading-relaxed">
            JobSpeak is built to support you, not judge you.<br />
            Practice privately. Improve calmly. Show up confident.
          </p>
        </div>
      </div>
    </section>
  );
}
