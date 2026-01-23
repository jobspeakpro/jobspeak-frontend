import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MockInterviewPaywallCard from "../../components/MockInterviewPaywallCard.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { apiClient } from "../../utils/apiClient.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";
import MicAudioTest from "../../components/MicAudioTest.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Mock interview limit status
  const [mockLimitStatus, setMockLimitStatus] = useState(null);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Generate display name - use display_name from profile
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';

  // Fetch daily reflection from backend
  const [dailyReflection, setDailyReflection] = useState("Practice makes progress. Every session builds your confidence.");

  useEffect(() => {
    const fetchDailyReflection = async () => {
      try {
        const data = await apiClient('/api/daily-reflection');
        if (data.reflection) {
          setDailyReflection(data.reflection);
        }
      } catch (err) {
        console.error('Failed to fetch daily reflection:', err);
        // Keep default reflection on error
      }
    };

    fetchDailyReflection();
  }, []);

  // Fetch progress data from backend
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await apiClient('/api/progress');
        setProgress(data);

        // DEBUG INSTRUMENTATION
        if (typeof window !== 'undefined') {
          if (!window.__JSP_DEBUG__) window.__JSP_DEBUG__ = {};
          window.__JSP_DEBUG__.dashboardSummary = {
            count: data?.recentActivity?.length || 0,
            timestamp: Date.now()
          };
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setProgressLoading(false);
      }
    };

    // Always fetch, apiClient handles auth/guest logic
    fetchProgress();
  }, [user]);

  const recentSessions = progress?.recentSessions || [];

  // Check mock interview limit status on mount
  useEffect(() => {
    const checkMockLimit = async () => {
      try {
        const data = await apiClient('/api/mock-interview/limit-status');
        setMockLimitStatus(data);
      } catch (err) {
        console.error('[MOCK] Limit check failed:', err);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkMockLimit();
  }, []);

  const handleStartMockInterview = () => {
    if (!mockLimitStatus) return;

    // Guest user - force signup
    if (mockLimitStatus.isGuest) {
      navigate('/signup');
      return;
    }

    // Blocked - show message (handled in UI)
    if (mockLimitStatus.blocked || !mockLimitStatus.canStartMock) {
      // UI already shows the block message, just prevent navigation
      return;
    }

    // Allowed - proceed
    navigate('/mock-interview/session?type=short');
  };

  // Format next allowed date
  const formatNextAllowedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
      {/* Use new shared header */}
      <UniversalHeader />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#1A222C] p-6 sm:p-8 rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex flex-col gap-2 max-w-lg">
            {profileLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white">
                  Welcome back, {displayName}
                </h1>
                <p className="text-[#617289] dark:text-gray-400 text-base font-normal leading-normal">
                  Ready to find your voice today? Consistent practice builds confidence. You're doing great.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => navigate("/practice")} className="flex-1 md:flex-none min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold shadow-md hover:shadow-lg flex">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span className="truncate">Start New Practice</span>
            </button>
            <button onClick={() => navigate("/progress")} className="flex-1 md:flex-none min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white dark:bg-gray-700 border border-[#dbe0e6] dark:border-gray-600 hover:bg-[#f0f2f4] dark:hover:bg-gray-600 text-[#111418] dark:text-white text-sm font-bold transition-colors flex">
              <span className="material-symbols-outlined text-[20px]">history</span>
              <span className="truncate">Review Past Sessions</span>
            </button>
          </div>
        </section>

        {/* Recent Activity or Empty State */}
        {recentSessions.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#111418] dark:text-white">Recent Activity</h2>
              <button
                onClick={() => navigate("/progress")}
                className="text-primary hover:underline text-sm font-medium"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => navigate(session.type === 'practice' ? `/practice/summary/${session.sessionId || session.id}` : `/mock-interview/summary/${session.sessionId || session.id}`)}
                  className={`bg-white dark:bg-[#1A222C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${session.type === 'practice'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                      <span className="material-symbols-outlined">
                        {session.type === 'practice' ? 'mic' : 'video_call'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {session.type === 'practice' ? 'Practice Session' : (session.type === 'mock_short' ? 'Short Mock Interview' : 'Full Mock Interview')}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    {session.score && (
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold">Score</p>
                        <p className={`text-lg font-bold ${session.score >= 80 ? 'text-green-600' : (session.score >= 60 ? 'text-blue-600' : 'text-amber-600')}`}>
                          {session.score}
                        </p>
                      </div>
                    )}

                    {(session.topStrength || session.topWeakness) && (
                      <div className="hidden md:block text-right max-w-[200px]">
                        {session.topStrength && (
                          <div className="text-xs text-green-600 truncate flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                            {session.topStrength}
                          </div>
                        )}
                        {session.topWeakness && (
                          <div className="text-xs text-amber-600 truncate flex items-center gap-1 justify-end mt-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            {session.topWeakness}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : progress?.recentActivity && Array.isArray(progress.recentActivity) && progress.recentActivity.length > 0 ? (
          /* Show Recent Activity if no sessions but activity exists */
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#111418] dark:text-white">Recent Activity</h2>
              <button
                onClick={() => navigate("/progress")}
                className="text-primary hover:underline text-sm font-medium"
              >
                View all
              </button>
            </div>

            <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">info</span>
                <p className="text-sm font-medium">You've started practicing! Complete a session to see detailed feedback here.</p>
              </div>

              <div className="flex flex-col gap-3">
                {progress.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${activity.activityType === 'practice'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {activity.activityType === 'practice' ? 'mic' : 'video_call'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {activity.activityType === 'practice'
                          ? 'Practiced'
                          : `Mock interview started${activity.context?.type ? ` (${activity.context.type})` : ''}`
                        }
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString(undefined, {
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
          </section>
        ) : (
          /* Empty State */
          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">mic</span>
              </div>
              <h2 className="text-2xl font-bold text-[#111418] dark:text-white mb-2">
                No interview data yet
              </h2>
              <p className="text-[#617289] dark:text-gray-400 mb-6">
                Start your first practice or mock interview to see your progress here.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
              >
                <span className="material-symbols-outlined">mic</span>
                Start Practicing
              </button>
            </div>
          </section>
        )}

        {/* Mic & Audio Test */}
        <MicAudioTest />

        {/* Mock Interview Card - Unified Component */}
        <MockInterviewPaywallCard />

        {/* Moment of Reflection - Dynamic from backend */}
        <section className="bg-gradient-to-br from-teal-50 to-white dark:from-[#1A222C] dark:to-[#1A222C] p-6 rounded-xl border border-teal-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-3">
            <span className="material-symbols-outlined">lightbulb</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">Moment of Reflection</h3>
          </div>
          <p className="text-[#111418] dark:text-white text-base font-medium italic">
            "{dailyReflection}"
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#1A222C] py-8">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#617289] dark:text-gray-500 text-sm">© 2024 JobSpeak Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="#">Help Center</a>
            <a className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="/privacy">Privacy Policy</a>
            <a className="text-[#617289] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
