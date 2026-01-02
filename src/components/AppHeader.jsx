import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import AvatarDropdown from "./AvatarDropdown.jsx";
import PreparingForBar from "./PreparingForBar.jsx";

export default function AppHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile data to get job_title and onboarding status
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('job_title, onboarding_complete')
                    .eq('id', user.id)
                    .single();

                if (data && !error) {
                    setProfile(data);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Determine logo route: always go to home /
    const logoRoute = "/";

    // Show "Preparing for" only on specific pages and if job_title exists
    // Dashboard, Practice, Profile paths
    const allowedPaths = ['/dashboard', '/practice', '/profile', '/contact'];
    const showPreparingFor =
        profile?.onboarding_complete &&
        profile?.job_title &&
        allowedPaths.some(path => location.pathname.startsWith(path));

    return (
        <div className="sticky top-0 z-50 w-full flex flex-col">
            <header className="w-full bg-white dark:bg-[#1A222C] border-b border-slate-200 dark:border-gray-800">
                <div className="px-4 sm:px-10 py-3 flex items-center justify-between">
                    {/* Logo - Clickable */}
                    <Link to={logoRoute} className="flex items-center gap-4 text-[#111418] dark:text-white hover:opacity-80 transition-opacity">
                        <div className="size-8 text-primary">
                            {/* Logo SVG */}
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_6_330)">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold leading-tight tracking-tight">JobSpeak Pro</h2>
                        </div>
                    </Link>

                    {/* Right side: Avatar Dropdown */}
                    <div className="flex items-center gap-4">
                        <AvatarDropdown />
                    </div>
                </div>
            </header>

            {showPreparingFor && (
                <PreparingForBar jobTitle={profile.job_title} />
            )}
        </div>
    );
}
