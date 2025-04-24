import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Pobieranie nazwy repozytorium - wpisz tutaj nazwę swojego repozytorium GitHub
const repoName = 'kogutowicz-art';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Base URL dla GitHub Pages - używaj ścieżki względnej w środowisku deweloperskim
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  // Konfiguracja serwera deweloperskiego
  server: {
    port: 5173,
  },
  // Konfiguracja budowania projektu
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        gallery: './src/pages/gallery.html',
        about: './src/pages/about.html',
        shop: './src/pages/shop.html',
      },
    },
  },
});