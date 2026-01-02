// src/utils/userKey.js

/**
 * Get or create a unique user key for session tracking.
 * 
 * Priority:
 * 1. Supabase user.id (if logged in)
 * 2. localStorage guest key (if logged out)
 * 3. Generate new guest key with crypto.randomUUID()
 * 
 * @param {Object} user - Optional Supabase user object
 * @returns {string} Unique user identifier
 */
export function getUserKey(user = null) {
  // If user is logged in, always use their Supabase ID
  if (user?.id) {
    return user.id;
  }

  // For logged-out users, use persistent guest key
  const STORAGE_KEY = "jsp_guest_userKey";

  // Try to get existing guest key from localStorage
  let userKey = localStorage.getItem(STORAGE_KEY);

  // Generate new UUID if missing
  if (!userKey) {
    try {
      // Use crypto.randomUUID() if available (modern browsers)
      userKey = crypto.randomUUID();
    } catch (e) {
      // Fallback for environments without crypto.randomUUID()
      userKey = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)} `;
    }

    // Store in localStorage for future use
    localStorage.setItem(STORAGE_KEY, userKey);
  }

  return userKey;
}
