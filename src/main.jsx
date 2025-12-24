// src/main.jsx
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import App from "./App.jsx";
import PracticePage from "./components/PracticePage.jsx";
import SpeakingPractice from "./components/SpeakingPractice.jsx";
import PrivacyPage from "./components/PrivacyPage.jsx";
import TermsPage from "./components/TermsPage.jsx";
import { ProProvider } from "./contexts/ProContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/globals.css";

// --- Sentry setup ---
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProProvider>
        <BrowserRouter>
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
