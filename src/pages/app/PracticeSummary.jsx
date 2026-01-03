import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiClient } from "../../utils/apiClient.js";
import { normalizePracticeFeedback } from "../../utils/apiNormalizers.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function PracticeSummary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!id) return;

            setLoading(true);
            try {
                // Determine if this is a mock interview session or practice session
                // The Dashboard routes both here, but we need to know which API to call?
                // Actually, the request says "Practice summary -> GET /api/practice/summary?sessionId=..."
                // Dashboard links to /mock-interview/summary/:id for everything currently.
                // I should probably use a different route or query param, or try one then the other?
                // Or maybe the Dashboard link should be distinct.
                // For now, let's assume this component handles /practice/summary/:id route

                const data = await apiClient(`/api/practice/summary?sessionId=${id}`);
                const normalized = normalizePracticeFeedback(data);
                setSummary(normalized);
            } catch (err) {
                console.error("[PRACTICE SUMMARY] Failed to fetch summary:", err);
                setError("Failed to load practice summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [id]);

    const handleBack = () => {
        navigate('/progress'); // or dashboard? Progress seems better for "Review Past Sessions" context
    };

    const handlePracticeAgain = () => {
        navigate('/practice');
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <UniversalHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <p className="text-red-500 mb-4">{error || "Summary not found"}</p>
                    <button onClick={handleBack} className="text-primary hover:underline">Return to Progress</button>
                </main>
            </div>
        );
    }

    // Extract fields from normalized data (already safe from normalizer)
    const score = summary.score;
    const strengths = Array.isArray(summary.whatWorked) ? summary.whatWorked : [];
    const improvements = Array.isArray(summary.improveNext) ? summary.improveNext : [];
    const improvedAnswer = summary.improved || "";
    const questionText = summary.questionText || "Practice Question";
    const transcript = summary.transcript || "";

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-500">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Practice Session Review</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(summary.created_at || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Question & Answer Card */}
                <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Question</h3>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">{questionText}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/30">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Your Answer</h3>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{transcript}</p>
                    </div>
                </section>

                {/* Score & Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="bg-white dark:bg-[#1A222C] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="size-20 rounded-full border-4 border-primary/20 flex items-center justify-center mb-3 relative">
                            <span className="text-2xl font-black text-primary">{score}</span>
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">/100</span>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">Analysis Score</p>
                    </div>

                    {/* Feedback Columns */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30">
                            <h4 className="font-bold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                                What Worked
                            </h4>
                            <ul className="space-y-2">
                                {strengths.map((item, i) => (
                                    <li key={i} className="text-sm text-green-900 dark:text-green-300 flex gap-2">
                                        <span className="mt-1.5 size-1.5 bg-green-500 rounded-full shrink-0"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                To Improve
                            </h4>
                            <ul className="space-y-2">
                                {improvements.map((item, i) => (
                                    <li key={i} className="text-sm text-amber-900 dark:text-amber-300 flex gap-2">
                                        <span className="mt-1.5 size-1.5 bg-amber-500 rounded-full shrink-0"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Improved Answer */}
                {improvedAnswer && (
                    <section className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#1A222C] rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm p-6">
                        <h3 className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-4">
                            <span className="material-symbols-outlined">auto_fix_high</span>
                            AI Suggested Improvement
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <p>{improvedAnswer}</p>
                        </div>
                    </section>
                )}

                <div className="flex justify-center mt-4">
                    <button
                        onClick={handlePracticeAgain}
                        className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">mic</span>
                        Practice Another Question
                    </button>
                </div>
            </main>
        </div>
    );
}
