// src/components/MockInterviewPaywallCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function MockInterviewPaywallCard() {
    const navigate = useNavigate();
    const [mockLimitStatus, setMockLimitStatus] = useState(null);
    const [checkingLimit, setCheckingLimit] = useState(true);
    const [showPaywallModal, setShowPaywallModal] = useState(false);

    // Check mock interview limit status on mount
    useEffect(() => {
        const checkMockLimit = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
                const { data } = await supabase.auth.getSession();
                const token = data?.session?.access_token;

                const response = await fetch(`${API_BASE}/api/mock-interview/limit-status`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (response.ok) {
                    const data = await response.json();
                    setMockLimitStatus(data);
                }
            } catch (err) {
                console.error('[MOCK] Limit check failed:', err);
            } finally {
                setCheckingLimit(false);
            }
        };

        checkMockLimit();
    }, []);

    // Format next allowed date
    const formatNextAllowedDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleCardClick = () => {
        if (!mockLimitStatus) return;

        // Guest user - redirect to signup
        if (mockLimitStatus.isGuest) {
            navigate('/signup');
            return;
        }

        // Blocked - show paywall modal
        if (mockLimitStatus.blocked || !mockLimitStatus.canStartMock) {
            setShowPaywallModal(true);
            return;
        }

        // Allowed - start mock interview
        navigate('/mock-interview/session?type=short');
    };

    const handleUpgrade = () => {
        navigate('/pricing');
    };

    return (
        <>
            {/* Mock Interview Card - Always Clickable */}
            <section
                onClick={handleCardClick}
                className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-[#1A222C] rounded-xl border border-purple-200 dark:border-purple-900/30 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="size-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">video_call</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready for a Mock Interview?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Practice builds skills. Mock interviews test readiness. Choose between a quick warmup or deep dive.
                        </p>

                        {/* Inline Blocked State Message */}
                        {!checkingLimit && mockLimitStatus?.blocked && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    {mockLimitStatus.resetInDays > 1
                                        ? `Next free mock in ${mockLimitStatus.resetInDays} days${mockLimitStatus.nextAllowedAt ? ` (${formatNextAllowedDate(mockLimitStatus.nextAllowedAt)})` : ''}`
                                        : mockLimitStatus.resetInDays === 1
                                            ? `Next free mock tomorrow${mockLimitStatus.nextAllowedAt ? ` (${formatNextAllowedDate(mockLimitStatus.nextAllowedAt)})` : ''}`
                                            : mockLimitStatus.resetInDays === 0
                                                ? 'Next free mock today'
                                                : 'Next free mock: check back later'}. Unlock unlimited with Pro.
                                </p>
                            </div>
                        )}

                        <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-md">
                            <span className="material-symbols-outlined">
                                {mockLimitStatus?.isGuest ? 'person_add' : (mockLimitStatus?.blocked || !mockLimitStatus?.canStartMock) ? 'workspace_premium' : 'play_arrow'}
                            </span>
                            {checkingLimit ? 'Checking...' : mockLimitStatus?.isGuest ? 'Create Free Account' : (mockLimitStatus?.blocked || !mockLimitStatus?.canStartMock) ? 'Unlock with Pro' : 'Start Mock Interview'}
                        </div>

                        {/* Helper text */}
                        {!checkingLimit && mockLimitStatus?.isGuest && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                                Sign up to get 1 free mock interview
                            </p>
                        )}
                        {!checkingLimit && !mockLimitStatus?.isGuest && mockLimitStatus?.canStartMock && !mockLimitStatus?.blocked && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Free Trial: 1 mock interview per week<br />
                                Upgrade for unlimited practice
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Paywall Modal */}
            {showPaywallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A222C] rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">workspace_premium</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free Limit Reached</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {mockLimitStatus?.message || "You've used your free mock interview for this week."}
                                </p>
                            </div>
                        </div>

                        {/* Reset Information */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">schedule</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {mockLimitStatus?.resetInDays > 1
                                        ? `Try again in ${mockLimitStatus.resetInDays} days`
                                        : mockLimitStatus?.resetInDays === 1
                                            ? 'Try again tomorrow'
                                            : mockLimitStatus?.resetInDays === 0
                                                ? 'Try again today'
                                                : 'Check back later'}
                                </p>
                            </div>
                            {mockLimitStatus?.nextAllowedAt && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 ml-7">
                                    Available on {formatNextAllowedDate(mockLimitStatus.nextAllowedAt)}
                                </p>
                            )}
                            {!mockLimitStatus?.nextAllowedAt && !mockLimitStatus?.resetInDays && (
                                <p className="text-xs text-red-600 dark:text-red-400 ml-7">
                                    Error: Missing reset information. Please contact support.
                                </p>
                            )}
                        </div>

                        {/* Benefits */}
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">With Pro, you get:</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Unlimited mock interviews</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Detailed AI feedback on every answer</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Private recording library</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleUpgrade}
                                className="w-full px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">workspace_premium</span>
                                Unlock with Pro
                            </button>
                            <button
                                onClick={() => setShowPaywallModal(false)}
                                className="w-full px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
