// src/components/TermsPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#181111] dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:px-40">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-red-600 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#181111] dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-[#5c4a4a] dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-6 text-sm text-[#5c4a4a] dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Acceptance of Terms
              </h2>
              <p>
                By accessing and using JobSpeak Pro, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Use License
              </h2>
              <p>
                Permission is granted to temporarily use JobSpeak Pro for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained in JobSpeak Pro</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Subscription and Billing
              </h2>
              <p>
                Subscriptions are billed on a monthly or annual basis. You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Refund Policy
              </h2>
              <p>
                We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be submitted within 30 days of the initial purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Limitation of Liability
              </h2>
              <p>
                JobSpeak Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Contact Information
              </h2>
              <p>
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@jobspeakpro.com" className="text-primary hover:underline">
                  support@jobspeakpro.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

