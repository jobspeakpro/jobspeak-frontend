// src/utils/apiClient.js

// Default to empty string for relative paths when VITE_API_BASE is not set
// Empty string means use relative paths, which work with Netlify proxy
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

/**
 * Check if API base URL is configured
 * @returns {boolean} Always returns true - empty string is valid for relative paths
 */
export function isApiBaseConfigured() {
  // Empty string is valid - it means we use relative paths with proxy
  return true;
}

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
  
  // Build full URL - use relative path if API_BASE is empty string (for Netlify proxy)
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : API_BASE === '' 
      ? endpoint 
      : `${API_BASE}${endpoint}`;
  
  // Default headers for JSON requests (unless body is FormData)
  const defaultHeaders = {};
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    if (!fetchOptions.headers?.['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    // Stringify JSON body if it's an object
    if (typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }
  }
  
  // Merge headers
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

