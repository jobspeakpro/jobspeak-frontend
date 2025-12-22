// src/utils/apiClient.js

// ALWAYS use relative paths - Vercel proxy handles routing to Railway backend
// This ensures production NEVER calls Railway directly (avoids CORS)
// Production must ALWAYS use relative paths (e.g., /api/stt, /voice/generate, /ai/micro-demo)
// No environment variables, no fallback URLs, no absolute URLs allowed

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
  
  // PRODUCTION ENFORCEMENT: Force relative paths only
  // Block ALL absolute URLs - no exceptions
  // ALL requests must use relative paths (e.g., /api/stt, /voice/generate, /ai/micro-demo)
  // Vercel rewrites handle routing to the Railway backend
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    throw new Error(
      `Absolute URL blocked: ${endpoint}. ` +
      `Use relative paths only (e.g., /api/stt, /voice/generate, /ai/micro-demo). ` +
      `Vercel rewrites handle routing to the backend.`
    );
  }
  
  // Ensure endpoint starts with / for relative paths
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Get persistent userKey for anonymous tracking
  const userKey = getUserKey();
  
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
      ...fetchOptions,
      headers,
    });
    
    // Parse JSON if requested
    if (parseJson) {
      const data = await response.json();
      
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

