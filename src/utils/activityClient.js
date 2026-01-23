// src/utils/activityClient.js

/**
 * Activity tracking client for practice and mock interview sessions.
 *
 * STRICT GUARDRAILS:
 * - Only tracks if VITE_ACTIVITY_TRACKING=1
 * - Fire-and-forget: never blocks UI
 * - Errors are swallowed silently
 * - Deduplication handled by caller using sessionStorage
 */

import { apiClient } from './apiClient.js';

/**
 * Track activity start event (practice or mock interview session)
 *
 * @param {Object} params
 * @param {string} params.activityType - "practice" or "mock_interview"
 * @param {Object} params.context - Additional context (source, type, etc.)
 * @returns {Promise<void>} Fire-and-forget promise (errors swallowed)
 */
export async function trackActivityStart({ activityType, context = {} }) {
  // Gate: Only track if feature flag enabled
  if (import.meta.env.VITE_ACTIVITY_TRACKING !== '1') {
    return;
  }

  try {
    // Fire-and-forget: send tracking request
    const promise = apiClient('/api/activity/start', {
      method: 'POST',
      body: {
        activityType,
        context,
      },
    });

    // DEBUG INSTRUMENTATION
    if (typeof window !== 'undefined') {
      promise.then(() => {
        if (!window.__JSP_DEBUG__) window.__JSP_DEBUG__ = {};
        window.__JSP_DEBUG__.lastActivityStatus = 'success';
        window.__JSP_DEBUG__.lastActivityTime = Date.now();
        console.debug('[Activity] Tracked success:', activityType);
      }).catch(() => {
        if (!window.__JSP_DEBUG__) window.__JSP_DEBUG__ = {};
        window.__JSP_DEBUG__.lastActivityStatus = 'error';
        window.__JSP_DEBUG__.lastActivityTime = Date.now();
      });
    }

    await promise;
  } catch (error) {
    // Swallow all errors silently - tracking must never break UI
    console.debug('[Activity Tracking] Silent error:', error.message);
    if (typeof window !== 'undefined') {
      if (!window.__JSP_DEBUG__) window.__JSP_DEBUG__ = {};
      window.__JSP_DEBUG__.lastActivityStatus = 'error';
      window.__JSP_DEBUG__.lastActivityTime = Date.now();
    }
  }
}

/**
 * Generate a unique tab ID for deduplication
 * Uses sessionStorage to create one ID per browser tab
 *
 * @returns {string} Unique tab identifier
 */
export function getTabId() {
  const key = 'jsp_tab_id';
  let tabId = sessionStorage.getItem(key);

  if (!tabId) {
    tabId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, tabId);
  }

  return tabId;
}

/**
 * Check if activity has already been tracked for this tab + date
 *
 * @param {string} activityType - "practice" or "mock_interview"
 * @returns {boolean} True if already tracked
 */
export function isActivityTracked(activityType) {
  const tabId = getTabId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `jsp_activity_${activityType}_${tabId}_${today}`;

  return sessionStorage.getItem(key) === 'true';
}

/**
 * Mark activity as tracked for this tab + date
 *
 * @param {string} activityType - "practice" or "mock_interview"
 */
export function markActivityTracked(activityType) {
  const tabId = getTabId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `jsp_activity_${activityType}_${tabId}_${today}`;

  sessionStorage.setItem(key, 'true');
}
