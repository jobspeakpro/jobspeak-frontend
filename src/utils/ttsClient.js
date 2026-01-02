// src/utils/ttsClient.js

// Global helper to stop all TTS playback (both server audio and browser speech)
export function stopAllTTS() {
    try {
        window.speechSynthesis?.cancel();
    } catch (e) {
        // Ignore errors
    }
    try {
        if (window.__jsp_audio) {
            window.__jsp_audio.pause();
            window.__jsp_audio.currentTime = 0;
        }
    } catch (e) {
        // Ignore errors
    }
}

export async function requestServerTTS({ text, voiceId, speed = 1 }) {
    const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId, speed }),
    });

    // Always try to parse JSON, even on non-200
    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        return { ok: false, mode: "server", error: "bad_json" };
    }

    if (!res.ok || !data?.ok) {
        return { ok: false, mode: "server", error: data?.error || data?.reason || "server_failed", raw: data };
    }

    // Backend may return either { audioBase64 } or { audioUrl } — support both.
    return {
        ok: true,
        mode: "server",
        audioBase64: data.audioBase64 || null,
        audioUrl: data.audioUrl || null,
    };
}

export function speakBrowserTTS({ text, preferredVoiceName = null, rate = 1, pitch = 1 }) {
    return new Promise((resolve) => {
        if (!("speechSynthesis" in window)) {
            resolve({ ok: false, mode: "browser", error: "speechSynthesis_unavailable" });
            return;
        }

        const synth = window.speechSynthesis;

        // Ensure voices are loaded
        let voices = synth.getVoices();

        const pickVoice = () => {
            voices = synth.getVoices();
            if (!voices?.length) return null;

            if (preferredVoiceName) {
                const exact = voices.find((v) => v.name === preferredVoiceName);
                if (exact) return exact;
            }

            // Fall back to a reasonable English voice if available
            const en = voices.find((v) => (v.lang || "").toLowerCase().startsWith("en"));
            return en || voices[0];
        };

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = rate;
        utter.pitch = pitch;

        const voice = pickVoice();
        if (voice) utter.voice = voice;

        utter.onend = () => resolve({ ok: true, mode: "browser" });
        utter.onerror = () => resolve({ ok: false, mode: "browser", error: "utterance_error" });

        // Cancel any existing speech to avoid overlapping
        synth.cancel();
        synth.speak(utter);
    });
}

export function playAudioFromServer({ audioBase64, audioUrl }) {
    return new Promise((resolve) => {
        // CRITICAL: Stop all TTS before playing server audio
        stopAllTTS();

        const audio = new Audio();

        // Store in global reference for stopAllTTS to access
        window.__jsp_audio = audio;

        audio.onended = () => resolve({ ok: true, mode: "server" });
        audio.onerror = () => resolve({ ok: false, mode: "server", error: "audio_playback_failed" });

        if (audioUrl) {
            audio.src = audioUrl;
        } else if (audioBase64) {
            audio.src = `data:audio/mp3;base64,${audioBase64}`;
        } else {
            resolve({ ok: false, mode: "server", error: "missing_audio_payload" });
            return;
        }

        audio.play().then(
            () => { },
            () => resolve({ ok: false, mode: "server", error: "autoplay_blocked" })
        );
    });
}
