import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient.js';

import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function ReferralPage() {
    const [referralCode, setReferralCode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "JobSpeakPro - Practice Is Better With Friends";

        async function fetchCode() {
            try {
                const res = await apiClient.get("/referrals/code");
                setReferralCode(res.data.referralCode);
            } catch (err) {
                console.error("Fetch referral code error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCode();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
            <UniversalHeader />
            <div className="relative flex h-auto w-full flex-col group/design-root overflow-x-hidden flex-grow">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Top Navigation Replaced by UniversalHeader */}
                    <main className="flex flex-1 justify-center py-10 px-4 md:px-10">
                        <div className="layout-content-container flex flex-col max-w-[900px] flex-1 gap-8">
                            {/* Hero Section */}
                            <div className="@container">
                                <div className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 text-center" data-alt="Soft abstract blue and white gradient background" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCqdSqXwfIM3UndWnEScMa9PgL5YzS0K9BXCKsRqKsM2iePwONXvZdYkq_bFJ_olwBmrSDdtoL14kGJ-q_ZOFFwvcm1aYnMk3PhdZLgInB0qhrFMOSmS9eRCRL8kg_dsxDpDxNQZsRDMAl6BluZq5jlHaE1EbvonLfLQwsSzgAejaZxZWT9-sDLAGVm6345VbgQ0GN6aBWvW-s3HZ-gre8SqLtBzekUmGm7niB-5kvrGXzmryjB0Bxtt_Slr0pbVy7w-MLG7ULoUOvu")' }}>
                                    <div className="flex flex-col gap-4">
                                        <h1 className="text-[#111418] text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                                            Practice Is Better With Friends
                                        </h1>
                                        <p className="text-[#4b5563] text-base font-normal leading-normal max-w-xl mx-auto md:text-lg">
                                            Invite someone you know to JobSpeakPro. Help them practice interviews and advance their career. Get rewarded for every success.
                                        </p>
                                    </div>
                                    <button className="mt-4 flex min-w-[200px] cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-[#4799eb] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#4799eb]/90 transition-all shadow-lg shadow-[#4799eb]/20">
                                        Share Your Referral Link
                                    </button>
                                </div>
                            </div>
                            {/* The Reward Offer */}
                            <section>
                                <h2 className="text-[#111418] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4">The Reward Offer</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                    {/* For Them */}
                                    <div className="flex flex-1 gap-4 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111921] p-6 flex-col shadow-sm">
                                        <div className="bg-[#4799eb]/10 text-[#4799eb] w-12 h-12 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">celebration</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight">For them</h3>
                                            <p className="text-[#637588] dark:text-gray-400 text-base font-normal leading-normal">7 days of full Pro access to all premium tools</p>
                                        </div>
                                    </div>
                                    {/* For You */}
                                    <div className="flex flex-1 gap-4 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111921] p-6 flex-col shadow-sm">
                                        <div className="bg-[#4799eb]/10 text-[#4799eb] w-12 h-12 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">redeem</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight">For you</h3>
                                            <p className="text-[#637588] dark:text-gray-400 text-base font-normal leading-normal">1 free mock interview credit for your next session</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* Feature List: What they get */}
                            <section className="bg-white/50 dark:bg-white/5 rounded-xl p-8">
                                <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] pb-6">What they get</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#4799eb]">check_circle</span>
                                        <span className="text-sm md:text-base font-medium">Unlimited practice sessions</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#4799eb]">check_circle</span>
                                        <span className="text-sm md:text-base font-medium">No paywalls or restricted features</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#4799eb]">check_circle</span>
                                        <span className="text-sm md:text-base font-medium">Unlimited mock interviews</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#4799eb]">check_circle</span>
                                        <span className="text-sm md:text-base font-medium">Full JobSpeakPro experience</span>
                                    </div>
                                </div>
                            </section>
                            {/* Share Your Link */}
                            <section className="flex flex-col gap-6">
                                <div className="rounded-lg border border-[#4799eb]/20 bg-white dark:bg-[#111921] p-8 shadow-sm flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-xl font-bold">Your Unique Invite Link</h3>
                                        <p className="text-sm text-gray-500">Copy this link and send it to your friends or colleagues.</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                className="w-full bg-gray-50 dark:bg-[#1c2630] border border-gray-200 dark:border-gray-700 rounded-full h-12 px-5 text-gray-600 dark:text-gray-300 font-mono text-sm focus:outline-none"
                                                readOnly
                                                type="text"
                                                value={loading ? "Loading..." : `jobspeakpro.com/ref/${referralCode || '...'}`}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (referralCode) {
                                                    navigator.clipboard.writeText(`https://jobspeakpro.com/ref/${referralCode}`);
                                                    alert("Link copied!");
                                                }
                                            }}
                                            disabled={loading || !referralCode}
                                            className="bg-[#4799eb] text-white px-8 h-12 rounded-full font-bold hover:bg-[#4799eb]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                            Copy Link
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-sm font-medium text-gray-500">Share via:</span>
                                        <div className="flex gap-3">
                                            <button className="size-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined text-[#4799eb]">mail</span>
                                            </button>
                                            <button className="size-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined text-[#4799eb]">chat</span>
                                            </button>
                                            <button className="size-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined text-[#4799eb]">group</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* Trust Note */}
                            <footer className="mt-4">
                                <div className="bg-[#4799eb]/5 dark:bg-[#4799eb]/10 border border-[#4799eb]/10 rounded-lg p-5 flex items-center justify-center gap-4 text-center">
                                    <span className="material-symbols-outlined text-[#4799eb]">verified_user</span>
                                    <p className="text-sm md:text-base font-medium text-[#4799eb]/80">No spam. No pressure. Just helping someone practice for their dream job.</p>
                                </div>
                                <div className="py-10 text-center text-xs text-gray-400">
                                    © 2024 JobSpeakPro Referral Program • Terms Apply
                                </div>
                            </footer>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
