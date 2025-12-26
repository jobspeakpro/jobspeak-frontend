import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MyProgress() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101822]/90 backdrop-blur-sm px-6 py-3 lg:px-10">
          <div className="flex items-center gap-4 text-slate-900 dark:text-white">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_330)">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeak Pro</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <div className="flex items-center gap-9">
              <Link to="/dashboard" className="text-sm font-medium leading-normal text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/start" className="text-sm font-medium leading-normal text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Practice</Link>
              <span className="text-sm font-medium leading-normal text-slate-900 dark:text-white font-semibold">My Progress</span>
              <Link to="/profile" className="text-sm font-medium leading-normal text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Profile</Link>
            </div>
            <button onClick={() => navigate("/start")} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
              <span className="truncate">Practice Now</span>
            </button>
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700" data-alt="User profile avatar placeholder" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAj09sauR7qIqE7IhipqSmBrt6U0AqsGP2gRhJePeB16uacAqz89bdhvu-FUpqUzAoKNJSJ-Ry6vgFBRRTFk_OKBWS73i4oW4x9LaDNJpU7JJ6v6QP2YbFxbSv0KymIaSNi_RQL9h09jEgDxGph9iglzuIEGrS_3uiD0INP2qnY8lO6q2rkahkAY_S-hh4Fs1BP5GtxKtacsqdhQDnps60NVSYCumJMSfqrT46OAXo5TKykSd9Td1aeeWRgmpFKefgptaOVFCiIiFqJ")' }}>
            </div>
          </div>
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-slate-900 dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>
        <main className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
            <div className="layout-content-container flex flex-col max-w-[800px] flex-1 w-full gap-8">
              {/* Header Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-3xl">psychology_alt</span>
                  <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">My Progress</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">A simple view of your practice over time.</p>
              </div>
              {/* Overview Message */}
              <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary mt-1">info</span>
                <div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-normal leading-relaxed">
                    Progress looks different for everyone. This page is here to help you notice your practice habits, not to score your performance. There are no grades here, only your own journey.
                  </p>
                </div>
              </div>
              {/* Stats Cards */}
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">equalizer</span>
                  Activity Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Total Sessions</p>
                      <span className="material-symbols-outlined text-primary/60 text-xl">forum</span>
                    </div>
                    <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">12</p>
                  </div>
                  {/* Card 2 */}
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Days Practiced</p>
                      <span className="material-symbols-outlined text-primary/60 text-xl">calendar_month</span>
                    </div>
                    <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">8</p>
                  </div>
                  {/* Card 3 */}
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Current Streak</p>
                      <span className="material-symbols-outlined text-primary/60 text-xl">local_fire_department</span>
                    </div>
                    <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">3 <span className="text-base font-normal text-slate-500 dark:text-slate-400">days</span></p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal mt-4 px-1">
                  You've been practicing regularly. Consistency matters more than perfection.
                </p>
              </div>
              {/* Recent Practice List */}
              <div className="mt-4">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">history</span>
                    Recent Practice
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {/* List Item 1 */}
                  <div className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-primary/20">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-2 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">check</span>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium text-base">Tell me about yourself</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Interview Basics</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">Practiced</span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm">Oct 24</span>
                      </div>
                    </div>
                  </div>
                  {/* List Item 2 */}
                  <div className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-primary/20">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-2 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">check</span>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium text-base">Handling conflict at work</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Behavioral Questions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">Practiced</span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm">Oct 22</span>
                      </div>
                    </div>
                  </div>
                  {/* List Item 3 */}
                  <div className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-primary/20">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-2 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">check</span>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium text-base">Salary negotiation roleplay</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Advanced Scenarios</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">Practiced</span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm">Oct 20</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* NOTE: View older sessions route doesn't exist yet */}
                <button className="mt-4 w-full py-2 text-primary dark:text-blue-400 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                  View older sessions <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </div>
              {/* Reflective Prompt */}
              <div className="mt-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl p-8 text-center flex flex-col items-center gap-4 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <span className="material-symbols-outlined text-primary text-4xl mb-1">self_improvement</span>
                <div className="max-w-lg">
                  <h4 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">A Moment for Reflection</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-base italic">"If you'd like, take a moment to notice how speaking feels today compared to when you started. Is there a little more ease?"</p>
                </div>
              </div>
              {/* Primary CTA */}
              <div className="flex flex-col items-center justify-center py-6 gap-6">
                <button onClick={() => navigate("/start")} className="flex items-center gap-3 bg-primary hover:bg-blue-600 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <span className="material-symbols-outlined">mic</span>
                  Practice Again
                </button>
                <div className="h-px w-24 bg-slate-200 dark:bg-slate-700"></div>
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-md">
                  Progress is personal. The most important step is continuing to practice in a way that feels comfortable.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

