import React from 'react';
import { Link } from 'react-router-dom';

import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AffiliatePage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200">
            {/* Top Navigation Bar Replaced */}
            <UniversalHeader />

            <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-24">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-3xl bg-[#197fe6]/5 dark:bg-[#197fe6]/10 border border-[#197fe6]/10">
                    <div className="relative z-10 py-20 px-8 text-center flex flex-col items-center gap-8">
                        <div className="inline-flex items-center gap-2 bg-[#197fe6]/20 text-[#197fe6] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Early Access Program
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-[1.1]">
                            Become a Founding Affiliate <span className="text-[#197fe6]">Earn 30% Revenue Share</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#637588] dark:text-gray-400 max-w-2xl leading-relaxed">
                            Help professionals practice interviews. Earn recurring commission on every customer you refer to the world's leading AI-powered interview prep platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <Link to="/affiliate/apply" className="bg-[#197fe6] text-white text-base font-bold px-8 py-4 rounded-xl hover:bg-[#197fe6]/90 transition-all shadow-lg hover:shadow-[#197fe6]/20 active:scale-95">
                                Apply to Become a Founding Affiliate
                            </Link>
                            <a
                                href="#important-notes"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('important-notes')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white dark:bg-gray-800 border border-[#dce0e5] dark:border-gray-700 text-base font-bold px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                View Program Terms
                            </a>
                        </div>
                    </div>
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#197fe6]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#197fe6]/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
                </section>

                {/* Who This Is For Section */}
                <section id="who-it-is-for">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Who This Is For</h2>
                        <p className="text-[#637588] dark:text-gray-400">We partner with high-integrity operators who serve the career space.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#dce0e5] dark:border-gray-800 bg-white dark:bg-[#111921] p-6 hover:shadow-xl transition-all duration-300">
                            <div className="size-12 rounded-xl bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-3xl">video_stable</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Creators</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-sm leading-relaxed">Content creators on LinkedIn, YouTube, or TikTok in the tech and career growth niche.</p>
                            </div>
                        </div>
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#dce0e5] dark:border-gray-800 bg-white dark:bg-[#111921] p-6 hover:shadow-xl transition-all duration-300">
                            <div className="size-12 rounded-xl bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-3xl">school</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Educators & Coaches</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-sm leading-relaxed">Interview coaches, HR consultants, and career advisors helping candidates land jobs.</p>
                            </div>
                        </div>
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#dce0e5] dark:border-gray-800 bg-white dark:bg-[#111921] p-6 hover:shadow-xl transition-all duration-300">
                            <div className="size-12 rounded-xl bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">AI Influencers</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-sm leading-relaxed">Thought leaders and operators focused on AI productivity and career automation tools.</p>
                            </div>
                        </div>
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#dce0e5] dark:border-gray-800 bg-white dark:bg-[#111921] p-6 hover:shadow-xl transition-all duration-300">
                            <div className="size-12 rounded-xl bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-3xl">groups</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Career Communities</h3>
                                <p className="text-[#637588] dark:text-gray-400 text-sm leading-relaxed">Owners of Slack, Discord, or newsletter communities supporting active job seekers.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Affiliate Benefits Section */}
                <section className="bg-white dark:bg-gray-900/40 rounded-3xl p-8 md:p-12 border border-[#dce0e5] dark:border-gray-800" id="benefits">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-1/3">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Affiliate Benefits</h2>
                            <p className="text-[#637588] dark:text-gray-400 mb-6">We reward our founding partners with high-value terms that recognize their early contribution.</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="font-medium">No Cap on Earnings</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="font-medium">Direct Founder Contact</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="font-medium">Exclusive Partner Portal</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">payments</span>
                                <h4 className="font-bold mb-1">30% Recurring Commission</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">Earn from every monthly or annual renewal from your referrals.</p>
                            </div>
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">workspace_premium</span>
                                <h4 className="font-bold mb-1">Founding Partner Status</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">Lock in your 30% rate for 24 months per active paying customer.</p>
                            </div>
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">calendar_month</span>
                                <h4 className="font-bold mb-1">24 Month Duration</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">Commission applies per active paying customer for 24 months.</p>
                            </div>
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">query_stats</span>
                                <h4 className="font-bold mb-1">Transparent Tracking</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">Real-time dashboard to see clicks, signups, and commissions earned.</p>
                            </div>
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">lock_open</span>
                                <h4 className="font-bold mb-1">Manual Approval</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">We keep the pool small and high-quality to prevent brand dilution.</p>
                            </div>
                            <div className="p-5 bg-[#f6f7f8] dark:bg-gray-800 rounded-2xl border border-[#dce0e5] dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#197fe6] mb-3">schedule_send</span>
                                <h4 className="font-bold mb-1">Monthly Payouts</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400">Predictable income with payouts processed by the 5th of every month.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-12" id="how-it-works">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
                        <p className="text-[#637588] dark:text-gray-400">Launch your partner status in three simple steps.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Line Decor */}
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-[#dce0e5] dark:via-gray-800 to-transparent"></div>
                        <div className="flex flex-col items-center text-center gap-4 relative">
                            <div className="size-20 rounded-full bg-[#197fe6] text-white flex items-center justify-center shadow-lg shadow-[#197fe6]/30 z-10">
                                <span className="material-symbols-outlined text-4xl">edit_document</span>
                            </div>
                            <h3 className="text-xl font-bold">1. Apply & Approve</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 max-w-xs leading-relaxed">Fill out our brief application. We review and approve partners within 48 hours to ensure a good fit.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4 relative">
                            <div className="size-20 rounded-full bg-[#197fe6] text-white flex items-center justify-center shadow-lg shadow-[#197fe6]/30 z-10">
                                <span className="material-symbols-outlined text-4xl">link</span>
                            </div>
                            <h3 className="text-xl font-bold">2. Share Your Link</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 max-w-xs leading-relaxed">Use your unique tracking link in your content, newsletters, or social media posts.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4 relative">
                            <div className="size-20 rounded-full bg-[#197fe6] text-white flex items-center justify-center shadow-lg shadow-[#197fe6]/30 z-10">
                                <span className="material-symbols-outlined text-4xl">currency_exchange</span>
                            </div>
                            <h3 className="text-xl font-bold">3. Earn Commission</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 max-w-xs leading-relaxed">Watch your balance grow in real-time as your audience subscribes to JobSpeakPro.</p>
                        </div>
                    </div>
                </section>

                {/* Payouts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" id="payouts">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Payout Information</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="shrink-0 size-10 rounded-lg bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Multiple Methods</h4>
                                    <p className="text-[#637588] dark:text-gray-400 text-sm">We support PayPal, Stripe Direct, and Crypto (USDT). Affiliate is responsible for all payment/network/processing fees.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 size-10 rounded-lg bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Minimum Threshold</h4>
                                    <p className="text-[#637588] dark:text-gray-400 text-sm">Low $50 minimum threshold for all payouts. Unpaid balances roll over to the next month.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 size-10 rounded-lg bg-[#197fe6]/10 text-[#197fe6] flex items-center justify-center">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Simple Tax Reporting</h4>
                                    <p className="text-[#637588] dark:text-gray-400 text-sm">Automatic generation of earnings reports for your annual tax filing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#197fe6] p-8 rounded-3xl text-white shadow-2xl shadow-[#197fe6]/20">
                        <h3 className="text-2xl font-bold mb-4">Payout Schedule</h3>
                        <p className="opacity-80 mb-6">Transparent and reliable payments. No hidden fees.</p>
                        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span>Frequency</span>
                                <span className="font-bold">Monthly</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span>Payment Date</span>
                                <span className="font-bold">5th of the month</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span>Currency</span>
                                <span className="font-bold">USD / USDT</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Next Payout Cycle</span>
                                <span className="font-bold px-2 py-1 bg-white/20 rounded-md text-sm">Active</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Important Notes Section */}
                <section className="bg-[#f0f2f4] dark:bg-gray-800/30 rounded-3xl p-8 border-l-4 border-[#197fe6]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#197fe6]">gavel</span>
                        Important Notes (Plain English)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-[#197fe6]">Ownership & Equity</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">This is a revenue-share partnership, not a grant of equity. Affiliates do not own customer data or have any legal claim to the company assets.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-[#197fe6]">Fraud Policy</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">We have zero tolerance for self-referrals, coupon site spamming, or fraudulent activity. Accounts found violating these will be terminated immediately.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-[#197fe6]">Verification</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">We reserve the right to request proof of traffic sources or audience verification at any time to maintain program integrity.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-[#197fe6]">Relationship</h4>
                                <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">You are an independent contractor. Participation does not create an employer-employee relationship or a formal partnership/joint venture.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section Removed */}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#111921] border-t border-[#dce0e5] dark:border-gray-800 py-12">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-60 grayscale">
                        <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
                        <span className="font-bold">JobSpeakPro</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-[#637588] dark:text-gray-400">
                        <a className="hover:text-[#197fe6]" href="#">Terms of Service</a>
                        <a className="hover:text-[#197fe6]" href="#">Privacy Policy</a>
                        <a className="hover:text-[#197fe6]" href="#">Contact Support</a>
                    </div>
                    <div className="text-sm text-[#637588] dark:text-gray-400">
                        © 2024 JobSpeakPro Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div >
    );
}
