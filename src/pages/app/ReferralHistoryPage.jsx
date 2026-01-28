import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UniversalHeader from '../../components/UniversalHeader.jsx';
import { apiClient } from '../../utils/apiClient.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function ReferralHistoryPage() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ credits: 0, total_referred: 0 });
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch history and stats from backend API
                // Defensive: Provide fallbacks in case of catch
                const [historyRes, statsRes] = await Promise.all([
                    apiClient("/api/referrals/history").catch(err => {
                        console.error("History fetch error:", err);
                        return { history: [] };
                    }),
                    apiClient("/api/referrals/stats").catch(err => {
                        console.error("Stats fetch error:", err);
                        return { credits: 0, total_referred: 0 };
                    })
                ]);

                // Handle various response shapes (backend usually returns { history: [] })
                const historyData = historyRes?.history || (Array.isArray(historyRes) ? historyRes : []);
                setHistory(historyData);

                // Handle stats response (backend returns { credits: n, total_referred: n })
                setStats({
                    credits: statsRes?.credits || statsRes?.data?.credits || 0,
                    total_referred: statsRes?.total_referred || statsRes?.data?.total_referred || 0
                });

            } catch (err) {
                console.error("Failed to load referral data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRedeem = async () => {
        setRedeeming(true);
        try {
            await apiClient("/api/referrals/redeem", { method: "POST" });

            // Success! 
            setModalOpen(false);

            // Redirect to interview as requested
            navigate('/interview');

        } catch (err) {
            console.error("Redeem error:", err);
            // Show alert if not eligible
            alert(err.message || "Not eligible or no credits available.");
        } finally {
            setRedeeming(false);
        }
    };

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
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading...</div>
                    ) : history.length > 0 ? (
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
                                    {history.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">{item.referred_email || item.email || "Hidden"}</td>
                                            <td className="px-6 py-4">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {item.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{item.reward_status || (item.status === 'converted' ? 'Credit Earned' : 'Pending')}</td>
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
                            <h3 className="font-bold text-lg">
                                You have {stats.credits || 0} credit{(stats.credits !== 1) && 's'} available!
                            </h3>
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
                            disabled={!stats.credits || stats.credits <= 0}
                            className="px-6 py-3 rounded-lg font-bold bg-[#197fe6] text-white hover:bg-[#197fe6]/90 transition-colors shadow-lg shadow-[#197fe6]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <button
                                    onClick={handleRedeem}
                                    disabled={redeeming}
                                    className="w-full py-3 bg-[#197fe6] text-white font-bold rounded-xl hover:bg-[#197fe6]/90 transition-colors disabled:opacity-70"
                                >
                                    {redeeming ? "Redeeming..." : "Confirm & Start Session"}
                                </button>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    disabled={redeeming}
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
