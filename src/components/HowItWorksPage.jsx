// src/components/HowItWorksPage.jsx
import React from "react";
import MarketingLayout from "../layouts/MarketingLayout.jsx";

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <div className="w-full bg-white py-20 px-6 lg:px-40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How JobSpeak works
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get better at interviews in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                  mic
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Record Your Answer
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speak or type your interview answer. Our AI transcribes and processes your response instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                  auto_awesome
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Get AI Feedback
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive a rewritten version that's clearer, more professional, and easier to say out loud.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>
                  trending_up
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Practice & Improve
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Listen to the improved answer, practice speaking it, and track your progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

