// src/utils/usage.js

/**
 * Helper function to check if usage is blocked
 * @param {Object} usage - Usage object from backend: { used, limit, remaining, blocked }
 * @returns {boolean} - true if blocked or remaining <= 0
 */
export function isBlocked(usage) {
  if (!usage) return false;
  return usage.blocked === true || (usage.remaining !== undefined && usage.remaining <= 0);
}

