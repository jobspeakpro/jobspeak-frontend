// src/analytics.js
// Simple custom event tracker for JobSpeakPro MVP

export function trackEvent(name, data = {}) {
  try {
    console.log(`[JobSpeakPro EVENT] ${name}`, data);

    // Send to Microsoft Clarity if available
    if (window.clarity) {
      window.clarity("event", name, data);
    }
  } catch (err) {
    console.error("Analytics error:", err);
  }
}

// Tiny console "dashboard" you can call manually in DevTools
export function reportSummary() {
  console.log(
    "%cJobSpeakPro MVP — Conversion Summary",
    "color: teal; font-size: 18px;"
  );
  console.log("Check Clarity for:");
  console.log(" - micro_demo_used");
  console.log(" - resume_doctor_used");
  console.log(" - stripe_upgrade_click");
  console.log(" - stripe_payment_success");
  console.log(" - stripe_payment_canceled");
}
