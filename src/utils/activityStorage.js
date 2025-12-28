// src/utils/activityStorage.js
// Utility for managing practice activity in localStorage

const ACTIVITY_KEY = 'practice_activity_v1';

/**
 * Get all practice activity from localStorage
 * @returns {Array} Array of activity items
 */
export function getActivity() {
    try {
        const stored = localStorage.getItem(ACTIVITY_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Failed to load activity:', err);
        return [];
    }
}

/**
 * Add a new activity item
 * @param {Object} item - Activity item { type, questionText, role, duration }
 */
export function addActivity(item) {
    try {
        const activity = getActivity();
        const newItem = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...item
        };
        activity.unshift(newItem); // Add to beginning

        // Keep only last 50 items
        const trimmed = activity.slice(0, 50);
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));

        return newItem;
    } catch (err) {
        console.error('Failed to add activity:', err);
        return null;
    }
}

/**
 * Clear all activity (for testing/reset)
 */
export function clearActivity() {
    try {
        localStorage.removeItem(ACTIVITY_KEY);
    } catch (err) {
        console.error('Failed to clear activity:', err);
    }
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
}
