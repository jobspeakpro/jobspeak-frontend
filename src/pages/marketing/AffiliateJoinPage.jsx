import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient.js';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AffiliateJoinPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [platform, setPlatform] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("");

    useEffect(() => {
        document.title = "Affiliate Application | JobSpeakPro";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target;

        // Basic validation
        if (!platform || !payoutMethod) {
            alert("Please complete all required fields.");
            setLoading(false);
            return;
        }

        const payload = {
            name: form['full-name'].value,
            email: form['email'].value,
            country: form['country'].value,
            platform: platform === 'other' ? form['platform_other'].value : platform,
            audienceSize: form['audience'].value,
            channelLink: form['link'].value,
            promoPlan: form['strategy'].value,
            payoutMethod: payoutMethod,
            payoutDetails: {}
        };

        if (payoutMethod === 'paypal') {
            payload.payoutDetails.email = form['paypal_email'].value;
        } else if (payoutMethod === 'stripe') {
            payload.payoutDetails.email = form['stripe_email'].value;
        } else if (payoutMethod === 'crypto') {
            payload.payoutDetails.wallet = form['crypto_wallet'].value;
            payload.payoutDetails.network = form['crypto_network'].value;
        }

        try {
            await apiClient.post("/affiliate/apply", payload);
            navigate('/affiliate/joined');
        } catch (err) {
            console.error("Affiliate apply error:", err);
            setLoading(false);
            alert(err.response?.data?.error || "Something went wrong. Please check your inputs and try again.");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#dce0e5] dark:border-gray-800 overflow-hidden">
                    <div className="px-8 pt-8 pb-6 border-b border-[#f0f2f4] dark:border-gray-800">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Affiliate Application</h1>
                                <p className="text-[#637588] dark:text-gray-400 mt-1">Tell us about your audience and platform.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-[#197fe6]">Step 1 of 2</span>
                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                    <div className="w-1/2 h-full bg-[#197fe6]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-6">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="full-name">Full Name</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="full-name" placeholder="John Doe" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="email">Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="email" placeholder="john@example.com" type="email" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="country">Country</label>
                                    <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="country">
                                        <option value="">Select Country</option>
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="CA">Canada</option>
                                        <option value="AU">Australia</option>
                                        <option value="IN">India</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-6">Channel Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="platform">Primary Platform</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]"
                                        id="platform"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="blog">Blog</option>
                                        <option value="community">Community</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {platform === 'other' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="platform_other">Specify Platform</label>
                                        <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="platform_other" placeholder="e.g. Instagram" type="text" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="audience">Audience Size</label>
                                    <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="audience">
                                        <option value="">Select Size</option>
                                        <option value="<5k">&lt;5k</option>
                                        <option value="5k-20k">5k-20k</option>
                                        <option value="20k-50k">20k-50k</option>
                                        <option value="50k+">50k+</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="link">Link to Channel / Portfolio</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="link" placeholder="https://youtube.com/c/yourchannel" type="url" />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold" htmlFor="strategy">How do you plan to promote JobSpeakPro?</label>
                                <textarea required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="strategy" placeholder="Tell us about your content strategy..." rows="4"></textarea>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-4">Payout Preference</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'paypal' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="paypal" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">account_balance_wallet</span>
                                    <span className="text-sm font-bold">PayPal</span>
                                </label>
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'stripe' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="stripe" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">credit_card</span>
                                    <span className="text-sm font-bold">Stripe</span>
                                </label>
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'crypto' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="crypto" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">currency_bitcoin</span>
                                    <span className="text-sm font-bold">Crypto (USDT)</span>
                                </label>
                            </div>

                            {/* Conditional Payout Fields */}
                            {payoutMethod === 'paypal' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold" htmlFor="paypal_email">PayPal Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="paypal_email" type="email" placeholder="paypal@example.com" />
                                </div>
                            )}
                            {payoutMethod === 'stripe' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold" htmlFor="stripe_email">Stripe Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="stripe_email" type="email" placeholder="stripe@example.com" />
                                </div>
                            )}
                            {payoutMethod === 'crypto' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="crypto_wallet">USDT Wallet Address</label>
                                        <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="crypto_wallet" type="text" placeholder="0x..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="crypto_network">Network</label>
                                        <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="crypto_network">
                                            <option value="">Select Network</option>
                                            <option value="ERC20">Ethereum (ERC20)</option>
                                            <option value="TRC20">Tron (TRC20)</option>
                                            <option value="BSC">Binance Smart Chain (BEP20)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </section>
                        <div className="pt-6 border-t border-[#f0f2f4] dark:border-gray-800 space-y-6">
                            <button
                                className="w-full bg-[#197fe6] text-white font-bold py-4 rounded-xl hover:bg-[#197fe6]/90 shadow-lg shadow-[#197fe6]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                            <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-[#197fe6]/5 p-4 rounded-xl">
                                <span className="material-symbols-outlined text-[#197fe6] text-xl">info</span>
                                <p className="text-xs text-[#637588] dark:text-gray-400 leading-relaxed">
                                    We manually review every application within 48 hours to ensure a high-quality partnership. You will receive an email once your application has been processed.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <footer className="bg-white dark:bg-[#111921] border-t border-[#dce0e5] dark:border-gray-800 py-8">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-60 grayscale">
                        <span className="font-bold">JobSpeakPro</span>
                    </div>
                    <div className="flex gap-8 text-xs font-medium text-[#637588] dark:text-gray-400">
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Affiliate Terms</a>
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Support</a>
                    </div>
                    <div className="text-xs text-[#637588] dark:text-gray-400">
                        © 2024 JobSpeakPro Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
