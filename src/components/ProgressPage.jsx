// src/components/ProgressPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import SessionDetail from "./SessionDetail.jsx";
import { getUserKey } from "../utils/userKey.js";
import { isNetworkError } from "../utils/networkError.js";
import { apiClient } from "../utils/apiClient.js";

export default function ProgressPage({ onNavigateToInterview }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userKey = getUserKey();
      const data = await apiClient(`/api/sessions?userKey=${encodeURIComponent(userKey)}&limit=10`);
      // Ensure data is an array
      const sessionsArray = Array.isArray(data) ? data : [];
      setSessions(sessionsArray);
    } catch (err) {
      console.error("Error loading sessions:", err);
      if (isNetworkError(err)) {
        setError("We're temporarily unavailable. Give us a moment and try again.");
      } else {
        setError(err.message || "Couldn't load your progress. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Memoize stats calculation to avoid recalculating on every render
  const stats = useMemo(() => {
    // Filter out sessions with null or undefined scores
    const sessionsWithScores = sessions.filter((s) => 
      s?.score !== null && s?.score !== undefined && typeof s.score === 'number'
    );
    
    if (sessionsWithScores.length === 0) {
      return {
        bestScore: null,
        averageScore: null,
        lastScore: null,
      };
    }

    const scores = sessionsWithScores.map((s) => s.score).filter(score => typeof score === 'number');
    if (scores.length === 0) {
      return {
        bestScore: null,
        averageScore: null,
        lastScore: null,
      };
    }

    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const lastScore = sessionsWithScores[0]?.score ?? null; // First item is most recent

    return {
      bestScore,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      lastScore,
    };
  }, [sessions]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Date not available";
    }
  }, []);

  const truncateText = useCallback((text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return "No transcript available";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Your Progress
        </h2>
        <div className="bg-white border border-rose-100 rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            <p className="text-sm text-slate-500">Loading your progress...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Your Progress
        </h2>
        <div className="bg-white border border-rose-100 rounded-2xl p-6">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-sm text-rose-800 font-semibold mb-1">Oops</p>
            <p className="text-sm text-rose-700 mb-3">{error}</p>
            <button
              type="button"
              onClick={loadSessions}
              className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Your Progress
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-rose-100 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1">Best Score</div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.bestScore !== null ? stats.bestScore : "—"}
            </div>
          </div>
          <div className="bg-white border border-rose-100 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1">Average Score (Last 10)</div>
            <div className="text-2xl font-bold text-rose-600">
              {stats.averageScore !== null ? stats.averageScore : "—"}
            </div>
          </div>
          <div className="bg-white border border-rose-100 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1">Last Score</div>
            <div className="text-2xl font-bold text-slate-700">
              {stats.lastScore !== null ? stats.lastScore : "—"}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white border border-rose-100 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Recent Sessions (Last 10)
          </h3>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Start tracking your progress
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-sm">
                Complete your first practice session to see scores, trends, and feedback here.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToInterview) {
                    onNavigateToInterview();
                    // Scroll to interview section after a brief delay to allow tab switch
                    setTimeout(() => {
                      const interviewSection = document.getElementById('practice-section');
                      if (interviewSection) {
                        interviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                // Ensure session has required fields
                const sessionId = session?.id || session?.sessionId || `session-${Math.random()}`;
                const transcript = session?.transcript || "";
                const score = session?.score;
                
                return (
                  <button
                    key={sessionId}
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className="w-full text-left p-4 rounded-lg border border-rose-100 hover:bg-rose-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-2">
                          {formatDate(session?.createdAt)}
                        </div>
                        <div className="text-sm text-slate-900 mb-2 line-clamp-2">
                          {truncateText(transcript)}
                        </div>
                        <div className="text-sm text-rose-600 font-semibold">
                          Score: {score !== null && score !== undefined ? score : "—"}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">View →</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

