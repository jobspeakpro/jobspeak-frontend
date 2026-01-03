import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { usePro } from "../../contexts/ProContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { gaEvent } from "../../utils/ga.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProStatus } = usePro();
  const [toast, setToast] = useState(null); // 'success' | 'canceled' | null

  const hasTrackedStripeReturn = useRef(false);

  // Handle anchor scrolling for #pricing
  useEffect(() => {
    if (location.hash === "#pricing") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById("pricing");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.hash]);

  // Handle Stripe redirect params (success/canceled query params)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const canceled = params.get("canceled");

      if (success === "true") {
        setToast("success");
        // Immediately refresh Pro status
        if (refreshProStatus) {
          refreshProStatus();
        }

        // Fire GA event for successful upgrade (once per return)
        if (!hasTrackedStripeReturn.current) {
          try {
            // Read period and source from localStorage (stored before redirect)
            const period = localStorage.getItem("jobspeak_upgrade_period") || "unknown";
            const source = localStorage.getItem("jobspeak_upgrade_source") || "unknown";

            gaEvent("paywall_upgrade_success", {
              page: "landing",
              period: period,
              source: source,
            });

            // Clean up localStorage after tracking
            localStorage.removeItem("jobspeak_upgrade_period");
            localStorage.removeItem("jobspeak_upgrade_source");

            hasTrackedStripeReturn.current = true;
          } catch (err) {
            console.error("Error tracking upgrade success:", err);
          }
        }

        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else if (canceled === "true") {
        setToast("canceled");

        // Fire GA event for canceled upgrade (once per return)
        if (!hasTrackedStripeReturn.current) {
          try {
            // Read period and source from localStorage (stored before redirect)
            const period = localStorage.getItem("jobspeak_upgrade_period") || "unknown";
            const source = localStorage.getItem("jobspeak_upgrade_source") || "unknown";

            gaEvent("paywall_upgrade_cancel", {
              page: "landing",
              period: period,
              source: source,
            });

            // Clean up localStorage after tracking
            localStorage.removeItem("jobspeak_upgrade_period");
            localStorage.removeItem("jobspeak_upgrade_source");

            hasTrackedStripeReturn.current = true;
          } catch (err) {
            console.error("Error tracking upgrade cancel:", err);
          }
        }

        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    } catch (err) {
      console.error("URL param parse error", err);
    }
  }, [refreshProStatus]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="bg-background-light text-[#0d131b]">
      {/* Toast notifications */}
      {toast === "success" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Payment successful!</p>
              <p className="text-xs text-emerald-700">Your Pro subscription is now active.</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-emerald-600 hover:text-emerald-800"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
      {toast === "canceled" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Checkout canceled</p>
              <p className="text-xs text-amber-700">You can upgrade anytime from the pricing page.</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      <UniversalHeader />

      <main className="flex flex-col">
        <section className="relative overflow-hidden bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-6 max-w-2xl">
                <h1 className="font-display text-4xl font-black leading-[1.15] tracking-tight text-[#0d131b] sm:text-5xl lg:text-6xl">
                  Practice speaking confidently for job interviews.
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  JobSpeak Pro helps you practice real interview answers, hear how you sound, and improve calmly without pressure or judgment.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to="/interview"
                    className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-blue-600 shadow-sm shadow-blue-200"
                  >
                    Start Practicing
                  </Link>
                  <Link
                    to="/pricing"
                    className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-base font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl lg:order-last">
                <img
                  alt="Asian woman smiling confidently while sitting at her computer, preparing for an interview"
                  className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2nLAJG3nrf2bhFJ0cJzDGKdsp5QK-yRxIzr8B7ZxPKMgQn1cnHWiwjAH876U6ZCV0Z5RRo6zikdaLddj6o2pts1Spjgialn2-BppUf92k0I6pnP3OLEtr63uuNic39HXq5DG4ySe5OYmP18-eV70fttIgGQJN0ot2y3HKHqj7_nvj1iYTaASMY6RIln9lbG8qDqK0UWb2gkeSN9O7RiDwT5Pj-TVbU-P8YUeo5hOsLqyhMSJ78HtpBf4iJpTCL5vVk8B_xnOt6v7Y"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f0f4f8] py-12 border-y border-[#e7ecf3]">
          <div className="mx-auto max-w-[800px] px-4 text-center">
            <p className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed">
              "Interviews are stressful, even for qualified professionals. JobSpeak Pro gives you a private space to practice speaking out loud and feel more comfortable expressing yourself."
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0d131b] sm:text-4xl">How It Works</h2>
              <div className="mt-6">
                <Link to="/how-it-works" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                  Learn how it works <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d131b]">Choose a question</h3>
                  <p className="mt-2 text-slate-600">Practice with real interview-style questions designed for various roles.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">mic</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d131b]">Speak your answer</h3>
                  <p className="mt-2 text-slate-600">Record yourself or type your response. Go at your own pace.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">refresh</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d131b]">Improve and practice again</h3>
                  <p className="mt-2 text-slate-600">Get clear feedback and practice as many times as you like.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background-light">
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white p-8 md:p-12 shadow-sm border border-slate-200">
              <h2 className="mb-8 text-2xl font-bold text-[#0d131b] sm:text-3xl text-center">What Makes JobSpeak Different</h2>
              <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2 max-w-3xl mx-auto">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                  <span className="text-slate-700 font-medium">Focused on speaking, not just writing</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                  <span className="text-slate-700 font-medium">Designed for non-native English speakers</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                  <span className="text-slate-700 font-medium">Private and judgment-free</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                  <span className="text-slate-700 font-medium">Practice at your own pace</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                  <span className="text-slate-700 font-medium">Built for interviews, not general language study</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16 pb-8 bg-white">
          <div className="mx-auto max-w-[1000px] px-4 text-center">
            <h2 className="text-3xl font-bold text-[#0d131b] mb-4">Trusted by over 10,000 users</h2>
            <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg">
              Join a supportive community of non-native speakers practicing for their interviews without the pressure.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-10 md:gap-20">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <div className="text-left">
                  <div className="text-5xl font-black text-[#0d131b] leading-none">10,000+</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Active Users</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <span className="material-symbols-outlined text-2xl">thumb_up</span>
                </div>
                <div className="text-left">
                  <div className="text-4xl font-black text-[#0d131b] leading-none">Positive</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Community Feedback</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <span className="material-symbols-outlined text-2xl">public</span>
                </div>
                <div className="text-left">
                  <div className="text-5xl font-black text-[#0d131b] leading-none">50+</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4 pb-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-[1000px] px-4 text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8">Trusted by employees from leading companies</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 group cursor-default">
                <div className="size-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <span className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors">TechCorp</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <div className="size-8 rounded bg-green-100 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">finance_chip</span>
                </div>
                <span className="text-xl font-bold text-slate-700 group-hover:text-green-600 transition-colors">FinGroup</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <div className="size-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <span className="text-xl font-bold text-slate-700 group-hover:text-purple-600 transition-colors">StartUp Inc</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <div className="size-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">cloud</span>
                </div>
                <span className="text-xl font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">CloudSys</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <div className="size-8 rounded bg-teal-100 text-teal-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <span className="text-xl font-bold text-slate-700 group-hover:text-teal-600 transition-colors">GlobalNet</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background-light py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-[#0d131b] sm:text-4xl">Find your comfort zone</h2>
              <p className="mt-4 text-lg text-slate-600">See how professionals are finding their voice in a safe, judgment-free environment.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-blue-100">
                <div className="h-64 w-full overflow-hidden relative">
                  <img
                    alt="Elena, a European woman, looking directly into the camera and smiling, ultra-realistic, wearing a beige blazer, distinct modern office background with city view, cropped to show full head with 5 inches of headroom down to chest"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7lskewm6NbOjOxmknsbaXgpI58sXhG_Sf7NU5jsuxdUg1jPIO63QRRCZNvBS2T3lJeRMH8svW5A_0rnzMdt4YqnGONeXBFtD7j2mex2Zc1f3P7Hzi8sa8SwMVDSOplWVzYuR4BwyyRH9jY2R1stxy6IyCeXGqafbcvsNsGKBZ2tufeDVc9c4PxWxXCN4MCTJgTRT7Se6XD-h58tUy_trWW_0cfxWneV2qb0EMGfdIKa71cfxBb4yZHi1kiAKpb2tJ-voisLUAvoJc"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-primary">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calmness</span>
                  </div>
                  <blockquote className="flex-1 text-lg font-medium text-[#0d131b] leading-relaxed">
                    "Practicing out loud helped me feel more comfortable answering questions. I could stumble and try again without anyone watching."
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3 border-t border-slate-50 pt-4">
                    <div>
                      <div className="font-bold text-[#0d131b]">Elena</div>
                      <div className="text-sm text-slate-500">Software Engineer</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-green-100">
                <div className="h-64 w-full overflow-hidden relative">
                  <img
                    alt="Marco, an Indian man, looking directly into the camera and smiling, ultra-realistic, wearing a navy blue button-down shirt, distinct professional office background with bookshelves and more distinct and visible, yet still subtly blurred, figures of people working in the background to create a more dynamic and realistic office environment, cropped to show full head with 5 inches of headroom down to chest"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwPBUoByYVx9j4pAU_q_SxWhsXtcHxAjOFUo5W36awl4zQOjqkAbe7M_qY_-yyn0PvX4zPwGMdn0NHKoAfnl4Qp60Hmg2TJNXFCdXmuAhlJrL8FhfLWD-rkhr50XyFwj8BUkN47691X3h_MC0B97E4gvsbC2l3O3C1D2zcnuc1DjR9vDHgVY-S9OU5A0pE31rldcng0_0dgoCIjSaK5dON36Hl2oM9TZbl7eHjNYP0Iqt7HKHVLvvqwi2tzmQA1JgmNi1IhmJOmxxp"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <span className="material-symbols-outlined text-sm">lock</span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Privacy</span>
                  </div>
                  <blockquote className="flex-1 text-lg font-medium text-[#0d131b] leading-relaxed">
                    "I liked having a quiet space to practice without feeling judged. It felt safe to make mistakes and learn from them."
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3 border-t border-slate-50 pt-4">
                    <div>
                      <div className="font-bold text-[#0d131b]">Marco</div>
                      <div className="text-sm text-slate-500">Product Manager</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-blue-100">
                <div className="h-64 w-full overflow-hidden relative">
                  <img
                    alt="Sarah, an Asian woman, looking directly into the camera and smiling, ultra-realistic, wearing a green blouse, distinct creative office background with soft lighting, cropped to show full head with 5 inches of headroom down to chest"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs2Owiuo42LvfNUG3jBUt6OmRTZD2gXkDySawLFf9M_-hWgPjWay1DNUkkhuyZbwngMhY1rGKmwR7CbWlMD5B1cLQqkn_sCGqt7mMnj3Vnk84lFx3qgCOraxeWRFPhpD3UjB8AooqaQEvFPFPfCOInoyA2iF6nc0bQussmpJgGfX8vcGJUuG_EcifAz5SLsCeyafHDcx-ll8RqKIvsdS28KMHq9qexlxBtW-hTreIqnAF--F9jmjYl9GIGmKADQ_6mQ7_q93WqbPKs"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-primary">
                      <span className="material-symbols-outlined text-sm">headphones</span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comfort</span>
                  </div>
                  <blockquote className="flex-1 text-lg font-medium text-[#0d131b] leading-relaxed">
                    "This made it easier to hear how I sound when I speak. Being able to listen back gave me so much clarity."
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3 border-t border-slate-50 pt-4">
                    <div>
                      <div className="font-bold text-[#0d131b]">Sarah</div>
                      <div className="text-sm text-slate-500">Marketing Specialist</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="pricing">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-primary">
                Simple Options
              </div>
              <h2 className="text-3xl font-bold text-[#0d131b]">Start for free. Upgrade anytime.</h2>
              <p className="max-w-xl text-slate-600 text-lg">
                You can start practicing for free to see if it's right for you. Upgrade anytime for unlimited practice sessions and advanced feedback.
              </p>
              <Link
                to="/pricing"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-8 text-base font-bold text-[#0d131b] shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background-light py-20 border-t border-slate-200">
          <div className="mx-auto max-w-[800px] px-4 text-center">
            <div className="mb-8 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[32px]">lock</span>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Your practice sessions are private. JobSpeak Pro is built to support your learning, not judge or evaluate you.
              </p>
            </div>
            <div className="mt-12">
              <Link
                to="/interview"
                className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-transform hover:scale-105"
              >
                Start Practicing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[#e7ecf3] pt-12 pb-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              </div>
              <span className="text-base font-bold text-[#0d131b]">JobSpeak Pro</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-8">
              <Link to="/how-it-works" className="text-sm text-slate-600 hover:text-primary">
                How It Works
              </Link>
              <Link to="/pricing" className="text-sm text-slate-600 hover:text-primary">
                Pricing
              </Link>
              <Link to="/support" className="text-sm text-slate-600 hover:text-primary">
                Support
              </Link>
              <Link to="/privacy" className="text-sm text-slate-600 hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-slate-600 hover:text-primary">
                Terms of Service
              </Link>
            </nav>
          </div>
          <div className="border-t border-slate-100 pt-8 text-center md:text-left">
            <p className="text-xs text-slate-400">© 2023 JobSpeak Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

