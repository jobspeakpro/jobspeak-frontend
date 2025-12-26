// src/lib/storage.js
// MVP storage layer using localStorage (no backend yet)

const KEYS = {
  USER: 'jsp_user',
  SETTINGS: 'jsp_settings',
  PROGRESS: 'jsp_progress',
  CONTACT_MESSAGES: 'jsp_contact_messages',
};

/**
 * Get user from localStorage
 * @returns {Object|null} User object with id, name, email
 */
export function getUser() {
  try {
    const userStr = localStorage.getItem(KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Set user in localStorage
 * @param {Object} user - User object with id, name, email
 */
export function setUser(user) {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting user:', error);
  }
}

/**
 * Clear user from localStorage
 */
export function clearUser() {
  try {
    localStorage.removeItem(KEYS.USER);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
}

/**
 * Get settings from localStorage
 * @returns {Object} Settings object with preferredPracticeMode, autoPlayAudio, dailyReminder
 */
export function getSettings() {
  try {
    const settingsStr = localStorage.getItem(KEYS.SETTINGS);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
    // Return defaults
    return {
      preferredPracticeMode: 'voice',
      autoPlayAudio: true,
      dailyReminder: false,
      audioReadQuestion: false,
      ttsVoiceURI: '',
      ttsRate: 1.0,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      preferredPracticeMode: 'voice',
      autoPlayAudio: true,
      dailyReminder: false,
      audioReadQuestion: false,
      ttsVoiceURI: '',
      ttsRate: 1.0,
    };
  }
}

/**
 * Set settings in localStorage
 * @param {Object} settings - Settings object
 */
export function setSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error setting settings:', error);
  }
}

/**
 * Get progress from localStorage
 * @returns {Object} Progress object with sessions, streak, totals
 */
export function getProgress() {
  try {
    const progressStr = localStorage.getItem(KEYS.PROGRESS);
    if (progressStr) {
      return JSON.parse(progressStr);
    }
    // Return defaults
    return {
      sessions: [],
      streak: 0,
      totals: {
        sessions: 0,
        questions: 0,
      },
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      sessions: [],
      streak: 0,
      totals: {
        sessions: 0,
        questions: 0,
      },
    };
  }
}

/**
 * Set progress in localStorage
 * @param {Object} progress - Progress object
 */
export function setProgress(progress) {
  try {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error setting progress:', error);
  }
}

/**
 * Save a contact message to localStorage
 * @param {Object} message - Message object with name, email, topic, message, createdAt
 */
export function saveContactMessage(message) {
  try {
    const messagesStr = localStorage.getItem(KEYS.CONTACT_MESSAGES);
    const messages = messagesStr ? JSON.parse(messagesStr) : [];
    messages.push({
      ...message,
      createdAt: message.createdAt || new Date().toISOString(),
    });
    localStorage.setItem(KEYS.CONTACT_MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving contact message:', error);
  }
}

