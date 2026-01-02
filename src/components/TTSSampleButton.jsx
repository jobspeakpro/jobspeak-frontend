import React, { useRef, useState, useEffect } from 'react';

/**
 * Isolated TTS Sample Button Component
 * Self-contained audio playback with no shared dependencies
 */
export default function TTSSampleButton({ text, voiceId, playbackRate }) {
    const audioRef = useRef(new Audio());
    const blobUrlRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

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

    const handleClick = async () => {
        const audio = audioRef.current;

        // If currently playing, pause
        if (isPlaying) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        // Reset state
        setError(null);
        setIsLoading(true);

        // Pause and reset audio
        audio.pause();
        audio.currentTime = 0;

        // Revoke old blob URL if exists
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }

        try {
            // Get API base URL (same pattern as answer submit)
            const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

            // Fetch TTS audio
            const response = await fetch(`${API_BASE}/api/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text || 'This is a test of the selected voice and speed.',
                    voiceId: voiceId || 'us_female_emma',
                    speed: playbackRate || 1.0
                }),
                credentials: 'include'
            });

            // Check response
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                console.error('[TTSSampleButton] TTS request failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    contentType: contentType
                });
                throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
            }

            // Read as blob
            const blob = await response.blob();

            // Create object URL
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;

            // Set audio source
            audio.src = url;
            audio.playbackRate = playbackRate || 1.0;

            // Setup event handlers
            audio.onended = () => {
                setIsPlaying(false);
                // Revoke URL after playback completes
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = null;
                }
            };

            audio.onerror = (e) => {
                console.error('[TTSSampleButton] Audio playback error:', e);
                setIsPlaying(false);
                setError('Audio playback failed');
            };

            // Play audio
            await audio.play();
            setIsPlaying(true);

        } catch (err) {
            console.error('[TTSSampleButton] Error:', err);
            setError(err.message || 'Failed to load audio');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleClick}
                disabled={isLoading || isPlaying}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isLoading ? 'hourglass_empty' : isPlaying ? 'pause' : 'play_arrow'}
                </span>
                {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play Sample'}
            </button>

            {error && (
                <div className="text-xs text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}
        </div>
    );
}
