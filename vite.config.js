// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: "inject-ga4",
      transformIndexHtml(html) {
        const injection = `
<!-- HTML_MARKER: html-marker-live-1 -->
<script>
  window.__HTML_MARKER__ = "html-marker-live-1";
  console.log("HTML MARKER LOADED:", window.__HTML_MARKER__);
</script>

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H2Z8SXNWQ7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-H2Z8SXNWQ7');
</script>
`;
        // inject before </head>
        if (html.includes("</head>")) return html.replace("</head>", injection + "\n</head>");
        return html + injection;
      }
    }
  ],
  // Vite automatically handles SPA routing in dev mode
  // For production, ensure your server is configured to serve index.html for all routes
});

