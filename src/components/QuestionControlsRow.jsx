import React from 'react';

export default function QuestionControlsRow({
    questionVoiceId,
    setQuestionVoiceId,
    questionSpeed,
    setQuestionSpeed,
    questionAutoplay,
    setQuestionAutoplay,
    handlePlayQuestion,
    questionIsLoading,
    questionIsPlaying,
    handleTryAnotherQuestion,
    QUESTION_VOICES,
    SPEEDS
}) {
    return (
        <div className="flex items-center gap-2">
            {/* Play Button */}
            <button
                type="button"
                onClick={handlePlayQuestion}
                disabled={questionIsLoading}
                className="size-8 flex items-center justify-center rounded-full bg-white text-primary hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-sm"
                title="Play question audio"
            >
                <span className="material-symbols-outlined text-xl">
                    {questionIsLoading ? "hourglass_empty" : questionIsPlaying ? "pause" : "play_arrow"}
                </span>
            </button>

            {/* Settings Popover Trigger (Voice/Speed/Autoplay) */}
            <div className="relative group">
                <button className="size-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">settings</span>
                </button>

                {/* Hover Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-20">
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Voice</label>
                            <select
                                value={questionVoiceId}
                                onChange={(e) => setQuestionVoiceId(e.target.value)}
                                className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-900 dark:text-white"
                            >
                                {QUESTION_VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Speed</label>
                            <div className="flex gap-1">
                                {['0.85', '1', '1.15'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setQuestionSpeed(s)}
                                        className={`flex-1 py-1 text-xs rounded-md border ${String(questionSpeed) === s ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Autoplay</span>
                                <input
                                    type="checkbox"
                                    checked={questionAutoplay}
                                    onChange={(e) => setQuestionAutoplay(e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <button
                type="button"
                onClick={handleTryAnotherQuestion}
                className="ml-1 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-sm border border-white/10"
            >
                Next question
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
        </div>
    );
}
