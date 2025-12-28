import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FAQPage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // --- Header Data ---
    const localAvatar = user?.id ? localStorage.getItem(`jsp_avatar_${user.id}`) : null;
    const displayAvatar = localAvatar || user?.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7OSQFZhF2rG-VynZ6WAzVggeYqM2KK1RlKBfcxtnvZ5wkKoNZYvIS78KvIQ3MguF106L9mdFmP61Mwv15fIJoq76Q-YtND9b1xiNMqREBjzXc1nnwTuBt64OuVT7ibePkxl2_MeM962jFqlOoLEp7YiYBSU_nBemtkqQzzSreOhqr2o2PSEC0MRgD_2ub6WjYS2-hQsYRrXXjhdDxtV8TCUgo8vHrXP_F_sLUgYVoUOTL3jYcfcb17z-Z6iWow8YIVVSxbDifNfMU";

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#101822]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">JobSpeak Pro</span>
                        </Link>
                        <nav className="hidden md:flex gap-8">
                            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary">Dashboard</Link>
                            <Link to="/start" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary">Practice</Link>
                            <Link to="/beta" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary">Beta</Link>
                            <Link to="/support" className="text-sm font-medium text-primary dark:text-primary">Support & FAQ</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="block bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden"
                                            style={{ backgroundImage: `url("${displayAvatar}")` }}
                                        >
                                        </button>
                                        {isMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-1 border border-slate-200 dark:border-slate-700 z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                >
                                                    Account
                                                </button>
                                                <button
                                                    disabled
                                                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                                >
                                                    Billing (Coming soon)
                                                </button>
                                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                                >
                                                    Log Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/signin" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign In</Link>
                                    <Link to="/signup" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 border border-transparent rounded-lg transition-all">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                            <button className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Frequently Asked Questions</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Get answers to common questions about JobSpeak Pro.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I cancel my subscription?</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            You can cancel your subscription at any time from the <Link to="/pricing" className="text-primary hover:underline">Billing page</Link>. Your access will continue until the end of your current billing period.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Do I lose progress if I downgrade?</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            No, your practice history and saved sessions are preserved even if you downgrade to the free plan. However, you will lose access to premium features like unlimited AI feedback.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Microphone issues troubleshooting</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Ensure your browser has permission to access your microphone. Check your system's sound settings and try reloading the page. Chrome or Edge are recommended for the best experience.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I contact support?</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            You can reach out to us directly via the <Link to="/contact" className="text-primary hover:underline">Contact page</Link> or email us at jobspeakpro@gmail.com.
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Still need help?</p>
                    <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-blue-600 border border-transparent rounded-lg transition-all shadow-sm">
                        Contact Support
                    </Link>
                </div>
            </main>
        </div>
    );
}
