// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite automatically handles SPA routing in dev mode
  // For production, ensure your server is configured to serve index.html for all routes
});

