// src/utils/voiceSelection.js

/**
 * Selects the best available speechSynthesis voice based on preferences.
 * 
 * Priority:
 * 1. User-selected voice (if provided)
 * 2. en-GB voices (British English)
 * 3. Voices containing "Google" or "Microsoft" in name
 * 4. First English voice found
 * 5. First available voice
 * 
 * Note: Browser voices vary by system and browser. We cannot guarantee
 * identical voice selection across all users' devices.
 * 
 * @param {string} preferredVoiceURI - Optional user-selected voice URI from settings
 * @returns {SpeechSynthesisVoice|null} Selected voice or null if none available
 */
export function selectBestVoice(preferredVoiceURI = null) {
  if (!window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return null;
  }

  // If user has selected a specific voice, try to use it
  if (preferredVoiceURI) {
    const selectedVoice = voices.find(v => v.voiceURI === preferredVoiceURI);
    if (selectedVoice) {
      return selectedVoice;
    }
  }

  // Priority 1: Prefer en-GB voices (British English)
  const enGBVoices = voices.filter(v => 
    v.lang && v.lang.toLowerCase().startsWith('en-gb')
  );
  if (enGBVoices.length > 0) {
    // Within en-GB, prefer Google/Microsoft voices
    const preferredEnGB = enGBVoices.find(v => 
      v.name.toLowerCase().includes('google') || 
      v.name.toLowerCase().includes('microsoft')
    );
    if (preferredEnGB) {
      return preferredEnGB;
    }
    // Fallback to first en-GB voice
    return enGBVoices[0];
  }

  // Priority 2: Prefer voices with "Google" or "Microsoft" in name
  const preferredBrandVoices = voices.filter(v => 
    v.name.toLowerCase().includes('google') || 
    v.name.toLowerCase().includes('microsoft')
  );
  if (preferredBrandVoices.length > 0) {
    // Prefer English voices within brand voices
    const englishBrandVoice = preferredBrandVoices.find(v => 
      v.lang && v.lang.toLowerCase().startsWith('en')
    );
    if (englishBrandVoice) {
      return englishBrandVoice;
    }
    // Fallback to first brand voice
    return preferredBrandVoices[0];
  }

  // Priority 3: Fallback to first English voice
  const englishVoices = voices.filter(v => 
    v.lang && v.lang.toLowerCase().startsWith('en')
  );
  if (englishVoices.length > 0) {
    return englishVoices[0];
  }

  // Priority 4: Fallback to first available voice
  return voices[0];
}

