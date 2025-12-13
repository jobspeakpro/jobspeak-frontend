// src/components/ErrorPage.jsx
import React from "react";

export default function ErrorPage({ error, errorInfo, onReset }) {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-rose-100 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-rose-500 text-4xl">
              error
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Oops, something went wrong
          </h1>
          <p className="text-sm text-slate-600">
            We hit a small snag. Don't worry—your data is safe.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={onReset}
            className="w-full px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors shadow-sm"
          >
            Try again
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition-colors text-sm"
          >
            Reload page
          </button>
        </div>

        {import.meta.env.DEV && error && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 mb-2">
              Error details (development only)
            </summary>
            <div className="bg-slate-50 rounded-lg p-4 text-xs font-mono text-slate-700 overflow-auto max-h-48">
              <div className="font-semibold text-rose-600 mb-2">
                {error.toString()}
              </div>
              {errorInfo && (
                <pre className="whitespace-pre-wrap text-xs">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}

        <p className="text-xs text-slate-400 mt-6">
          If this keeps happening, reach out to our support team.
        </p>
      </div>
    </div>
  );
}

