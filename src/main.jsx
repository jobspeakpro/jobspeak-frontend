// src/main.jsx
window.__BUILD_MARKER__ = 'ga-debug-1';
import * as Sentry from "@sentry/react";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import App from "./App.jsx";
import PracticePage from "./components/PracticePage.jsx";
import SpeakingPractice from "./components/SpeakingPractice.jsx";
import PrivacyPage from "./components/PrivacyPage.jsx";
import TermsPage from "./components/TermsPage.jsx";
import { ProProvider } from "./contexts/ProContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { initGA, trackPageView } from "./lib/analytics";
import "./styles/globals.css";

// --- Sentry setup ---
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

// --- GA4 initialization ---
console.log('[GA] measurement id present?', !!import.meta.env.VITE_GA_MEASUREMENT_ID);
console.log('[GA] measurement id value:', import.meta.env.VITE_GA_MEASUREMENT_ID);
initGA();

// Component to track page views on route changes
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProProvider>
        <BrowserRouter>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/interview" element={<App defaultTab="interview" />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/speaking" element={<SpeakingPractice />} />
            <Route path="/resume" element={<App defaultTab="resume" />} />
            <Route path="/progress" element={<App defaultTab="progress" />} />
            <Route path="/pricing" element={<App defaultTab="pricing" />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            {/* Catch-all: redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
