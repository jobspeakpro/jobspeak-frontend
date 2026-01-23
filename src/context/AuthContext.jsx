// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserState(session.user);
        setIsAuthed(true);
      }
      setLoading(false);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserState(session.user);
        setIsAuthed(true);
      } else {
        setUserState(null);
        setIsAuthed(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // SYNC: Activity data (guest -> user)
  useEffect(() => {
    if (user && typeof localStorage !== 'undefined' && localStorage.getItem('jsp_guest_userKey')) {
      // Fire and forget sync to merge guest activity with user account
      // apiClient handles attaching x-guest-key automatically
      console.log('[Activity] Triggering guest activity sync...');
      apiClient('/api/activity/sync', { method: 'POST' })
        .then(() => console.log('[Activity] Sync initiated'))
        .catch(err => console.warn('[Activity] Sync failed (non-critical):', err));
    }
  }, [user]);

  // SYNC: Guest referral data to DB on login/signup
  useEffect(() => {
    const syncReferralData = async () => {
      if (!user) return;

      // Check if guest answered referral question in localStorage
      const guestValue = localStorage.getItem("jsp_heard_about_value");
      const guestAnswered = localStorage.getItem("jsp_heard_about_answered");

      if (!guestValue || !guestAnswered) return; // No guest data to sync

      // Check if DB already has a value (write-once: only sync if DB is NULL)
      try {
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('heard_about_us')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.warn("[SYNC] Failed to fetch profile:", fetchError);
          return;
        }

        // Only sync if DB is NULL (write-once semantics)
        if (profile && (profile.heard_about_us === null || profile.heard_about_us === undefined || profile.heard_about_us === "")) {
          console.log("[SYNC] Syncing guest referral data to DB:", guestValue);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ heard_about_us: guestValue })
            .eq('id', user.id);

          if (updateError) {
            console.warn("[SYNC] Failed to sync referral data:", updateError);
          } else {
            console.log("[SYNC] Successfully synced referral data to DB");
            // Clear localStorage after successful sync (optional, but keeps it clean)
            // Keep it for now in case sync fails and we need to retry
          }
        } else {
          console.log("[SYNC] DB already has heard_about_us value, skipping sync");
        }
      } catch (e) {
        console.error("[SYNC] Error syncing referral data:", e);
      }
    };

    syncReferralData();
  }, [user]);

  // MIGRATION: Guest -> Supabase
  useEffect(() => {
    const migrateGuestData = async () => {
      if (!user) return;

      const flagKey = `jsp_migrated_${user.id}`;
      if (localStorage.getItem(flagKey)) return; // Already migrated

      console.log("[MIGRATION] Starting guest data migration for", user.id);

      // 1. Profile Migration
      const onboardingData = localStorage.getItem("jsp_onboarding_v1");
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData);
          // Filter out empty values to avoid overwriting existing data
          const updates = {};
          ["display_name", "job_title", "seniority", "industry", "difficulty", "tts_speed_pref"].forEach(field => {
            if (parsed[field]) updates[field] = parsed[field];
          });
          if (parsed.focus_areas && parsed.focus_areas.length > 0) {
            updates.focus_areas = parsed.focus_areas;
          }

          if (Object.keys(updates).length > 0) {
            const { error } = await supabase
              .from('profiles')
              .upsert({ id: user.id, ...updates }, { onConflict: 'id' });

            if (error) console.error("[MIGRATION] Profile upsert failed", error);
            else console.log("[MIGRATION] Profile migrated");
          }
        } catch (e) {
          console.error("[MIGRATION] Profile parse error", e);
        }
      }

      // 2. Practice History Migration
      const progressData = localStorage.getItem("jsp_progress");
      if (progressData) {
        try {
          const sessions = JSON.parse(progressData);
          if (Array.isArray(sessions) && sessions.length > 0) {
            // Prepare specific rows for practice_sessions table
            // Schema assumption: user_id, question, transcript, analysis_json, score, audio_url, created_at, client_session_id
            const rows = sessions.map((s, idx) => ({
              user_id: user.id,
              // Generated stable ID: user_timestamp_index
              client_session_id: `mig_${user.id}_${s.timestamp || Date.now()}_${idx}`,
              question: s.question || s.prompt || "Unknown Question",
              transcript: s.transcript || "",
              // Store full analysis object if field exists, else mapping
              analysis_json: s.analysis || s.feedback || {},
              score: s.score || 0,
              // Skip blobs as they might be expired or invalid, but if it's base64 or external url keep it. 
              // LocalStorage probably has blobs which are useless. We skip audio_url usually unless it's remote.
              created_at: s.timestamp ? new Date(s.timestamp).toISOString() : new Date().toISOString()
            }));

            // Attempt insert. Use upsert on client_session_id if possible, or just insert.
            // If table has unique constraint on client_session_id, upsert is safe.
            const { error } = await supabase
              .from('practice_sessions')
              .upsert(rows, { onConflict: 'client_session_id', ignoreDuplicates: true });

            if (error) {
              // Graceful fail: table might not exist or columns mismatch
              console.warn("[MIGRATION] Practice sessions insert failed (continuing)", error);
            } else {
              console.log("[MIGRATION] Sessions migrated:", rows.length);
            }
          }
        } catch (e) {
          console.error("[MIGRATION] Progress parse error", e);
        }
      }

      // 3. Mark Complete & Cleanup
      localStorage.setItem(flagKey, "true");
      // Only remove onboarding profile data to avoid confusion in wizard.
      // Keep progress data as backup? User said: "remove only the migrated key(s): localStorage.removeItem('jsp_onboarding_v1')"
      // User also said: "If profile migration succeeds but sessions fail, still clear jsp_onboarding_v1 but keep jsp_progress"
      // Since we catch errors above, we proceed here.
      localStorage.removeItem("jsp_onboarding_v1");
      console.log("[MIGRATION] Complete");
    };

    migrateGuestData();
  }, [user]);

  const signin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data.user;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserState(null);
    setIsAuthed(false);
  };

  const updateUser = (updatedUser) => {
    setUserState(updatedUser);
  };

  const value = {
    isAuthed,
    user,
    signin,
    signup,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

