import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';

// Nazwa repozytorium GitHub
const repoName = 'kogutowicz-art';

// Plugin do kopiowania plików statycznych
function copyStaticFilesPlugin() {
  return {
    name: 'copy-static-files',
    // Używaj writeBundle zamiast buildEnd
    writeBundle() {
      const sourceFolders = [
        { src: 'images', dest: 'dist/images' },
        { src: 'src/data/json', dest: 'dist/src/data/json' }
      ];

      sourceFolders.forEach(({ src, dest }) => {
        if (!existsSync(src)) {
          console.warn(`Katalog źródłowy ${src} nie istnieje!`);
          return;
        }

        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }

        copyFolderRecursiveSync(src, dest);
      });
      
      console.log('Statyczne pliki zostały skopiowane do katalogu dist');
    }
  };
}

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
    copyStaticFilesPlugin(),
  ],
  // Base URL dla GitHub Pages
  base: '/',
  // Konfiguracja budowania projektu
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gallery: resolve(__dirname, 'src/pages/gallery.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        shop: resolve(__dirname, 'src/pages/shop.html'),
      },
    },
  },
  // Publiczny katalog z zasobami statycznymi
  publicDir: '',
});