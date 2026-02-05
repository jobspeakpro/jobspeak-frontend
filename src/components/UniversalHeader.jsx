import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarDropdown from "./AvatarDropdown.jsx";

export default function UniversalHeader() {
    const { isAuthed } = useAuth();
    const navigate = useNavigate();

    return (
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

                {/* Desktop Public Nav Removed (Restoring Original simplified header) */}

                {/* Right Side: Auth Buttons or Avatar */}
                <div className="flex items-center gap-4">
                    {/* Desktop Logged Out Actions */}
                    {!isAuthed && (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/signin"
                                className="text-sm font-bold text-slate-700 dark:text-white hover:text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/practice"
                                className="h-9 px-4 flex items-center justify-center rounded-full bg-primary text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                Start Practicing
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu / Avatar Dropdown (Handles Hamburger for Logged Out or Avatar for Logged In) */}
                    <div className={!isAuthed ? "md:hidden" : ""}>
                        <AvatarDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}
