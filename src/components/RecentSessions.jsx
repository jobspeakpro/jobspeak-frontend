// src/components/RecentSessions.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import SessionDetail from "./SessionDetail.jsx";
import { isNetworkError } from "../utils/networkError.js";
import { getUserKey } from "../utils/userKey.js";
import { apiClient } from "../utils/apiClient.js";

export default function RecentSessions({ refreshTrigger }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [serverError, setServerError] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const userKey = getUserKey();
      const data = await apiClient(`/api/sessions?userKey=${encodeURIComponent(userKey)}&limit=5`);
      setSessions(data);
      setServerError(false);
    } catch (err) {
      console.error("Error loading sessions:", err);
      if (isNetworkError(err)) {
        setServerError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger, loadSessions]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const truncateText = useCallback((text, maxLength = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Recent Sessions
        </h3>
        <p className="text-xs text-slate-500">Loading...</p>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Recent Sessions
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-800 mb-2">
            We're temporarily unavailable. Give us a moment and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setServerError(false);
              loadSessions();
            }}
            className="text-xs px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Recent Sessions
        </h3>
        <p className="text-xs text-slate-500">
          No sessions yet. Complete a practice session to see your history here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-rose-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setSelectedSession(session)}
              className="w-full text-left p-3 rounded-lg border border-rose-100 hover:bg-rose-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 mb-1">
                    {formatDate(session.createdAt)}
                  </div>
                  <div className="text-xs text-slate-900 line-clamp-2">
                    {truncateText(session.transcript)}
                  </div>
                  {session.score !== null && (
                    <div className="text-xs text-rose-600 font-semibold mt-1">
                      Score: {session.score}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

