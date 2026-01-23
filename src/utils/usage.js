// src/utils/usage.js

/**
 * Helper function to check if usage is blocked
 * @param {Object} usage - Usage object from backend: { used, limit, remaining, blocked }
 * @returns {boolean} - true if blocked, remaining <= 0, or used >= limit
 */
export function isBlocked(usage) {
  if (!usage) return false;
  return usage?.blocked || usage?.remaining <= 0 || usage?.used >= usage?.limit;
}

















