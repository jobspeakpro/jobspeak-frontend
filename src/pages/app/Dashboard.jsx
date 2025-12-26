import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A222C] border-b border-[#f0f2f4] dark:border-gray-800">
        <div className="px-4 sm:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[#111418] dark:text-white">
            <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">graphic_eq</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeak Pro</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="hidden md:flex items-center gap-9">
              <Link to="/" className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Home</Link>
              <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal text-primary">Dashboard</span>
              {/* NOTE: Settings route doesn't exist, using /profile as fallback */}
              <Link to="/profile" className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Settings</Link>
            </nav>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/start")} className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Start Practice</span>
              </button>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white shadow-sm cursor-pointer" data-alt="User profile picture showing a smiling professional" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCj3D5OlSxZY2a4hiDG5iYy_J9rtUEDyJbJbHFl_r9FQ-yxe0BMyneSSA7_Gew2Sq52WCdfeDt8desZOG948LWdaKS8UFjI3WLSa9WU8pm_TJz8lbVm86eDUzDz6LC0BDwlfunq4_oJpOh9IIRtiTcZeVEF82CXljaZ4QKauTFkxFQUS5VMRPeo6cfLFrGQCqelKpCBt1k6Y461YuNogw6BNpdT0OG9LaT2bAyGNiaz5s5vNWZsgRSA_Hb2DojjKeFpCRl1aCfQtzM1")' }}>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#1A222C] p-6 sm:p-8 rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex flex-col gap-2 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white">
              Welcome back, Alex
            </h1>
            <p className="text-[#617289] dark:text-gray-400 text-base font-normal leading-normal">
              Ready to find your voice today? Consistent practice builds confidence. You're doing great.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => navigate("/start")} className="flex-1 md:flex-none min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold shadow-md hover:shadow-lg flex">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span className="truncate">Start New Practice</span>
            </button>
            {/* NOTE: Review Past Sessions route doesn't exist yet */}
            <button className="flex-1 md:flex-none min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white dark:bg-gray-700 border border-[#dbe0e6] dark:border-gray-600 hover:bg-[#f0f2f4] dark:hover:bg-gray-600 text-[#111418] dark:text-white text-sm font-bold transition-colors flex">
              <span className="material-symbols-outlined text-[20px]">history</span>
              <span className="truncate">Review Past Sessions</span>
            </button>
          </div>
        </section>
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-[#1A222C] border border-[#dbe0e6] dark:border-gray-800 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined">fact_check</span>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">+2 this week</span>
            </div>
            <div>
              <p className="text-[#617289] dark:text-gray-400 text-sm font-medium leading-normal">Total Sessions</p>
              <p className="text-[#111418] dark:text-white tracking-tight text-3xl font-bold leading-tight mt-1">12</p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-[#1A222C] border border-[#dbe0e6] dark:border-gray-800 shadow-sm hover:border-teal-500/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 transition-colors">
                <span className="material-symbols-outlined">timer</span>
              </div>
            </div>
            <div>
              <p className="text-[#617289] dark:text-gray-400 text-sm font-medium leading-normal">Practice Time</p>
              <p className="text-[#111418] dark:text-white tracking-tight text-3xl font-bold leading-tight mt-1">45m</p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-[#1A222C] border border-[#dbe0e6] dark:border-gray-800 shadow-sm hover:border-orange-500/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <span className="text-xs font-medium text-[#617289] dark:text-gray-400">Keep it up!</span>
            </div>
            <div>
              <p className="text-[#617289] dark:text-gray-400 text-sm font-medium leading-normal">Current Streak</p>
              <p className="text-[#111418] dark:text-white tracking-tight text-3xl font-bold leading-tight mt-1">3 Days</p>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Recent Activity</h3>
              <a className="text-primary text-sm font-medium hover:underline" href="#">View All</a>
            </div>
            <div className="bg-white dark:bg-[#1A222C] border border-[#dbe0e6] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              {/* Item 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#f0f2f4] dark:border-gray-700 hover:bg-background-light dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">record_voice_over</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#111418] dark:text-white font-semibold text-sm">Mock Interview: Behavioral</p>
                    <p className="text-[#617289] dark:text-gray-400 text-xs mt-0.5">Yesterday • 4:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-[#617289] dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="text-sm font-medium">15 min</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#f0f2f4] dark:border-gray-700 hover:bg-background-light dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <span className="material-symbols-outlined">speed</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#111418] dark:text-white font-semibold text-sm">Elevator Pitch Practice</p>
                    <p className="text-[#617289] dark:text-gray-400 text-xs mt-0.5">2 days ago • 10:15 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-[#617289] dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="text-sm font-medium">5 min</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-background-light dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#111418] dark:text-white font-semibold text-sm">Star Method Drill</p>
                    <p className="text-[#617289] dark:text-gray-400 text-xs mt-0.5">3 days ago • 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-[#617289] dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="text-sm font-medium">10 min</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column: Goals & Tips */}
          <div className="flex flex-col gap-6">
            {/* Goal Card */}
            <div className="flex flex-col gap-4 bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Weekly Goal</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-end">
                  <p className="text-[#111418] dark:text-white text-3xl font-bold leading-none">30<span className="text-base font-normal text-[#617289] dark:text-gray-400 ml-1">min</span></p>
                  <div className="text-right">
                    <p className="text-[#111418] dark:text-white text-sm font-bold">60%</p>
                    <p className="text-[#617289] dark:text-gray-400 text-xs">of 50 min goal</p>
                  </div>
                </div>
                <div className="h-3 w-full bg-[#f0f2f4] dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-[#617289] dark:text-gray-400 text-sm font-normal leading-normal mt-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  On track to reach your goal!
                </p>
              </div>
            </div>
            {/* Tip Card */}
            <div className="flex flex-col gap-4 bg-gradient-to-br from-teal-50 to-white dark:from-[#1A222C] dark:to-[#1A222C] p-6 rounded-xl border border-teal-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <span className="material-symbols-outlined">lightbulb</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Daily Tip</h3>
              </div>
              <p className="text-[#111418] dark:text-white text-base font-medium italic">
                "Pause before answering complex questions. A brief silence shows thoughtfulness and confidence."
              </p>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="mt-auto border-t border-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#1A222C] py-8">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#617289] dark:text-gray-500 text-sm">© 2024 JobSpeak Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="#">Help Center</a>
            <Link to="/privacy" className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

