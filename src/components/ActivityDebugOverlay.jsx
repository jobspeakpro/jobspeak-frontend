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
                setDebugData({
                    guestKey: localStorage.getItem('jsp_guest_userKey') || 'Not Set',
                    dashboardSummary: window.__JSP_DEBUG__.dashboardSummary,
                    progressSummary: window.__JSP_DEBUG__.progressSummary,
                    lastActivityStatus: window.__JSP_DEBUG__.lastActivityStatus,
                    lastActivityTime: window.__JSP_DEBUG__.lastActivityTime
                });
            }, 500);

            return () => clearInterval(interval);
        }
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded-lg shadow-2xl font-mono text-xs max-w-sm border border-green-500/30 backdrop-blur-sm pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-2 border-b border-white/20 pb-1">
                <h3 className="font-bold text-green-400">🕵️ AG Frontend Debug</h3>
                <span className="bg-red-900/50 text-red-200 px-1 rounded text-[10px]">DEBUG=1</span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Identity (Guest Key):</span>
                    <span className="font-bold truncate max-w-[120px]" title={debugData.guestKey}>
                        {debugData.guestKey}
                    </span>
                </div>

                <div className="border-t border-white/10 pt-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Activity Tracking</div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Last Status:</span>
                        <span className={`font-bold ${debugData.lastActivityStatus === 'success' ? 'text-green-400' :
                                debugData.lastActivityStatus === 'error' ? 'text-red-400' : 'text-gray-500'
                            }`}>
                            {debugData.lastActivityStatus || 'None'}
                        </span>
                    </div>
                    {debugData.lastActivityTime && (
                        <div className="text-[10px] text-right text-gray-500">
                            {new Date(debugData.lastActivityTime).toLocaleTimeString()}
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 pt-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">API Responses</div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Dashboard (Recent):</span>
                        <span className="font-bold text-blue-300">
                            {debugData.dashboardSummary?.count ?? '-'}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Progress (Events):</span>
                        <span className="font-bold text-purple-300">
                            {debugData.progressSummary?.count ?? '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
