import React, { useState, useEffect } from 'react';

// Debug overlay to verify activity tracking without DevTools
// Only renders when ?debug=1 is in the URL
import { apiClient } from '../utils/apiClient';

// Debug overlay to verify activity tracking without DevTools
// Only renders when ?debug=1 is in the URL
export default function ActivityDebugOverlay() {
    const [visible, setVisible] = useState(false);
    const [debugData, setDebugData] = useState({
        guestKey: '',
        apiBase: '',
        dashboardSummary: null,
        progressSummary: null,
        lastActivityStatus: null,
        lastActivityTime: null,
        backendCommit: null,
        lastRequestUrl: null,
        lastRequestStatus: null,
        seedStatus: null
    });

    // Actions
    const handleSeedActivity = async () => {
        try {
            await apiClient('/api/activity/debug-seed', {
                method: 'POST',
            });
            // apiClient debug instrumentation will capture the status
            // Force a refresh after a short delay
            setTimeout(handleRefresh, 500);
        } catch (err) {
            console.error("Seed failed", err);
        }
    };

    const handleRefresh = () => {
        // Reload page to force re-fetch of dashboard/progress
        // Or we could trigger re-fetch if we had context, but page reload is safer for "hard facts"
        window.location.reload();
    };

    useEffect(() => {
        // Check if debug mode is enabled
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('debug') === '1') {
            setVisible(true);

            // Initialize debug data object if not exists
            if (!window.__JSP_DEBUG__) {
                window.__JSP_DEBUG__ = {
                    dashboardSummary: null,
                    progressSummary: null,
                    lastActivityStatus: null,
                    lastActivityTime: null,
                    logs: []
                };
            }

            // Start polling for data updates
            const interval = setInterval(() => {
                const debugData = window.__JSP_DEBUG__ || {};
                const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;

                setDebugData({
                    guestKey: localStorage.getItem('jsp_guest_userKey') || 'Not Set',
                    apiBase: apiBase,
                    dashboardSummary: debugData.dashboardSummary,
                    progressSummary: debugData.progressSummary,
                    lastActivityStatus: debugData.lastActivityStatus,
                    lastActivityTime: debugData.lastActivityTime,
                    backendCommit: debugData.lastRequest?.backendCommit,
                    lastRequestUrl: debugData.lastRequest?.url,
                    lastRequestStatus: debugData.lastRequest?.status,
                    lastResponseIdentity: debugData.lastRequest?.identityKey
                });
            }, 500);

            return () => clearInterval(interval);
        }
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white p-4 rounded-lg shadow-2xl font-mono text-[10px] leading-tight max-w-md border border-green-500/30 backdrop-blur-sm opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-2 border-b border-white/20 pb-1">
                <h3 className="font-bold text-green-400">🕵️ AG Frontend Debug</h3>
                <span className="bg-red-900/50 text-red-200 px-1 rounded text-[10px]">DEBUG=1</span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Identity:</span>
                    <span className="font-bold text-yellow-300 truncate max-w-[150px]" title={debugData.guestKey}>
                        {debugData.guestKey}
                    </span>
                </div>

                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">API Base:</span>
                    <span className="font-bold text-gray-300 truncate max-w-[150px]" title={debugData.apiBase}>
                        {debugData.apiBase || 'Same Origin'}
                    </span>
                </div>

                <div className="border-t border-white/10 pt-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Backend Commit:</span>
                        <span className="font-bold text-cyan-300">
                            {debugData.backendCommit || 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-1">
                    <div className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Last Request</div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 truncate max-w-[200px]" title={debugData.lastRequestUrl}>{debugData.lastRequestUrl ? new URL(debugData.lastRequestUrl).pathname : '-'}</span>
                            <span className={debugData.lastRequestStatus === 200 ? 'text-green-400' : 'text-red-400'}>{debugData.lastRequestStatus || '-'}</span>
                        </div>
                        <div className="flex justify-between gap-2 border-t border-white/5 pt-0.5 mt-0.5">
                            <span className="text-[8px] text-gray-500">Backend ID:</span>
                            <span className="text-[8px] text-gray-400 font-mono truncate max-w-[150px]">{debugData.lastResponseIdentity || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-1">
                    <div className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Counts</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Dashboard:</span>
                            <span className="font-bold text-blue-300">{debugData.dashboardSummary?.count ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Progress:</span>
                            <span className="font-bold text-purple-300">{debugData.progressSummary?.count ?? '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-2 flex gap-2">
                    <button
                        onClick={handleSeedActivity}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-2 py-1.5 rounded font-bold transition-colors text-center"
                    >
                        🌱 Seed Data
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-2 py-1.5 rounded font-bold transition-colors text-center"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}
