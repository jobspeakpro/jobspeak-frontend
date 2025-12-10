// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import "./styles/globals.css";

// --- Sentry setup ---
Sentry.init({
  dsn: "https://5653911c2d435d161da94e14d939b9df@o4510463592497152.ingest.us.sentry.io/4510511928377344",
  integrations: (integrations) => integrations,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
