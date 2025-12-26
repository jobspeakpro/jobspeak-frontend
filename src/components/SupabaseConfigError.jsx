// src/components/SupabaseConfigError.jsx
import React from "react";

export default function SupabaseConfigError() {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-rose-100 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Configuration Error
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Supabase environment variables are missing.
          </p>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-left text-xs text-slate-700">
            <p className="font-semibold mb-2">Required environment variables:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-white px-1 rounded">VITE_SUPABASE_URL</code></li>
              <li><code className="bg-white px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
            </ul>
            <p className="mt-3 text-slate-600">
              Please check your <code className="bg-white px-1 rounded">.env.local</code> file and ensure these variables are set.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors shadow-sm"
          >
            Reload page
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          If you're a developer, please configure the environment variables and restart the development server.
        </p>
      </div>
    </div>
  );
}

