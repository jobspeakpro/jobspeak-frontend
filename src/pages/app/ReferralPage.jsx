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
                const res = await apiClient("/api/referrals/me");
                setReferralCode(res?.data?.referralCode || res?.referralCode);
            } catch (err) {
                console.error("Fetch referral code error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCode();
    }, []);

    const linkUrl = referralCode ? `https://jobspeakpro.com?ref=${referralCode}` : 'Loading...';

    return (
        <div className="bg-white dark:bg-[#0d1117] font-display text-[#111418] dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-1 w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
                {/* Hero Section */}
                <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm overflow-hidden relative">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-900/10 dark:to-[#1A222C] pointer-events-none"></div>

                    <div className="relative z-10 p-8 md:p-12 text-center flex flex-col items-center gap-6">
                        <div className="size-16 rounded-full bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-4xl">group_add</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white max-w-2xl">
                            Practice Is Better With Friends
                        </h1>
                        <p className="text-[#637588] dark:text-gray-400 text-lg font-normal leading-relaxed max-w-xl">
                            Invite someone you know to JobSpeakPro. Help them practice interviews and advance their career. Get rewarded for every success.
                        </p>
                    </div>
                </div>

                {/* The Reward Offer */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#197fe6]">redeem</span>
                        The Reward Offer
                    </h2>
                    {/* Strict Grid Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {/* For Them */}
                        <div className="w-full min-w-0 flex flex-col sm:flex-row gap-4 rounded-xl border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#1A222C] p-6 shadow-sm hover:border-[#197fe6]/30 transition-colors overflow-hidden relative h-full">
                            {/* Icon */}
                            <div className="bg-[#197fe6]/10 text-[#197fe6] size-12 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">celebration</span>
                            </div>
                            <div className="flex flex-col gap-1 z-10 relative">
                                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight break-words">For them</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-base">7 days of full Pro access to all premium tools</p>
                            </div>
                        </div>
                        {/* For You */}
                        <div className="w-full min-w-0 flex flex-col sm:flex-row gap-4 rounded-xl border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#1A222C] p-6 shadow-sm hover:border-[#197fe6]/30 transition-colors overflow-hidden relative h-full">
                            {/* Icon - Same style as 'For them' */}
                            <div className="bg-[#197fe6]/10 text-[#197fe6] size-12 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">wallet_giftcard</span>
                            </div>
                            <div className="flex flex-col gap-1 z-10 relative">
                                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight break-words">For you</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-base">1 free mock interview credit for your next session</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What they get */}
                <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#dce0e5] dark:border-gray-800 p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">What they get</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        {[
                            "Unlimited practice sessions",
                            "No paywalls or restricted features",
                            "Unlimited mock interviews",
                            "Full JobSpeakPro experience"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#197fe6]">check_circle</span>
                                <span className="text-sm md:text-base font-medium text-[#111418] dark:text-gray-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Share Your Link */}
                <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#197fe6]/20 shadow-lg shadow-[#197fe6]/5 p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-bold text-[#111418] dark:text-white">Your Unique Invite Link</h3>
                        <p className="text-sm text-[#637588] dark:text-gray-400">Copy this link and send it to your friends or colleagues.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                className="w-full bg-gray-50 dark:bg-[#141b23] border border-gray-200 dark:border-gray-700 rounded-xl h-12 px-5 text-gray-700 dark:text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#197fe6] transition-all"
                                readOnly
                                type="text"
                                id="referral-link-input"
                                data-testid="referral-code"
                                value={linkUrl}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (referralCode) {
                                    const copyToClipboard = async () => {
                                        try {
                                            await navigator.clipboard.writeText(linkUrl);
                                            return true;
                                        } catch (err) {
                                            // Fallback
                                            const input = document.getElementById('referral-link-input');
                                            if (input) {
                                                input.select();
                                                document.execCommand('copy');
                                                return true;
                                            }
                                            return false;
                                        }
                                    };
                                    copyToClipboard().then(() => {
                                        // Toast
                                        const toast = document.createElement('div');
                                        toast.className = 'fixed bottom-4 right-4 bg-[#197fe6] text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 font-bold flex items-center gap-2';
                                        toast.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Link copied!';
                                        document.body.appendChild(toast);
                                        setTimeout(() => toast.remove(), 3000);
                                    });
                                }
                            }}
                            disabled={loading || !referralCode}
                            data-testid="referral-copy"
                            className="bg-[#197fe6] text-white px-8 h-12 rounded-xl font-bold hover:bg-[#197fe6]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#197fe6]/20 active:scale-95 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            Copy Link
                        </button>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500">Share via:</span>
                            <div className="flex gap-3">
                                <button onClick={() => window.open(`mailto:?subject=Join JobSpeakPro&body=Check out JobSpeakPro! ${linkUrl}`, '_blank')} className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-[#197fe6] hover:text-white transition-all"><span className="material-symbols-outlined text-sm">mail</span></button>
                                <button onClick={() => window.open(`sms:?&body=Check out JobSpeakPro! ${linkUrl}`, '_blank')} className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-[#197fe6] hover:text-white transition-all"><span className="material-symbols-outlined text-sm">sms</span></button>
                                <button onClick={() => window.open(`https://wa.me/?text=Check out JobSpeakPro! ${linkUrl}`, '_blank')} className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-[#197fe6] hover:text-white transition-all"><span className="material-symbols-outlined text-sm">chat</span></button>
                            </div>
                        </div>

                        <Link to="/referral/history" className="text-[#197fe6] hover:underline text-sm font-bold flex items-center gap-1">
                            View Referral History
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
