import React from 'react';

export default function PreparingForBar({ jobTitle }) {
    if (!jobTitle) return null;

    return (
        <div className="w-full bg-slate-50 dark:bg-[#11161d] border-b border-slate-200 dark:border-gray-800 py-1.5 px-4 sm:px-10 flex items-center justify-center sm:justify-start">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Preparing for: <span className="text-primary font-semibold">{jobTitle} role</span>
            </span>
        </div>
    );
}
