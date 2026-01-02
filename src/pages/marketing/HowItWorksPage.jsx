// src/pages/marketing/HowItWorksPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      {/* Keep ONLY inner content from Stitch (no header/footer/scripts/styles) */}
      <main className="flex-1 flex flex-col items-center py-10 px-6 md:px-10 lg:px-40 pb-20">
        <div className="flex flex-col max-w-[960px] w-full gap-16">
          <section className="text-center flex flex-col items-center gap-6">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-[#111418] text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                How JobSpeak Pro Works
              </h1>
              <p className="text-[#617289] text-xl font-normal leading-relaxed">
                A simple, private way to practice speaking confidently for
                interviews.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#dbe0e6] shadow-sm max-w-3xl w-full">
              <p className="text-[#111418] text-base md:text-lg font-normal leading-relaxed text-center">
                JobSpeak Pro is designed to help you practice speaking clearly and
                confidently, without pressure or judgment. You practice privately,
                at your own pace, and repeat as often as you need.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#111418] text-2xl md:text-3xl font-bold leading-tight">
                Your Practice Journey
              </h2>
              <p className="text-[#617289] text-base font-normal">
                Follow these four simple steps to build your confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">quiz</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#111418] text-lg font-bold leading-tight">
                    1. Choose a question
                  </h3>
                  <p className="text-[#617289] text-sm font-normal leading-relaxed">
                    Start with a real interview-style question. There is no timer
                    and no expectation to be perfect.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">mic</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#111418] text-lg font-bold leading-tight">
                    2. Speak your answer
                  </h3>
                  <p className="text-[#617289] text-sm font-normal leading-relaxed">
                    Record yourself speaking out loud, or type your answer if you
                    prefer. Listen back to get comfortable.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    reviews
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#111418] text-lg font-bold leading-tight">
                    3. Review feedback
                  </h3>
                  <p className="text-[#617289] text-sm font-normal leading-relaxed">
                    Get clear, structured feedback to help you sound more natural.
                    Adapt suggestions to match your own words.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    replay
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#111418] text-lg font-bold leading-tight">
                    4. Practice again
                  </h3>
                  <p className="text-[#617289] text-sm font-normal leading-relaxed">
                    Repeat as many times as you like. Confidence comes from
                    practice, not perfection.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6 rounded-2xl bg-[#f0fdf4] border border-green-100 p-8">
              <div className="flex items-center gap-3 border-b border-green-200 pb-4">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  check_circle
                </span>
                <h2 className="text-[#111418] text-xl font-bold">
                  JobSpeak Pro IS:
                </h2>
              </div>

              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl mt-0.5">
                    check
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      A private practice space
                    </span>
                    <span className="text-[#617289] text-sm">
                      Practice without fear of being overheard.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl mt-0.5">
                    check
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      Focused on speaking
                    </span>
                    <span className="text-[#617289] text-sm">
                      Not just writing. Get comfortable with your voice.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl mt-0.5">
                    check
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      Designed for interview prep
                    </span>
                    <span className="text-[#617289] text-sm">
                      Targeted questions for real scenarios.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl mt-0.5">
                    check
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      Supportive and judgment-free
                    </span>
                    <span className="text-[#617289] text-sm">
                      Mistakes are just part of the process.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl bg-white border border-[#dbe0e6] p-8">
              <div className="flex items-center gap-3 border-b border-[#f0f2f4] pb-4">
                <span className="material-symbols-outlined text-gray-400 text-3xl">
                  cancel
                </span>
                <h2 className="text-[#111418] text-xl font-bold">
                  JobSpeak Pro is NOT:
                </h2>
              </div>

              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">
                    close
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">A test</span>
                    <span className="text-[#617289] text-sm">
                      No grades, no scores to beat.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">
                    close
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      A public evaluation
                    </span>
                    <span className="text-[#617289] text-sm">
                      Your recordings are yours alone.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">
                    close
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111418]">
                      A guarantee of outcomes
                    </span>
                    <span className="text-[#617289] text-sm">
                      We help you prepare.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col items-center gap-8 py-4">
            <div className="text-center max-w-2xl">
              <h2 className="text-[#111418] text-2xl font-bold mb-2">
                Practice at your own pace
              </h2>
              <p className="text-[#617289]">
                Start for free and upgrade when you're ready for more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="flex flex-col gap-3 rounded-xl border border-[#dbe0e6] bg-white p-6">
                <h3 className="text-[#111418] text-lg font-bold">Free Practice</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#617289] text-sm">
                    <span className="material-symbols-outlined text-sm">
                      circle
                    </span>
                    Try speaking practice
                  </li>
                  <li className="flex items-center gap-2 text-[#617289] text-sm">
                    <span className="material-symbols-outlined text-sm">
                      circle
                    </span>
                    Limited daily usage
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="text-primary text-lg font-bold">JobSpeak Pro</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#111418] text-sm">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    Unlimited practice
                  </li>
                  <li className="flex items-center gap-2 text-[#111418] text-sm">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    No daily limits
                  </li>
                  <li className="flex items-center gap-2 text-[#111418] text-sm">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    Practice as much as you want
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center gap-10 py-8">
            <div className="w-full bg-[#f0f4f8] rounded-xl p-8 text-center flex flex-col items-center gap-3">
              <div className="size-12 bg-white rounded-full flex items-center justify-center text-primary mb-1 shadow-sm">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <h3 className="text-[#111418] text-lg font-bold">
                Your privacy comes first
              </h3>
              <p className="text-[#617289] max-w-lg">
                Everything you practice is private. JobSpeak Pro is built to
                support your learning, not judge or evaluate you.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                onClick={() => navigate("/start")}
                className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all"
              >
                Start Practicing
              </button>

              <Link
                className="text-[#617289] text-sm font-medium hover:text-primary transition-colors underline-offset-4 hover:underline"
                to="/pricing"
              >
                View Pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </MarketingLayout>
  );
}
