import React, { useState } from "react";

const API_BASE = "https://jobspeak-backend-production.up.railway.app";

const UpgradeToProButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (plan) => {
    try {
      setLoading(true);
      setError("");

      // ✅ CORRECT STRIPE ENDPOINT ON RAILWAY
      const response = await fetch(
        `${API_BASE}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }), // "monthly" or "annual"
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Payment failed");
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => handleCheckout("monthly")}
          disabled={loading}
          className="w-full sm:w-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Go PRO Monthly – $9.99"}
        </button>

        <button
          type="button"
          onClick={() => handleCheckout("annual")}
          disabled={loading}
          className="w-full sm:w-auto rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
        >
          Save 33% – Annual $79.99
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Secure payments powered by Stripe. You’ll be redirected back to JobSpeak
        Pro after checkout.
      </p>
    </div>
  );
};

export default UpgradeToProButton;
