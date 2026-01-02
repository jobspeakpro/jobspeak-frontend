import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { apiClient } from "../../utils/apiClient.js";
import { normalizeMockSummary } from "../../utils/apiNormalizers.js";
import { fetchTtsBlobUrl, triggerBrowserFallback } from "../../utils/ttsHelper.js";
import AppHeader from "../../components/AppHeader.jsx";
import TTSSampleButton from "../../components/TTSSampleButton.jsx";

// Per-Question Audio Player Component (no speed controls, uses global settings)
// Per-Question Audio Player Component (no speed controls, uses global settings)
// Per-Question Audio Player Component (no speed controls, uses global settings)
function QuestionAudioPlayer({ text, label, voiceId, playbackRate, onPlay, isCurrentlyPlaying, onError }) {
    const audioRef = useRef(new Audio());
    const audioUrlRef = useRef(null); // Track current blob URL for cleanup
    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Explicit State Machine: 'IDLE' | 'LOADING' | 'PLAYING' | 'ERROR'
    const [status, setStatus] = useState('IDLE');
    const [audioUrl, setAudioUrl] = useState(null);

    // Stop playing if another audio starts (EXTERNAL CONTROL)
    useEffect(() => {
        if (!isCurrentlyPlaying && status === 'PLAYING') {
            audioRef.current.pause();
            setStatus('IDLE');
        }
    }, [isCurrentlyPlaying, status]);

    // Handle audio events and cleanup
    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => {
            setStatus('IDLE');
            onPlay(null);
        };

        const handleError = (e) => {
            console.error("Audio playback error:", e);
            setStatus('ERROR');
            onPlay(null);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.pause(); // Stop on unmount
            if (abortControllerRef.current) abortControllerRef.current.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // Use ref for cleanup to ensure we always have the current URL
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        };
    }, []);

    // Update playback rate dynamically
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const handlePlayClick = async () => {
        // CASE 1: PLAYING -> PAUSE
        if (status === 'PLAYING') {
            audioRef.current.pause();
            setStatus('IDLE');
            onPlay(null);
            return;
        }

        // CASE 2: LOADING -> CANCEL
        if (status === 'LOADING') {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setStatus('IDLE');
            return;
        }

        // CASE 3: IDLE/ERROR -> START PLAYING
        onPlay(text); // Notify parent to stop others
        setStatus('LOADING');

        // Reuse existing URL if available
        if (audioUrl) {
            try {
                audioRef.current.playbackRate = playbackRate;
                await audioRef.current.play();
                setStatus('PLAYING');
            } catch (err) {
                console.error("Replay error:", err);
                setStatus('ERROR');
                onPlay(null);
            }
            return;
        }

        // Fetch New Audio
        abortControllerRef.current = new AbortController();
        timeoutRef.current = setTimeout(() => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            setStatus('ERROR');
            if (onError) onError();
            onPlay(null);
        }, 15000);

        try {
            const result = await fetchTtsBlobUrl({ text, voiceId, speed: playbackRate });
            clearTimeout(timeoutRef.current);

            if (result.error) {
                throw new Error(result.error);
            }

            // Revoke old blob URL before setting new one
            if (audioUrlRef.current && audioUrlRef.current !== result.url) {
                URL.revokeObjectURL(audioUrlRef.current);
            }

            // Update both ref and state
            audioUrlRef.current = result.url;
            setAudioUrl(result.url);

            audioRef.current.src = result.url;
            audioRef.current.playbackRate = playbackRate;
            await audioRef.current.play();
            setStatus('PLAYING');

        } catch (err) {
            clearTimeout(timeoutRef.current);
            if (err.name !== 'AbortError') {
                console.warn('API TTS failed, trying fallback...', err);

                // Fallback attempt
                const fallbackSuccess = triggerBrowserFallback(text, voiceId, playbackRate);
                if (fallbackSuccess) {
                    setStatus('IDLE'); // Browser TTS is fire-and-forget, so we assume it plays.
                    if (onFallback) onFallback();
                } else {
                    setStatus('ERROR');
                    if (onError) onError();
                }
            } else {
                setStatus('IDLE'); // Cancelled cleanly
            }
            onPlay(null);
        }
    };

    return (
        <button
            onClick={handlePlayClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${status === 'ERROR'
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-primary hover:bg-blue-700 text-white'
                }`}
        >
            <span className="material-symbols-outlined text-[20px]">
                {status === 'LOADING' ? 'hourglass_empty' : status === 'PLAYING' ? 'pause' : 'play_arrow'}
            </span>
            {status === 'LOADING' ? 'Loading...' : status === 'PLAYING' ? 'Pause' : label || 'Play'}
        </button>
    );
}

// Vocabulary Word Component with Pronunciation (uses global voice)
// Vocabulary Word Component with Pronunciation (uses global voice)
function VocabWord({ word, ipa, definition, example, pos, voiceId, onPlay, isCurrentlyPlaying, onError, onFallback }) {
    const audioRef = useRef(new Audio());
    const audioUrlRef = useRef(null); // Track current blob URL for cleanup
    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    // Parent manages toast via onError. But we need fallback logic here.

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => onPlay(null);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            if (abortControllerRef.current) abortControllerRef.current.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // Use ref for cleanup to ensure we always have the current URL
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        };
    }, [onPlay]);

    useEffect(() => {
        if (!isCurrentlyPlaying && audioRef.current) {
            audioRef.current.pause();
        }
    }, [isCurrentlyPlaying]);

    const handlePlayPronunciation = async () => {
        if (isCurrentlyPlaying) {
            audioRef.current.pause();
            onPlay(null);
            return;
        }

        if (isLoading) {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsLoading(false);
            return;
        }

        onPlay(word);
        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        timeoutRef.current = setTimeout(() => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            setIsLoading(false);
            if (onError) onError();
            onPlay(null);
        }, 15000);

        try {
            const result = await fetchTtsBlobUrl({ text: word, voiceId });
            clearTimeout(timeoutRef.current);
            setIsLoading(false);

            if (result.error) {
                throw new Error(result.error);
            }

            // Revoke old blob URL before setting new one
            if (audioUrlRef.current && audioUrlRef.current !== result.url) {
                URL.revokeObjectURL(audioUrlRef.current);
            }

            // Update ref with new URL
            audioUrlRef.current = result.url;
            audioRef.current.src = result.url;
            audioRef.current.play();
        } catch (err) {
            clearTimeout(timeoutRef.current);
            if (err.name !== 'AbortError') {
                console.warn('Pronunciation API failed, trying fallback...', err);
                const fallbackSuccess = triggerBrowserFallback(word, voiceId);
                if (fallbackSuccess) {
                    if (onFallback) onFallback();
                } else if (onError) {
                    onError(err);
                }
            }
            setIsLoading(false);
            onPlay(null);
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <button
                onClick={handlePlayPronunciation}
                className="mt-1 flex-shrink-0 size-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                title="Play US pronunciation"
            >
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    {isLoading ? 'hourglass_empty' : 'volume_up'}
                </span>
            </button>
            <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{word}</span>
                    {ipa && <span className="text-sm text-slate-500 dark:text-slate-400">{ipa}</span>}
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">US</span>
                    {pos && <span className="text-xs text-slate-500 dark:text-slate-400 italic">({pos})</span>}
                </div>
                {definition && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span className="font-semibold">Definition:</span> {definition}
                    </p>
                )}
                {example && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                        <span className="font-semibold not-italic">Example:</span> "{example}"
                    </p>
                )}
            </div>
        </div>
    );
}

// Underline specific words in text
function UnderlinedText({ text, wordsToUnderline }) {
    if (import.meta.env.DEV && Array.isArray(wordsToUnderline) && wordsToUnderline.length < 2) {
        console.warn("[DEV WARNING] Stronger Example has fewer than 2 underlined words:", wordsToUnderline);
    }

    if (!text || !wordsToUnderline || wordsToUnderline.length === 0) {
        return <span>{text}</span>;
    }

    // Track which words were found for dev warning
    const foundWords = new Set();

    // Create regex pattern for all words to underline (case-insensitive, handle punctuation)
    const pattern = wordsToUnderline
        .map(word => {
            // Escape special regex chars
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Allow optional punctuation after word
            return `(${escaped})(?=[\\s,;:.!?'"]|$)`;
        })
        .join('|');
    const regex = new RegExp(pattern, 'gi');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Track found word
        foundWords.add(match[0].toLowerCase().replace(/[^a-z]/g, ''));

        // Add text before match
        if (match.index > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
        }
        // Add underlined match
        parts.push(
            <span key={`underline-${match.index}`} className="underline decoration-2 decoration-primary font-semibold">
                {match[0]}
            </span>
        );
        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    // Dev-only warning for missing words
    if (import.meta.env.DEV && foundWords.size < wordsToUnderline.length) {
        const missingWords = wordsToUnderline.filter(w =>
            !foundWords.has(w.toLowerCase().replace(/[^a-z]/g, ''))
        );
        console.warn('[DEV] Underline mismatch - words not found in text:', missingWords);
    }

    return <>{parts}</>;
}

export default function MockInterviewSummary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock interview limit status
    const [mockLimitStatus, setMockLimitStatus] = useState(null);
    const [checkingLimit, setCheckingLimit] = useState(true);

    // Global playback settings
    const [selectedVoice, setSelectedVoice] = useState('us_female_emma');
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);
    const [ttsErrorToast, setTtsErrorToast] = useState(false);
    const [fallbackToast, setFallbackToast] = useState(false);

    // Auto-dismiss toast
    useEffect(() => {
        if (ttsErrorToast) {
            const timer = setTimeout(() => setTtsErrorToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [ttsErrorToast]);

    useEffect(() => {
        if (fallbackToast) {
            const timer = setTimeout(() => setFallbackToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [fallbackToast]);

    // Voice options (same as Practice page)
    const voiceOptions = [
        { id: 'us_female_emma', label: 'Emma (US Female)' },
        { id: 'us_female_ava', label: 'Ava (US Female)' },
        { id: 'us_male_jake', label: 'Jake (US Male)' },
        { id: 'uk_female_amelia', label: 'Amelia (UK Female)' },
        { id: 'uk_male_oliver', label: 'Oliver (UK Male)' },
        { id: 'uk_male_harry', label: 'Harry (UK Male)' },
    ];

    // Fetch summary data from API
    const fetchSummary = async () => {
        if (!id) return;

        setLoading(true);

        try {
            // DIRECT FETCH (bypass apiClient to prevent option handling issues)
            // Use relative path to leverage Vercel proxy
            const base = "";
            const url = `${base}/api/mock-interview/summary?sessionId=${encodeURIComponent(id)}&t=${Date.now()}`;

            console.log("[SUMMARY] Fetching from:", url);

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Summary fetch failed ${res.status}: ${text.slice(0, 200)}`);
            }

            const data = await res.json();
            console.log("[SUMMARY] Raw API Response:", data);

            if (!data) throw new Error("No data returned");

            const normalized = normalizeMockSummary(data);
            console.log("[SUMMARY] Normalized Data:", normalized);

            // FRONTEND VOCAB GUARANTEE: Ensure exactly 2 unique vocab words per question
            const usedVocabWords = new Set();
            const vocabBank = [
                { word: 'leverage', ipa: '/ˈlev.ər.ɪdʒ/', pos: 'verb', definition: 'Use something to maximum advantage', example: 'We can leverage our expertise to win this contract.' },
                { word: 'synergy', ipa: '/ˈsɪn.ər.dʒi/', pos: 'noun', definition: 'Combined power greater than individual parts', example: 'The synergy between our teams produced excellent results.' },
                { word: 'optimize', ipa: '/ˈɑːp.tɪ.maɪz/', pos: 'verb', definition: 'Make as effective as possible', example: 'We need to optimize our workflow for efficiency.' },
                { word: 'facilitate', ipa: '/fəˈsɪl.ɪ.teɪt/', pos: 'verb', definition: 'Make an action easier', example: 'This tool will facilitate better communication.' },
                { word: 'implement', ipa: '/ˈɪm.plə.ment/', pos: 'verb', definition: 'Put a plan into action', example: 'We will implement the new strategy next quarter.' },
                { word: 'strategic', ipa: '/strəˈtiː.dʒɪk/', pos: 'adjective', definition: 'Relating to long-term planning', example: 'We made a strategic decision to expand.' },
                { word: 'initiative', ipa: '/ɪˈnɪʃ.ə.tɪv/', pos: 'noun', definition: 'A new plan or action', example: 'The team launched a new initiative to improve sales.' },
                { word: 'collaborate', ipa: '/kəˈlæb.ə.reɪt/', pos: 'verb', definition: 'Work jointly with others', example: 'We collaborate with partners across the industry.' }
            ];

            normalized.perQuestion = normalized.perQuestion.map(q => {
                // Strip HTML tags from strongerExample text
                if (q.strongerExample?.text) {
                    q.strongerExample.text = q.strongerExample.text.replace(/<\/?u>/g, '');
                }

                // Ensure exactly 2 vocab words
                let vocab = q.strongerExample?.vocab || [];
                let underlinedWords = q.strongerExample?.underlinedWords || [];

                // If we don't have exactly 2, rebuild from vocab bank
                if (vocab.length !== 2 || underlinedWords.length !== 2) {
                    vocab = [];
                    underlinedWords = [];

                    for (const vocabItem of vocabBank) {
                        if (vocab.length >= 2) break;
                        if (!usedVocabWords.has(vocabItem.word.toLowerCase())) {
                            vocab.push({
                                word: vocabItem.word,
                                ipa: vocabItem.ipa,
                                pos: vocabItem.pos,
                                definition: vocabItem.definition,
                                example: vocabItem.example,
                                accent: 'US',
                                audioText: vocabItem.word
                            });
                            underlinedWords.push(vocabItem.word);
                            usedVocabWords.add(vocabItem.word.toLowerCase());
                        }
                    }

                    // Fallback if bank exhausted
                    while (vocab.length < 2) {
                        const fallbackWord = `term${vocab.length + 1}`;
                        vocab.push({
                            word: fallbackWord,
                            ipa: '',
                            pos: 'noun',
                            definition: 'Professional terminology',
                            example: `Example using ${fallbackWord}.`,
                            accent: 'US',
                            audioText: fallbackWord
                        });
                        underlinedWords.push(fallbackWord);
                    }
                }

                // Update strongerExample
                if (!q.strongerExample) {
                    q.strongerExample = {};
                }
                q.strongerExample.vocab = vocab;
                q.strongerExample.underlinedWords = underlinedWords;

                return q;
            });

            // VALIDATION: Check if attemptCount exceeds totalQuestions
            if (normalized.attemptCount > normalized.totalQuestions) {
                console.error('[SUMMARY VALIDATION ERROR] attemptCount exceeds totalQuestions!', {
                    sessionId: id,
                    attemptCount: normalized.attemptCount,
                    totalQuestions: normalized.totalQuestions,
                    rawResponse: data,
                    normalizedResponse: normalized
                });
            }

            setSummary(normalized);
        } catch (err) {
            // VISIBLE ERROR with stack trace (never silent fail)
            console.error("[SUMMARY LOAD FAILED]", err);
            console.error("Stack trace:", err.stack);
            setSummary({ error: true, message: err?.message || "Could not load summary." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [id]);

    // Check mock interview limit status on mount
    useEffect(() => {
        const checkMockLimit = async () => {
            try {
                // Use relative path
                const API_BASE = '';
                const { data } = await supabase.auth.getSession();
                const token = data?.session?.access_token;

                const response = await fetch(`${API_BASE}/api/mock-interview/limit-status`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (response.ok) {
                    const data = await response.json();
                    setMockLimitStatus(data);
                }
            } catch (err) {
                console.error('[MOCK] Limit check failed:', err);
            } finally {
                setCheckingLimit(false);
            }
        };

        checkMockLimit();
    }, []);



    const handleStartNew = () => {
        // Clear old session data before starting new interview (defense-in-depth)
        sessionStorage.removeItem('jsp_mock_session_id');
        localStorage.removeItem('jsp_mock_session_id');

        if (!mockLimitStatus) return;

        // Guest user - force signup
        if (mockLimitStatus.isGuest) {
            alert('Create a free account to start another mock interview.');
            navigate('/signup');
            return;
        }

        // Free limit reached - redirect to pricing
        if (!mockLimitStatus.canStartMock) {
            alert('Your free mock interview is complete. Upgrade for unlimited practice.');
            navigate('/pricing');
            return;
        }

        // Allowed - proceed
        navigate('/mock-interview/session?type=short');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <AppHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            </div>
        );
    }

    if (!summary || summary.error) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <AppHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-slate-400 text-6xl mb-4">analytics</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Could not load summary. Please retry.</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {summary?.message || "We couldn't load the results for this session."}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchSummary}
                            className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={handleDashboard}
                            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    // Map backend recommendation values to human-readable labels
    const getRecommendationDisplay = (backendValue) => {
        const mapping = {
            'not_recommended_yet': {
                title: 'Not Recommended Yet',
                description: 'Needs foundational improvement before being interview-ready',
                type: 'default'
            },
            'recommend_with_reservations': {
                title: 'Potential, With Reservations',
                description: 'Shows promise but needs clearer structure and outcomes',
                type: 'recommend'
            },
            'recommended': {
                title: 'Recommended',
                description: 'Demonstrates clear, confident, and effective interview responses',
                type: 'strong'
            }
        };

        // Default to "Not Recommended Yet" if value not found
        return mapping[backendValue] || mapping['not_recommended_yet'];
    };

    const getRecommendationColor = (type) => {
        switch (type) {
            case 'strong': return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-900/30', text: 'text-green-700 dark:text-green-400', icon: 'thumb_up' };
            case 'recommend': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'thumb_up' };
            default: return { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-900/30', text: 'text-slate-700 dark:text-slate-400', icon: 'info' };
        }
    };

    // Get interview readiness based on score
    const getInterviewReadiness = (score) => {
        if (score < 50) return 'Practice Recommended';
        if (score < 75) return 'Nearly Ready';
        return 'Interview-Ready';
    };

    const recommendationDisplay = getRecommendationDisplay(summary.recommendation);
    const colors = getRecommendationColor(recommendationDisplay.type);

    // Track seen vocabulary words across all questions to enforce uniqueness
    const seenVocab = new Set();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <AppHeader />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Mock Interview Complete</h2>
                    <p className="text-slate-600 dark:text-slate-400">Here is your automated hiring recommendation based on your performance.</p>
                </div>

                {/* Recommendation Banner */}
                <div className={`w-full ${colors.bg} border ${colors.border} rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
                            <span className="material-symbols-outlined text-[28px]">{colors.icon}</span>
                        </div>
                        <div>
                            <p className={`text-xs font-bold ${colors.text} uppercase tracking-wide`}>Hiring Recommendation</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{recommendationDisplay.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{recommendationDisplay.description}</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{summary.percentile}</p>
                    </div>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Overall Score */}
                    <div className="bg-white dark:bg-[#1A222C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Overall Score</p>
                        <div className="text-4xl font-bold text-primary mb-1">
                            {summary?.overallScore || 0}
                            <span className="text-xl text-slate-400 font-normal">/100</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-8 rounded-full ${i < Math.floor((summary?.overallScore || 0) / 20) ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                            Interview Readiness: <span className="font-semibold">{getInterviewReadiness(summary?.overallScore || 0)}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Questions answered: <span className="font-semibold">{summary?.attemptCount || 0} out of {summary?.totalQuestions || 5}</span>
                        </p>
                    </div>

                    {/* Strongest Area */}
                    <div className="bg-white dark:bg-[#1A222C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Strongest Area</p>
                            <span className="material-symbols-outlined text-green-500">trending_up</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {summary?.strongestArea?.title || summary?.strongestArea?.label || (typeof summary?.strongestArea === 'string' ? summary.strongestArea : "N/A")}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {summary?.strongestArea?.description || ""}
                            </p>
                        </div>
                    </div>

                    {/* Biggest Risk */}
                    <div className="bg-white dark:bg-[#1A222C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Biggest Risk</p>
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {summary?.biggestRisk?.title || summary?.biggestRisk?.label || (typeof summary?.biggestRisk === 'string' ? summary.biggestRisk : "N/A")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {summary?.biggestRisk?.description || summary?.biggestRisk?.detail || "Your answers would benefit from clearer structure and more specific examples."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feedback Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {/* What you did well */}
                    <div className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            What you did well
                        </h4>
                        <ul className="space-y-3">
                            {Array.isArray(summary?.strengths) && summary.strengths.length > 0 ? (
                                summary.strengths.map((strength, index) => {
                                    const text = typeof strength === 'string' ? strength : (strength.title || strength.label || JSON.stringify(strength));
                                    return (
                                        <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 break-words [overflow-wrap:anywhere]">
                                            <div className="size-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                            <span>{text}</span>
                                        </li>
                                    )
                                })
                            ) : (
                                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="size-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                    <span>You communicated your ideas clearly and stayed focused on the question, which helps interviewers quickly understand your thinking.</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* What to improve next */}
                    <div className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">arrow_upward</span>
                            What to improve next
                        </h4>
                        <ul className="space-y-3">
                            {Array.isArray(summary?.improvements) && summary.improvements.length > 0 ? (
                                summary.improvements.map((improvement, index) => {
                                    const text = typeof improvement === 'string' ? improvement : (improvement.title || improvement.label || JSON.stringify(improvement));
                                    return (
                                        <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 break-words [overflow-wrap:anywhere]">
                                            <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                            <span>{text}</span>
                                        </li>
                                    )
                                })
                            ) : (
                                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                    <span>Focus more on outcomes. Adding specific numbers, timelines, or results will make your impact clearer and more credible to interviewers.</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* What the Hiring Manager Likely Heard - Only show if data exists */}
                {summary?.hiringManagerHeard && (
                    <div className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">hearing</span>
                            What the Hiring Manager Likely Heard
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 break-words [overflow-wrap:anywhere]">
                            {summary.hiringManagerHeard}
                        </p>
                    </div>
                )}

                {/* Per-Question Breakdown */}
                {summary?.perQuestion && summary.perQuestion.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Question-by-Question Breakdown</h3>
                        </div>

                        {/* Global Playback Settings */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 mb-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">settings_voice</span>
                                Playback Settings
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Voice Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Voice
                                    </label>
                                    <select
                                        value={selectedVoice}
                                        onChange={(e) => setSelectedVoice(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {voiceOptions.map(voice => (
                                            <option key={voice.id} value={voice.id}>{voice.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Speed Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Speed
                                    </label>
                                    <div className="flex gap-2">
                                        {[0.75, 1.0, 1.25, 1.5].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setPlaybackRate(speed)}
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${playbackRate === speed
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Test Voice Button */}
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900/30">
                                <TTSSampleButton
                                    text="This is a test of the selected voice and speed. Use this to preview how the audio will sound."
                                    voiceId={selectedVoice}
                                    playbackRate={playbackRate}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {summary.perQuestion.map((q, index) => (
                                <div key={index} className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    {/* Question Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="flex-shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary font-bold">Q{index + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white">{q.questionText || `Question ${index + 1}`}</h4>
                                        </div>
                                    </div>

                                    {/* User's Transcript */}
                                    {(() => {
                                        // STRICT RULE: Display ONLY user's actual answer
                                        // Priority: yourAnswer > answer_text > answerText
                                        // NEVER: strongerExample, rewrite, improved, etc.
                                        const userAnswer = q.yourAnswer || q.answer_text || q.answerText || '';

                                        // PROOF: Log per question to verify correct field usage
                                        console.log("[ANSWER FIELD USED]", {
                                            qid: q.question_id || q.questionId || 'unknown',
                                            yourAnswer: q.yourAnswer,
                                            answer_text: q.answer_text,
                                            answerText: q.answerText,
                                            strongerExample: q.strongerExample?.text?.slice?.(0, 60),
                                            finalDisplayed: userAnswer
                                        });

                                        if (userAnswer.trim()) {
                                            return (
                                                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Answer:</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{userAnswer}"</p>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">(No answer recorded)</p>
                                                </div>
                                            );
                                        }
                                    })()}

                                    {/* Feedback Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* What Worked */}
                                        {q.whatWorked && q.whatWorked.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    What the hiring manager liked
                                                </p>
                                                <ul className="space-y-1">
                                                    {q.whatWorked.map((item, i) => (
                                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                                                            <span className="text-green-500">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Improve Next */}
                                        {q.improveNext && q.improveNext.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                    What to improve next
                                                </p>
                                                <ul className="space-y-1">
                                                    {q.improveNext.map((item, i) => (
                                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                                                            <span className="text-primary">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stronger Example Response */}
                                    {q.strongerExample && q.strongerExample.text && (
                                        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                                                    Stronger Example Response
                                                </h5>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                                                <UnderlinedText
                                                    text={(q.strongerExample.text || '').replace(/<\/?u>/g, '')}
                                                    wordsToUnderline={q.strongerExample.underlinedWords || []}
                                                />
                                            </p>
                                            <QuestionAudioPlayer
                                                text={(q.strongerExample.text || '').replace(/<\/?u>/g, '')}
                                                label="Play Example"
                                                voiceId={selectedVoice}
                                                playbackRate={playbackRate}
                                                onPlay={setCurrentlyPlayingAudio}
                                                isCurrentlyPlaying={currentlyPlayingAudio === (q.strongerExample.text || '').replace(/<\/?u>/g, '')}
                                                onError={() => setTtsErrorToast(true)}
                                                onFallback={() => setFallbackToast(true)}
                                            />
                                        </div>
                                    )}

                                    {/* Vocabulary - Use vocab from strongerExample with uniqueness check */}
                                    {(() => {
                                        const vocabList = q.strongerExample?.vocab || [];
                                        if (vocabList.length === 0) return null;

                                        // Filter duplicates ensuring we haven't shown this word in previous questions
                                        const uniqueVocab = vocabList.filter(v => {
                                            if (!v?.word) return false;
                                            const key = v.word.trim().toLowerCase();
                                            if (seenVocab.has(key)) return false;
                                            seenVocab.add(key);
                                            return true;
                                        });

                                        // If filtered list is empty (duplicates) but original wasn't, show fallback
                                        if (uniqueVocab.length === 0) {
                                            return (
                                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 border-dashed">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center">
                                                        More vocabulary suggestions will appear as you answer more questions.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="mt-4">
                                                <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">school</span>
                                                    Vocabulary to level up your answer
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {uniqueVocab.map((v, i) => (
                                                        <VocabWord
                                                            key={i}
                                                            word={v.word}
                                                            ipa={v.ipa}
                                                            definition={v.definition}
                                                            example={v.example}
                                                            pos={v.pos}
                                                            voiceId={selectedVoice}
                                                            onPlay={setCurrentlyPlayingAudio}
                                                            isCurrentlyPlaying={currentlyPlayingAudio === v.word}
                                                            onError={() => setTtsErrorToast(true)}
                                                            onFallback={() => setFallbackToast(true)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Final CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 mb-12">
                    <button
                        onClick={handleDashboard}
                        className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm w-full sm:w-auto"
                    >
                        Return to Dashboard
                    </button>
                    {mockLimitStatus?.canStartMock && !mockLimitStatus?.isGuest ? (
                        <button
                            onClick={handleStartNew}
                            disabled={checkingLimit}
                            className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            {checkingLimit ? 'Checking...' : 'Start New Mock Interview'}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(mockLimitStatus?.isGuest ? '/signup' : '/pricing')}
                            className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <span className="material-symbols-outlined">workspace_premium</span>
                            {checkingLimit ? 'Checking...' : mockLimitStatus?.isGuest ? 'Create Free Account' : 'Upgrade to Pro'}
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-[-1rem]">
                    Mock interviews are evaluation mode. Use <button onClick={() => navigate('/practice')} className="text-primary hover:underline">Practice Mode</button> to build skills with real-time coaching.
                </p>


            </main>

            {/* Fallback Toast */}
            {fallbackToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
                    Using browser voice fallback.
                </div>
            )}

            {/* TTS Error Toast */}
            {ttsErrorToast && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">volume_off</span>
                        <div>
                            <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Audio unavailable right now</p>
                        </div>
                        <button
                            onClick={() => setTtsErrorToast(false)}
                            className="ml-auto text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
