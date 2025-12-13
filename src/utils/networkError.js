// src/utils/networkError.js

/**
 * Detects if an error is a network error (server unavailable, connection failed)
 * @param {Error} error - The error object from a failed fetch
 * @returns {boolean} - True if it's a network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  // Network errors typically have these characteristics:
  // - TypeError: Failed to fetch
  // - NetworkError
  // - No response received (fetch promise rejects)
  const errorMessage = error.message?.toLowerCase() || "";
  const errorName = error.name?.toLowerCase() || "";
  
  return (
    errorName === "typeerror" ||
    errorName === "networkerror" ||
    errorMessage.includes("failed to fetch") ||
    errorMessage.includes("network request failed") ||
    errorMessage.includes("networkerror") ||
    errorMessage.includes("load failed")
  );
}

/**
 * Wraps a fetch call with network error handling
 * @param {Function} fetchFn - Function that returns a fetch promise
 * @param {Object} options - Options for error handling
 * @param {Function} options.onNetworkError - Callback when network error occurs
 * @param {Function} options.onHttpError - Callback when HTTP error occurs (optional)
 * @returns {Promise<Response>} - The fetch response
 */
export async function handleFetchWithNetworkError(fetchFn, { onNetworkError, onHttpError }) {
  try {
    const response = await fetchFn();
    return response;
  } catch (error) {
    if (isNetworkError(error)) {
      if (onNetworkError) {
        onNetworkError(error);
      }
      throw error;
    }
    // Re-throw non-network errors
    throw error;
  }
}

