import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';

// Pobieranie nazwy repozytorium - wpisz tutaj nazwę swojego repozytorium GitHub
const repoName = 'kogutowicz-art';

// Funkcja do kopiowania plików statycznych
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    buildEnd() {
      const sourceFolders = [
        { src: 'images', dest: 'dist/images' },
        { src: 'src/data/json', dest: 'dist/src/data/json' }
      ];

      sourceFolders.forEach(({ src, dest }) => {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }

        // Rekursywne kopiowanie plików
        copyFolderRecursiveSync(src, dest);
      });
    }
  };
};

// Funkcja do rekursywnego kopiowania folderów
function copyFolderRecursiveSync(source, target) {
  // Sprawdź, czy katalog źródłowy istnieje
  if (!existsSync(source)) {
    return;
  }

  // Utwórz katalog docelowy, jeśli nie istnieje
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  // Kopiuj wszystkie pliki z katalogu źródłowego do docelowego
  const files = readdirSync(source, { withFileTypes: true });
  
  files.forEach(file => {
    const srcPath = resolve(source, file.name);
    const destPath = resolve(target, file.name);
    
    if (file.isDirectory()) {
      // Rekursywnie kopiuj podkatalogi
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      // Kopiuj plik
      copyFileSync(srcPath, destPath);
    }
  });
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    copyStaticFiles(),
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
  // Konfiguracja publicznego katalogu
  publicDir: 'public',
});