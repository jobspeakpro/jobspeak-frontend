// src/components/UpgradeToProButton.jsx
import React, { useState } from "react";
import { trackEvent } from "../analytics";

const API_BASE = "https://jobspeak-backend-production.up.railway.app";

export default function UpgradeToProButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setLoading(true);
      trackEvent("stripe_upgrade_click", { source: "header_button" });

      const res = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      });

      if (!res.ok) {
        console.error("Stripe session error", await res.text());
        setLoading(false);
        alert("Could not start checkout. Please try again.");
        return;
      }

      const data = await res.json();

      if (data?.url) {
        // Optional extra event before redirect
        trackEvent("stripe_checkout_redirect", { source: "header_button" });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from backend");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <button
      onClick={handleUpgradeClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Opening Stripe..." : "Upgrade to Pro"}
    </button>
  );
}
