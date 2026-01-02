import React, { useRef, useState, useEffect } from 'react';
import { fetchTtsBlobUrl, triggerBrowserFallback } from "../utils/ttsHelper";

// Local error toast component
const TTS_ERROR_TOAST = ({ onClose }) => (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200 pointer-events-auto">
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">volume_off</span>
            <div>
                <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Audio unavailable right now</p>
            </div>
            <button
                onClick={onClose}
                className="ml-auto text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200"
            >
                ✕
            </button>
        </div>
    </div>
);

/**
 * Isolated TTS Sample Button Component
 * Self-contained audio playback with no shared dependencies
 */
export default function TTSSampleButton({ text, voiceId, playbackRate, label }) {
    const audioRef = useRef(new Audio());
    const blobUrlRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [fallbackToast, setFallbackToast] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const audio = audioRef.current;
            audio.pause();
            audio.currentTime = 0;

            // Revoke blob URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, []);

    // Update playback rate when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate || 1.0;
        }
    }, [playbackRate]);

    // Auto-dismiss toast
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Auto-dismiss Fallback toast
    useEffect(() => {
        if (fallbackToast) {
            const timer = setTimeout(() => setFallbackToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [fallbackToast]);

    const handleClick = async () => {
        const audio = audioRef.current;
        const sampleText = text || 'This is a test of the selected voice and speed.';
        const speed = playbackRate || 1.0;

        // If currently playing, pause
        if (isPlaying) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        // Reset state
        setShowToast(false);
        setFallbackToast(false);
        setLoading(true);

        // Pause and reset audio
        audio.pause();
        audio.currentTime = 0;

        // Revoke old blob URL if exists
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }

        try {
            const { url, error } = await fetchTtsBlobUrl({
                text: sampleText,
                voiceId: voiceId,
                speed: speed
            });

            if (error || !url) {
                console.error('[TTSSampleButton] TTS request failed:', error);
                setLoading(false);

                // Fallback Attempt
                const fellBack = triggerBrowserFallback(sampleText, voiceId, speed);
                if (fellBack) {
                    setFallbackToast(true);
                } else {
                    setShowToast(true);
                }
                return;
            }

            // Create object URL (if not already handled by helper, but helper returns URL)
            blobUrlRef.current = url;

            // Set audio source
            audio.src = url;
            audio.playbackRate = speed;

            // Setup event handlers
            audio.onended = () => {
                setIsPlaying(false);
                // Revoke URL after playback completes to save memory
                // Note: might want to keep it if we want replay without fetch, but this is safer
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = null;
                }
            };

            audio.onerror = (e) => {
                console.error('[TTSSampleButton] Audio playback error:', e);
                setIsPlaying(false);
                setLoading(false);

                // Fallback on playback error
                const fellBack = triggerBrowserFallback(sampleText, voiceId, speed);
                if (fellBack) {
                    setFallbackToast(true);
                } else {
                    setShowToast(true);
                }
            };

            // Play audio
            await audio.play();
            setIsPlaying(true);

        } catch (err) {
            console.error('[TTSSampleButton] Error:', err);
            setLoading(false);

            // Fallback on catch
            const fellBack = triggerBrowserFallback(sampleText, voiceId, speed);
            if (fellBack) {
                setFallbackToast(true);
            } else {
                setShowToast(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-main dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors group"
            >
                {loading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin text-primary">progress_activity</span>
                ) : isPlaying ? (
                    <span className="material-symbols-outlined text-[18px] text-primary animate-pulse">volume_up</span>
                ) : (
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary">play_arrow</span>
                )}
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary">
                    {label || "Sample"}
                </span>
            </button>

            {/* Shared Error Toast */}
            {showToast && <TTS_ERROR_TOAST onClose={() => setShowToast(false)} />}

            {/* Fallback Toast */}
            {fallbackToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
                    Using browser voice fallback.
                </div>
            )}
        </>
    );
}
