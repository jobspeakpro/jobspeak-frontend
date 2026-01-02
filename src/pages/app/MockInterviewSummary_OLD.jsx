import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiClient } from "../../utils/apiClient.js";
import { normalizeMockSummary } from "../../utils/apiNormalizers.js";
import { fetchTtsBlobUrl } from "../../utils/ttsHelper.js";
import AppHeader from "../../components/AppHeader.jsx";

// Per-Question Audio Player Component
function QuestionAudioPlayer({ text, label }) {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        const audio = audioRef.current;
        audio.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handlePlay = async () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        if (!audioUrl) {
            setIsLoading(true);
            const result = await fetchTtsBlobUrl({ text, voiceId: 'us_female_emma', speed: playbackSpeed });
            setIsLoading(false);

            if (result.error) {
                console.error('TTS error:', result.error);
                alert('Failed to generate audio');
                return;
            }

            setAudioUrl(result.url);
            audioRef.current.src = result.url;
        }

        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const speeds = [0.75, 1.0, 1.25, 1.5];

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <button
                onClick={handlePlay}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isLoading ? 'hourglass_empty' : isPlaying ? 'pause' : 'play_arrow'}
                </span>
                {isLoading ? 'Loading...' : isPlaying ? 'Pause' : label || 'Play'}
            </button>
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Speed:</span>
                {speeds.map(speed => (
                    <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${playbackSpeed === speed
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                    >
                        {speed}x
                    </button>
                ))}
            </div>
        </div>
    );
}

// Vocabulary Word Component with Pronunciation
function VocabWord({ word, ipa, definition }) {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    const handlePlayPronunciation = async () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        setIsLoading(true);
        const result = await fetchTtsBlobUrl({ text: word, voiceId: 'us_female_emma' });
        setIsLoading(false);

        if (result.error) {
            console.error('Pronunciation TTS error:', result.error);
            return;
        }

        audioRef.current.src = result.url;
        audioRef.current.play();
        setIsPlaying(true);
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <button
                onClick={handlePlayPronunciation}
                disabled={isLoading}
                className="mt-1 flex-shrink-0 size-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full transition-colors disabled:opacity-50"
                title="Play pronunciation"
            >
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    {isLoading ? 'hourglass_empty' : 'volume_up'}
                </span>
            </button>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{word}</span>
                    {ipa && <span className="text-sm text-slate-500 dark:text-slate-400">{ipa}</span>}
                </div>
                {definition && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{definition}</p>
                )}
            </div>
        </div>
    );
}

// Underline specific words in text
function UnderlinedText({ text, wordsToUnderline }) {
    if (!text || !wordsToUnderline || wordsToUnderline.length === 0) {
        return <span>{text}</span>;
    }

    // Create regex pattern for all words to underline (case-insensitive)
    const pattern = wordsToUnderline
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
        .join('|');
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
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

    return <>{parts}</>;
}

export default function MockInterviewSummary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch summary data from API
    useEffect(() => {
        const fetchSummary = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const data = await apiClient(`/api/mock-interview/summary?sessionId=${id}`);
                console.log("[SUMMARY] Raw API Response:", data);
                if (!data) throw new Error("No data returned");
                const normalized = normalizeMockSummary(data);
                console.log("[SUMMARY] Normalized Data:", normalized);
                console.log("[SUMMARY] attemptCount:", data.attemptCount);
                console.log("[SUMMARY] overall_score:", data.overall_score);
                console.log("[SUMMARY] overallScore:", data.overallScore);
                setSummary(normalized);
            } catch (err) {
                console.error("[SUMMARY] Failed to fetch summary:", err);
                setSummary({ error: true, message: "Could not load summary." });
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [id]);

    // TEMPORARY: Log final summary data for verification
    useEffect(() => {
        console.log("MOCK SUMMARY DATA (FINAL):", summary);
    }, [summary]);

    const handleStartNew = () => {
        navigate('/mock-interview');
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Summary Not Available</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {summary?.message || "We couldn't load the results for this session."}
                    </p>
                    <button onClick={handleDashboard} className="text-primary hover:underline">Return to Dashboard</button>
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
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {summary?.biggestRisk?.description || "Your answers would benefit from clearer structure. Interviewers typically look for responses that explain the situation, what you did, and the result. Using the STAR format will make your answers easier to follow and more convincing."}
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
                                        <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
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
                                        <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
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
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {summary.hiringManagerHeard}
                        </p>
                    </div>
                )}

                {/* Stronger Example Response - Only show if data exists and show ONE sentence only */}
                {summary?.improvedExample && (
                    <div className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">auto_fix_high</span>
                            Stronger Example Response
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            "{summary.improvedExample.split('.')[0]}."
                        </p>
                    </div>
                )}

                {/* Per-Question Breakdown */}
                {summary?.perQuestion && summary.perQuestion.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Question-by-Question Breakdown</h3>
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
                                    {q.transcript && (
                                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Answer:</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{q.transcript}"</p>
                                        </div>
                                    )}

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
                                                    text={q.strongerExample.text}
                                                    wordsToUnderline={q.strongerExample.underlinedWords || []}
                                                />
                                            </p>
                                            <QuestionAudioPlayer text={q.strongerExample.text} label="Play Example" />
                                        </div>
                                    )}

                                    {/* Vocabulary */}
                                    {q.vocab && q.vocab.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px]">school</span>
                                                Vocabulary to level up your answer
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.vocab.map((v, i) => (
                                                    <VocabWord
                                                        key={i}
                                                        word={v.word}
                                                        ipa={v.ipa}
                                                        definition={v.definition}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                    <button
                        onClick={handleStartNew}
                        className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Start New Mock Interview
                    </button>
                </div>

                <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-[-1rem]">
                    Mock interviews are evaluation mode. Use <button onClick={() => navigate('/practice')} className="text-primary hover:underline">Practice Mode</button> to build skills with real-time coaching.
                </p>

                {/* DEV ONLY: Debug Panel - TEMPORARY */}
                {import.meta.env.DEV && summary && !summary.error && (
                    <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl">
                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                            🔧 DEV MODE: Summary Data Debug
                        </h3>
                        <div className="space-y-2 text-sm font-mono">
                            <p className="text-slate-900 dark:text-white">
                                <strong>attemptCount:</strong> {summary.attemptCount ?? 'undefined'}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                                <strong>overall_score:</strong> {summary.overallScore ?? 'undefined'}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                                <strong>recommendation:</strong> {summary.recommendation ?? 'undefined'}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                                <strong>hiringManagerHeard:</strong> {summary.hiringManagerHeard ? `"${summary.hiringManagerHeard.substring(0, 120)}${summary.hiringManagerHeard.length > 120 ? '...' : ''}"` : 'null'}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                                <strong>improvedExample:</strong> {summary.improvedExample ? `"${summary.improvedExample.substring(0, 120)}${summary.improvedExample.length > 120 ? '...' : ''}"` : 'null'}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                                <strong>perQuestion.length:</strong> {summary.perQuestion?.length ?? 0}
                            </p>
                        </div>
                        <details className="mt-4">
                            <summary className="cursor-pointer text-yellow-900 dark:text-yellow-200 font-bold hover:underline">
                                Show Full JSON
                            </summary>
                            <pre className="mt-2 p-4 bg-slate-900 text-green-400 rounded overflow-x-auto text-xs">
                                {JSON.stringify(summary, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </main>
        </div>
    );
}
