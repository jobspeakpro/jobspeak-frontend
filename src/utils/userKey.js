// src/utils/userKey.js

/**
 * Get or create a unique user key for session tracking.
 * 
 * - Checks localStorage for existing key
 * - Generates crypto.randomUUID() if missing
 * - Stores in localStorage for persistence
 * 
 * @returns {string} Unique user identifier
 */
export function getUserKey() {
  const STORAGE_KEY = "jobspeak_user_key";
  
  // Try to get existing key from localStorage
  let userKey = localStorage.getItem(STORAGE_KEY);
  
  // Generate new UUID if missing
  if (!userKey) {
    try {
      // Use crypto.randomUUID() if available (modern browsers)
      userKey = crypto.randomUUID();
    } catch (e) {
      // Fallback for environments without crypto.randomUUID()
      userKey = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Store in localStorage for future use
    localStorage.setItem(STORAGE_KEY, userKey);
  }
  
  return userKey;
}
