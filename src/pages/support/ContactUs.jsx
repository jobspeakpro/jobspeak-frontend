import React, { useState } from "react";
import { Link } from "react-router-dom";
import { saveContactMessage } from "../../lib/storage.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    messagingAppType: '',
    messagingAppUsername: '',
    topic: '',
    message: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Save message to localStorage
    saveContactMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      messagingAppType: formData.messagingAppType || undefined,
      messagingAppUsername: formData.messagingAppUsername || undefined,
      topic: formData.topic,
      message: formData.message,
    });

    // Show toast
    setShowToast(true);
    setLoading(false);

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      messagingAppType: '',
      messagingAppUsername: '',
      topic: '',
      message: '',
    });

    // Auto-dismiss toast
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="font-display antialiased text-slate-900 dark:text-white bg-background-light dark:bg-background-dark">
      <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
        <UniversalHeader />
        <main className="flex-grow layout-container flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl flex flex-col gap-10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Need help? Send us a message.</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Contact us</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal mt-3">We usually respond within 24 hours.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 flex flex-col">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 md:p-8 flex-1">
                  <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">Full name</span>
                        <input
                          className="form-input w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 placeholder:text-slate-400"
                          placeholder="Jane Doe"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">Email</span>
                        <input
                          className="form-input w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 placeholder:text-slate-400"
                          placeholder="jane@example.com"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                          Phone number
                          <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">(Optional)</span>
                        </span>
                        <input
                          className="form-input w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 placeholder:text-slate-400"
                          placeholder="+1 (555) 000-0000"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                          Messaging App Type
                          <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">(Optional)</span>
                        </span>
                        <div className="relative">
                          <select
                            className="form-select w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 pr-10 appearance-none"
                            value={formData.messagingAppType}
                            onChange={(e) => setFormData({ ...formData, messagingAppType: e.target.value })}
                          >
                            <option disabled value="">Select app...</option>
                            <option value="line">Line</option>
                            <option value="wechat">WeChat</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                          Messaging App Username
                          <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">(Optional)</span>
                        </span>
                        <input
                          className="form-input w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 placeholder:text-slate-400"
                          placeholder="Your username"
                          type="text"
                          value={formData.messagingAppUsername}
                          onChange={(e) => setFormData({ ...formData, messagingAppUsername: e.target.value })}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-base font-medium text-slate-900 dark:text-slate-100">Topic</span>
                        <div className="relative">
                          <select
                            className="form-select w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 h-12 px-4 pr-10 appearance-none"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            required
                          >
                            <option disabled value="">Select a topic...</option>
                            <option value="billing">Billing &amp; Subscriptions</option>
                            <option value="technical">Technical Issue</option>
                            <option value="feedback">Feedback &amp; Suggestions</option>
                            <option value="partnership">Partnership</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 flex-1">
                      <span className="text-base font-medium text-slate-900 dark:text-slate-100">Message</span>
                      <textarea
                        className="form-textarea w-full rounded-xl border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ring-1 ring-slate-200 dark:ring-slate-700 min-h-[160px] p-4 placeholder:text-slate-400 resize-none"
                        placeholder="How can we help you today?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      ></textarea>
                    </label>
                    <div className="pt-2 flex flex-col gap-3">
                      <button
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold rounded-xl h-12 text-base transition-colors shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send message"}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        By submitting, you agree to be contacted about your request.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 md:p-8 h-full flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">support_agent</span>
                      Support
                    </h3>
                    <div className="bg-background-light dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-sm">mail</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Email</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">jobspeakpro@gmail.com</p>
                        </div>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-600 w-full"></div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Response time</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Within 24 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">receipt_long</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Billing Questions?</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Questions about upgrades or receipts? Choose <span className="font-bold text-primary">Billing</span> in the topic dropdown.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-auto">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">FAQ quick links</h3>
                    <div className="flex flex-col gap-2">
                      <Link to="/help#cancel" className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary">How do I cancel?</span>
                        <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </Link>
                      <Link to="/help#progress" className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary">Do I lose progress if I downgrade?</span>
                        <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </Link>
                      <Link to="/help#microphone" className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary">Microphone issues troubleshooting</span>
                        <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pb-8 border-t border-slate-200 dark:border-slate-800 pt-8">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-primary">lock</span>
                <span className="text-sm font-medium">Secure communication</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                <span className="text-sm font-medium">Support included</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <span className="text-sm font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Message saved</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">We'll get back to you soon!</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

