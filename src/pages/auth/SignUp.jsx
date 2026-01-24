import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
const [firstName, setFirstName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [toast, setToast] = useState(null);
const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

// Auto-dismiss toast - INCREASED TO 6000ms (+3000ms)
useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000); // Changed from 3000 to 6000
    return () => clearTimeout(timer);
  }
}, [toast]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!firstName || !email) {
    setError("Please enter your first name and email address");
    setLoading(false);
    return;
  }

  try {
    const user = await signup(email, password);

    // Write first name to profiles.display_name
    if (user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: firstName.trim()
          }, { onConflict: 'id' });
      } catch (profileError) {
        console.error('Profile update error:', profileError);
        // Continue anyway - profile can be updated later
      }
    }

    // Show email confirmation message - DO NOT auto-login
    setShowEmailConfirmation(true);
    setToast("success");
    setLoading(false);

    // Track referral if code exists in URL or localStorage
    // Logic: If ref param is in URL, use it. Else check localStorage (if we implemented global capture, but I'll stick to URL param here as primary, or just check both).
    // Since we don't have a dedicated global capture yet, I'll check URL param here.
    // But typically user might land on landing page and nav to signup.
    // I'll grab from URL param `ref` if present.
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get('ref');

    if (referralCode) {
      try {
        await apiClient.post("/referrals/track", { referralCode });
      } catch (trackError) {
        console.error("Referral track error:", trackError);
        // Non-blocking
      }
    }

    // Force sign out to ensure user is not logged in until confirmed
    await supabase.auth.signOut();
  } catch (err) {
    setError(err.message || "Something went wrong. Please try again.");
    setLoading(false);
  }
};

// If email confirmation is shown, display that instead of the form
if (showEmailConfirmation) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] font-display antialiased min-h-screen flex flex-col">        <UniversalHeader />
      {/* Email Confirmation Message */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[540px] flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a222d] rounded-2xl shadow-xl dark:shadow-slate-900/20 border border-slate-100 dark:border-slate-800 overflow-hidden p-8">
            <div className="text-center mb-6">
              <div className="size-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111418] dark:text-white mb-3 tracking-tight">Check your email</h2>
              <p className="text-[#617289] dark:text-slate-400 text-base font-normal leading-relaxed mb-2">
                We've sent a confirmation link to <span className="font-semibold text-[#111418] dark:text-white">{email}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Email will be sent from Supabase (noreply@supabase.io). If you don't see it, check spam or promotions.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg p-4 text-sm leading-relaxed border border-blue-100 dark:border-blue-800/50 mb-6">
              <p className="font-semibold mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the confirmation link</li>
                <li>Come back here to sign in</li>
              </ol>
            </div>
            <Link
              to="/signin"
              className="w-full flex items-center justify-center rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-12 px-6 transition-colors shadow-lg shadow-blue-500/20"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

return (
  <div className="bg-background-light dark:bg-background-dark text-[#111418] font-display antialiased min-h-screen flex flex-col">        <UniversalHeader />
    {/* Main Content */}
    <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[480px] flex flex-col gap-6">
        {/* Auth Card */}
        <div className="bg-white dark:bg-[#1a222d] rounded-2xl shadow-xl dark:shadow-slate-900/20 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header Section */}
          <div className="pt-8 px-8 pb-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111418] dark:text-white mb-3 tracking-tight">Create your JobSpeak Pro account</h2>
            <p className="text-[#617289] dark:text-slate-400 text-base font-normal leading-relaxed">
              Save your practice and continue anytime.
            </p>
          </div>
          {/* Reassurance Block */}
          <div className="px-8 py-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg p-4 text-sm leading-relaxed text-center border border-blue-100 dark:border-blue-800/50">
              <span className="material-symbols-outlined align-middle mr-1 text-primary" style={{ fontSize: "18px" }}>sentiment_satisfied</span>
              You can practice without pressure. Signing in simply helps you save your sessions and access features when you want.
            </div>
          </div>
          {/* Auth Options */}
          <div className="p-8 pt-6 flex flex-col gap-4">
            {/* Social Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setToast("google")}
                className="relative flex w-full items-center justify-center rounded-xl bg-[#f0f2f4] dark:bg-slate-800 hover:bg-[#e4e6e8] dark:hover:bg-slate-700 transition-colors h-12 px-4 text-[#111418] dark:text-white font-bold text-base tracking-[0.015em] border border-transparent focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span className="absolute left-5 flex items-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                </span>
                <span>Continue with Google</span>
              </button>
              <button
                onClick={() => setToast("apple")}
                className="relative flex w-full items-center justify-center rounded-xl bg-[#f0f2f4] dark:bg-slate-800 hover:bg-[#e4e6e8] dark:hover:bg-slate-700 transition-colors h-12 px-4 text-[#111418] dark:text-white font-bold text-base tracking-[0.015em] border border-transparent focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span className="absolute left-5 flex items-center text-black dark:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"></path>
                  </svg>
                </span>
                <span>Continue with Apple</span>
              </button>
            </div>
            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-sm font-medium">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            {/* Email Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg p-3 text-sm border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#111418] dark:text-slate-200" htmlFor="firstName">First name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 h-12 text-[#111418] dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  id="firstName"
                  placeholder="John"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#111418] dark:text-slate-200" htmlFor="email">Email address</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 h-12 text-[#111418] dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#111418] dark:text-slate-200" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 h-12 text-[#111418] dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="mt-2 w-full rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-12 px-6 transition-transform active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
          {/* Sign In / Toggle Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#111418] dark:text-white">Already have an account?</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Sign in to continue your practice.</span>
              </div>
              <Link to="/signin" className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#111418] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold h-10 px-4 transition-colors flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>
        {/* No Pressure Action */}
        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            You can start practicing without signing in.
          </p>
          <Link to="/start" className="inline-flex items-center gap-2 text-primary hover:text-blue-700 dark:hover:text-blue-400 font-semibold group">
            Start Practicing Now
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: "20px" }}>arrow_forward</span>
          </Link>
        </div>
        {/* Footer Links */}
        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            We respect your privacy. Your information is used only to provide the service.
          </p>
          <div className="flex justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </main>
    {/* Background Decoration */}
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-[100px]" data-alt="Abstract soft blue gradient background"></div>
      <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/30 dark:bg-emerald-900/10 blur-[100px]" data-alt="Abstract soft green gradient background"></div>
    </div>
    {/* Toast notifications */}
    {toast === "google" && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Google sign-in coming soon</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    )}
    {toast === "apple" && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Apple sign-in coming soon</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    )}
    {toast === "success" && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Account created</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    )}
  </div>
);
}
