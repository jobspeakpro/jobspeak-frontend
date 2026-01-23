import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiClient } from "../../utils/apiClient.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function MyProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch progress data from backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await apiClient('/api/progress/summary');
        setProgressData(data);

        // DEBUG INSTRUMENTATION
        if (typeof window !== 'undefined') {
          if (!window.__JSP_DEBUG__) window.__JSP_DEBUG__ = {};
          window.__JSP_DEBUG__.progressSummary = {
            count: (data?.totalSessions || 0) + (data?.activityEvents?.length || 0),
            timestamp: Date.now()
          };
        }
      } catch (err) {
        console.error('Failed to fetch progress summary:', err);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch, apiClient handles auth/guest logic
    fetchProgress();
  }, [user]);

  const hasData = progressData && (
    progressData.totalSessions > 0 ||
    (Array.isArray(progressData.sessions) && progressData.sessions.length > 0) ||
    (Array.isArray(progressData.activityEvents) && progressData.activityEvents.length > 0)
  );

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 min-h-screen flex flex-col">
      <UniversalHeader />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">mic</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No sessions yet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start practicing to see your progress here.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
              >
                <span className="material-symbols-outlined">mic</span>
                Start Practicing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">equalizer</span>
                Activity Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Sessions */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Total Sessions</p>
                    <span className="material-symbols-outlined text-primary/60 text-xl">forum</span>
                  </div>
                  <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{progressData.totalSessions || 0}</p>
                </div>
                {/* Days Practiced */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Days Practiced</p>
                    <span className="material-symbols-outlined text-primary/60 text-xl">calendar_month</span>
                  </div>
                  <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{progressData.daysPracticed || 0}</p>
                </div>
                {/* Current Streak */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Current Streak</p>
                    <span className="material-symbols-outlined text-primary/60 text-xl">local_fire_department</span>
                  </div>
                  <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{progressData.currentStreak || 0} <span className="text-base font-normal text-slate-500 dark:text-slate-400">days</span></p>
                </div>
              </div>
              {progressData.totalSessions > 0 && (
                <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal mt-4 px-1">
                  You've been practicing regularly. Consistency matters more than perfection.
                </p>
              )}
            </div>

            {/* Recent Practice List */}
            {progressData?.sessions && Array.isArray(progressData.sessions) && progressData.sessions.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">history</span>
                    Recent Practice
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {progressData.sessions.map((session, index) => (
                    <div key={index} className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-primary/20">
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">check</span>
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium text-base">{session?.question || 'Practice session'}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{session?.category || 'General'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">Practiced</span>
                          <span className="text-slate-400 dark:text-slate-500 text-sm">{session?.date || 'Recent'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Events (if no sessions yet) */}
            {progressData?.activityEvents && Array.isArray(progressData.activityEvents) && progressData.activityEvents.length > 0 &&
              (!progressData.sessions || progressData.sessions.length === 0) && (
                <div className="mt-4">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">history</span>
                      Recent Activity
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined">info</span>
                      <p className="text-sm font-medium">You've started practicing! Complete a session to see detailed feedback here.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {progressData.activityEvents.map((event, index) => (
                        <div key={event.id || index} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
                          <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${event.activityType === 'practice'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {event.activityType === 'practice' ? 'mic' : 'video_call'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {event.activityType === 'practice'
                                ? 'Practiced (started)'
                                : `Mock interview started${event.context?.type ? ` (${event.context.type})` : ''}`
                              }
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </>
        )}

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
          <button onClick={() => navigate("/practice")} className="flex items-center gap-3 bg-primary hover:bg-blue-600 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
            <span className="material-symbols-outlined">mic</span>
            Practice Again
          </button>
          <div className="h-px w-24 bg-slate-200 dark:bg-slate-700"></div>
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-md">
            Progress is personal. The most important step is continuing to practice in a way that feels comfortable.
          </p>
        </div>
      </main>
    </div>
  );
}
