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
 * @param {string} options.priceType - 'monthly' | 'annual'
 * @param {string} options.source - Source identifier for analytics (e.g., 'button', 'pricing_page')
 * @param {Function} options.onLoadingChange - Optional callback to update component loading state
 * @returns {Promise<void>}
 */
export async function initiateUpgrade({ 
  priceType = "monthly", 
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
    

    // Get userKey and include in both header (via apiClient) and body (for redundancy/compatibility)
    const userKey = getUserKey();
    const data = await apiClient("/api/billing/create-checkout-session", {
      method: "POST",
      body: { userKey, priceType },
    });

    if (data?.url) {
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

