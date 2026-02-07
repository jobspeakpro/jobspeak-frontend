
import React from 'react';

export default function DevDebugBanner() {
    // Force visible for verification
    // if (!import.meta.env.DEV) return null;

    // Determine current API base (manual check logic similar to apiClient)
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
    const isRelative = API_BASE === "" || API_BASE.startsWith("/");

    return (
        <div className="fixed bottom-0 right-0 z-[9999] bg-black/80 text-white px-3 py-2 text-xs font-mono rounded-tl-lg pointer-events-auto opacity-75 hover:opacity-100 transition-opacity flex gap-4 items-center">
            <span>
                API: {isRelative ? "[Relative]" : API_BASE} |
                Build: {window.__BUILD_INFO__?.gitSha || 'unknown'} |
                Time: {window.__BUILD_INFO__?.buildTime?.split('T')[1]?.split('.')[0] || 'sw'}
            </span>
            <button
                onClick={() => {
                    if (!window.speechSynthesis) {
                        alert("No speech synthesis detected");
                        return;
                    }
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance("System Voice Test");
                    window.speechSynthesis.speak(u);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded"
            >
                Test Voice
            </button>
        </div>
    );
}
