// src/lib/analytics.js
// Analytics wrapper using window.gtag (loaded from index.html)

/**
 * Initialize Google Analytics
 * This is a no-op if gtag is not available
 */
export function initGA() {
  // GA is loaded from index.html, so we just verify it's available
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // GA is already initialized in index.html
    return true;
  }
  return false;
}

/**
 * Track a page view
 * @param {string} path - The page path to track
 */
export function trackPageView(path) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'page_view', {
        page_path: path,
      });
    } catch (err) {
      // Silently fail if there's an error
      console.error('Analytics error:', err);
    }
  }
}

/**
 * Track a custom event
 * @param {string} name - Event name
 * @param {object} params - Event parameters
 */
export function trackEvent(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', name, params);
    } catch (err) {
      // Silently fail if there's an error
      console.error('Analytics error:', err);
    }
  }
}

