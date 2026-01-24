import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AffiliateSuccessPage() {
    useEffect(() => {
        document.title = "Application Received | JobSpeakPro";
    }, []);

    return (
        <div className="bg-[#f6f8f6] dark:bg-[#102216] min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* TopNavBar */}
            <header className="w-full bg-white dark:bg-[#102216] border-b border-[#dbe6df] dark:border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#111813] dark:text-white">
                        <div className="size-8 text-[#13ec5b]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">JobSpeakPro</h2>
                    </div>
                    <Link to="/" className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-[#13ec5b] text-[#111813] text-sm font-bold transition-transform hover:scale-105 active:scale-95 no-underline">
                        Home
                    </Link>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-[640px] w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#dbe6df] dark:border-white/10 p-8 md:p-12">
                    {/* Success Icon */}
                    <div className="flex justify-center pb-6">
                        <div className="bg-[#13ec5b]/10 p-4 rounded-full">
                            <span className="material-symbols-outlined text-[#13ec5b] text-6xl">check_circle</span>
                        </div>
                    </div>
                    {/* HeadlineText */}
                    <h1 className="text-[#111813] dark:text-white tracking-tight text-3xl md:text-[32px] font-bold leading-tight text-center pb-3">
                        Application Received
                    </h1>
                    {/* BodyText */}
                    <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-relaxed pb-8 text-center max-w-[500px] mx-auto">
                        Thanks for applying to the JobSpeakPro Founding Affiliate program. Our team manually reviews every application to maintain the highest quality standards.
                    </p>
                    {/* Stats Card Section */}
                    <div className="flex flex-col sm:flex-row gap-4 pb-8">
                        <div className="flex flex-1 flex-col gap-1 rounded-xl p-5 border border-[#dbe6df] dark:border-white/10 bg-[#f6f8f6]/50 dark:bg-white/5">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <p className="text-[#111813] dark:text-white text-xl font-bold">Under Review</p>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-1 rounded-xl p-5 border border-[#dbe6df] dark:border-white/10 bg-[#f6f8f6]/50 dark:bg-white/5">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Response Estimate</p>
                            <p className="text-[#111813] dark:text-white text-xl font-bold">48 hours</p>
                        </div>
                    </div>
                    {/* SectionHeader */}
                    <div className="border-t border-[#dbe6df] dark:border-white/10 pt-6">
                        <h3 className="text-[#111813] dark:text-white text-lg font-bold leading-tight tracking-tight pb-4">Next Steps</h3>
                        {/* Steps List */}
                        <div className="space-y-4 pb-10">
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center size-6 rounded-full bg-[#13ec5b]/20 text-[#13ec5b] shrink-0 mt-1">
                                    <span className="text-xs font-bold">1</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-normal">
                                    Check your email for a confirmation message. We've sent a summary of your application details to your registered address.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center size-6 rounded-full bg-[#13ec5b]/20 text-[#13ec5b] shrink-0 mt-1">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-normal">
                                    We'll reach out via email once your unique affiliate link is ready and your dashboard is activated.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/" className="flex-1 cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-[#13ec5b] text-[#111813] text-sm font-bold leading-normal transition-all hover:opacity-90 active:scale-95 no-underline flex">
                            Return to Home
                        </Link>
                        <button className="flex-1 cursor-pointer items-center justify-center rounded-xl h-12 px-6 border-2 border-[#dbe6df] dark:border-white/20 text-[#111813] dark:text-white text-sm font-bold leading-normal transition-all hover:bg-zinc-50 dark:hover:bg-white/5 active:scale-95 flex gap-2">
                            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                            </svg>
                            Follow on LinkedIn
                        </button>
                    </div>
                </div>
            </main>
            {/* Footer Simple */}
            <footer className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs">
                © 2024 JobSpeakPro. All rights reserved.
            </footer>
        </div>
    );
}
