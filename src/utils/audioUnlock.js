// src/utils/audioUnlock.js
// Pre-unlock audio playback so TTS auto-play works without user gesture prompts.
// Call unlockAudio() inside any click handler BEFORE navigating to a page that needs auto-play.

let audioContext = null;
let unlocked = false;

/**
 * Call this inside a click/tap handler to permanently unlock audio for the tab.
 * Safe to call multiple times — only does work once.
 */
export function unlockAudio() {
    if (unlocked) return;

    try {
        // 1. Create and resume an AudioContext (unlocks Web Audio API)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // 2. Play a silent HTML5 Audio element (unlocks HTMLAudioElement.play())
        const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
        silent.volume = 0;
        silent.play().then(() => {
            silent.pause();
            silent.remove?.();
        }).catch(() => {
            // Ignore — best-effort
        });

        unlocked = true;
        console.log('[AudioUnlock] Audio unlocked for this tab');
    } catch (err) {
        console.warn('[AudioUnlock] Failed (non-fatal):', err.message);
    }
}

/**
 * Returns the shared AudioContext (creates one if needed).
 */
export function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Returns true if unlockAudio() was already called.
 */
export function isAudioUnlocked() {
    return unlocked;
}
