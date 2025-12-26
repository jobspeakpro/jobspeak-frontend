// src/pages/marketing/PrivacyPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
                  Contents
                </h3>
                <nav className="flex flex-col gap-1">
                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors"
                    href="#overview"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      info
                    </span>
                    Overview
                  </a>

                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#collection"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      list_alt
                    </span>
                    Data Collection
                  </a>

                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#usage"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      settings_suggest
                    </span>
                    Usage
                  </a>

                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#voice"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      mic
                    </span>
                    Voice Data
                  </a>

                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#sharing"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      share
                    </span>
                    Sharing &amp; Rights
                  </a>

                  <a
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#contact"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      mail
                    </span>
                    Contact
                  </a>
                </nav>
              </div>

              <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-primary mb-1">Need help?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Our support team is available 24/7.
                </p>
                <Link
                  className="text-xs font-bold text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-2 hover:decoration-primary transition-all"
                  to="/support"
                >
                  Visit Support Center
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 min-w-0">
            <div className="mb-10">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
                <Link className="hover:text-primary transition-colors" to="/">
                  Home
                </Link>
                <span className="material-symbols-outlined text-[14px]">
                  chevron_right
                </span>
                <span className="text-slate-900 dark:text-white">Privacy Policy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Privacy Policy
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Your privacy matters. This page explains what information we collect,
                how we use it, and the control you have over your data.
              </p>

              <div className="text-sm text-slate-400 mt-4">
                Last Updated: October 24, 2023
              </div>
            </div>

            <section className="mb-12" id="overview">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-green-700 dark:text-green-400">
                    <span className="material-symbols-outlined">verified_user</span>
                    <h2 className="text-lg font-bold uppercase tracking-wide">
                      Plain-Language Overview
                    </h2>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-lg font-medium leading-relaxed">
                    JobSpeak Pro is designed to help you practice speaking confidently.
                    We only collect information needed to provide and improve the
                    service.{" "}
                    <span className="bg-green-200/50 dark:bg-green-900/50 px-1 rounded">
                      We do not sell your personal data.
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16" id="collection">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">folder_open</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Information We Collect
                </h2>
              </div>

              <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 shadow-sm">
                <div className="p-6 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-slate-900 dark:text-white mb-1 sm:mb-0">
                    Basic User Info
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:mt-0 sm:col-span-2">
                    When you create an account, we collect session identifiers and
                    basic account details (like email) to verify your identity.
                  </dd>
                </div>

                <div className="p-6 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-slate-900 dark:text-white mb-1 sm:mb-0">
                    Usage Information
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:mt-0 sm:col-span-2">
                    We track data on practice sessions (duration, frequency) and
                    feature usage to understand what tools help you the most.
                  </dd>
                </div>

                <div className="p-6 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-slate-900 dark:text-white mb-1 sm:mb-0">
                    Voice &amp; Text Input
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:mt-0 sm:col-span-2">
                    We process your voice recordings and text inputs specifically to
                    provide feedback and run practice scenarios.
                  </dd>
                </div>

                <div className="p-6 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-slate-900 dark:text-white mb-1 sm:mb-0">
                    Technical Data
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:mt-0 sm:col-span-2">
                    Like most websites, we collect browser type, device type, and
                    basic technical logs to ensure our site works on your device.
                  </dd>
                </div>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <section
                className="bg-white dark:bg-[#1a2634] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full"
                id="usage"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    psychology
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    How We Use Your Data
                  </h2>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-1">
                      check_circle
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Provide Practice:</strong> To generate feedback on your
                      speaking pace, tone, and clarity.
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-1">
                      check_circle
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Improve Reliability:</strong> To identify bugs and
                      improve performance across different devices.
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-1">
                      check_circle
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Analyze Patterns:</strong> To understand how users learn
                      best and build better features.
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-1">
                      check_circle
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Billing &amp; Access:</strong> To manage your subscription
                      and grant access to Pro features.
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-500 italic">
                    "We do not use your data to judge or evaluate you outside of the
                    practice context."
                  </p>
                </div>
              </section>

              <section
                className="bg-primary/5 dark:bg-primary/10 p-8 rounded-xl border border-primary/10 dark:border-primary/20 h-full relative overflow-hidden"
                id="voice"
              >
                <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                  <svg
                    fill="none"
                    height="100"
                    viewBox="0 0 200 100"
                    width="200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 50C40 50 40 20 80 20C120 20 120 80 160 80C200 80 200 50 240 50"
                      stroke="#136dec"
                      strokeWidth="4"
                    />
                  </svg>
                </div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    graphic_eq
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Voice &amp; Practice Data
                  </h2>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    Your voice recordings are used solely for generating automated
                    feedback.
                  </p>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                      Our Promise:
                    </h4>
                    <ul className="space-y-2">
                      <li className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        Practice sessions are private.
                      </li>
                      <li className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        Recordings are never shared publicly.
                      </li>
                      <li className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        We do not use your voice for third-party advertising.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-12 mb-16" id="sharing">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                    Data Sharing
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-300">
                  We value your trust. We do not sell your personal data. We may
                  share data with trusted service providers who assist us in
                  operating our website, conducting our business, or serving our
                  users (such as cloud hosting and payment processing). These parties
                  agree to keep this information confidential. We may also release
                  information when its release is appropriate to comply with the law,
                  enforce our site policies, or protect ours or others' rights,
                  property or safety.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-3">
                    <span className="material-symbols-outlined text-slate-400">
                      schedule
                    </span>
                    Data Retention
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    We keep your personal information only as long as we need it for
                    legitimate business purposes and as permitted by applicable law.
                    You can request deletion of your account at any time. Please note
                    that we may retain certain information for recordkeeping purposes
                    or to complete any transactions that you began prior to requesting
                    a change or deletion.
                  </p>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-3">
                    <span className="material-symbols-outlined text-slate-400">
                      gavel
                    </span>
                    Your Choices &amp; Rights
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    You have control over your information. Depending on where you
                    live, you may have rights to access, correct, or delete your
                    personal data. You can always choose to stop using the service or
                    delete your account through your profile settings.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 mb-16">
              <div className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Security
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    We implement reasonable security safeguards designed to protect
                    your data. While no internet transmission is 100% secure, we take
                    care to maintain the safety of your personal information using
                    standard encryption and access controls.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">cookie</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Cookies &amp; Analytics
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    We use cookies for basic functionality (like keeping you logged
                    in) and anonymous analytics to see how the site is used. We do
                    not use cookies to track you across unrelated websites. You can
                    control cookies through your browser settings.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="size-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">child_care</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Children’s Privacy
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    JobSpeak Pro is not intended for children under 13 (or other
                    applicable age of digital consent). We do not knowingly collect
                    personal data from children. If we become aware that we have
                    collected such data, we will take steps to delete it.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Changes to This Policy
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
                We may update this Privacy Policy from time to time. If we make
                material changes, we will notify you through the service or by other
                means so you can review the changes before they become effective.
                Your continued use of the service after any changes constitutes your
                acceptance of the new policy.
              </p>
            </section>

            <section
              className="bg-slate-900 dark:bg-black rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
              id="contact"
            >
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Still have questions?
                </h2>
                <p className="text-slate-300 mb-8 text-lg">
                  We're committed to being transparent. If you have any questions
                  about this policy or your data, please reach out.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    href="mailto:jobspeakpro@gmail.com"
                  >
                    <span className="material-symbols-outlined">mail</span>
                    jobspeakpro@gmail.com
                  </a>
                </div>
              </div>

              <div className="absolute top-4 left-4 opacity-20">
                <div className="grid grid-cols-4 gap-2">
                  <div className="size-1 rounded-full bg-white" />
                  <div className="size-1 rounded-full bg-white" />
                  <div className="size-1 rounded-full bg-white" />
                  <div className="size-1 rounded-full bg-white" />
                  <div className="size-1 rounded-full bg-white" />
                  <div className="size-1 rounded-full bg-white" />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </MarketingLayout>
  );
}
