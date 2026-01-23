import React, { useState, useEffect } from 'react';

// Debug overlay to verify activity tracking without DevTools
// Only renders when ?debug=1 is in the URL
export default function ActivityDebugOverlay() {
    const [visible, setVisible] = useState(false);
    const [debugData, setDebugData] = useState({
        guestKey: '',
        dashboardSummary: null,
        progressSummary: null,
        lastActivityStatus: null,
        lastActivityTime: null
    });

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
                setDebugData({
                    guestKey: localStorage.getItem('jsp_guest_userKey') || 'Not Set',
                    dashboardSummary: debugData.dashboardSummary,
                    progressSummary: debugData.progressSummary,
                    lastActivityStatus: debugData.lastActivityStatus,
                    lastActivityTime: debugData.lastActivityTime,
                    backendCommit: debugData.lastRequest?.backendCommit,
                    lastRequestUrl: debugData.lastRequest?.url,
                    lastRequestStatus: debugData.lastRequest?.status
                });
            }, 500);

            return () => clearInterval(interval);
        }
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white p-4 rounded-lg shadow-2xl font-mono text-[10px] leading-tight max-w-md border border-green-500/30 backdrop-blur-sm pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
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
            </div>
        </div>
    );
}
