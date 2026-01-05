
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ReferralSurveyModal({ onComplete }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const OPTIONS = [
        "TikTok",
        "Instagram",
        "YouTube",
        "Discord",
        "Twitter / X",
        "Facebook",
        "LinkedIn",
        "Google/Search",
        "Friend/Referral",
        "Other"
    ];

    const handleSelect = async (source) => {
        if (loading) return;
        setLoading(true);

        try {
            if (user) {
                // Logged-in user: Save to database
                const { error } = await supabase
                    .from('profiles')
                    .update({ heard_about_us: source })
                    .eq('id', user.id);

                if (error) {
                    console.warn("[ReferralSurvey] DB update failed (non-blocking):", error);
                } else {
                    console.log("[ReferralSurvey] Saved to DB:", source);
                }
            } else {
                // Guest user: Save to localStorage
                localStorage.setItem("jsp_heard_about_value", source);
                localStorage.setItem("jsp_heard_about_answered", "true");
                console.log("[ReferralSurvey] Saved to localStorage (guest):", source);
            }
        } catch (e) {
            console.warn("[ReferralSurvey] Error:", e);
            // Fallback: Still save to localStorage even on error
            if (!user) {
                localStorage.setItem("jsp_heard_about_value", source);
                localStorage.setItem("jsp_heard_about_answered", "true");
            }
        } finally {
            // ALWAYS close and trigger completion logic
            onComplete();
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1A222C] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-6">
                        Quick question — how did you hear about us?
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                disabled={loading}
                                className="px-3 py-3 text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleSelect("skipped")}
                        disabled={loading}
                        className="w-full mt-6 py-3 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
}
