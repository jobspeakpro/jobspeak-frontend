export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ea2a33",
        "background-light": "#f8f6f6",
        "background-dark": "#211111",
        teal: {
          DEFAULT: "#00B8C8",
          dark: "#0095A2"
        },
        navy: {
          DEFAULT: "#0F1E33",
          light: "#1A2C48"
        },
        accent: "#FFD766",
        offwhite: "#F7FAFA"
      },
      fontFamily: {
        display: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    }
  },
  plugins: []
};
