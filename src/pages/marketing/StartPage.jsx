// src/pages/marketing/StartPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 md:px-0">
        <div className="w-full max-w-[640px] flex flex-col gap-10">
          {/* Page Header */}
          <div className="text-center space-y-4 px-4">
            <h1 className="text-[#111418] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
              Start Your Practice
            </h1>
            <p className="text-[#617289] dark:text-gray-400 text-lg md:text-xl font-normal leading-normal max-w-lg mx-auto">
              A calm, private way to practice speaking for interviews.
            </p>
          </div>
          {/* Core Content Card */}
          <div className="bg-white dark:bg-[#1a2634] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 p-8 md:p-10 mx-4 md:mx-0">
            {/* What to Expect */}
            <div className="mb-10">
              <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight mb-6">What to Expect</h3>
              <ul className="flex flex-col gap-5">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>check_circle</span>
                  </div>
                  <span className="text-[#111418] dark:text-gray-200 text-base font-normal">Choose a real interview-style question</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>check_circle</span>
                  </div>
                  <span className="text-[#111418] dark:text-gray-200 text-base font-normal">Speak your answer out loud or type it</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>check_circle</span>
                  </div>
                  <span className="text-[#111418] dark:text-gray-200 text-base font-normal">Listen back and review helpful feedback</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>check_circle</span>
                  </div>
                  <span className="text-[#111418] dark:text-gray-200 text-base font-normal">Practice again at your own pace</span>
                </li>
              </ul>
            </div>
            {/* Reassurance / Comfort Block */}
            <div className="border-t border-[#f0f2f4] dark:border-gray-700 pt-8">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800/30">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: "20px" }}>lock</span>
                  <span className="text-green-800 dark:text-green-300 text-sm font-medium">Private</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800/30">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: "20px" }}>volunteer_activism</span>
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">Judgment-free</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-800/30">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: "20px" }}>hourglass_disabled</span>
                  <span className="text-purple-800 dark:text-purple-300 text-sm font-medium">At your own pace</span>
                </div>
              </div>
              <p className="text-center text-[#617289] dark:text-gray-400 text-base">
                There is no timer and no pressure to be perfect. You can stop or repeat anytime.
              </p>
            </div>
          </div>
          {/* First-Time Guidance */}
          <div className="text-center max-w-md mx-auto px-4">
            <p className="text-[#617289] dark:text-gray-400 text-base leading-relaxed italic">
              "Many people feel nervous speaking out loud at first. That is normal. Confidence comes from practice, not perfection."
            </p>
          </div>
          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-6 pb-12">
            <button 
              onClick={() => navigate("/practice")}
              className="bg-primary hover:bg-primary/90 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-500/30 outline-none"
            >
              Start Practicing
            </button>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[#617289] dark:text-gray-500 text-sm">
                You can explore pricing later if you choose.
              </p>
              <Link 
                to="/pricing"
                className="text-primary dark:text-blue-400 text-sm font-medium hover:underline"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

