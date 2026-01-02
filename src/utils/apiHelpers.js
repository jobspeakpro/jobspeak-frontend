// src/utils/apiHelpers.js
// Centralized API base URL helper to prevent 404s

/**
 * Get the API base URL from environment variable
 * Falls back to same-origin if not set (for production builds)
 */
export function getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || '';
}

/**
 * Construct full API URL with base URL prefix
 * @param {string} endpoint - API endpoint path (e.g., '/api/mock-interview/questions')
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint) {
    const base = getApiBaseUrl();
    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
}

/**
 * Fetch wrapper that automatically uses API base URL
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    return fetch(url, options);
}
