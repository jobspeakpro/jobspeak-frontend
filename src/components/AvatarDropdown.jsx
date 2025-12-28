import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AvatarDropdown() {
    const navigate = useNavigate();
    const { user, profile, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Avatar priority: profile.avatar_url (Supabase) → user_metadata → localStorage → default
    const localAvatar = user?.id ? localStorage.getItem(`jsp_avatar_${user.id}`) : null;
    const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || localAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7OSQFZhF2rG-VynZ6WAzVggeYqM2KK1RlKBfcxtnvZ5wkKoNZYvIS78KvIQ3MguF106L9mdFmP61Mwv15fIJoq76Q-YtND9b1xiNMqREBjzXc1nnwTuBt64OuVT7ibePkxl2_MeM962jFqlOoLEp7YiYBSU_nBemtkqQzzSreOhqr2o2PSEC0MRgD_2ub6WjYS2-hQsYRrXXjhdDxtV8TCUgo8vHrXP_F_sLUgYVoUOTL3jYcfcb17z-Z6iWow8YIVVSxbDifNfMU";
    const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : "User");

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

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="block bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden"
                style={{ backgroundImage: `url("${displayAvatar}")` }}
                title={displayName}
            >
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-1 border border-slate-200 dark:border-slate-700 z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        Account
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        Dashboard
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
    );
}
