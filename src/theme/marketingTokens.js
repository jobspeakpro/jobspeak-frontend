/**
 * Marketing Design Tokens
 * 
 * Single source of truth for marketing page styling.
 * These tokens match the Stitch HTML reference exactly.
 * 
 * DO NOT modify these values without explicit approval.
 * All marketing pages (Pricing, How It Works, etc.) must use these tokens.
 */

export const marketingTokens = {
  colors: {
    primary: "#137fec",
    "background-light": "#f6f7f8",
    "background-dark": "#101922",
  },
  fontFamily: {
    display: [
      "Inter",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "Apple Color Emoji",
      "Segoe UI Emoji",
    ],
  },
  radius: {
    DEFAULT: "0.25rem", // 4px
    lg: "0.5rem",       // 8px
    xl: "0.75rem",      // 12px
    full: "9999px",
  },
};

