import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePro } from "../../contexts/ProContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import UniversalHeader from "../../components/UniversalHeader.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthed, updateUser } = useAuth();
  const { isPro, refreshProStatus } = usePro();
  const [displayName, setDisplayName] = useState('');
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        <UniversalHeader />
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

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token || ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');

      // CRITICAL: Clear all auth and cached state immediately
      // 1. Sign out from Supabase
      await supabase.auth.signOut();

      // 2. Clear any localStorage cached data
      localStorage.removeItem('jsp_onboarding_complete_v1');
      localStorage.removeItem('jsp_practice_questions_used');
      localStorage.removeItem('jsp_seen_questions');

      // 3. Clear all keys that might have user-specific data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('jsp_') || key.startsWith('jobspeak_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 4. Call logout from AuthContext (clears React state)
      logout();

      // 5. Navigate to home immediately
      navigate('/');

    } catch (err) {
      console.error('Account deletion error:', err);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setShowSaveToast(true);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setShowSaveToast(true);
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create unique filename with user ID subdirectory
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setShowSaveToast(true);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setShowSaveToast(true);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Profile Fields State
  const [profileData, setProfileData] = useState({
    job_title: '',
    seniority: 'Mid',
    focus_areas: [],
    industry: '',
    difficulty: 'Normal',
  });

  // Load profile data on mount
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('display_name, job_title, seniority, focus_areas, industry, difficulty, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setDisplayName(data.display_name || '');
            setAvatarUrl(data.avatar_url || '');
            setProfileData({
              job_title: data.job_title || '',
              seniority: data.seniority || 'Mid',
              focus_areas: data.focus_areas || [],
              industry: data.industry || '',
              difficulty: data.difficulty || 'Normal',
            });
          }
        });
    }
  }, [user]);

  // Update profile field helper
  const updateProfile = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...profileData,
            display_name: displayName,
          })
          .eq('id', user.id);

        if (error) throw error;
        setShowSaveToast(true);
      } catch (err) {
        console.error("Profile save failed", err);
        setShowSaveToast(true);
      }
    }
  };

  const handleDisplayNameChange = (newName) => {
    setDisplayName(newName);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      <UniversalHeader />
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Profile</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-normal">Manage your account and preferences.</p>
        </div>
        <div className="space-y-8">

          {/* PROFESSIONAL PROFILE SECTION */}
          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">work</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional Profile</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={profileData.job_title}
                    onChange={(e) => updateProfile('job_title', e.target.value)}
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                    placeholder="e.g. Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seniority</label>
                  <select
                    value={profileData.seniority}
                    onChange={(e) => updateProfile('seniority', e.target.value)}
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                  >
                    {["Intern/Student", "Entry", "Mid", "Senior", "Manager", "Executive", "Other"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={profileData.industry}
                    onChange={(e) => updateProfile('industry', e.target.value)}
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                    placeholder="e.g. Tech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                  <select
                    value={profileData.difficulty}
                    onChange={(e) => updateProfile('difficulty', e.target.value)}
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
                  >
                    {["Easy", "Normal", "Hard"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Controls prompt complexity.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {["Behavioral", "Technical", "Communication/Clarity", "Confidence", "Leadership", "Storytelling (STAR)", "Mixed / All"].map(opt => {
                    const isSelected = profileData.focus_areas.includes(opt) || (opt === "Mixed / All" && profileData.focus_areas.includes("Mixed / General"));
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          let current = [...profileData.focus_areas];
                          // Normalize old value
                          current = current.filter(c => c !== "Mixed / General");
                          if (isSelected) current = current.filter(c => c !== opt);
                          else current.push(opt);
                          updateProfile('focus_areas', current);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50"
                          }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#1A222C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">person</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="size-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg cursor-pointer transition-colors text-sm">
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

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
                  <p className="text-xs text-slate-500 mt-1">Email is managed by your login provider and can't be edited here yet.</p>
                </div>
              </div>
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
                  {isPro === true ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">Pro</span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-400/10 dark:text-slate-400">Free</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isPro === true ? "Unlimited practice sessions and advanced feedback." : "Limited daily practice sessions. Upgrade for unlimited access."}
                </p>
              </div>
              <Link to="/pricing" className="text-sm font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 hover:underline">
                {isPro === true ? "Manage Billing" : "Upgrade to Pro"}
              </Link>
            </div>
          </section>
          <div className="pt-6 pb-20 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200 dark:border-slate-800 mt-8">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors shadow-sm">
              Save Changes
            </button>
            <button
              onClick={handleDeleteAccount}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline px-4 py-2">
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

