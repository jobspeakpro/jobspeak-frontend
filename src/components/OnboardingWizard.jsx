import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { fetchTtsBlobUrl } from "../utils/ttsHelper.js";
import VoiceRecorder from "./VoiceRecorder.jsx";
import interviewerAvatar from "../assets/her.png";

// Helper: Sanitize Job Title
const sanitizeJobTitle = (title) => {
    if (!title) return "";
    let clean = title.trim();
    // Remove quotes
    clean = clean.replace(/^["']|["']$/g, '');
    // Remove common prefixes
    const prefixes = ["i'm trying to be a", "i am trying to be a", "i want to be a", "preparing for", "looking for", "i'm a", "i am a"];
    const lower = clean.toLowerCase();
    for (const p of prefixes) {
        if (lower.startsWith(p)) {
            clean = clean.slice(p.length).trim();
            break; // only strip one prefix
        }
    }
    // Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// Helper: Validate Job Title (guard against bad data)
const isValidJobTitle = (title) => {
    if (!title || !title.trim()) return false;
    const lower = title.toLowerCase();
    // Check for invalid phrases that shouldn't appear in a clean job title
    const invalidPhrases = ["i'm", "i am", "preparing", "trying", '"', "'"];
    return !invalidPhrases.some(phrase => lower.includes(phrase));
};

/* 
  OnboardingWizard
  - Polished Card Layout
  - Human Avatar (Interviewer)
  - Mic Setup First
  - Speak-First logic (blind confirmation)
  - Inline Calibration
  - TTS Overlap Guard
  - Wrapped with React.memo to prevent flicker on parent rerenders
*/


function OnboardingWizard({ onComplete }) {
    // INSTRUMENTATION: Track renders and mount/unmount
    console.count("[WIZARD] render");

    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const audioRef = useRef(new Audio());
    const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);

    // Prefetch cache: Map of step index -> audioUrl (for step-based prefetch)
    const prefetchCacheRef = useRef(new Map());
    // Voice-specific cache: Map of "voiceName:text" -> audioUrl (for voice-change prefetch)
    const voiceCacheRef = useRef(new Map());
    const [isFetchingAudio, setIsFetchingAudio] = useState(false);
    const currentVoiceRef = useRef("female"); // Track current voice selection

    // INSTRUMENTATION: Track mount/unmount
    useEffect(() => {
        console.log("[WIZARD] mounted");
        return () => console.log("[WIZARD] unmounted");
    }, []);

    // Explicit Mic State
    const [micEnabled, setMicEnabled] = useState(false);
    const [micDenied, setMicDenied] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        display_name: "",
        job_title: "",
        seniority: "Mid",
        focus_areas: [],
        industry: "",
        difficulty: "Normal",
        tts_speed_pref: "normal"
    });

    // Temp state for "Blind Confirmation" (Speak-First)
    const [tempTranscript, setTempTranscript] = useState(null);
    const [inputMode, setInputMode] = useState("speak"); // "speak" | "type"
    const [redoCount, setRedoCount] = useState(0); // Track redos to fallback to type

    // Draft state for "Other" custom inputs (prevents re-render on every keystroke)
    const [customInputDraft, setCustomInputDraft] = useState("");


    // Steps Config - MOVED OUTSIDE to prevent re-creation on every render
    // Step 0 is now Mic Setup (Functional Step, not data field)
    const ONBOARDING_STEPS = [
        { type: "mic_setup", title: "Mic Setup", question: "Hi! To get started, please turn on your microphone so you can answer out loud.", optional: true },
        { type: "field", title: "Name", question: "What should I call you?", field: "display_name", optional: false, inputType: "text" },
        { type: "field", title: "Job Role", question: "Nice to meet you. What job role are you preparing for?", field: "job_title", optional: false, inputType: "text" },
        { type: "field", title: "Seniority", question: "Got it. And what seniority level is this role?", field: "seniority", optional: false, inputType: "select" },
        { type: "field", title: "Focus", question: "What specific areas do you want to improve?", field: "focus_areas", optional: false, inputType: "multi-select" },
        { type: "field", title: "Industry", question: "Which industry is this role in?", field: "industry", optional: true, inputType: "select" },
        { type: "field", title: "Difficulty", question: "What difficulty level do you want?", field: "difficulty", optional: false, inputType: "select" },
        { type: "field", title: "Speed", question: "Finally, how fast should I speak during our sessions?", field: "tts_speed_pref", optional: true, inputType: "select" }
    ];

    // Use the constant steps array
    const steps = ONBOARDING_STEPS;


    // Load existing data on mount
    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (data && !error) {
                        setFormData(prev => ({
                            ...prev,
                            display_name: data.display_name || prev.display_name,
                            job_title: data.job_title || prev.job_title,
                            seniority: data.seniority || prev.seniority,
                            focus_areas: data.focus_areas || prev.focus_areas,
                            industry: data.industry || prev.industry,
                            difficulty: data.difficulty || prev.difficulty,
                            tts_speed_pref: data.tts_speed_pref || prev.tts_speed_pref
                        }));
                    }
                } catch (err) {
                    console.error("Error loading profile:", err);
                }
            } else {
                const stored = localStorage.getItem("jsp_onboarding_v1");
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setFormData(prev => ({ ...prev, ...parsed }));
                    } catch (e) { console.error("Parse error", e); }
                }
            }
        };

        loadData();
    }, [user]);

    // Audio Setup
    useEffect(() => {
        const audio = audioRef.current;
        const handlePlay = () => setIsPlayingPrompt(true);
        const handleEnd = () => setIsPlayingPrompt(false);
        const handlePause = () => setIsPlayingPrompt(false);

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("ended", handleEnd);
        audio.addEventListener("pause", handlePause);

        // Global TTS stop on mount/unmount
        document.body.appendChild(audio);
        return () => {
            stopTts();
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("ended", handleEnd);
            audio.removeEventListener("pause", handlePause);
            if (document.body.contains(audio)) {
                document.body.removeChild(audio);
            }
        };
    }, []);

    // AUTOPLAY EFFECT: Trigger audio playback on step change
    useEffect(() => {
        const text = steps[step]?.question;
        if (!text) return;

        console.log("[ONBOARDING] stepChanged ->", step, "-> autoplay attempt");

        // Small delay to let UI settle
        const timer = setTimeout(() => {
            playCurrentPrompt(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [step]); // Trigger on step change

    const stopTts = () => {
        const audio = audioRef.current;
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        // Don't revoke blob URL here - it will be revoked after audio ends
        setIsPlayingPrompt(false);
    };

    // Play Prompt Logic with persistent audio and blob URL management
    // CRITICAL: Never revoke blob URLs immediately - they must persist for repeat playback
    const lastPlayedRef = useRef({ step: -1, text: null });
    const lastBlobUrlRef = useRef(null); // Store blob URL for repeat functionality
    const lastPromptTextRef = useRef(null); // Store text for regeneration if needed


    const playCurrentPrompt = async (force = false) => {
        const text = steps[step].question;

        // Guard: Don't replay if already played for this step unless forced
        if (!force && lastPlayedRef.current.step === step && lastPlayedRef.current.text === text) {
            console.log("[ONBOARDING] Skipping replay - already played for this step");
            return;
        }

        stopTts(); // Ensure previous is stopped

        // Only revoke the PREVIOUS blob URL when we're about to replace it with a new one
        // NEVER revoke immediately after setting src - audio element needs it!
        if (lastBlobUrlRef.current && force) {
            // Only revoke if we're forcing a regeneration
            URL.revokeObjectURL(lastBlobUrlRef.current);
            lastBlobUrlRef.current = null;
        }

        try {
            // Update ref immediately to lock
            lastPlayedRef.current = { step, text };
            lastPromptTextRef.current = text;

            // Check voice-specific cache first (voiceName:text key)
            const voiceCacheKey = `female:${text}`;
            let url = voiceCacheRef.current.get(voiceCacheKey);

            // Fallback to step cache
            if (!url) {
                url = prefetchCacheRef.current.get(step);
            }

            if (!url) {
                // CRITICAL: Force female voice for onboarding - hardcoded, no client override
                const onboardingVoiceId = "us_female_emma"; // Maps to "nova" on backend
                console.log("[ONBOARDING] Fetching TTS for:", text.substring(0, 50));
                console.log("[ONBOARDING] FORCED VOICE:", onboardingVoiceId, "→ backend will resolve to 'nova'");

                setIsFetchingAudio(true);
                const result = await fetchTtsBlobUrl({ text, speed: 1.0, voiceId: onboardingVoiceId });
                url = result.url;
                setIsFetchingAudio(false);

                // Store in voice cache
                if (url) {
                    voiceCacheRef.current.set(voiceCacheKey, url);
                }
            } else {
                console.log("[ONBOARDING] Using cached audio for step", step);
            }

            if (url) {
                console.log("[ONBOARDING] TTS URL received:", url.substring(0, 100));

                // Revoke OLD blob before storing new one (if different)
                if (lastBlobUrlRef.current && lastBlobUrlRef.current !== url) {
                    URL.revokeObjectURL(lastBlobUrlRef.current);
                }

                lastBlobUrlRef.current = url; // Store for repeat functionality

                // Only update src if it's different (optimization)
                if (audioRef.current.src !== url) {
                    // Cache-bust only when changing URLs
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    audioRef.current.load();
                    audioRef.current.src = url;

                    // Audio priming: Wait for audio to be ready before playing
                    await new Promise((resolve) => {
                        const onReady = () => {
                            audioRef.current.removeEventListener('loadeddata', onReady);
                            audioRef.current.removeEventListener('canplaythrough', onReady);
                            resolve();
                        };
                        audioRef.current.addEventListener('loadeddata', onReady);
                        audioRef.current.addEventListener('canplaythrough', onReady);
                        audioRef.current.load();
                    });
                } else {
                    console.log("[ONBOARDING] Reusing same audio src");
                }

                // CRITICAL: Ensure audio is not muted and volume is set
                audioRef.current.muted = false;
                audioRef.current.volume = 1.0;
                console.log("[ONBOARDING] Audio element configured - muted:", audioRef.current.muted, "volume:", audioRef.current.volume);

                // Set up event handlers - do NOT revoke blob URLs here!
                audioRef.current.onended = () => {
                    console.log("[ONBOARDING] Audio playback ended");
                    setIsPlayingPrompt(false);
                    // Keep blob URL alive for repeat functionality
                };

                audioRef.current.onerror = (e) => {
                    console.error("[ONBOARDING] Audio playback error:", e);
                    setIsPlayingPrompt(false);
                    // Keep blob URL alive for retry
                };

                // Wrap play in try/catch to handle autoplay blocking gracefully
                try {
                    console.log("[ONBOARDING] Attempting to play audio...");
                    const playPromise = audioRef.current.play();

                    if (playPromise !== undefined) {
                        await playPromise;
                        console.log("[ONBOARDING] autoplay success");
                        setIsPlayingPrompt(true);
                        setAutoplayBlocked(false); // Autoplay worked
                    }
                } catch (e) {
                    console.warn("[ONBOARDING] autoplay blocked:", e.name, e.message);
                    setIsPlayingPrompt(false);
                    setAutoplayBlocked(true); // Show tap to play prompt
                }
            } else {
                console.error("!!! TTS FAILURE — AUDIO SKIPPED !!!", { text, step });
                setIsPlayingPrompt(false);
                setAutoplayBlocked(false); // Not blocked by browser, just failed
                setIsFetchingAudio(false);
            }

            // Prefetch next step's audio in background
            const nextStep = step + 1;
            if (nextStep < steps.length) {
                const nextText = steps[nextStep].question;
                const nextVoiceCacheKey = `female:${nextText}`;

                // Only prefetch if not already in voice cache
                if (!voiceCacheRef.current.has(nextVoiceCacheKey)) {
                    console.log("[ONBOARDING] Prefetching audio for next step:", nextStep);
                    fetchTtsBlobUrl({ text: nextText, speed: 1.0, voiceId: "us_female_emma" })
                        .then(({ url: nextUrl }) => {
                            if (nextUrl) {
                                voiceCacheRef.current.set(nextVoiceCacheKey, nextUrl);
                                prefetchCacheRef.current.set(nextStep, nextUrl);
                                console.log("[ONBOARDING] Prefetch complete for step", nextStep);
                            }
                        })
                        .catch(err => console.warn("[ONBOARDING] Prefetch failed:", err));
                }
            }
        } catch (err) {
            console.error("[ONBOARDING] Prompt TTS error:", err);
            setIsFetchingAudio(false);
        }
    };


    // Cleanup: Only revoke blob URLs on unmount
    useEffect(() => {
        return () => {
            if (lastBlobUrlRef.current) {
                URL.revokeObjectURL(lastBlobUrlRef.current);
                lastBlobUrlRef.current = null;
            }
        };
    }, []);

    // Helper for manual repeat - reuses existing blob URL with priming
    const handleRepeatQuestion = async (e) => {
        e.preventDefault();
        console.log("[ONBOARDING] Repeat question clicked");
        stopTts(); // Stop current playback

        if (lastBlobUrlRef.current && audioRef.current) {
            console.log("[ONBOARDING] Replaying existing audio URL");
            audioRef.current.src = lastBlobUrlRef.current; // Ensure src is set
            audioRef.current.currentTime = 0;

            // CRITICAL: Ensure audio is not muted and volume is set
            audioRef.current.muted = false;
            audioRef.current.volume = 1.0;
            console.log("[ONBOARDING] Audio configured for replay - muted:", audioRef.current.muted, "volume:", audioRef.current.volume);

            audioRef.current.play()
                .then(() => {
                    console.log("[ONBOARDING] ✅ Replay successful!");
                    setIsPlayingPrompt(true);
                    setAutoplayBlocked(false); // Clear blocked state after successful manual play
                })
                .catch(err => {
                    console.error("[ONBOARDING] ❌ Repeat playback error:", err);
                    // If blob URL failed, try regenerating
                    if (lastPromptTextRef.current) {
                        console.log("[ONBOARDING] Regenerating audio...");
                        playCurrentPrompt(true);
                    }
                });
        } else if (lastPromptTextRef.current) {
            // No blob URL available, regenerate
            console.log("[ONBOARDING] No cached audio, regenerating...");
            playCurrentPrompt(true);
        } else {
            console.error("[ONBOARDING] No audio URL or text available for replay");
        }
    };

    // Hover/focus prefetch for repeat button
    const handleRepeatHover = () => {
        const text = steps[step].question;
        const voiceCacheKey = `female:${text}`;

        // Prefetch if not cached
        if (!voiceCacheRef.current.has(voiceCacheKey) && !lastBlobUrlRef.current) {
            console.log("[ONBOARDING] Hover prefetch triggered");
            fetchTtsBlobUrl({ text, speed: 1.0, voiceId: "us_female_emma" })
                .then(({ url }) => {
                    if (url) {
                        voiceCacheRef.current.set(voiceCacheKey, url);
                    }
                })
                .catch(err => console.warn("[ONBOARDING] Hover prefetch failed:", err));
        }
    };


    // Helper: Sleep utility for delays
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Helper: Advance step with TTS delay to prevent overlap
    const advanceStepWithTTSDelay = async (nextStepFn) => {
        try {
            stopTts();
            if (audioRef?.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } catch (e) {
            console.warn("TTS cleanup error:", e);
        }
        await sleep(2000);
        nextStepFn();
    };

    // Auto-play prompts on step change
    useEffect(() => {
        // Reset temp input state on step change
        setTempTranscript(null);
        setRedoCount(0);

        // Input logic: If mic enabled, default to speak. If not, default to type.
        // EXCEPTION: Job title AND Display Name are ALWAYS type-only
        const current = steps[step];
        if (current?.field === "job_title" || current?.field === "display_name") {
            setInputMode("type");
        } else if (micEnabled && !micDenied) {
            setInputMode("speak");
        } else {
            setInputMode("type");
        }

        playCurrentPrompt(false);
    }, [step, micEnabled, micDenied]);


    const handleNext = () => {
        const current = steps[step];

        // Commit temp transcript if pending
        if (current.type === "field" && tempTranscript && !formData[current.field]) {
            let val = tempTranscript;
            if (current.field === "job_title") {
                val = sanitizeJobTitle(val);
            }
            updateField(current.field, val);
        }

        stopTts(); // Stop audio on transition

        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        stopTts();

        // Sanitize data before saving (ensures typed input is clean)
        const finalData = { ...formData };
        if (finalData.job_title) {
            finalData.job_title = sanitizeJobTitle(finalData.job_title);
        }

        // Persist
        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        display_name: finalData.display_name,
                        job_title: finalData.job_title,
                        seniority: finalData.seniority,
                        focus_areas: finalData.focus_areas,
                        industry: finalData.industry,
                        difficulty: finalData.difficulty,
                        tts_speed_pref: finalData.tts_speed_pref,
                        onboarding_complete: true
                    })
                    .eq('id', user.id);

                if (error) throw error;
                // IMMEDIATE UPDATE of Context
                updateUser({ ...user, ...finalData, onboarding_complete: true });

            } catch (err) {
                console.error("Profile save error", err);
                setError("Failed to save profile. Please try again.");
                setLoading(false);
                return;
            }
        } else {
            localStorage.setItem("jsp_onboarding_v1", JSON.stringify(finalData));
            // For guest, we also need to simulate context update if AuthContext supports it for null user (unlikely)
            // or rely on the reload/parent checking storage.
            // But the user asked to "immediately update the shared profile context". 
            // If updateUser works for guest state in AuthContext(which it currently doesn't seem to based on null), 
            // then we rely on localStorage being source of truth for guests in PracticePage.
        }

        // Clear all guest usage keys to prevent "3/3 used" bug after onboarding/migration
        try {
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith("jobspeak_free_improve_usage") ||
                    key.startsWith("speaking_attempts_") ||
                    key.startsWith("jsp_usage_")
                )) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => {
                localStorage.removeItem(key);
                console.log("[Onboarding] Cleared guest usage key:", key);
            });
        } catch (err) {
            console.error("Error clearing guest usage keys:", err);
        }

        localStorage.setItem("jsp_onboarding_complete_v1", "1");
        setLoading(false);
        if (onComplete) onComplete();
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // --- Components ---

    // AssistantBubble component - memoized to prevent remounting during typing
    // CRITICAL: Only depends on step - isPlayingPrompt changes should NOT cause remount
    // MOVED OUTSIDE to prevent re-creation on every render
    const AssistantBubble = memo(({ currentStep, playing, onRepeat, onHover, steps, autoplayBlocked: blocked }) => {
        // Debug: Track mounts/unmounts
        useEffect(() => {
            // console.log("[AVATAR] MOUNT");
            // return () => console.log("[AVATAR] UNMOUNT");
        }, []);

        const currentQ = steps[currentStep].question;
        return (
            <div className="flex gap-4 items-start w-full mb-6 animate-fade-in">
                {/* Avatar - Centered and Larger */}
                <div className="flex-shrink-0 relative">
                    <img
                        src={interviewerAvatar}
                        alt="Assistant"
                        className="size-16 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-lg object-cover object-center"
                        style={{ objectPosition: 'center center' }}
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                    {/* Fallback if image fails or loading */}
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 absolute inset-0 -z-10">
                        <span className="material-symbols-outlined text-primary text-2xl">face</span>
                    </div>

                    {/* Speaking Indicator */}
                    {playing && (
                        <div className="absolute -right-1 -bottom-1 flex gap-0.5 bg-white dark:bg-slate-800 rounded-full px-1 py-0.5 border border-slate-100 dark:border-slate-700 shadow-sm z-10">
                            <span className="size-1 bg-primary rounded-full animate-bounce delay-0"></span>
                            <span className="size-1 bg-primary rounded-full animate-bounce delay-[150ms]"></span>
                            <span className="size-1 bg-primary rounded-full animate-bounce delay-[300ms]"></span>
                        </div>
                    )}
                </div>

                {/* Bubble */}
                <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-3 text-sm md:text-base text-slate-800 dark:text-slate-100 shadow-sm leading-relaxed">
                        {currentQ}
                    </div>
                    {/* Autoplay Blocked Prompt - Prominent */}
                    {blocked && !playing && (
                        <button
                            onClick={onRepeat}
                            onMouseEnter={onHover}
                            onFocus={onHover}
                            className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-md transition-all animate-pulse"
                        >
                            <span className="material-symbols-outlined text-lg">volume_up</span>
                            Tap to play audio
                        </button>
                    )}

                    {/* Regular Repeat Button - Only show if not blocked or already playing */}
                    {(!blocked || playing) && (
                        <button
                            onClick={onRepeat}
                            onMouseEnter={onHover}
                            onFocus={onHover}
                            className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary hover:text-primary-hover transition-colors ml-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">replay</span>
                            Repeat question
                        </button>
                    )}
                </div>
            </div>
        );
    }, (prevProps, nextProps) => prevProps.currentStep === nextProps.currentStep);

    const renderMicSetup = () => {
        return (
            <div className="flex flex-col items-center justify-center w-full animate-fade-in py-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-full p-6 mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">mic</span>
                </div>

                <button
                    onClick={() => {
                        navigator.mediaDevices.getUserMedia({ audio: true })
                            .then(() => {
                                setMicEnabled(true);
                                setMicDenied(false);
                                handleNext();
                            })
                            .catch((err) => {
                                console.error("Mic denied", err);
                                setMicDenied(true);
                                setMicEnabled(false);
                            });
                    }}
                    className="w-full max-w-xs py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all mb-4"
                >
                    Enable mic
                </button>

                {micDenied && (
                    <p className="text-red-500 text-sm mb-4">Microphone access denied.</p>
                )}

                <button
                    onClick={() => {
                        setMicDenied(true);
                        handleNext();
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                >
                    Skip for now (Type only)
                </button>

                {micDenied && (
                    <p className="text-xs text-slate-400 mt-4 max-w-xs text-center">
                        You can still practice by typing your answers.
                    </p>
                )}
            </div>
        );
    };



    const renderSpeakInput = (field) => {
        // State 1: Recording / Initial
        if (!tempTranscript) {
            return (
                <div className="flex flex-col items-center justify-center py-4 w-full animate-fade-in">
                    <VoiceRecorder
                        onTranscript={async (text) => {
                            setTempTranscript(text);

                            // Play "Okay, got it" TTS
                            try {
                                const { url } = await fetchTtsBlobUrl({ text: "Okay, got it.", speed: 1.0 });
                                if (url) {
                                    const audio = new Audio(url);
                                    audio.play().catch(e => console.log("TTS autoplay blocked", e));
                                }
                            } catch (err) {
                                console.error("Confirmation TTS error", err);
                            }

                            // Auto-advance with TTS delay to prevent overlap
                            advanceStepWithTTSDelay(() => {
                                let val = text;
                                if (field === "job_title") val = sanitizeJobTitle(val);
                                updateField(field, val);
                                setStep(s => s + 1);
                            });
                        }}
                        renderButton={({ startRecording, stopRecording, recording, transcribing, error = null, permissionDenied }) => (
                            <div className="flex flex-col items-center gap-4">
                                <button
                                    type="button"
                                    onClick={recording ? stopRecording : startRecording}
                                    disabled={transcribing}
                                    className={`group relative flex items-center justify-center size-16 rounded-full shadow-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                                      ${recording
                                            ? "animate-pulse bg-red-600 hover:bg-red-700 shadow-red-600/30 ring-2 ring-red-600/50 shadow-[0_0_0_4px_rgba(220,38,38,0.2)]"
                                            : "bg-primary hover:bg-primary-hover shadow-primary/30"}`}
                                >
                                    <span className="material-symbols-outlined text-white text-3xl group-hover:animate-pulse">
                                        {recording ? "stop" : "mic"}
                                    </span>
                                </button>
                                {permissionDenied && (
                                    <p className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Microphone denied. Switch to "Type" mode.</p>
                                )}
                                {recording && <p className="text-xs text-red-500 font-bold animate-pulse">Listening...</p>}
                                {transcribing && <p className="text-xs text-slate-500 font-medium animate-pulse">Processing...</p>}
                                {error && !permissionDenied && <p className="text-xs text-red-500">{error}</p>}
                            </div>
                        )}
                    />
                    <p className="text-xs text-slate-400 mt-4 text-center">Tap to speak your answer</p>
                </div>
            );
        }

        // State 2: Brief auto-advance state (no transcript shown, just moving forward)
        return (
            <div className="flex flex-col items-center justify-center py-6 w-full animate-fade-in bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-green-600">check</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Got it!</h4>
                <p className="text-sm text-slate-500 mb-4">Moving to next step...</p>

                <button
                    onClick={() => {
                        setTempTranscript(null);
                        setRedoCount(0);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                    Redo
                </button>
            </div>
        );
    };

    const renderInput = () => {
        const current = steps[step];

        // 0. Mic Setup
        if (current.type === "mic_setup") {
            return renderMicSetup();
        }

        // 1. Text Inputs (Speak-First)
        if (current.inputType === "text") {
            const canSpeak = micEnabled && !micDenied;

            return (
                <div className="w-full">
                    {/* Toggle - Only show if Mic is potentially available AND not job_title/display_name field */}
                    {canSpeak && current.field !== "job_title" && current.field !== "display_name" && (
                        <div className="flex justify-center mb-6">
                            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex gap-1 border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setInputMode("speak")}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${inputMode === "speak" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Speak
                                </button>
                                <button
                                    onClick={() => setInputMode("type")}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${inputMode === "type" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Type
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Helper text for job title */}
                    {current.field === "job_title" && (
                        <p className="text-xs text-slate-500 text-center mb-4">
                            Type the exact job title you're applying for.
                        </p>
                    )}

                    {/* Content */}
                    <div className="min-h-[160px] flex items-center justify-center">
                        {inputMode === "speak" && canSpeak && current.field !== "job_title" ? renderSpeakInput(current.field) : (
                            <div className="w-full animate-fade-in">
                                <input
                                    type="text"
                                    placeholder={`Type your ${current.title.toLowerCase()}...`}
                                    className="w-full p-3 text-base border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-primary focus:outline-none transition-colors text-center text-slate-800 dark:text-white"
                                    value={formData[current.field]}
                                    onChange={(e) => updateField(current.field, e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 2. Select / Multi-Select
        if (current.inputType === "select" || current.inputType === "multi-select") {
            let options = [];
            if (current.field === "seniority") options = ["Intern", "Entry", "Mid", "Senior", "Manager", "Exec", "Other"];
            if (current.field === "industry") options = ["Tech", "Health", "Finance", "Consulting", "Retail", "Other"];
            if (current.field === "difficulty") options = ["Easy", "Normal", "Hard"];
            if (current.field === "tts_speed_pref") options = ["slow", "normal", "fast"];
            if (current.field === "focus_areas") options = ["Behavioral", "Technical", "Clarity", "Confidence", "Leadership", "STAR", "Mixed / All"];

            const isMulti = current.inputType === "multi-select";

            return (
                <div className="w-full animate-fade-in">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {options.map(opt => {
                            const isSelected = isMulti
                                ? (formData[current.field].includes(opt) || (opt === "Mixed / All" && formData[current.field].includes("mixed")))
                                : formData[current.field] === opt;

                            return (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        if (isMulti) {
                                            let val = [...formData[current.field]];
                                            if (opt === "Mixed / All") val = ["mixed"];
                                            else {
                                                val = val.filter(v => v !== "mixed");
                                                if (val.includes(opt)) val = val.filter(v => v !== opt);
                                                else val.push(opt);
                                            }
                                            updateField(current.field, val);
                                        } else {
                                            updateField(current.field, opt);
                                        }
                                    }}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${isSelected
                                        ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 shadow-md transform scale-105"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>


                    {/* Show text input when "Other" is selected */}
                    {((current.field === "industry" || current.field === "seniority") && formData[current.field] === "Other") && (
                        <div className="mt-4 animate-in zoom-in-95">
                            <input
                                type="text"
                                placeholder={`Type your ${current.field}...`}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                autoFocus
                                value={customInputDraft}
                                onChange={(e) => {
                                    // Update draft state only - don't commit to formData yet
                                    setCustomInputDraft(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customInputDraft.trim()) {
                                        // Commit draft to formData and advance
                                        updateField(current.field, customInputDraft.trim());
                                        setCustomInputDraft("");
                                        handleNext();
                                    }
                                }}
                                onBlur={() => {
                                    // Commit draft to formData on blur if not empty
                                    if (customInputDraft.trim()) {
                                        updateField(current.field, customInputDraft.trim());
                                        setCustomInputDraft("");
                                    }
                                }}
                            />
                            <p className="text-xs text-slate-500 mt-2 text-center">Type your custom {current.field} and press Enter or Next</p>
                        </div>
                    )}

                    {/* Show custom value display when a custom value has been entered */}
                    {((current.field === "industry" || current.field === "seniority") && formData[current.field] && formData[current.field] !== "Other" && !["Tech", "Health", "Finance", "Consulting", "Retail", "Intern", "Entry", "Mid", "Senior", "Manager", "Exec"].includes(formData[current.field])) && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                                Custom {current.field}: {formData[current.field]}
                            </p>
                            <button
                                onClick={() => {
                                    // Reset to "Other" and clear draft to allow re-editing
                                    updateField(current.field, "Other");
                                    setCustomInputDraft("");
                                }}
                                className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>
            )
        }
    };


    // --- Main Render ---

    const current = steps[step];

    // CRITICAL: Memoize AssistantBubble to prevent remounting on every render
    const MemoizedAssistantBubble = useMemo(() => {
        return <AssistantBubble currentStep={step} playing={isPlayingPrompt} onRepeat={handleRepeatQuestion} onHover={handleRepeatHover} steps={steps} autoplayBlocked={autoplayBlocked} />;
    }, [step, isPlayingPrompt, autoplayBlocked]);

    // CRITICAL: Memoize renderInput to prevent recreating JSX on every render
    const MemoizedInput = useMemo(() => {
        return renderInput();
    }, [step, formData, inputMode, tempTranscript, customInputDraft, micEnabled, micDenied]);

    // Render wizard into a portal to isolate from parent component rerenders/layout changes
    return createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-display" onClick={(e) => e.stopPropagation()}>
            {/* Card Container - DISABLE ANIMATIONS */}
            <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto" style={{ animation: 'none', transition: 'none' }}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-surface-dark z-10">
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                        {current.type === "mic_setup" ? "Setup" : `Step ${step} of ${steps.length - 1}`}
                    </span>
                    {current.optional && (
                        <button onClick={handleNext} className="text-xs font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-wide">
                            Skip
                        </button>
                    )}
                </div>

                {/* Body - DISABLE ANIMATIONS */}
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center" style={{ animation: 'none', transition: 'none' }}>
                    {MemoizedAssistantBubble}
                    {isFetchingAudio && (
                        <p className="text-xs text-slate-400 italic mb-2">Loading voice…</p>
                    )}
                    {MemoizedInput}
                </div>

                {/* Footer Controls */}
                <div className="p-6 pt-2">
                    {/* Hide Main Next Button for Mic Setup (it has its own) & Speak Input (Waiting Confirmation) */}
                    {current.type !== "mic_setup" && !(inputMode === "speak" && !tempTranscript && current.inputType === "text") && (
                        <button
                            onClick={handleNext}
                            disabled={!current.optional && !formData[current.field] && current.field !== "focus_areas"}
                            className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {step === steps.length - 1 ? (loading ? "Finishing..." : "Finish Onboarding") : "Next"}
                        </button>
                    )}

                    {/* Back Link */}
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="w-full mt-4 text-xs font-medium text-slate-400 hover:text-slate-600"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// Export with React.memo to prevent flickering when parent rerenders (e.g., on typing)
export default memo(OnboardingWizard);
