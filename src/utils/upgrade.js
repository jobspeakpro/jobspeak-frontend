// src/utils/upgrade.js
import { apiClient } from "./apiClient.js";
import { getUserKey } from "./userKey.js";
import { gaEvent } from "./ga.js";

// Global loading state to prevent double clicks across all upgrade buttons
let isUpgrading = false;

/**
 * Shared upgrade function for all upgrade CTAs
 * Prevents double clicks globally and handles the upgrade flow consistently
 * @param {Object} options
 * @param {string} options.priceType - 'monthly' | 'annual' (deprecated, use interval)
 * @param {string} options.interval - 'monthly' | 'annual' (preferred)
 * @param {string} options.source - Source identifier for analytics (e.g., 'button', 'pricing_page')
 * @param {Function} options.onLoadingChange - Optional callback to update component loading state
 * @returns {Promise<void>}
 */
export async function initiateUpgrade({ 
  priceType = "monthly",
  interval = null,
  source = "unknown",
  onLoadingChange = null 
}) {
  // Prevent double clicks - return early if already upgrading
  if (isUpgrading) {
    return;
  }

  try {
    isUpgrading = true;
    if (onLoadingChange) onLoadingChange(true);
    
    // Use interval if provided, otherwise fall back to priceType for backward compatibility
    const billingInterval = interval || priceType;

    // Get userKey and include in both header (via apiClient) and body (for redundancy/compatibility)
    const userKey = getUserKey();
    const data = await apiClient("/api/billing/create-checkout-session", {
      method: "POST",
      body: { interval: billingInterval },
    });

    if (data?.url) {
      // Store period and source in localStorage for GA tracking on return
      try {
        localStorage.setItem("jobspeak_upgrade_period", priceType);
        localStorage.setItem("jobspeak_upgrade_source", source);
      } catch (err) {
        console.warn("Failed to store upgrade metadata:", err);
      }
      
      // Track begin checkout before redirecting
      gaEvent("begin_checkout", { source: "free_limit_modal" });
      // Navigate to Stripe checkout - don't reset loading state as we're leaving the page
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned from backend");
    }
  } catch (err) {
    console.error("Upgrade error:", err);
    isUpgrading = false;
    if (onLoadingChange) onLoadingChange(false);
    alert("We couldn't start checkout. Please try again.");
  }
}

