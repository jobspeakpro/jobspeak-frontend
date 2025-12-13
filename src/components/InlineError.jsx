// src/components/InlineError.jsx
import React from "react";

/**
 * Shared inline error component for consistent error display
 * @param {Object} props
 * @param {string} props.title - Optional error title (e.g., "Oops", "Something went wrong")
 * @param {string} props.message - Error message to display
 * @param {Function} props.onRetry - Optional retry callback function
 * @param {string} props.variant - Optional variant: "compact" (default) or "expanded"
 */
export default function InlineError({ title, message, onRetry, variant = "compact" }) {
  if (!message) return null;

  if (variant === "expanded") {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-rose-600 text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-rose-900 mb-1">
                {title}
              </h3>
            )}
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-rose-700 leading-relaxed flex-1">
                {message}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-xs px-2 py-1 rounded bg-rose-200 hover:bg-rose-300 text-rose-800 font-semibold whitespace-nowrap transition"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
      {title ? (
        <div>
          <p className="text-xs text-rose-700 font-semibold mb-1">{title}</p>
          <p className="text-xs text-rose-600">{message}</p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-rose-700 flex-1">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs px-2 py-1 rounded bg-rose-200 hover:bg-rose-300 text-rose-800 font-semibold whitespace-nowrap transition"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

