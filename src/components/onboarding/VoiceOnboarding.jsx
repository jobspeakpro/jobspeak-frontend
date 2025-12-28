import React, { useState, useEffect, useRef } from 'react';
import { fetchTtsBlob } from '../../utils/ttsHelper.js';
import { usePractice } from '../../store/practiceStore.jsx';

// Strict role normalization - conservative fallback to "General interview"
const normalizeRoleStrict = (raw) => {
    if (!raw || typeof raw !== 'string') return 'General interview';

    const t = raw.trim().toLowerCase();

    // Profanity/inappropriate check
    const badWords = ['fuck', 'shit', 'damn', 'ass', 'bitch', 'crap'];
    if (badWords.some(w => t.includes(w))) return 'General interview';

    // Common roles
    if (t.includes('software') || t.includes('developer') || t.includes('engineer')) return 'Software Engineer';
    if (t.includes('data scien')) return 'Data Scientist';
    if (t.includes('product manage')) return 'Product Manager';
    if (t.includes('designer') || t.includes('ux') || t.includes('ui')) return 'Designer';
    if (t.includes('market')) return 'Marketing';
    if (t.includes('sales')) return 'Sales';
    if (t.includes('account')) return 'Accountant';
    if (t.includes('doctor') || t.includes('physician')) return 'Doctor';
    if (t.includes('nurse')) return 'Nurse';
    if (t.includes('teacher')) return 'Teacher';
    if (t.includes('analyst')) return 'Analyst';
    if (t.includes('consultant')) return 'Consultant';
    if (t.includes('manager')) return 'Manager';

    // Vague/unhelpful
    if (t.length < 3 || t === 'idk' || t === 'dunno' || t === 'whatever') return 'General interview';

    // Capitalize first letter of each word if it looks reasonable
    if (t.length > 2 && t.length < 50 && /^[a-z\s]+$/.test(t)) {
        return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return 'General interview';
};

const normalizeLevel = (raw) => {
    if (!raw) return 'mid-level';
    const t = raw.toLowerCase();
    if (t.includes('junior') || t.includes('entry')) return 'entry-level';
    if (t.includes('senior') || t.includes('lead')) return 'senior';
    return 'mid-level';
};

const normalizeType = (raw) => {
    if (!raw) return 'mixed';
    const t = raw.toLowerCase();
    if (t.includes('behavior')) return 'behavioral';
    if (t.includes('technic')) return 'technical';
    return 'mixed';
};

export default function VoiceOnboarding({ onComplete }) {
    const [step, setStep] = useState('ROLE');
    const [answers, setAnswers] = useState({ role: '', level: '', type: '' });
    const [isListening, setIsListening] = useState(false);
    const [currentKey, setCurrentKey] = useState('role');
    const [transcript, setTranscript] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [clarificationAttempts, setClarificationAttempts] = useState(0);

    // Use practice store for state management
    const {
        setTargetRole,
        setTargetLevel,
        setTargetType,
        setTtsSpeed,
        completeOnboarding,
    } = usePractice();

    const audioRef = useRef(new Audio());
    const silenceTimerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Helper to get question text for current step
    const getQuestionText = (currentStep) => {
        switch (currentStep) {
            case 'ROLE':
                return "What role are you applying for?";
            case 'LEVEL':
                return "What seniority level is it? Entry, mid-level, or senior?";
            case 'TYPE':
                return "What interview style? Behavioral, technical, or mixed?";
            case 'SPEED_PREF':
                return "Speaking speed preference?";
            case 'CONFIRM':
                const normalizedRole = normalizeRoleStrict(answers.role);
                if (normalizedRole === 'General interview') {
                    return "We'll start with general interview questions.";
                }
                return `We'll tailor questions to: ${normalizedRole}`;
            default:
                return "";
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const handleSpeed = (s) => {
        let r = 1.0;
        if (s === 'slower') r = 0.85;
        if (s === 'faster') r = 1.15;

        // Normalize and save to practice store
        const normalizedRole = normalizeRoleStrict(answers.role);
        const normalizedLevel = normalizeLevel(answers.level);
        const normalizedType = normalizeType(answers.type);

        setTargetRole(normalizedRole);
        setTargetLevel(normalizedLevel);
        setTargetType(normalizedType);
        setTtsSpeed(r);

        // Complete onboarding in store
        completeOnboarding();

        // NO TTS summary - text only
        setStep('ONBOARDING_COMPLETE_GUIDANCE');
    };

    const handleRoleSubmit = (role) => {
        setAnswers(prev => ({ ...prev, role }));
        setStep('LEVEL');
    };

    const handleLevelSubmit = (level) => {
        setAnswers(prev => ({ ...prev, level }));
        setStep('TYPE');
    };

    const handleTypeSubmit = (type) => {
        setAnswers(prev => ({ ...prev, type }));
        setStep('CONFIRM');
    };

    // Render based on step
    if (step === 'ROLE') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {getQuestionText('ROLE')}
                </h2>
                <input
                    type="text"
                    className="w-full p-3 border rounded-lg mb-4"
                    placeholder="e.g., Software Engineer"
                    value={answers.role}
                    onChange={(e) => setAnswers(prev => ({ ...prev, role: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && answers.role && handleRoleSubmit(answers.role)}
                />
                <button
                    onClick={() => handleRoleSubmit(answers.role)}
                    disabled={!answers.role}
                    className="w-full py-3 bg-primary text-white rounded-lg font-bold disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    }

    if (step === 'LEVEL') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {getQuestionText('LEVEL')}
                </h2>
                <div className="space-y-3">
                    <button onClick={() => handleLevelSubmit('entry-level')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Entry-level
                    </button>
                    <button onClick={() => handleLevelSubmit('mid-level')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Mid-level
                    </button>
                    <button onClick={() => handleLevelSubmit('senior')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Senior
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'TYPE') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {getQuestionText('TYPE')}
                </h2>
                <div className="space-y-3">
                    <button onClick={() => handleTypeSubmit('behavioral')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Behavioral
                    </button>
                    <button onClick={() => handleTypeSubmit('technical')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Technical
                    </button>
                    <button onClick={() => handleTypeSubmit('mixed')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Mixed
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'CONFIRM') {
        const normalizedRole = normalizeRoleStrict(answers.role);
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    Confirm your details
                </h2>
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Role:</strong> {normalizedRole}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Level:</strong> {answers.level || 'mid-level'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Type:</strong> {answers.type || 'mixed'}
                    </p>
                </div>
                <button onClick={() => setStep('SPEED_PREF')} className="w-full py-3 bg-primary text-white rounded-lg font-bold">
                    Looks good!
                </button>
                <button onClick={() => setStep('ROLE')} className="w-full mt-3 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold">
                    Edit details
                </button>
            </div>
        );
    }

    if (step === 'SPEED_PREF') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    Speaking speed preference?
                </h2>
                <div className="space-y-3">
                    <button onClick={() => handleSpeed('slower')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Slower (0.85x)
                    </button>
                    <button onClick={() => handleSpeed('normal')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Normal (1.0x)
                    </button>
                    <button onClick={() => handleSpeed('faster')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                        Faster (1.15x)
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'ONBOARDING_COMPLETE_GUIDANCE') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    You're all set!
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {getQuestionText('CONFIRM')}
                </p>
                <button onClick={onComplete} className="w-full py-3 bg-primary text-white rounded-lg font-bold">
                    Start practicing
                </button>
            </div>
        );
    }

    return null;
}
