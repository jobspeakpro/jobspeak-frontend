import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function AvatarDropdown() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const dropdownRef = useRef(null);

    // Fetch avatar URL from profile
    useEffect(() => {
        if (user?.id) {
            supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data?.avatar_url) {
                        setAvatarUrl(data.avatar_url);
                    }
                });
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate("/");
    };

    // Logged OUT menu items
    const loggedOutItems = [
        { label: "Sign in", onClick: () => navigate("/signin") },
        { label: "Create account", onClick: () => navigate("/signup") },
        { label: "Contact", onClick: () => navigate("/contact") },
        { label: "Help / FAQ", onClick: () => navigate("/help") },
    ];

    // Logged IN menu items
    const loggedInItems = [
        { label: "Dashboard", onClick: () => navigate("/dashboard") },
        { label: "Practice", onClick: () => navigate("/practice") },
        { label: "My Progress", onClick: () => navigate("/progress") },
        { label: "Profile", onClick: () => navigate("/profile") },
        { label: "Billing / Upgrade", onClick: () => navigate("/pricing") },
        { label: "Sign out", onClick: handleLogout, danger: true },
    ];

    const menuItems = user ? loggedInItems : loggedOutItems;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                aria-label="User menu"
            >
                {avatarUrl || user?.user_metadata?.avatar_url ? (
                    <img
                        src={avatarUrl || user.user_metadata.avatar_url}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A222C] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${item.danger
                                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
