import React, { useState } from 'react';

export default function DateRangeFilter({ onFilterChange }) {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const applyRange = (start, end) => {
        const newRange = { start, end };
        setDateRange(newRange);
        onFilterChange(newRange);
    };

    const handlePreset = (preset) => {
        const today = new Date();
        let start = '';
        let end = '';

        const formatDate = (d) => d.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                start = formatDate(today);
                end = formatDate(today);
                break;
            case 'yesterday':
                const y = new Date(today);
                y.setDate(y.getDate() - 1);
                start = formatDate(y);
                end = formatDate(y);
                break;
            case 'thisMonth':
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                start = formatDate(thisMonthStart);
                end = formatDate(today);
                break;
            case 'lastMonth':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                start = formatDate(lastMonthStart);
                end = formatDate(lastMonthEnd);
                break;
            case 'last3Months':
                const l3m = new Date(today);
                l3m.setMonth(l3m.getMonth() - 3);
                start = formatDate(l3m);
                end = formatDate(today);
                break;
            case 'last6Months':
                const l6m = new Date(today);
                l6m.setMonth(l6m.getMonth() - 6);
                start = formatDate(l6m);
                end = formatDate(today);
                break;
            case 'thisYear':
                const thisYearStart = new Date(today.getFullYear(), 0, 1);
                start = formatDate(thisYearStart);
                end = formatDate(today);
                break;
            case 'allTime':
                start = '';
                end = '';
                break;
            default:
                break;
        }
        applyRange(start, end);
    };

    return (
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Date Range:</span>
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => applyRange(e.target.value, dateRange.end)}
                    style={{ padding: '6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ color: '#94a3b8' }}>to</span>
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => applyRange(dateRange.start, e.target.value)}
                    style={{ padding: '6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                    { label: 'Today', val: 'today' },
                    { label: 'This Month', val: 'thisMonth' },
                    { label: 'Last Month', val: 'lastMonth' },
                    { label: 'Last 3 Months', val: 'last3Months' },
                    { label: 'Last 6 Months', val: 'last6Months' },
                    { label: 'This Year', val: 'thisYear' },
                    { label: 'All Time', val: 'allTime' },
                ].map((btn) => (
                    <button
                        key={btn.val}
                        onClick={() => handlePreset(btn.val)}
                        style={{
                            padding: '4px 10px',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.target.style.background = '#f1f5f9'}
                        onMouseOut={e => e.target.style.background = '#fff'}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
