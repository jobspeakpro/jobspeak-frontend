import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function HelpPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Scroll to anchor on mount or hash change
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location.hash]);

    // Mic Test State
    const [showMicTest, setShowMicTest] = React.useState(false);
    const [micStatus, setMicStatus] = React.useState('idle'); // idle, listening, error
    const [micError, setMicError] = React.useState('');
    const [audioLevel, setAudioLevel] = React.useState(0);
    const audioContextRef = React.useRef(null);
    const analyserRef = React.useRef(null);
    const microphoneRef = React.useRef(null);
    const animationFrameRef = React.useRef(null);

    const startMicTest = async () => {
        setShowMicTest(true);
        setMicStatus('listening');
        setMicError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setAudioLevel(average); // Normalize slightly if needed, but raw average is fine for simple viz
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();

        } catch (err) {
            console.error("Mic Error:", err);
            setMicStatus('error');
            setMicError(err.message || 'Could not access microphone.');
        }
    };

    const stopMicTest = () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setShowMicTest(false);
        setMicStatus('idle');
        setAudioLevel(0);
        // Also stop the tracks to release the mic light
        if (microphoneRef.current && microphoneRef.current.mediaStream) {
            microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
            <UniversalHeader />

            <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                <div className="flex flex-col max-w-[1200px] flex-1">
                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
                        <div className="flex min-w-72 flex-col gap-3">
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Help &amp; FAQ</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal">Quick answers to common questions.</p>
                        </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                        {/* Left Column: Sticky Quick Links */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 flex flex-col gap-4">
                                <div className="bg-white dark:bg-[#1A222C] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Quick Links</h3>
                                    </div>
                                    <div className="flex flex-col">
                                        {/* Link 1 */}
                                        <a
                                            className="flex items-center gap-4 bg-white dark:bg-[#1A222C] px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-0 group cursor-pointer"
                                            href="#cancel"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 size-10 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">cancel</span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal flex-1 truncate">How do I cancel?</p>
                                            </div>
                                            <div className="shrink-0 text-slate-600 dark:text-slate-400">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </div>
                                        </a>

                                        {/* Link 2 */}
                                        <a
                                            className="flex items-center gap-4 bg-white dark:bg-[#1A222C] px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-0 group cursor-pointer"
                                            href="#progress"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 size-10 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">trending_down</span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal flex-1 truncate">Downgrading progress</p>
                                            </div>
                                            <div className="shrink-0 text-slate-600 dark:text-slate-400">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </div>
                                        </a>

                                        {/* Link 3 */}
                                        <a
                                            className="flex items-center gap-4 bg-white dark:bg-[#1A222C] px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-0 group cursor-pointer"
                                            href="#microphone"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 size-10 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">mic</span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal flex-1 truncate">Mic troubleshooting</p>
                                            </div>
                                            <div className="shrink-0 text-slate-600 dark:text-slate-400">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Content Sections */}
                        <div className="lg:col-span-8 flex flex-col gap-8 pb-20">
                            {/* Section A: Cancel */}
                            <section className="scroll-mt-24" id="cancel">
                                <div className="bg-white dark:bg-[#1A222C] rounded-lg p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-primary text-3xl">cancel_schedule_send</span>
                                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold">How do I cancel?</h2>
                                    </div>
                                    <p className="text-slate-900 dark:text-white text-base leading-relaxed mb-6">
                                        You can cancel anytime from your Billing page. Your subscription remains active until the end of your billing period. You won't be charged again after canceling.
                                    </p>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold leading-normal tracking-[0.015em] text-white hover:bg-blue-600 transition-colors"
                                    >
                                        Go to Billing
                                    </button>
                                </div>
                            </section>

                            {/* Section B: Progress */}
                            <section className="scroll-mt-24" id="progress">
                                <div className="bg-white dark:bg-[#1A222C] rounded-lg p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-primary text-3xl">save_as</span>
                                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold">Do I lose progress if I downgrade?</h2>
                                    </div>
                                    <p className="text-slate-900 dark:text-white text-base leading-relaxed mb-6">
                                        Your saved practice and mock interview history stays in your account. Some Pro-only features may be locked if you downgrade.
                                    </p>
                                    {/* Tip Callout */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-4 rounded-r-lg mb-2">
                                        <div className="flex gap-3">
                                            <span className="material-symbols-outlined text-primary">lightbulb</span>
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">Tip</p>
                                                <p className="text-slate-900 dark:text-white text-sm">Export or screenshot summaries if you want offline copies.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section C: Microphone */}
                            <section className="scroll-mt-24" id="microphone">
                                <div className="bg-white dark:bg-[#1A222C] rounded-lg p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-symbols-outlined text-primary text-3xl">mic_off</span>
                                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold">Microphone troubleshooting</h2>
                                    </div>
                                    <div className="flex flex-col gap-4 mb-8">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-600 shrink-0 mt-0.5">check_circle</span>
                                            <p className="text-slate-900 dark:text-white text-base">Allow microphone permission in browser.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-600 shrink-0 mt-0.5">check_circle</span>
                                            <p className="text-slate-900 dark:text-white text-base">Select the correct input device in OS settings.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-600 shrink-0 mt-0.5">check_circle</span>
                                            <p className="text-slate-900 dark:text-white text-base">Try Chrome/Edge if Safari blocks permissions.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-600 shrink-0 mt-0.5">check_circle</span>
                                            <p className="text-slate-900 dark:text-white text-base">Refresh the page after granting permission.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-600 shrink-0 mt-0.5">check_circle</span>
                                            <p className="text-slate-900 dark:text-white text-base">Close other apps using the microphone (Zoom, Teams).</p>
                                        </div>
                                    </div>

                                    {!showMicTest ? (
                                        <button
                                            onClick={startMicTest}
                                            className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-3 text-sm font-bold leading-normal tracking-[0.015em] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                        >
                                            <span className="material-symbols-outlined mr-2">mic</span>
                                            Run mic test
                                        </button>
                                    ) : (
                                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {micStatus === 'error' ? (
                                                        <span className="material-symbols-outlined text-red-500">error</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                    )}
                                                    {micStatus === 'error' ? 'Microphone Error' : 'Microphone Active'}
                                                </h4>
                                                <button onClick={stopMicTest} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>

                                            {micStatus === 'error' ? (
                                                <p className="text-red-500 text-sm mb-2">{micError}</p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Speak now to test your input level.</p>

                                                    {/* Audio Visualizer Bar */}
                                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 transition-all duration-[50ms]"
                                                            style={{ width: `${Math.min(100, (audioLevel / 50) * 100)}%` }} // Scaling factor
                                                        ></div>
                                                    </div>

                                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                        <span>Low</span>
                                                        <span>{audioLevel > 10 ? 'Input Detected ✅' : '...'}</span>
                                                        <span>High</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={stopMicTest}
                                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    Stop Test
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Extra: Still Need Help */}
                            <section>
                                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 md:p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xl font-bold">Still need help?</h3>
                                            <p className="text-gray-300">Contact our support team directly.</p>
                                            <div className="flex items-center gap-2 mt-2 text-primary">
                                                <span className="material-symbols-outlined text-sm">mail</span>
                                                <span className="font-medium">jobspeakpro@gmail.com</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/contact')}
                                            className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
                                        >
                                            Contact Support
                                        </button>
                                    </div>
                                    {/* decorative background element */}
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
