import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient.js';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AdminDashboardPage() {
    const [tab, setTab] = useState('referrals');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient('/api/admin/dashboard');
                setData(res);
            } catch (err) {
                console.error('Admin dashboard error:', err);
                setError(err.message || 'Unauthorized or failed to load');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-500 text-lg">Loading admin dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-xl font-bold mb-2">Access Denied</div>
                        <div className="text-gray-500">{error}</div>
                        <Link to="/" className="mt-4 inline-block text-[#197fe6] hover:underline">← Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { referralLogs, affiliateApplications, payoutSummary, totals } = data;

    const tabs = [
        { id: 'referrals', label: 'Referral Activity', count: totals.totalReferrals },
        { id: 'affiliates', label: 'Affiliate Applications', count: totals.totalAffiliateApps },
        { id: 'payouts', label: 'Payout Summary', count: payoutSummary?.length || 0 }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {totals.totalReferrals} referrals · {totals.totalConverted} converted · {totals.totalPending} pending
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                        Admin
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Referrals" value={totals.totalReferrals} icon="group_add" color="blue" />
                    <StatCard label="Converted" value={totals.totalConverted} icon="check_circle" color="green" />
                    <StatCard label="Pending" value={totals.totalPending} icon="pending" color="amber" />
                    <StatCard label="Affiliate Apps" value={totals.totalAffiliateApps} icon="description" color="purple" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${tab === t.id
                                    ? 'bg-white dark:bg-[#1A222C] text-[#111418] dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {t.label}
                            <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-[#111921] rounded-xl border border-[#dce0e5] dark:border-gray-800 overflow-hidden shadow-sm">
                    {tab === 'referrals' && <ReferralsTab logs={referralLogs} />}
                    {tab === 'affiliates' && <AffiliatesTab applications={affiliateApplications} />}
                    {tab === 'payouts' && <PayoutsTab summary={payoutSummary} />}
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-[#111921] border border-[#dce0e5] dark:border-gray-800 rounded-xl p-4">
            <div className={`inline-flex items-center justify-center size-10 rounded-lg mb-3 ${colors[color]}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
    );
}

function ReferralsTab({ logs }) {
    if (!logs || logs.length === 0) {
        return <div className="p-12 text-center text-gray-500">No referrals yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#dce0e5] dark:border-gray-800">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Referrer</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Referred User</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Code</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#dce0e5] dark:divide-gray-800">
                    {logs.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="font-medium">{log.referrer_email || 'Unknown'}</div>
                                <div className="text-xs text-gray-400">{log.referrer_name || log.referrer_id?.substring(0, 8)}</div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium">{log.referred_email || 'Unknown'}</div>
                                <div className="text-xs text-gray-400">{log.referred_name || log.referred_user_id?.substring(0, 8)}</div>
                            </td>
                            <td className="px-4 py-3">
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{log.referrer_code || '—'}</code>
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={log.status} />
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                                {log.created_at ? new Date(log.created_at).toLocaleDateString() : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AffiliatesTab({ applications }) {
    if (!applications || applications.length === 0) {
        return <div className="p-12 text-center text-gray-500">No affiliate applications yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#dce0e5] dark:border-gray-800">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Platform</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Audience</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Payout</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#dce0e5] dark:divide-gray-800">
                    {applications.map((app, idx) => (
                        <tr key={app.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{app.name}</td>
                            <td className="px-4 py-3">{app.email}</td>
                            <td className="px-4 py-3">{app.primary_platform}</td>
                            <td className="px-4 py-3">{app.audience_size}</td>
                            <td className="px-4 py-3">{app.payout_preference}</td>
                            <td className="px-4 py-3">
                                <StatusBadge status={app.status} />
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                                {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PayoutsTab({ summary }) {
    if (!summary || summary.length === 0) {
        return <div className="p-12 text-center text-gray-500">No payout data yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#dce0e5] dark:border-gray-800">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Referrer</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Code</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Total Referrals</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Converted</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Pending</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Credits</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#dce0e5] dark:divide-gray-800">
                    {summary.map((row, idx) => (
                        <tr key={row.referrer_id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="font-medium">{row.referrer_email || 'Unknown'}</div>
                                <div className="text-xs text-gray-400">{row.referrer_name || row.referrer_id?.substring(0, 8)}</div>
                            </td>
                            <td className="px-4 py-3">
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{row.referral_code || '—'}</code>
                            </td>
                            <td className="px-4 py-3 font-bold">{row.total_referrals}</td>
                            <td className="px-4 py-3">
                                <span className="text-green-600 font-semibold">{row.converted}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-amber-600 font-semibold">{row.pending}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">{row.credits}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${styles[status] || styles.pending}`}>
            {status || 'pending'}
        </span>
    );
}
