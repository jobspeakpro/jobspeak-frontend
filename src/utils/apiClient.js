// src/utils/apiClient.js

// API routing strategy:
// ALL API calls must use RELATIVE paths only (e.g., /api/billing/create-checkout-session)
// Vite dev server proxies /api/* to http://localhost:3000/api/*
// Production uses Vercel rewrites to route /api/* to backend
// This ensures the browser NEVER calls backend URLs directly (avoids CORS and ERR_CONNECTION_REFUSED)

import { getUserKey } from "./userKey.js";

/**
 * Standardized API error
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Tiny API client wrapper around fetch
 * 
 * @param {string} endpoint - API endpoint (e.g., '/api/sessions')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {boolean} options.parseJson - Whether to parse response as JSON (default: true)
 * @returns {Promise<Response|Object>} Response object if parseJson=false, parsed JSON otherwise
 * @throws {ApiError} Standardized error object
 */
export async function apiClient(endpoint, options = {}) {
  const { parseJson = true, ...fetchOptions } = options;

  // Use relative paths to leverage Vercel proxy (avoid CORS)
  const API_BASE = "";

  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Construct final URL
  const url = `${API_BASE}${path}`;

  // Get current user from Supabase (if logged in)
  const { supabase } = await import('../lib/supabaseClient.js');
  const { data: { user } } = await supabase.auth.getUser();

  // Get persistent userKey (prioritizes user.id if logged in, else guest key)
  const userKey = getUserKey(user);

  // Default headers for JSON requests (unless body is FormData)
  const defaultHeaders = {
    'x-user-key': userKey, // Always include userKey header for all requests
  };
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    if (!fetchOptions.headers?.['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    // Stringify JSON body if it's an object
    if (typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }
  }

  // Merge headers (user-provided headers take precedence)
  const headers = {
    ...defaultHeaders,
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      credentials: "include", // Always include cookies for authentication
      ...fetchOptions,
      headers,
    });

    // Parse JSON if requested
    if (parseJson) {
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, check if response is an error
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new ApiError(
            `Request failed with status ${response.status}`,
            response.status,
            { errorText }
          );
        }
        // If response is ok but not JSON, re-throw parse error
        throw parseError;
      }

      if (!response.ok) {
        throw new ApiError(
          data.error || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    }

    // Return response object for blob/text responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        { errorText }
      );
    }

    return response;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network errors
    throw new ApiError(
      error.message || 'Network error',
      null,
      { originalError: error }
    );
  }
}

