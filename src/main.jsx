// src/main.jsx
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./App.jsx";
import LandingPage from "./pages/marketing/LandingPage.jsx";
import PricingPage from "./pages/marketing/PricingPage.jsx";
import UpgradePage from "./pages/marketing/UpgradePage.jsx";
import HowItWorksPage from "./pages/marketing/HowItWorksPage.jsx";
import StartPage from "./pages/marketing/StartPage.jsx";
import SupportPage from "./pages/marketing/SupportPage.jsx";
import PrivacyPage from "./pages/marketing/PrivacyPage.jsx";
import TermsPage from "./pages/marketing/TermsPage.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import Callback from "./pages/auth/Callback.jsx";
import ContactUs from "./pages/support/ContactUs.jsx";
import HelpPage from "./pages/support/HelpPage.jsx";
import Profile from "./pages/account/Profile.jsx";
import Dashboard from "./pages/app/Dashboard.jsx";
import MyProgress from "./pages/app/MyProgress.jsx";
import PracticePage from "./components/PracticePage.jsx";
import PracticeSpeakingPage from "./pages/app/PracticeSpeakingPage.jsx";
import MockInterviewPage from "./pages/app/MockInterviewPage.jsx";
import MockInterviewSession from "./pages/app/MockInterviewSession.jsx";
import MockInterviewSummary from "./pages/app/MockInterviewSummary.jsx";
import PracticeSummary from "./pages/app/PracticeSummary.jsx";
import AffiliatePage from "./pages/marketing/AffiliatePage.jsx";
import AffiliateJoinPage from "./pages/marketing/AffiliateJoinPage.jsx";
import AffiliateSuccessPage from "./pages/marketing/AffiliateSuccessPage.jsx";
import AffiliateTermsPage from "./pages/marketing/AffiliateTermsPage.jsx";
import ReferralPage from "./pages/app/ReferralPage.jsx";
import ReferralHistoryPage from "./pages/app/ReferralHistoryPage.jsx";
import { ProProvider } from "./contexts/ProContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StripeCancelHandler from "./components/StripeCancelHandler.jsx";
import SupabaseConfigError from "./components/SupabaseConfigError.jsx";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";
import "./styles/globals.css";

// Route logger to track all route changes
function RouteLogger() {
  const loc = useLocation();
  React.useEffect(() => {
    console.log("ROUTE:", loc.pathname);
  }, [loc.pathname]);
  return null;
}

// Dev-only sanity ping to check backend connectivity
function SanityPing() {
  React.useEffect(() => {
    // Only run in dev
    if (import.meta.env.DEV) {
      console.log("[Sanity] Pinging GET /health...");
      fetch("/health")
        .then((res) => {
          console.log(`[Sanity] /health status: ${res.status}`);
          // Don't parse JSON, just verify connection
        })
        .catch((err) => console.error("[Sanity] Connection failed:", err));
    }
  }, []);
  return null;
}

// --- Build ID for production verification ---
const BUILD_ID = "prod-routes-v1";
console.log(`[BUILD_ID] ${BUILD_ID}`);
if (typeof window !== 'undefined') {
  window.__BUILD_ID__ = BUILD_ID;
}

// --- Sentry setup ---
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <ErrorBoundary>
        {!isSupabaseConfigured ? (
          <SupabaseConfigError />
        ) : (
          <ProProvider>
            <AuthProvider>
              <BrowserRouter>
                <RouteLogger />
                <SanityPing />
                <StripeCancelHandler />
                <Routes>
                  {/* Marketing routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/upgrade" element={<UpgradePage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/start" element={<StartPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/auth/callback" element={<Callback />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Affiliate Routes */}
                  <Route path="/affiliate" element={<AffiliatePage />} />
                  <Route path="/affiliate/apply" element={<AffiliateJoinPage />} />
                  <Route path="/affiliate/joined" element={<AffiliateSuccessPage />} />
                  <Route path="/affiliate/terms" element={<AffiliateTermsPage />} />

                  {/* App routes (practice pages) */}
                  <Route path="/practice" element={<PracticeSpeakingPage />} />
                  <Route path="/interview" element={<Navigate to="/practice" replace />} />
                  <Route path="/speaking" element={<Navigate to="/practice" replace />} />
                  {/* Legacy route (optional - keep temporarily) */}
                  <Route path="/practice-legacy" element={<PracticePage />} />
                  <Route path="/resume" element={<App defaultTab="resume" />} />
                  {/* /progress points to MyProgress page */}
                  <Route path="/progress" element={<MyProgress />} />
                  {/* Preserve old App defaultTab="progress" behavior via /app/progress */}
                  <Route path="/app/progress" element={<App defaultTab="progress" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mock-interview" element={<MockInterviewPage />} />
                  <Route path="/mock-interview/session" element={<MockInterviewSession />} />
                  <Route path="/mock-interview/summary/:id" element={<ProtectedRoute><MockInterviewSummary /></ProtectedRoute>} />
                  <Route path="/practice/summary/:id" element={<ProtectedRoute><PracticeSummary /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* Referral Routes */}
                  <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
                  <Route path="/referral/history" element={<ProtectedRoute><ReferralHistoryPage /></ProtectedRoute>} />

                  {/* Catch-all: redirect to landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ProProvider>
        )}
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
