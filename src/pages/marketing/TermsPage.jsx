// src/pages/marketing/TermsPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function TermsPage() {
  return (
    <>
      <UniversalHeader />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 relative">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 pl-3">
                  Contents
                </h3>
                <nav className="space-y-1">
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#acceptance"
                  >
                    Acceptance of Terms
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#service"
                  >
                    Description of Service
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#eligibility"
                  >
                    Eligibility
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#responsibilities"
                  >
                    User Responsibilities
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#accounts"
                  >
                    Accounts &amp; Access
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#payments"
                  >
                    Payments
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#privacy"
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#disclaimer"
                  >
                    Disclaimers
                  </a>
                  <a
                    className="group flex items-center border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    href="#contact"
                  >
                    Contact Us
                  </a>
                </nav>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Have questions?
                </p>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Our support team is available to clarify any points regarding our terms.
                </p>
                <Link
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                  to="/support"
                >
                  Contact Support{" "}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="lg:col-span-9 max-w-3xl">
            <div className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary mb-6">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Legal
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
                Terms of Service
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed mb-4">
                These terms explain how JobSpeak Pro works and how you can use the service responsibly. We believe in transparency and plain English.
              </p>

              <p className="text-sm font-medium text-slate-400">Last Updated: October 24, 2023</p>
            </div>

            <div className="space-y-16">
              <section className="scroll-mt-28" id="acceptance">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  By accessing or using JobSpeak Pro, you agree to these Terms of Service. If you do not agree with any part of these terms, please do not access or use our services. Your continued use of the platform signifies your acceptance of these terms and any future modifications.
                </p>
              </section>

              <section className="scroll-mt-28" id="service">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  2. Description of the Service
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-4">
                  JobSpeak Pro provides AI-driven tools and interactive scenarios to help users practice speaking confidently in English, specifically tailored for job interview preparation.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border-l-4 border-primary">
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                    <span className="font-bold text-primary block mb-1">Please Note:</span>
                    While we aim to improve your communication skills, the service offers practice and feedback only. It does not guarantee interview results, job offers, or any specific employment outcomes.
                  </p>
                </div>
              </section>

              <section className="scroll-mt-28" id="eligibility">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  3. Eligibility
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  You must be at least 13 years old (or the applicable minimum age in your jurisdiction) to create an account and use JobSpeak Pro. By creating an account, you represent and warrant that you meet this age requirement and that you are responsible for complying with all local laws regarding online conduct and acceptable content.
                </p>
              </section>

              <section className="scroll-mt-28" id="responsibilities">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  4. User Responsibilities
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-6">
                  We want JobSpeak Pro to be a safe and productive environment for everyone. By using our service, you agree to the following commitments:
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      title: "Use for lawful purposes only.",
                      body: "You will not use the service for any illegal activities or to promote illegal acts.",
                    },
                    {
                      title: "Provide accurate information.",
                      body: "You agree to provide current and accurate information when registering and to keep your account information updated.",
                    },
                    {
                      title: "Respect the platform.",
                      body: "You will avoid misuse, abuse, or attempts to disrupt the service, including introducing viruses or harmful code.",
                    },
                    {
                      title: "Content safety.",
                      body: "You will not upload or share content that is harmful, threatening, abusive, defamatory, or offensive.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="flex-none rounded-full bg-emerald-500/10 p-1 text-emerald-600">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        <strong>{item.title}</strong> {item.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="scroll-mt-28" id="accounts">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  5. Accounts &amp; Access
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-4">
                  Access to JobSpeak Pro may include free tiers and paid subscription plans. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  While we aim to keep the service available at all times, access may be limited, suspended, or terminated if we detect serious violations of these terms. We enforce this to ensure the security and integrity of the platform for all users.
                </p>
              </section>

              <section className="scroll-mt-28" id="payments">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  6. Payments &amp; Subscriptions
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary">payments</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">Pricing &amp; Renewal</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pricing is clearly shown before purchase. Subscriptions may renew automatically at the end of each billing cycle unless canceled prior to the renewal date.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary">cancel</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">Cancellation &amp; Refunds</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      You can cancel your subscription at any time through your account settings. Refunds are generally not provided for partial periods unless required by applicable law.
                    </p>
                  </div>
                </div>
              </section>

              <section className="scroll-mt-28" id="ip">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  7. Intellectual Property
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-4">
                  <strong>Platform Ownership:</strong> JobSpeak Pro owns all rights, title, and interest in the platform, including its software, design, trademarks, and content provided by us.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  <strong>Your Content:</strong> You retain ownership of any content (such as audio recordings or text inputs) you submit. However, by using the service, you grant JobSpeak Pro a limited, non-exclusive permission to process, analyze, and store your content solely for the purpose of providing and improving the service to you.
                </p>
              </section>

              <section className="scroll-mt-28" id="privacy">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  8. Privacy
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  Your privacy is important to us. All personal data and user content are handled in strict accordance with our Privacy Policy. We encourage you to review it to understand how your data is collected, used, and protected.
                </p>
                <div className="mt-4">
                  <Link className="inline-flex items-center text-primary font-semibold hover:underline" to="/privacy">
                    Read our Privacy Policy
                    <span className="material-symbols-outlined text-sm ml-1">open_in_new</span>
                  </Link>
                </div>
              </section>

              <section className="scroll-mt-28" id="disclaimer">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  9. Disclaimers &amp; Limitation of Liability
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-4">
                  <strong>Practice Tool Only:</strong> JobSpeak Pro is an educational practice tool. The feedback provided is for informational purposes only and should not be considered professional, legal, or career advice.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  <strong>Liability:</strong> To the maximum extent permitted by law, JobSpeak Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. Our liability is limited to the amount you paid us to use the service in the last 12 months, or as otherwise mandated by local laws.
                </p>
              </section>

              <section className="scroll-mt-28" id="termination">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  10. Termination
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                  You may stop using the service at any time. Similarly, JobSpeak Pro reserves the right to suspend or terminate your access to the service if you are found to be in serious or repeated violation of these terms. This measure helps us protect the integrity of the service and the safety of our user community.
                </p>
              </section>

              <section className="scroll-mt-28 grid md:grid-cols-2 gap-8" id="misc">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">11. Changes to These Terms</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    We may update these terms occasionally to reflect changes in our service or relevant laws. We will notify you of any material changes via email or a prominent notice on the platform. Continued use of the service after such changes constitutes acceptance of the updated terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">12. Governing Law</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    These terms shall be governed by and construed in accordance with the laws of [Jurisdiction/State], without regard to its conflict of law provisions. Any disputes arising from these terms will be handled in the competent courts of that jurisdiction.
                  </p>
                </div>
              </section>

              <section className="scroll-mt-28 pt-8 border-t border-slate-200 dark:border-slate-800" id="contact">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-6">
                  If you have any questions about these Terms of Service, please do not hesitate to contact our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 transition-colors"
                    href="mailto:jobspeakpro@gmail.com"
                  >
                    jobspeakpro@gmail.com
                  </a>
                  <Link
                    className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                    to="/support"
                  >
                    Visit Help Center
                  </Link>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
