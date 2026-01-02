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
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/voice": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err, req) => {
            console.log("[proxy:error] /voice", err?.message, req?.url);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("[proxy:req] /voice", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("[proxy:res] /voice", proxyRes.statusCode, req.url);
          });
        },
      },
      "/ai": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/resume": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Vite automatically handles SPA routing in dev mode
  // For production, ensure your server is configured to serve index.html for all routes
});

