import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RedeemCreditModal from '../../components/RedeemCreditModal';

export default function ReferralHistoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        document.title = "Referral History | JobSpeakPro";
    }, []);

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#111921] text-[#111418] dark:text-white min-h-screen font-display">
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* TopNavBar */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f2f4] dark:border-slate-800 px-10 py-3 bg-white dark:bg-[#111921] sticky top-0 z-50">
                        <div className="flex items-center gap-4 text-[#111418] dark:text-white">
                            <div className="size-6 text-[#4799eb]">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeakPro</h2>
                        </div>
                        <div className="flex flex-1 justify-end gap-8">
                            <div className="flex items-center gap-9">
                                <Link className="text-[#111418] dark:text-slate-300 text-sm font-medium leading-normal hover:text-[#4799eb] transition-colors" to="/dashboard">Dashboard</Link>
                                <Link className="text-[#111418] dark:text-slate-300 text-sm font-medium leading-normal hover:text-[#4799eb] transition-colors" to="/practice">Practice</Link>
                                <a className="text-[#4799eb] text-sm font-bold leading-normal" href="#">Referrals</a>
                                <a className="text-[#111418] dark:text-slate-300 text-sm font-medium leading-normal hover:text-[#4799eb] transition-colors" href="#">Settings</a>
                            </div>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#4799eb]/20" data-alt="User profile avatar" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAHMsVI-HaQgYUCbTxEAyOHoQgfpwpcWJNRzlEz_185CopmkYDln2sq9gTVsiTfws674igcNTQSwRO9g1a2bemSSPCFCBAgIG-Ygpe80XrCYm02Q16f_B2XOMcbzcWuMs3imhhiHozYupXuHuJAWF3ZW9PGGrh7q8ScqkbVuw6RYS4J9F2IPP9f_qRAOHIkfdxG1Pi1HBGLEMviIldgRF1WlRaedZonEoCCuHBc3ngz6SzunWE42kkFq5x7c-mp6ucabrGxysXA6I9m")' }}></div>
                        </div>
                    </header>
                    <main className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            {/* Breadcrumbs */}
                            <div className="flex flex-wrap gap-2 p-4 items-center">
                                <Link className="text-[#637588] dark:text-slate-400 text-sm font-medium leading-normal hover:text-[#4799eb]" to="/dashboard">Dashboard</Link>
                                <span className="text-[#637588] dark:text-slate-500 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal">Referral History</span>
                            </div>
                            {/* PageHeading */}
                            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                                <div className="flex min-w-72 flex-col gap-1">
                                    <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Referral History</p>
                                    <p className="text-[#637588] dark:text-slate-400 text-base font-normal leading-normal">Invite your friends to JobSpeakPro and earn mock interview credits together.</p>
                                </div>
                                <Link to="/referral" className="bg-[#4799eb] hover:bg-[#4799eb]/90 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 no-underline">
                                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                                    Invite Friend
                                </Link>
                            </div>
                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 p-4">
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5] dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2 text-[#637588] dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">group</span>
                                        <p className="text-sm font-medium leading-normal">Total Friends Invited</p>
                                    </div>
                                    <p className="text-[#111418] dark:text-white tracking-light text-3xl font-bold leading-tight">12</p>
                                </div>
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5] dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2 text-[#637588] dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">timer</span>
                                        <p className="text-sm font-medium leading-normal">Active Pro Trials</p>
                                    </div>
                                    <p className="text-[#4799eb] tracking-light text-3xl font-bold leading-tight">3</p>
                                </div>
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5] dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2 text-[#637588] dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">redeem</span>
                                        <p className="text-sm font-medium leading-normal">Rewards Earned</p>
                                    </div>
                                    <p className="text-[#111418] dark:text-white tracking-light text-3xl font-bold leading-tight">5</p>
                                </div>
                            </div>
                            {/* Available Rewards Card */}
                            <div className="p-4">
                                <div className="flex items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-[#4799eb]/20">
                                    <div className="flex flex-[2_2_0px] flex-col justify-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[#4799eb]">
                                                <span className="material-symbols-outlined">confirmation_number</span>
                                                <p className="text-lg font-bold leading-tight">Available Credits: 5</p>
                                            </div>
                                            <p className="text-[#637588] dark:text-slate-400 text-sm font-normal leading-normal max-w-md">
                                                Awesome! You have 5 mock interview credits ready. Use them to practice with our AI and get instant feedback on your performance.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#4799eb] text-white gap-2 text-sm font-bold leading-normal w-fit hover:bg-[#4799eb]/90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">play_circle</span>
                                            <span className="truncate">Use Credit Now</span>
                                        </button>
                                    </div>
                                    <div className="hidden md:block w-48 bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex-none bg-[#4799eb]/5 flex items-center justify-center" data-alt="Abstract credit representation">
                                        <span className="material-symbols-outlined text-[#4799eb] text-6xl">token</span>
                                    </div>
                                </div>
                            </div>
                            {/* Tracking Table */}
                            <div className="p-4">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dce0e5] dark:border-slate-800 overflow-hidden">
                                    <div className="p-4 border-b border-[#f0f2f4] dark:border-slate-800">
                                        <h3 className="font-bold text-lg">Detailed Referral Tracking</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f6f7f8] dark:bg-slate-800/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-[#637588] dark:text-slate-400 uppercase tracking-wider">Friend</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-[#637588] dark:text-slate-400 uppercase tracking-wider">Date Joined</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-[#637588] dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-[#637588] dark:text-slate-400 uppercase tracking-wider text-right">Reward Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#f0f2f4] dark:divide-slate-800">
                                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium">a***@gmail.com</td>
                                                    <td className="px-6 py-4 text-sm text-[#637588] dark:text-slate-400">Oct 24, 2023</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                            Completed
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-bold text-[#4799eb]">+1 Credit Earned</span>
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium">m***@yahoo.com</td>
                                                    <td className="px-6 py-4 text-sm text-[#637588] dark:text-slate-400">Oct 28, 2023</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                                                            Pro Trial Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-[#637588] dark:text-slate-400">Pending Completion</span>
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium">s***@outlook.com</td>
                                                    <td className="px-6 py-4 text-sm text-[#637588] dark:text-slate-400">Nov 02, 2023</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                            <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                                            Joined
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-[#637588] dark:text-slate-400">Pending Pro Trial</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    {/* Footer */}
                    <footer className="mt-auto py-10 px-10 border-t border-[#f0f2f4] dark:border-slate-800 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="size-4">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">JobSpeakPro</span>
                        </div>
                        <p className="text-xs text-[#637588] dark:text-slate-500">© 2023 JobSpeakPro. All rights reserved. Your practice, your future.</p>
                    </footer>
                </div>
            </div>

            {/* Modal Integration */}
            <RedeemCreditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
