import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePro } from "../../contexts/ProContext.jsx";
import UniversalHeader from "../../components/UniversalHeader.jsx";
import PaywallModal from "../../components/PaywallModal.jsx";
import MockInterviewGate from "../../components/MockInterviewGate.jsx";
import { unlockAudio } from "../../utils/audioUnlock.js";

export default function MockInterviewPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isPro } = usePro();
    const [loading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Entitlements check
    const [entitlements, setEntitlements] = useState(null);
    const [checkingEntitlements, setCheckingEntitlements] = useState(true);
    const [entitlementsError, setEntitlementsError] = useState(false);

    // Route guard: redirect if user tries to access long interview
    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'long') {
            alert('Long interview coming soon.');
            navigate('/mock-interview', { replace: true });
        }
    }, [searchParams, navigate]);

    // Check entitlements on mount
    useEffect(() => {
        fetchEntitlements();
    }, []);

    const fetchEntitlements = async () => {
        setCheckingEntitlements(true);
        setEntitlementsError(false);
        try {
            const response = await fetch('/api/entitlements', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setEntitlements(data);
            console.log('[ENTITLEMENTS] Mock interview allowed:', data.mockInterview?.allowed);
        } catch (err) {
            console.error('[ENTITLEMENTS] Failed to fetch:', err);
            setEntitlementsError(true);
        } finally {
            setCheckingEntitlements(false);
        }
    };

    const handleStartMockInterview = () => {
        // Pre-unlock audio so TTS auto-plays on the session page
        unlockAudio();

        if (!entitlements?.mockInterview?.allowed) {
            alert('You do not have access to mock interviews. Please check your account status.');
            return;
        }

        navigate('/mock-interview/session?type=short');
    };

    // Show loading while checking entitlements
    if (checkingEntitlements) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state with retry if entitlements API failed
    if (entitlementsError) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Mock Interview Temporarily Unavailable
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We're having trouble connecting to our servers. Practice mode still works!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={fetchEntitlements}
                                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/practice')}
                                className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Go to Practice Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show gate if not allowed
    if (!entitlements?.mockInterview?.allowed) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <MockInterviewGate entitlements={entitlements} />
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <UniversalHeader />
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
