// src/lib/analytics.js
// Analytics stub for MVP - replace with real implementation later

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
    // Stub implementation - logs to console in development
    if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, params);
    }
    // TODO: Integrate with Google Analytics, Mixpanel, or other analytics service
};

/**
 * Track a Google Analytics event
 * @param {string} eventName - Name of the event
 * @param {object} params - Event parameters
 */
export const gaEvent = (eventName, params = {}) => {
    // Stub implementation - logs to console in development
    if (import.meta.env.DEV) {
        console.log('[GA Event]', eventName, params);
    }
    // TODO: Integrate with Google Analytics gtag
    // Example: window.gtag?.('event', eventName, params);
};

export default { trackEvent, gaEvent };
