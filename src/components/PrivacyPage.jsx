// src/components/PrivacyPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[#5c4a4a] dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-6 text-sm text-[#5c4a4a] dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Introduction
              </h2>
              <p>
                This Privacy Policy describes how JobSpeak Pro ("we", "our", or "us") collects, uses, and protects your personal information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Information We Collect
              </h2>
              <p>
                We collect information that you provide directly to us, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Account information (email address, user preferences)</li>
                <li>Practice session data (transcripts, feedback, scores)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide and improve our services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you updates and support communications</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#181111] dark:text-white mb-3">
                Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
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

