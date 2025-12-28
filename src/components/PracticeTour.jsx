import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TOUR_STEPS = [
    {
        targetId: 'tour-mic-button',
        title: 'Speak your answer here',
        content: "Click the microphone and answer out loud.\nThis is private practice — perfection is not expected.",
        subtext: "You can re-record as many times as you want.",
        cta: "Next",
    },
    {
        targetId: 'tour-fix-button',
        fallbackId: 'tour-mic-button',
        title: 'Get instant feedback',
        content: "After you answer, we rewrite your response and show how to improve it.",
        subtext: "This unlocks after you answer.",
        cta: "Next",
    },
    {
        targetId: 'tour-question-controls',
        title: 'Question controls (optional)',
        content: "Play: hear the question\nSettings: change voice or speed\nNext question: skip and move on",
        cta: "Next",
    },
    {
        targetId: 'tour-guidance-section',
        title: 'Guidance is optional',
        content: "These are examples from strong answers.\nUse them for inspiration or ignore them.",
        cta: "Next",
    },
    {
        targetId: 'tour-usage-banner',
        title: 'Free Plan Limit',
        content: "You get 3 free practice questions per day.\nAfter that, you can upgrade or come back tomorrow.",
        cta: "Got it — start practicing",
    }
];

export default function PracticeTour({ isOpen, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState(null);
    const [placement, setPlacement] = useState('bottom');

    const step = TOUR_STEPS[currentStep];

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            let element = document.getElementById(step.targetId);
            if (!element && step.fallbackId) {
                element = document.getElementById(step.fallbackId);
            }

            if (element) {
                const rect = element.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const isBottom = spaceBelow > 200 || spaceBelow > spaceAbove;

                setPlacement(isBottom ? 'bottom' : 'top');
                setCoords({
                    top: rect.top + scrollY,
                    left: rect.left + scrollX,
                    width: rect.width,
                    height: rect.height,
                });

                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        const t = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            clearTimeout(t);
        }
    }, [currentStep, isOpen, step]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden">
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />

            {coords && (
                <div
                    className="absolute border-2 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: coords.top - 4,
                        left: coords.left - 4,
                        width: coords.width + 8,
                        height: coords.height + 8,
                    }}
                />
            )}

            {coords && (
                <div
                    className="absolute w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all ease-out"
                    style={{
                        top: placement === 'bottom'
                            ? coords.top + coords.height + 16
                            : coords.top - 16,
                        left: Math.max(16, Math.min(window.innerWidth - 336, coords.left + (coords.width / 2) - 160)), // Smart clamping
                        transform: placement === 'top' ? 'translateY(-100%)' : 'none',
                    }}
                >
                    <div
                        className={`absolute w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45 left-1/2 -translate-x-1/2 ${placement === 'bottom' ? '-top-2' : '-bottom-2'
                            }`}
                    />

                    <div className="relative z-10 font-sans">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                            <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium px-2 py-1">
                                Skip tour
                            </button>
                        </div>

                        <h4 className="text-lg font-bold text-text-main dark:text-white leading-tight">{step.title}</h4>

                        <div className="text-sm text-text-secondary dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {step.content}
                        </div>

                        {step.subtext && (
                            <p className="text-xs text-slate-400 italic mt-1">{step.subtext}</p>
                        )}

                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleNext}
                                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold shadow-md shadow-primary/20 transition-colors"
                            >
                                {step.cta}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
