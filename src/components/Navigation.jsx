// src/components/Navigation.jsx
import React from "react";

export default function Navigation({ activeTab, onTabChange, variant = "desktop" }) {
  const navItems = [
    { id: "interview", label: "Interview" },
    { id: "resume", label: "Resume" },
    { id: "progress", label: "Progress" },
    { id: "pricing", label: "Pricing" },
  ];

  const NavButton = ({ item, isMobile = false }) => {
    const isActive = activeTab === item.id;
    const baseClasses = isMobile
      ? "flex-1 px-2 py-2 rounded-lg text-xs font-medium transition"
      : "w-full text-left px-3 py-2 rounded-lg transition text-xs";

    const activeClasses = isActive
      ? "bg-rose-500 text-white font-semibold"
      : isMobile
      ? "text-slate-500 hover:bg-rose-50"
      : "text-slate-500 hover:bg-rose-50 hover:text-slate-900";

    return (
      <button
        type="button"
        onClick={() => onTabChange(item.id)}
        className={`${baseClasses} ${activeClasses}`}
        aria-current={isActive ? "page" : undefined}
      >
        {item.label}
      </button>
    );
  };

  if (variant === "mobile") {
    return (
      <nav className="md:hidden bg-white border-b border-rose-100 sticky top-0 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} isMobile={true} />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 px-4 py-4 space-y-1">
      {navItems.map((item) => (
        <NavButton key={item.id} item={item} />
      ))}
    </nav>
  );
}

