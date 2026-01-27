import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AffiliateSuccessPage() {
    useEffect(() => {
        document.title = "Application Received | JobSpeakPro";
    }, []);

    return (
        <div className="bg-[#f6f8f6] dark:bg-[#102216] min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* TopNavBar */}
            <UniversalHeader />

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-[640px] w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#dbe6df] dark:border-white/10 p-8 md:p-12">
                    {/* Success Icon */}
                    <div className="flex justify-center pb-6">
                        <div className="bg-[#197fe6]/10 p-4 rounded-full">
                            <span className="material-symbols-outlined text-[#197fe6] text-6xl">check_circle</span>
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
                                <div className="flex items-center justify-center size-6 rounded-full bg-[#197fe6]/20 text-[#197fe6] shrink-0 mt-1">
                                    <span className="text-xs font-bold">1</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-normal">
                                    We received your application. Our team will review it and contact you.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center size-6 rounded-full bg-[#197fe6]/20 text-[#197fe6] shrink-0 mt-1">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-normal">
                                    Once approved, you'll receive your unique affiliate link and access to the partner dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/" className="flex-1 cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-[#197fe6] text-white text-sm font-bold leading-normal transition-all hover:bg-[#197fe6]/90 active:scale-95 no-underline flex">
                            Return to Home
                        </Link>
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
