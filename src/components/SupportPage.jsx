// src/components/SupportPage.jsx
import React from "react";
import MarketingLayout from "../layouts/MarketingLayout.jsx";

export default function SupportPage() {
  return (
    <MarketingLayout>
      <div className="w-full bg-white py-20 px-6 lg:px-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Support
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            We're here to help you succeed with JobSpeak Pro.
          </p>

          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Get Help
              </h2>
              <p className="text-slate-600 mb-4">
                Have a question or need assistance? Reach out to our support team.
              </p>
              <a
                href="mailto:support@jobspeakpro.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Common Questions
              </h2>
              <ul className="space-y-3 text-slate-600">
                <li>
                  <strong className="text-slate-900">How do I get started?</strong>
                  <p className="mt-1">Click "Login" to start practicing. No account needed to begin.</p>
                </li>
                <li>
                  <strong className="text-slate-900">Is my data private?</strong>
                  <p className="mt-1">Yes, all your practice sessions are completely private. See our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> for details.</p>
                </li>
                <li>
                  <strong className="text-slate-900">Can I cancel my subscription?</strong>
                  <p className="mt-1">Yes, you can cancel anytime from your account settings.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

