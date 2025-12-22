// src/components/SessionDetail.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient } from "../utils/apiClient.js";

export default function SessionDetail({ session, onClose, sessionId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(session);
  const [isAiResponseExpanded, setIsAiResponseExpanded] = useState(false);
  const [copiedState, setCopiedState] = useState(null); // 'transcript' | 'feedback' | null

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient(`/api/sessions/${sessionId}`);
      setSessionData(data);
    } catch (err) {
      console.error("Error loading session:", err);
      if (isNetworkError(err)) {
        setError("We're temporarily unavailable. Give us a moment and try again.");
      } else {
        setError("Connection issue. Try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // If sessionId is provided, fetch the session
  useEffect(() => {
    if (sessionId && !session) {
      loadSession();
    } else if (session) {
      setSessionData(session);
    }
    // Reset expanded state and copied state when session changes
    setIsAiResponseExpanded(false);
    setCopiedState(null);
  }, [sessionId, session, loadSession]);

  // Format date nicely
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }, []);

  // Parse AI response (stored as JSON string)
  const parseAiResponse = useCallback((aiResponse) => {
    if (!aiResponse) return "No AI feedback available";

    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.improved) {
        return parsed.improved;
      } else if (parsed.message) {
        return parsed.message;
      } else if (typeof parsed === "string") {
        return parsed;
      } else {
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      // If not JSON, use as-is
      return aiResponse;
    }
  }, []);

  // Check if AI response is large (more than 500 characters)
  const isAiResponseLarge = useCallback((text) => {
    if (!text || typeof text !== 'string') return false;
    return text.length > 500;
  }, []);

  // Truncate text for preview
  const truncateText = useCallback((text, maxLength = 500) => {
    if (!text || typeof text !== 'string') return text || "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }, []);

  // Copy to clipboard with feedback
  const handleCopy = async (text, type) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(type);
      // Reset after 2 seconds
      setTimeout(() => setCopiedState(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            <p className="text-sm text-slate-600">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full">
          <div className="sticky top-0 bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Session Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm text-rose-800 font-semibold mb-1">Oops</p>
              <p className="text-sm text-rose-700 mb-3">{error}</p>
              {error.includes("temporarily unavailable") && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    loadSession();
                  }}
                  className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!sessionData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full">
          <div className="sticky top-0 bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Session Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No session data available</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Memoize derived values to avoid recalculating on every render
  const formattedDate = useMemo(() => formatDate(sessionData?.createdAt), [sessionData?.createdAt, formatDate]);
  const aiResponseText = useMemo(() => parseAiResponse(sessionData?.aiResponse), [sessionData?.aiResponse, parseAiResponse]);
  const transcript = useMemo(() => sessionData?.transcript || "No transcript available", [sessionData?.transcript]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-900">Session Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date and Score */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-rose-100">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Date:</span> {formattedDate}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700">
              <span className="text-xs font-semibold">Score:</span>
              <span className="text-base font-bold">
                {sessionData.score !== null && sessionData.score !== undefined ? sessionData.score : "—"}
              </span>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-rose-500 flex items-center gap-2">
                <span>📝</span>
                Your Answer
              </h3>
              <button
                type="button"
                onClick={() => handleCopy(transcript, 'transcript')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-medium transition-colors"
              >
                {copiedState === 'transcript' ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
              {transcript}
            </div>
          </div>

          {/* AI Response */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                <span>✨</span>
                AI Feedback
              </h3>
              <button
                type="button"
                onClick={() => handleCopy(aiResponseText, 'feedback')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium transition-colors"
              >
                {copiedState === 'feedback' ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
              {isAiResponseLarge(aiResponseText) && !isAiResponseExpanded ? (
                <>
                  <div className="mb-2">{truncateText(aiResponseText)}</div>
                  <button
                    type="button"
                    onClick={() => setIsAiResponseExpanded(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs transition-colors"
                  >
                    Show more →
                  </button>
                </>
              ) : (
                <>
                  <div>{aiResponseText}</div>
                  {isAiResponseLarge(aiResponseText) && isAiResponseExpanded && (
                    <button
                      type="button"
                      onClick={() => setIsAiResponseExpanded(false)}
                      className="mt-2 text-emerald-600 hover:text-emerald-700 font-semibold text-xs transition-colors"
                    >
                      Show less ↑
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-rose-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

