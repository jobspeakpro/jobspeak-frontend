import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AffiliateTermsPage() {
    useEffect(() => {
        document.title = "Program Terms | JobSpeakPro Affiliate";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-grow max-w-[800px] mx-auto px-6 py-12 w-full">
                <div className="mb-8">
                    <Link to="/affiliate" className="inline-flex items-center gap-2 text-[#197fe6] font-semibold hover:underline">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Affiliate Program
                    </Link>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-8">Affiliate Program Terms</h1>

                    <section className="mb-8 space-y-4">
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <h3 className="text-lg font-bold text-[#197fe6] mb-2">Program Overview</h3>
                            <p className="m-0">
                                The JobSpeakPro Affiliate Program is designed to reward partners who refer qualified customers to our platform.
                                By participating, you agree to the terms outlined below.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">1. Commission Structure</h3>
                            <ul className="list-disc pl-5 space-y-2 text-[#637588] dark:text-gray-300">
                                <li><strong>Rate:</strong> You earn a <strong>30% recurring commission</strong> on all revenue generated from referred customers.</li>
                                <li><strong>Duration:</strong> Commissions are paid for the first <strong>24 months</strong> of the customer's active subscription. This is a 24-month window, not a lifetime revenue share.</li>
                                <li><strong>Attribution:</strong> Tracking is handled via your unique affiliate link and ID. Last-click attribution applies. Cookies are valid for 60 days.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-3">2. Payouts & Fees</h3>
                            <ul className="list-disc pl-5 space-y-2 text-[#637588] dark:text-gray-300">
                                <li><strong>Schedule:</strong> Payouts are processed monthly, typically by the 5th of the month, for the previous month's earnings.</li>
                                <li><strong>Methods:</strong> We support PayPal, Stripe, and Crypto (USDT).</li>
                                <li><strong>Fees:</strong> The <strong>affiliate is responsible for all transaction fees</strong> associated with the payout (e.g., PayPal fees, Gas fees, Stripe transfer fees). We will deduct these fees from the payout amount.</li>
                                <li><strong>Minimum:</strong> There is a $50 minimum threshold for payouts.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-3">3. Ownership & Equity</h3>
                            <p className="text-[#637588] dark:text-gray-300">
                                This agreement establishes a revenue-share partnership only. Participation in the affiliate program <strong>does not grant any equity, stock options, or ownership stake</strong> in JobSpeakPro Inc. You are an independent contractor, not an employee.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-3">4. Termination</h3>
                            <p className="text-[#637588] dark:text-gray-300 mb-2">
                                We reserve the right to terminate your affiliate account at any time, with or without notice, for conduct that violates these terms, including but not limited to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-[#637588] dark:text-gray-300">
                                <li>Self-referrals (buying via your own link).</li>
                                <li>Spamming or unsolicited marketing.</li>
                                <li>Misrepresenting the product or brand.</li>
                                <li>Posting links on coupon/discount sites.</li>
                            </ul>
                            <p className="text-[#637588] dark:text-gray-300 mt-2">
                                In the event of termination for cause, all pending commissions will be forfeited.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="bg-white dark:bg-[#111921] border-t border-[#dce0e5] dark:border-gray-800 py-8">
                <div className="max-w-[1200px] mx-auto px-6 text-center text-sm text-[#637588] dark:text-gray-400">
                    © 2024 JobSpeakPro Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
