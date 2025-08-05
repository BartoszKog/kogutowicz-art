import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { createWriteStream } from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

// Nazwa repozytorium GitHub
const repoName = 'kogutowicz-art';

// Funkcja do generowania sitemap.xml
async function generateSitemap(outDir) {
  try {
    console.log('🗺️  Generowanie sitemap.xml...');
    
    // Wczytaj konfigurację strony
    const siteConfigPath = resolve('src/data/json/site-config.json');
    if (!existsSync(siteConfigPath)) {
      console.warn('⚠️  Plik site-config.json nie istnieje. Pomijam generowanie sitemap.');
      return;
    }
    
    const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf8'));
    const baseUrl = `https://${siteConfig.siteUrl}`;
    
    // Definicja stron do wygenerowania w sitemap
    const pages = [
      {
        url: '/',
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString()
      },
      {
        url: '/src/pages/gallery.html',
        changefreq: 'weekly', 
        priority: 0.8,
        lastmod: new Date().toISOString()
      },
      {
        url: '/src/pages/about.html',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      },
      {
        url: '/src/pages/shop.html',
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: new Date().toISOString()
      }
    ];
    
    // Ścieżka do wygenerowanego pliku sitemap
    const outputPath = resolve(outDir, 'sitemap.xml');
    
    // Utwórz strumień sitemap
    const sitemapStream = new SitemapStream({ hostname: baseUrl });
    
    // Utwórz strumień zapisu do pliku
    const writeStream = createWriteStream(outputPath);
    sitemapStream.pipe(writeStream);
    
    // Dodaj wszystkie strony do sitemap
    pages.forEach(page => {
      sitemapStream.write(page);
    });
    
    // Zakończ strumień
    sitemapStream.end();
    
    // Poczekaj na zakończenie zapisu
    await streamToPromise(sitemapStream);
    
    console.log(`✅ Sitemap.xml został wygenerowany: ${outputPath}`);
    console.log(`🌐 Bazowy URL: ${baseUrl}`);
    console.log(`📄 Liczba stron w sitemap: ${pages.length}`);
    
  } catch (error) {
    console.error('❌ Błąd podczas generowania sitemap.xml:', error);
  }
}

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
  // Znajdź sekcję <head>
  const headStartTag = '<head>';
  const headCloseTag = '</head>';
  const headStartIndex = htmlContent.indexOf(headStartTag);
  const headEndIndex = htmlContent.indexOf(headCloseTag);
  
  if (headStartIndex === -1 || headEndIndex === -1) {
    console.warn(`Nie znaleziono sekcji <head> w pliku HTML dla ${pageType}`);
    return htmlContent;
  }
  
  // Wyodrębnij sekcję head
  const beforeHead = htmlContent.slice(0, headStartIndex + headStartTag.length);
  const headContent = htmlContent.slice(headStartIndex + headStartTag.length, headEndIndex);
  const afterHead = htmlContent.slice(headEndIndex);
  
  // Usuń istniejące meta tagi Open Graph tylko z sekcji head
  let cleanedHeadContent = headContent;
  cleanedHeadContent = cleanedHeadContent.replace(/<meta property="og:title" content="[^"]*"[^>]*>/g, '');
  cleanedHeadContent = cleanedHeadContent.replace(/<meta property="og:image" content="[^"]*"[^>]*>/g, '');
  cleanedHeadContent = cleanedHeadContent.replace(/<meta property="og:url" content="[^"]*"[^>]*>/g, '');
  cleanedHeadContent = cleanedHeadContent.replace(/<meta property="og:type" content="[^"]*"[^>]*>/g, '');
  cleanedHeadContent = cleanedHeadContent.replace(/<!-- Open Graph meta tags[^>]*>/g, '');
  cleanedHeadContent = cleanedHeadContent.replace(/<!-- Open Graph meta tags - generated during build -->/g, '');
  
  // Przygotuj nowe meta tagi
  const ogTags = `
    
    <!-- Open Graph meta tags - generated during build -->
    <meta property="og:title" content="${ogData.title}">
    <meta property="og:image" content="${ogData.image}">
    <meta property="og:url" content="${ogData.url}">
    <meta property="og:type" content="website">`;
  
  // Połącz wszystko razem
  const updatedHtml = beforeHead + cleanedHeadContent + ogTags + afterHead;
  
  return updatedHtml;
}

// Plugin do kopiowania plików statycznych i generowania meta tagów Open Graph
function copyStaticFilesPlugin() {
  return {
    name: 'copy-static-files-and-generate-og-tags',
    // Używaj writeBundle zamiast buildEnd
    async writeBundle() {
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
      
      // Kopiuj plik weryfikacyjny Google Search Console
      const googleVerificationFile = 'google69b18c39e14234e6.html';
      if (existsSync(googleVerificationFile)) {
        const destPath = resolve('dist', googleVerificationFile);
        copyFileSync(googleVerificationFile, destPath);
        console.log(`✅ Plik weryfikacyjny Google skopiowany: ${destPath}`);
      } else {
        console.warn(`⚠️  Plik weryfikacyjny Google nie istnieje: ${googleVerificationFile}`);
      }
      
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
      
      // Generuj sitemap.xml
      try {
        await generateSitemap('dist');
      } catch (error) {
        console.error('Błąd podczas generowania sitemap.xml:', error);
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