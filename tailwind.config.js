import { marketingTokens } from "./src/theme/marketingTokens.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: marketingTokens.colors.primary,
        "primary-dark": "#0b63be",
        "primary-hover": "#0e5bc9",
        "background-light": marketingTokens.colors["background-light"],
        "background-dark": marketingTokens.colors["background-dark"],
        "card-light": "#ffffff",
        "card-dark": "#1a242d",
        "text-main": "#111418",
        "text-sub": "#617589",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2430",
        "text-secondary": "#4c6c9a",
      },
      fontFamily: {
        display: marketingTokens.fontFamily.display,
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(19, 127, 236, 0.15)',
      },
    },
  },
  plugins: [],
};
