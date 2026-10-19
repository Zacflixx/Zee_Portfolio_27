import { defineConfig } from 'astro/config';

// Netlify exposes the deployed URL as process.env.URL. Replace the fallback with the real domain.
export default defineConfig({
  site: process.env.URL || 'https://isaac-conteh.netlify.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
});
