// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: "inject-html-marker",
      transformIndexHtml(html) {
        const injection = `
<!-- HTML_MARKER: html-marker-live-1 -->
<script>
  window.__HTML_MARKER__ = "html-marker-live-1";
  console.log("HTML MARKER LOADED:", window.__HTML_MARKER__);
</script>
`;
        // inject before </head>
        if (html.includes("</head>")) return html.replace("</head>", injection + "\n</head>");
        return html + injection;
      }
    }
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/voice": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ai": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/resume": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  // Vite automatically handles SPA routing in dev mode
  // For production, ensure your server is configured to serve index.html for all routes
});

