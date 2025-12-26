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
import ContactUs from "./pages/support/ContactUs.jsx";
import Profile from "./pages/account/Profile.jsx";
import Dashboard from "./pages/app/Dashboard.jsx";
import MyProgress from "./pages/app/MyProgress.jsx";
import PracticePage from "./components/PracticePage.jsx";
import PracticeSpeakingPage from "./pages/app/PracticeSpeakingPage.jsx";
import { ProProvider } from "./contexts/ProContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StripeCancelHandler from "./components/StripeCancelHandler.jsx";
import "./styles/globals.css";

// Route logger to track all route changes
function RouteLogger() {
  const loc = useLocation();
  React.useEffect(() => {
    console.log("ROUTE:", loc.pathname);
  }, [loc.pathname]);
  return null;
}

// --- Sentry setup ---
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProProvider>
        <AuthProvider>
          <BrowserRouter>
            <RouteLogger />
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
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* App routes (practice pages) */}
            <Route path="/practice" element={<PracticeSpeakingPage />} />
            <Route path="/interview" element={<Navigate to="/practice" replace />} />
            <Route path="/speaking" element={<Navigate to="/practice" replace />} />
            {/* Legacy route (optional - keep temporarily) */}
            <Route path="/practice-legacy" element={<PracticePage />} />
            <Route path="/resume" element={<App defaultTab="resume" />} />
            {/* /progress points to MyProgress page */}
            <Route path="/progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
            {/* Preserve old App defaultTab="progress" behavior via /app/progress */}
            <Route path="/app/progress" element={<App defaultTab="progress" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Catch-all: redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ProProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
