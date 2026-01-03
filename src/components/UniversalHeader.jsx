import React from "react";
import { Link } from "react-router-dom";
import AvatarDropdown from "./AvatarDropdown.jsx";

export default function UniversalHeader() {
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

                    {/* Right side: UNIVERSAL HEADER RULE - Avatar OR Hamburger */}
                    <div className="flex items-center gap-4">
                        <AvatarDropdown />
                    </div>
                </div>
            </header>
        </>
    );
}
