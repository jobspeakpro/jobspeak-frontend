import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarDropdown from "./AvatarDropdown.jsx";

export default function UniversalHeader() {
    const navigate = useNavigate();
    const { isAuthed, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when clicking outside
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A222C] border-b border-slate-200 dark:border-gray-800 backdrop-blur-sm bg-white/95 dark:bg-[#1A222C]/95">
                <div className="px-4 sm:px-10 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 text-[#111418] dark:text-white hover:opacity-80 transition-opacity">
                        <div className="size-8 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_6_330)">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                </defs>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">JobSpeak Pro</h2>
                    </Link>

                    {/* Right side: Hamburger + Avatar */}
                    <div className="flex items-center gap-4">
                        {/* Avatar Dropdown (logged in only) */}
                        {isAuthed && <AvatarDropdown />}

                        {/* Hamburger Menu (always visible) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center justify-center size-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Menu"
                        >
                            <span className="material-symbols-outlined text-2xl text-slate-700 dark:text-slate-300">
                                {isMobileMenuOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={closeMobileMenu}
                    ></div>

                    {/* Drawer */}
                    <div className="fixed top-[57px] right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#1A222C] border-l border-slate-200 dark:border-gray-800 z-50 overflow-y-auto">
                        <nav className="flex flex-col p-6 gap-2">
                            {/* Navigation Links */}
                            <Link
                                to="/how-it-works"
                                onClick={closeMobileMenu}
                                className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                How It Works
                            </Link>
                            <Link
                                to="/pricing"
                                onClick={closeMobileMenu}
                                className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/support"
                                onClick={closeMobileMenu}
                                className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Support
                            </Link>
                            <Link
                                to="/help"
                                onClick={closeMobileMenu}
                                className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Help
                            </Link>
                            <Link
                                to="/contact"
                                onClick={closeMobileMenu}
                                className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Contact
                            </Link>

                            <div className="my-4 border-t border-slate-200 dark:border-gray-800"></div>

                            {/* Conditional: Logged OUT */}
                            {!isAuthed && (
                                <>
                                    <Link
                                        to="/practice"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-3 text-base font-bold text-white bg-primary hover:bg-blue-600 rounded-lg transition-colors text-center"
                                    >
                                        Start Practicing
                                    </Link>
                                    <Link
                                        to="/signin"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-center"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}

                            {/* Conditional: Logged IN */}
                            {isAuthed && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/practice"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Practice
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                            navigate("/");
                                        }}
                                        className="px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
