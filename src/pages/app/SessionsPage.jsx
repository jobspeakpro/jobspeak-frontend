import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import AvatarDropdown from "../../components/AvatarDropdown.jsx";
import { getActivity, formatRelativeTime } from "../../utils/activityStorage.js";

export default function SessionsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activity, setActivity] = useState([]);

    // Load activity on mount
    useEffect(() => {
        const loadedActivity = getActivity();
        setActivity(loadedActivity);
    }, []);

    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : "User");

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A222C] border-b border-[#f0f2f4] dark:border-gray-800">
                <div className="px-4 sm:px-10 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4 text-[#111418] dark:text-white hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">graphic_eq</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeak Pro</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-8 items-center">
                        <nav className="hidden md:flex items-center gap-9">
                            <Link to="/dashboard" className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</Link>
                            <Link to="/start" className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Practice</Link>
                            <Link to="/sessions" className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal text-primary">Sessions</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/start")} className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                <span className="truncate">Start Practice</span>
                            </button>
                            <AvatarDropdown />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#111418] dark:text-white mb-2">Past Sessions</h1>
                    <p className="text-[#617289] dark:text-gray-400 text-base">
                        Review your practice history and track your improvement over time.
                    </p>
                </div>

                {activity.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center gap-6 text-center py-16 bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
                        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <span className="material-symbols-outlined text-4xl">history</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#111418] dark:text-white mb-2">No sessions yet</h2>
                            <p className="text-[#617289] dark:text-gray-400 text-base max-w-md mx-auto">
                                Your practice history will appear here after you complete your first session.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/practice")}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">mic</span>
                            Start Your First Practice
                        </button>
                    </div>
                ) : (
                    // Sessions List
                    <div className="bg-white dark:bg-[#1A222C] border border-[#dbe0e6] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        {activity.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background-light dark:hover:bg-gray-800/50 transition-all duration-200 ${index < activity.length - 1 ? 'border-b border-[#f0f2f4] dark:border-gray-700' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        <span className="material-symbols-outlined text-2xl">record_voice_over</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[#111418] dark:text-white font-bold text-base">
                                            {item.questionText || 'Practice Session'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[#617289] dark:text-gray-400 text-sm">
                                                {formatRelativeTime(item.createdAt)}
                                            </p>
                                            {item.role && (
                                                <>
                                                    <span className="text-[#617289] dark:text-gray-400">•</span>
                                                    <span className="text-[#617289] dark:text-gray-400 text-sm">{item.role}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {item.duration && (
                                        <div className="flex items-center gap-2 text-[#617289] dark:text-gray-400">
                                            <span className="material-symbols-outlined text-lg">schedule</span>
                                            <span className="text-sm font-medium">{item.duration} min</span>
                                        </div>
                                    )}
                                    <div className="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                                        Completed
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
