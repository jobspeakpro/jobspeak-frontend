import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AffiliateJoinPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Affiliate Application | JobSpeakPro";
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Use navigate instead of default form behavior
        navigate('/affiliate/joined');
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#111921] font-display text-[#111418] dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            <header className="w-full bg-white dark:bg-[#111921] border-b border-[#dce0e5] dark:border-gray-800">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-[#197fe6]">
                            <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">JobSpeakPro</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium text-[#637588] hover:text-[#197fe6] transition-colors">
                            Back to Site
                        </Link>
                    </div>
                </div>
            </header>

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
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                        <input className="w-full pl-11 pr-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="full-name" placeholder="John Doe" type="text" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="email">Email Address</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                        <input className="w-full pl-11 pr-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="email" placeholder="john@example.com" type="email" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="country">Country</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">public</span>
                                        <input className="w-full pl-11 pr-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="country" placeholder="e.g. United States" type="text" />
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-6">Channel Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="platform">Primary Platform</label>
                                    <select className="w-full px-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="platform">
                                        <option value="">Select Platform</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="blog">Blog</option>
                                        <option value="community">Community</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="audience">Audience Size</label>
                                    <select className="w-full px-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="audience">
                                        <option value="">Select Size</option>
                                        <option value="<5k">&lt;5k</option>
                                        <option value="5k-20k">5k-20k</option>
                                        <option value="20k-50k">20k-50k</option>
                                        <option value="50k+">50k+</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="link">Link to Channel / Portfolio</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">link</span>
                                        <input className="w-full pl-11 pr-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="link" placeholder="https://youtube.com/c/yourchannel" type="url" />
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold" htmlFor="strategy">How do you plan to promote JobSpeakPro?</label>
                                <textarea className="w-full px-4 py-2.5 rounded-lg border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="strategy" placeholder="Tell us about your content strategy..." rows="4"></textarea>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-4">Payout Preference</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <label className="relative flex flex-col items-center gap-3 p-4 border border-[#dce0e5] dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">account_balance_wallet</span>
                                    <span className="text-sm font-bold">PayPal</span>
                                </label>
                                <label className="relative flex flex-col items-center gap-3 p-4 border border-[#dce0e5] dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">credit_card</span>
                                    <span className="text-sm font-bold">Stripe</span>
                                </label>
                                <label className="relative flex flex-col items-center gap-3 p-4 border border-[#dce0e5] dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">currency_bitcoin</span>
                                    <span className="text-sm font-bold">Crypto (USDT)</span>
                                </label>
                            </div>
                        </section>
                        <div className="pt-6 border-t border-[#f0f2f4] dark:border-gray-800 space-y-6">
                            <button className="w-full bg-[#197fe6] text-white font-bold py-4 rounded-xl hover:bg-[#197fe6]/90 shadow-lg shadow-[#197fe6]/20 transition-all active:scale-[0.98]" type="submit">
                                Submit Application
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
                        <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
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
