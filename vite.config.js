import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { injectSeo, homeSeo } from './src/seo/html.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bake homepage meta, JSON-LD and crawlable HTML into index.html
    { name: 'flink-seo', transformIndexHtml: (html) => injectSeo(html, homeSeo()) },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
