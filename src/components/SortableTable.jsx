import React, { useState, useMemo } from 'react';

export default function SortableTable({
    columns,
    data,
    loading,
    emptyMessage = "No data available",
    defaultSortStr = "created_at"
}) {
    // Default to sorting by the first column's key if not specified, usually 'created_at' in desc
    const [sort, setSort] = useState({ key: defaultSortStr, direction: 'desc' });
    const [filter, setFilter] = useState('');

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const processedData = useMemo(() => {
        if (!data) return [];
        let items = [...data];

        // 1. Filter
        if (filter) {
            const lower = filter.toLowerCase();
            items = items.filter(item =>
                // Search across all values in the row object that are strings or numbers
                Object.values(item).some(val =>
                    val && String(val).toLowerCase().includes(lower)
                )
            );
        }

        // 2. Sort
        if (sort.key) {
            items.sort((a, b) => {
                const aVal = a[sort.key];
                const bVal = b[sort.key];

                if (aVal === bVal) return 0;

                // Handle dates
                if (new Date(aVal).toString() !== 'Invalid Date' && typeof aVal === 'string' && aVal.includes('-')) {
                    const dateA = new Date(aVal);
                    const dateB = new Date(bVal);
                    return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                // Handle numbers
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // Default string sort
                const sA = String(aVal || '').toLowerCase();
                const sB = String(bVal || '').toLowerCase();
                return sort.direction === 'asc' ? sA.localeCompare(sB) : sB.localeCompare(sA);
            });
        }

        return items;
    }, [data, filter, sort]);

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading data...
            </div>
        );
    }

    return (
        <div>
            {/* Filter Bar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: 14,
                        width: 200,
                        outline: 'none'
                    }}
                />
            </div>

            {processedData.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                    {filter ? 'No results match your search' : emptyMessage}
                </div>
            ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#fff' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {columns.map((col, i) => (
                                    <th
                                        key={col.key || i}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontWeight: 700,
                                            color: '#64748b',
                                            fontSize: 12,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            cursor: col.sortable !== false ? 'pointer' : 'default',
                                            whiteSpace: 'nowrap',
                                            userSelect: 'none',
                                            ...col.headerStyle
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {col.label}
                                            {sort.key === col.key && (
                                                <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((item, rowIdx) => (
                                <tr key={item.id || rowIdx} style={{ borderBottom: rowIdx === processedData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    {columns.map((col, colIdx) => (
                                        <td key={col.key || colIdx} style={{ padding: '12px 16px', verticalAlign: 'top', color: '#334155', ...col.style }}>
                                            {col.render ? col.render(item) : (item[col.key] || '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>
                Showing {processedData.length} records
            </div>
        </div>
    );
}
