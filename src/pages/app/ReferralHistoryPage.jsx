import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function ReferralHistoryPage() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);

    // Mock history data (or fetch from API if available, user didn't specify API for history, just UI)
    // "Buttons on history page must function"
    const history = [
        { id: 1, user: "john.d@example.com", date: "2024-01-20", status: "Joined", creditDetails: "Pending" },
        { id: 2, user: "sarah.m@gmail.com", date: "2024-01-15", status: "Pro Plan", creditDetails: "+1 Mock Interview Credit" },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
            <UniversalHeader />
            <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/referral" className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-2xl font-bold">Referral History</h1>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111921] rounded-xl border border-[#dce0e5] dark:border-gray-800 overflow-hidden shadow-sm">
                    {history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#dce0e5] dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Referred User</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dce0e5] dark:divide-gray-800">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">{item.user}</td>
                                            <td className="px-6 py-4">{item.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'Pro Plan' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{item.creditDetails}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            No referrals yet. Start inviting friends!
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#197fe6]/5 dark:bg-[#197fe6]/10 border border-[#197fe6]/20 p-6 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-[#197fe6] text-white flex items-center justify-center">
                            <span className="material-symbols-outlined">redeem</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">You have credits available!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Use your credits to unlock more mock interviews.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/referral')}
                            className="px-6 py-3 rounded-lg font-bold border border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[#111921]"
                        >
                            Invite Friend
                        </button>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="px-6 py-3 rounded-lg font-bold bg-[#197fe6] text-white hover:bg-[#197fe6]/90 transition-colors shadow-lg shadow-[#197fe6]/20"
                        >
                            Use Credit Now
                        </button>
                    </div>
                </div>
            </main>

            {/* Redeem Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A222C] rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="text-center">
                            <div className="mx-auto size-16 bg-[#197fe6]/10 rounded-full flex items-center justify-center mb-4 text-[#197fe6]">
                                <span className="material-symbols-outlined text-3xl">redeem</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">Redeem Credit</h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-6">
                                You are about to use 1 Referral Credit for a Mock Interview session.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button className="w-full py-3 bg-[#197fe6] text-white font-bold rounded-xl hover:bg-[#197fe6]/90 transition-colors">
                                    Confirm & Start Session
                                </button>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-full py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
