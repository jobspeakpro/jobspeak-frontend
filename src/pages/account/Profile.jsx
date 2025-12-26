import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSettings, setSettings, setUser } from "../../lib/storage.js";
import { selectBestVoice } from "../../utils/voiceSelection.js";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthed, updateUser } = useAuth();
  const [settings, setSettingsState] = useState({
    preferredPracticeMode: 'voice',
    autoPlayAudio: true,
    dailyReminder: false,
    audioReadQuestion: false,
    ttsVoiceURI: '',
    ttsRate: 1.0,
  });
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [voices, setVoices] = useState([]);

  // Load settings on mount
  useEffect(() => {
    const storedSettings = getSettings();
    setSettingsState(storedSettings);
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };

    // Load voices immediately
    loadVoices();

    // Listen for voices loaded event (async)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Update display name when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
    }
  }, [user]);

  // Auto-dismiss save toast
  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => {
        setShowSaveToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveToast]);

  // If not logged in, show message
  if (!isAuthed || !user) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#101822]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">JobSpeak Pro</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">Please sign in to view your profile.</p>
            <Link to="/signin" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 border border-transparent rounded-lg transition-all">
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setShowDeleteToast(true);
      setTimeout(() => setShowDeleteToast(false), 3000);
      // Don't actually delete - just show toast
    }
  };

  const handlePreferredModeChange = (mode) => {
    const newSettings = { ...settings, preferredPracticeMode: mode };
    // Don't save immediately - just update state
    setSettingsState(newSettings);
  };

  const handleAutoPlayToggle = (checked) => {
    const newSettings = { ...settings, autoPlayAudio: checked };
    setSettingsState(newSettings);
  };

  const handleDailyReminderToggle = (checked) => {
    const newSettings = { ...settings, dailyReminder: checked };
    setSettingsState(newSettings);
  };

  const handleAudioReadQuestionToggle = (checked) => {
    const newSettings = { ...settings, audioReadQuestion: checked };
    setSettingsState(newSettings);
  };

  const handleTTSVoiceChange = (voiceURI) => {
    const newSettings = { ...settings, ttsVoiceURI: voiceURI };
    setSettingsState(newSettings);
  };

  const handleTTSRateChange = (rate) => {
    const newSettings = { ...settings, ttsRate: parseFloat(rate) };
    setSettingsState(newSettings);
  };

  // New handler to test voice
  const handleTestVoice = () => {
    if (!window.speechSynthesis) return;
    
    const testText = "This is a test of the voice settings. How does this sound?";
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = settings.ttsRate || 1.0;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Select best available voice (prefers user selection, then en-GB, Google/Microsoft, English, fallback)
    // Note: Browser voices vary by system; cannot guarantee identical voice across users
    const selectedVoice = selectBestVoice(settings.ttsVoiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // New handler to save all settings
  const handleSaveSettings = () => {
    setSettings(settings);
    setShowSaveToast(true);
  };

  const handleDisplayNameChange = (newName) => {
    setDisplayName(newName);
    // Update user in storage and context
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#101822]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">graphic_eq</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">JobSpeak Pro</span>
            </div>
            <nav className="hidden md:flex gap-8">
              <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary">Dashboard</Link>
              <Link to="/start" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary">Practice</Link>
              <span className="text-sm font-medium text-primary dark:text-primary">Profile</span>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/start" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-transparent rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:ring-offset-slate-900">
                Practice Now
              </Link>
              <button className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Profile</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-normal">Manage your account and preferences.</p>
        </div>
        <div className="space-y-8">
          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">person</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                  <input 
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3" 
                    type="text" 
                    value={displayName}
                    onChange={(e) => handleDisplayNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 cursor-not-allowed" readOnly type="email" value={user.email || ''} />
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                <p>This information is used only to manage your account and personalize your practice experience. We do not share your personal details.</p>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">tune</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Practice Preferences</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-slate-900 dark:text-white">Preferred Practice Mode</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose how you want to start new sessions by default.</p>
                </div>
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button 
                    onClick={() => handlePreferredModeChange('voice')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      settings.preferredPracticeMode === 'voice'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">mic</span>
                      Voice
                    </div>
                  </button>
                  <button 
                    onClick={() => handlePreferredModeChange('text')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      settings.preferredPracticeMode === 'text'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                      Text
                    </div>
                  </button>
                </div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-slate-900 dark:text-white">Auto-play Audio</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatically play interviewer questions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={settings.autoPlayAudio}
                    onChange={(e) => handleAutoPlayToggle(e.target.checked)}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-slate-900 dark:text-white">Daily Reminder</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Receive a gentle nudge to practice at 9:00 AM.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={settings.dailyReminder}
                    onChange={(e) => handleDailyReminderToggle(e.target.checked)}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-slate-900 dark:text-white">Read question out loud</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatically read the question when it loads.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={settings.audioReadQuestion}
                    onChange={(e) => handleAudioReadQuestionToggle(e.target.checked)}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              {settings.audioReadQuestion && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Voice</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={settings.ttsVoiceURI || ''}
                          onChange={(e) => handleTTSVoiceChange(e.target.value)}
                          className="block flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                        >
                          <option value="">Default System Voice</option>
                          {voices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              {voice.name} {voice.lang ? `(${voice.lang})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleTestVoice}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
                          title="Test voice"
                        >
                          <span className="material-symbols-outlined text-lg">volume_up</span>
                          <span className="hidden sm:inline">Test</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Speed: {settings.ttsRate?.toFixed(1) || '1.0'}x
                      </label>
                      <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.1"
                        value={settings.ttsRate || 1.0}
                        onChange={(e) => handleTTSRateChange(e.target.value)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                      />
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>0.8x</span>
                        <span>1.2x</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Save Button */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Save Settings
              </button>
            </div>
          </section>
          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">credit_card</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subscription</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-base font-medium text-slate-900 dark:text-white">Current Plan</span>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">Pro</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Unlimited practice sessions and advanced feedback.</p>
              </div>
              <Link to="/pricing" className="text-sm font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 hover:underline">
                Manage Billing
              </Link>
            </div>
          </section>
          <div className="pt-6 pb-20 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200 dark:border-slate-800 mt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Log Out
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline px-4 py-2"
            >
              Delete Account
            </button>
          </div>
          {/* Save Settings Toast */}
          {showSaveToast && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Settings saved</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Your preferences have been updated.</p>
                </div>
                <button
                  onClick={() => setShowSaveToast(false)}
                  className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Delete Account Toast */}
          {showDeleteToast && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Account deletion not implemented yet</p>
                </div>
                <button
                  onClick={() => setShowDeleteToast(false)}
                  className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

