import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePro } from "../../contexts/ProContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { apiClient } from "../../utils/apiClient.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";
import PaywallModal from "../../components/PaywallModal.jsx";
import MockInterviewGate from "../../components/MockInterviewGate.jsx";

export default function MockInterviewPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isPro } = usePro();
    const [loading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Mock interview limit status
    const [mockLimitStatus, setMockLimitStatus] = useState(null);
    const [checkingLimit, setCheckingLimit] = useState(true);

    // Route guard: redirect if user tries to access long interview
    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'long') {
            alert('Long interview coming soon.');
            navigate('/mock-interview', { replace: true });
        }
    }, [searchParams, navigate]);

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

    const handleStartMockInterview = () => {
        if (!mockLimitStatus) return;

        if (mockLimitStatus.isGuest) {
            alert('Create a free account to use your 1 free mock interview.');
            navigate('/signup');
            return;
        }

        if (!mockLimitStatus.canStartMock) {
            alert('Your free mock interview is complete. Upgrade for unlimited practice.');
            navigate('/pricing');
            return;
        }

        navigate('/mock-interview/session?type=short');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <UniversalHeader />

            {/* Show gate for guests */}
            {!checkingLimit && mockLimitStatus?.isGuest ? (
                <MockInterviewGate />
            ) : (
                <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
                    {/* Header Section */}
                    <div className="text-center flex flex-col items-center gap-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">video_call</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Mock Interview
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Simulate a real interview and receive an overall hiring recommendation.
                        </p>
                    </div>

                    {/* Single Card - Short Only (Long hidden) */}
                    <div className="max-w-md mx-auto w-full">
                        {/* Short Mock Interview Card */}
                        <div className="bg-white dark:bg-[#1A222C] rounded-xl border-t-4 border-t-blue-500 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                {/* Badge */}
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                        Quick Check
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-900 dark:text-white">timer</span>
                                    Short Mock Interview
                                </h2>

                                {/* Features List */}
                                <div className="space-y-4 mb-6 flex-1">
                                    {/* Duration */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400 mt-0.5">schedule</span>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">~8–10 minutes</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Estimated duration</p>
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400 mt-0.5">format_list_bulleted</span>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">5 questions</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Core behavioral & Role-specific fundamentals</p>
                                        </div>
                                    </div>

                                    {/* Best For */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400 mt-0.5">verified</span>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Readiness Check</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Best for first-time users</p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                {mockLimitStatus?.canStartMock && !mockLimitStatus?.isGuest ? (
                                    <button
                                        onClick={handleStartMockInterview}
                                        disabled={loading || checkingLimit}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(loading || checkingLimit) ? (
                                            <>
                                                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <span>Start Short Mock Interview</span>
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(mockLimitStatus?.isGuest ? '/signup' : '/pricing')}
                                        disabled={checkingLimit}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                        <span>{checkingLimit ? 'Checking...' : mockLimitStatus?.isGuest ? 'Create Free Account to Start' : 'Upgrade for Unlimited Mocks'}</span>
                                    </button>
                                )}

                                {/* Helper Text */}
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                                    {checkingLimit ? 'Checking eligibility...' : mockLimitStatus?.isGuest
                                        ? 'Sign up to get 1 free mock interview'
                                        : mockLimitStatus?.canStartMock
                                            ? 'Includes one complimentary mock interview.'
                                            : 'Free trial used. Upgrade for unlimited practice.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <PaywallModal
                    onClose={() => setShowUpgradeModal(false)}
                    source="mock_interview"
                />
            )}
        </div>
    );
}
