import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from 'fs';

// Nazwa repozytorium GitHub
const repoName = 'kogutowicz-art';

// Funkcja do generowania meta tagów Open Graph
function generateOpenGraphTags(siteConfig, featuredData, pageType = 'home') {
  const siteName = siteConfig.siteName || 'Portfolio Artystyczne';
  const siteUrl = siteConfig.siteUrl;
  
  let title = siteName;
  
  // Ustaw tytuł w zależności od typu strony
  switch (pageType) {
    case 'gallery':
      title = `Galeria - ${siteName}`;
      break;
    case 'about':
      title = `O Artyście - ${siteName}`;
      break;
    case 'shop':
      title = `Sklep - ${siteName}`;
      break;
  }
  
  // Przygotuj pełny URL strony
  let fullUrl = '';
  if (siteUrl) {
    let baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    
    switch (pageType) {
      case 'home':
        fullUrl = baseUrl + '/';
        break;
      case 'gallery':
        fullUrl = baseUrl + '/src/pages/gallery.html';
        break;
      case 'about':
        fullUrl = baseUrl + '/src/pages/about.html';
        break;
      case 'shop':
        fullUrl = baseUrl + '/src/pages/shop.html';
        break;
    }
  }
  
  // Pobierz pierwszy obraz z featured.json dla og:image
  let imageUrl = '';
  if (featuredData && featuredData.length > 0 && siteUrl) {
    const firstImage = featuredData[0].image;
    if (firstImage) {
      const cleanImagePath = firstImage.replace(/^\.\//, '');
      let baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
      imageUrl = `${baseUrl}/${cleanImagePath}`;
    }
  }
  
  return {
    title,
    url: fullUrl,
    image: imageUrl,
    type: 'website'
  };
}

// Funkcja do aktualizowania meta tagów w HTML
function injectOpenGraphTags(htmlContent, ogData, pageType) {
  // Znajdź znacznik </head> i wstaw meta tagi przed nim
  const headCloseTag = '</head>';
  const headIndex = htmlContent.indexOf(headCloseTag);
  
  if (headIndex === -1) {
    console.warn(`Nie znaleziono tagu </head> w pliku HTML dla ${pageType}`);
    return htmlContent;
  }
  
  // Usuń istniejące puste meta tagi Open Graph
  htmlContent = htmlContent.replace(/<meta property="og:title" content="">/g, '');
  htmlContent = htmlContent.replace(/<meta property="og:image" content="">/g, '');
  htmlContent = htmlContent.replace(/<meta property="og:url" content="">/g, '');
  
  // Przygotuj nowe meta tagi
  const ogTags = `
    <!-- Open Graph meta tags - generated during build -->
    <meta property="og:title" content="${ogData.title}">
    <meta property="og:image" content="${ogData.image}">
    <meta property="og:url" content="${ogData.url}">
    <meta property="og:type" content="website">
    `;
  
  // Wstaw nowe meta tagi przed </head>
  const updatedHtml = htmlContent.slice(0, headIndex) + ogTags + htmlContent.slice(headIndex);
  
  return updatedHtml;
}

// Plugin do kopiowania plików statycznych i generowania meta tagów Open Graph
function copyStaticFilesPlugin() {
  return {
    name: 'copy-static-files-and-generate-og-tags',
    // Używaj writeBundle zamiast buildEnd
    writeBundle() {
      // Kopiuj pliki statyczne
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
      
      // Generuj meta tagi Open Graph
      try {
        console.log('Generowanie meta tagów Open Graph...');
        
        // Wczytaj dane konfiguracyjne
        const siteConfigPath = 'src/data/json/site-config.json';
        const featuredPath = 'src/data/json/featured.json';
        
        if (!existsSync(siteConfigPath) || !existsSync(featuredPath)) {
          console.warn('Brak plików konfiguracyjnych - pomijam generowanie meta tagów Open Graph');
          return;
        }
        
        const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf8'));
        const featuredData = JSON.parse(readFileSync(featuredPath, 'utf8'));
        
        // Lista plików HTML do aktualizacji
        const htmlFiles = [
          { path: 'dist/index.html', type: 'home' },
          { path: 'dist/src/pages/gallery.html', type: 'gallery' },
          { path: 'dist/src/pages/about.html', type: 'about' },
          { path: 'dist/src/pages/shop.html', type: 'shop' }
        ];
        
        // Aktualizuj każdy plik HTML
        htmlFiles.forEach(({ path, type }) => {
          if (existsSync(path)) {
            const htmlContent = readFileSync(path, 'utf8');
            const ogData = generateOpenGraphTags(siteConfig, featuredData, type);
            const updatedHtml = injectOpenGraphTags(htmlContent, ogData, type);
            writeFileSync(path, updatedHtml, 'utf8');
            console.log(`Meta tagi Open Graph wygenerowane dla: ${path}`);
          } else {
            console.warn(`Plik HTML nie istnieje: ${path}`);
          }
        });
        
        console.log('Meta tagi Open Graph zostały pomyślnie wygenerowane!');
        
      } catch (error) {
        console.error('Błąd podczas generowania meta tagów Open Graph:', error);
      }
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