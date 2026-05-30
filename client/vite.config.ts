import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The client reuses many components originally written for Next.js. Rather
// than rewrite every import, we alias the Next-specific specifiers to small
// local shims so the components run unchanged under Vite + React Router.
export default defineConfig({
  plugins: [react()],
  build: {
    // Split big libraries into their own cached chunks so no single file is
    // huge (clears the 500 kB warning) and the browser downloads in parallel.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next-intl': path.resolve(__dirname, './src/shims/next-intl.tsx'),
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.tsx'),
      'server-only': path.resolve(__dirname, './src/shims/empty.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express server during development.
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
