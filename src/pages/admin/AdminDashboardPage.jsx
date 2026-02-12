import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient.js';
import UniversalHeader from '../../components/UniversalHeader.jsx';
import SortableTable from '../../components/SortableTable.jsx';

export default function AdminDashboardPage() {
    const [tab, setTab] = useState('overview');
    const [data, setData] = useState(null);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await apiClient('/api/admin/dashboard');
            setData(res);
        } catch (err) {
            setError(err.message || 'Unauthorized or failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    const fetchUsers = useCallback(async () => {
        if (users) return;
        setUsersLoading(true);
        try {
            const res = await apiClient('/api/admin/users');
            setUsers(res.users);
        } catch (err) {
            console.error('Users fetch error:', err);
        } finally {
            setUsersLoading(false);
        }
    }, [users]);

    useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);

    const handleAffiliateAction = async (id, action) => {
        try {
            await apiClient(`/api/admin/affiliates/${id}/${action}`, { method: 'POST' });
            setActionMsg(`Application ${action}d successfully!`);
            setTimeout(() => setActionMsg(null), 3000);
            // Refresh data
            const res = await apiClient('/api/admin/dashboard');
            setData(res);
        } catch (err) {
            setActionMsg(`Error: ${err.message}`);
            setTimeout(() => setActionMsg(null), 3000);
        }
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <UniversalHeader />
                <div style={styles.loadingWrap}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.page}>
                <UniversalHeader />
                <div style={styles.loadingWrap}>
                    <div style={styles.errorIcon}>🔒</div>
                    <h2 style={styles.errorTitle}>Access Denied</h2>
                    <p style={styles.errorMsg}>{error}</p>
                    <Link to="/" style={styles.backLink}>← Back to Home</Link>
                </div>
            </div>
        );
    }

    const { referralLogs, affiliateApplications, payoutSummary, totals, totalUsers } = data;

    const tabs = [
        { id: 'overview', label: '📊 Overview', icon: '📊' },
        { id: 'users', label: '👥 Users', icon: '👥' },
        { id: 'affiliates', label: '🤝 Affiliates', icon: '🤝' },
        { id: 'referrals', label: '🔗 Referrals', icon: '🔗' },
        { id: 'payouts', label: '💰 Payouts', icon: '💰' }
    ];

    return (
        <div style={styles.page}>
            <UniversalHeader />

            <main style={styles.main}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Admin Dashboard</h1>
                        <p style={styles.subtitle}>
                            {totalUsers || 0} users · {totals.totalReferrals} referrals · {totals.totalAffiliateApps} affiliate apps
                        </p>
                    </div>
                    <div style={styles.adminBadge}>
                        🛡️ Admin
                    </div>
                </div>

                {/* Toast */}
                {actionMsg && (
                    <div style={{
                        ...styles.toast,
                        background: actionMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
                        color: actionMsg.startsWith('Error') ? '#dc2626' : '#16a34a',
                        borderColor: actionMsg.startsWith('Error') ? '#fecaca' : '#bbf7d0'
                    }}>
                        {actionMsg}
                    </div>
                )}

                {/* Tabs */}
                <div style={styles.tabBar}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={tab === t.id ? { ...styles.tabBtn, ...styles.tabBtnActive } : styles.tabBtn}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={styles.card}>
                    {tab === 'overview' && <OverviewTab totals={totals} totalUsers={totalUsers} referralLogs={referralLogs} affiliateApplications={affiliateApplications} />}
                    {tab === 'users' && <UsersTab users={users} loading={usersLoading} />}
                    {tab === 'affiliates' && <AffiliatesTab applications={affiliateApplications} onAction={handleAffiliateAction} />}
                    {tab === 'referrals' && <ReferralsTab logs={referralLogs} />}
                    {tab === 'payouts' && <PayoutsTab summary={payoutSummary} />}
                </div>
            </main>
        </div>
    );
}

// ==================== OVERVIEW TAB ====================
function OverviewTab({ totals, totalUsers, referralLogs, affiliateApplications }) {
    const recentReferrals = (referralLogs || []).slice(0, 5);
    const pendingApps = (affiliateApplications || []).filter(a => a.status === 'pending');

    return (
        <div>
            {/* KPI Cards */}
            <div style={styles.kpiGrid}>
                <KPICard label="Total Users" value={totalUsers || 0} emoji="👥" color="#3b82f6" />
                <KPICard label="Total Referrals" value={totals.totalReferrals} emoji="🔗" color="#8b5cf6" />
                <KPICard label="Converted" value={totals.totalConverted} emoji="✅" color="#16a34a" />
                <KPICard label="Pending" value={totals.totalPending} emoji="⏳" color="#f59e0b" />
                <KPICard label="Affiliate Apps" value={totals.totalAffiliateApps} emoji="📋" color="#ec4899" />
                <KPICard label="Pending Approval" value={totals.pendingAffiliates || 0} emoji="🔔" color="#ef4444" />
            </div>

            {/* Quick Glance Sections */}
            <div style={styles.twoCol}>
                <div>
                    <h3 style={styles.sectionTitle}>🔔 Pending Affiliate Applications ({pendingApps.length})</h3>
                    {pendingApps.length === 0 ? (
                        <p style={styles.emptyText}>No pending applications</p>
                    ) : (
                        pendingApps.slice(0, 3).map(app => (
                            <div key={app.id} style={styles.quickCard}>
                                <strong>{app.name}</strong>
                                <span style={styles.quickMeta}>{app.email} · {app.primary_platform}</span>
                            </div>
                        ))
                    )}
                </div>
                <div>
                    <h3 style={styles.sectionTitle}>🕐 Recent Referrals</h3>
                    {recentReferrals.length === 0 ? (
                        <p style={styles.emptyText}>No referrals yet</p>
                    ) : (
                        recentReferrals.map((log, i) => (
                            <div key={log.id || i} style={styles.quickCard}>
                                <strong>{log.referrer_email || 'Unknown'}</strong>
                                <span style={styles.quickMeta}>→ {log.referred_email || 'Unknown'} · {formatDate(log.created_at)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== USERS TAB ====================
function UsersTab({ users, loading }) {
    if (loading) return <div style={styles.emptyState}><div style={styles.spinner}></div> Loading users...</div>;
    if (!users) return <div style={styles.emptyState}>No user data available.</div>;

    const columns = [
        { key: 'created_at', label: 'Joined', render: u => formatDate(u.created_at) },
        { key: 'email', label: 'Email', render: u => <strong>{u.email || '—'}</strong> },
        { key: 'display_name', label: 'Name' },
        {
            key: 'subscription_tier', label: 'Tier', render: u => (
                <span style={{
                    ...styles.badge,
                    background: u.subscription_tier === 'pro' ? '#dbeafe' : '#f3f4f6',
                    color: u.subscription_tier === 'pro' ? '#1d4ed8' : '#6b7280'
                }}>
                    {u.subscription_tier || 'free'}
                </span>
            )
        },
        { key: 'credits', label: 'Credits' },
        { key: 'referral_code', label: 'Referral Code', render: u => <code style={styles.code}>{u.referral_code || '—'}</code> }
    ];

    return <SortableTable columns={columns} data={users} defaultSortStr="created_at" />;
}

// ==================== AFFILIATES TAB ====================
function AffiliatesTab({ applications, onAction }) {
    if (!applications || applications.length === 0) {
        return <div style={styles.emptyState}>No affiliate applications yet.</div>;
    }

    const columns = [
        { key: 'created_at', label: 'Date', render: app => formatDate(app.created_at) },
        { key: 'name', label: 'Name', render: app => <strong>{app.name}</strong> },
        { key: 'email', label: 'Email' },
        { key: 'primary_platform', label: 'Platform' },
        { key: 'audience_size', label: 'Audience' },
        { key: 'payout_preference', label: 'Payout' },
        { key: 'status', label: 'Status', render: app => <StatusBadge status={app.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, render: app => (
                app.status === 'pending' ? (
                    <div style={styles.actionBtns}>
                        <button onClick={() => onAction(app.id, 'approve')} style={styles.approveBtn}>✓ Approve</button>
                        <button onClick={() => onAction(app.id, 'reject')} style={styles.rejectBtn}>✗ Reject</button>
                    </div>
                ) : <span style={styles.tdMuted}>—</span>
            )
        }
    ];

    return <SortableTable columns={columns} data={applications} defaultSortStr="created_at" />;
}

// ==================== REFERRALS TAB ====================
function ReferralsTab({ logs }) {
    if (!logs || logs.length === 0) {
        return <div style={styles.emptyState}>No referrals yet.</div>;
    }

    const columns = [
        { key: 'created_at', label: 'Date', render: log => formatDate(log.created_at) },
        {
            key: 'referrer_email', label: 'Referrer', render: log => (
                <div>
                    <strong>{log.referrer_email || 'Unknown'}</strong>
                    <div style={styles.subText}>{log.referrer_name || ''}</div>
                </div>
            )
        },
        {
            key: 'referred_email', label: 'Referred User', render: log => (
                <div>
                    <strong>{log.referred_email || 'Unknown'}</strong>
                    <div style={styles.subText}>{log.referred_name || ''}</div>
                </div>
            )
        },
        { key: 'referrer_code', label: 'Code', render: log => <code style={styles.code}>{log.referrer_code || '—'}</code> },
        { key: 'status', label: 'Status', render: log => <StatusBadge status={log.status} /> }
    ];

    return <SortableTable columns={columns} data={logs} defaultSortStr="created_at" />;
}

// ==================== PAYOUTS TAB ====================
function PayoutsTab({ summary }) {
    if (!summary || summary.length === 0) {
        return <div style={styles.emptyState}>No payout data yet.</div>;
    }

    const columns = [
        { key: 'last_active', label: 'Last Active', render: row => formatDate(row.last_active) },
        {
            key: 'referrer_email', label: 'Referrer', render: row => (
                <div>
                    <strong>{row.referrer_email || 'Unknown'}</strong>
                    <div style={styles.subText}>{row.referrer_name || ''}</div>
                </div>
            )
        },
        { key: 'referral_code', label: 'Code', render: row => <code style={styles.code}>{row.referral_code || '—'}</code> },
        { key: 'total_referrals', label: 'Total Referrals', headerStyle: { fontWeight: 700 } },
        { key: 'converted', label: 'Converted', style: { color: '#16a34a', fontWeight: 600 } },
        { key: 'pending', label: 'Pending', style: { color: '#f59e0b', fontWeight: 600 } },
        { key: 'credits', label: 'Credits', render: row => <span style={{ ...styles.badge, background: '#dbeafe', color: '#1d4ed8' }}>{row.credits}</span> }
    ];

    return (
        <div>
            <div style={styles.payoutInfo}>
                💡 <strong>How payouts work:</strong> When an affiliate's referred user upgrades to Pro,
                the referral converts. You pay the affiliate their commission (30% of subscription revenue)
                via their preferred method (PayPal, Venmo, etc. from their application).
            </div>
            <SortableTable columns={columns} data={summary} defaultSortStr="last_active" />
        </div>
    );
}

// ==================== SHARED COMPONENTS ====================
function KPICard({ label, value, emoji, color }) {
    return (
        <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIcon, background: `${color}15`, color }}>{emoji}</div>
            <div style={styles.kpiValue}>{value}</div>
            <div style={styles.kpiLabel}>{label}</div>
        </div>
    );
}

function StatusBadge({ status }) {
    const colors = {
        pending: { bg: '#fef3c7', color: '#b45309' },
        converted: { bg: '#dcfce7', color: '#15803d' },
        approved: { bg: '#dcfce7', color: '#15803d' },
        rejected: { bg: '#fee2e2', color: '#dc2626' },
    };
    const c = colors[status] || colors.pending;
    return (
        <span style={{ ...styles.badge, background: c.bg, color: c.color }}>
            {status || 'pending'}
        </span>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });
}

// ==================== STYLES ====================
const styles = {
    page: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" },
    main: { maxWidth: 1200, margin: '0 auto', padding: '24px 16px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    adminBadge: { background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700 },
    tabBar: { display: 'flex', gap: 4, background: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 24, overflowX: 'auto' },
    tabBtn: { flex: 1, padding: '12px 16px', border: 'none', borderRadius: 8, background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' },
    tabBtnActive: { background: '#fff', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    toast: { padding: '12px 20px', borderRadius: 12, border: '1px solid', marginBottom: 16, fontWeight: 600, fontSize: 14 },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
    spinner: { width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    loadingText: { marginTop: 16, color: '#64748b', fontSize: 16 },
    errorIcon: { fontSize: 48, marginBottom: 16 },
    errorTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
    errorMsg: { color: '#64748b', marginBottom: 16 },
    backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
    emptyState: { padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 16 },
    emptyText: { color: '#94a3b8', fontSize: 14, padding: '12px 0' },

    // KPI
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 },
    kpiCard: { background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', textAlign: 'center' },
    kpiIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 },
    kpiValue: { fontSize: 32, fontWeight: 800, color: '#0f172a' },
    kpiLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },

    // Two column layout
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 },
    quickCard: { padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, border: '1px solid #e2e8f0' },
    quickMeta: { display: 'block', fontSize: 12, color: '#64748b', marginTop: 4 },

    // Search
    searchBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    searchInput: { flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', transition: 'border 0.2s', background: '#f8fafc' },
    searchCount: { color: '#64748b', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },

    // Table
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', verticalAlign: 'top' },
    tdMuted: { padding: '12px 16px', color: '#94a3b8', fontSize: 13 },
    subText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' },
    code: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' },

    // Action buttons
    actionBtns: { display: 'flex', gap: 8 },
    approveBtn: { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' },
    rejectBtn: { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' },

    // Payout info
    payoutInfo: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: '#1e40af', fontSize: 14, lineHeight: 1.6 },
};
