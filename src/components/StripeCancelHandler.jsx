// src/components/StripeCancelHandler.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Global handler for Stripe canceled redirects.
 * If any page loads with ?canceled=true, redirect to correct domain if needed.
 */
export default function StripeCancelHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const canceled = params.get("canceled");

    if (canceled === "true") {
      // Check if we're on the wrong domain and redirect to correct one
      const currentHost = window.location.hostname;
      const correctDomain = "www.jobspeakpro.com";
      
      // If we're on the wrong domain, redirect to pricing page on correct domain
      // This is a safety net to prevent users from being stuck on wrong domain after Stripe cancel
      if (currentHost !== correctDomain && currentHost !== "jobspeakpro.com") {
        // Always redirect to pricing page on correct domain
        const newUrl = `https://${correctDomain}/pricing?canceled=true`;
        window.location.href = newUrl;
        return;
      }
      
      // If we're on the correct domain, let the page handle the canceled state
      // (PricingPage will show the toast automatically)
      // Don't clean up URL params here - let the page component handle it
    }
  }, [location.search, navigate]);

  return null;
}

