// Simple analytics wrapper using react-ga4
import ReactGA from "react-ga4";

export function trackEvent(name, params = {}) {
  try {
    ReactGA.event({
      action: name,
      category: "user",
      ...params,
    });
  } catch (err) {
    // Silently fail if GA is not initialized
    console.error("Analytics error:", err);
  }
}

