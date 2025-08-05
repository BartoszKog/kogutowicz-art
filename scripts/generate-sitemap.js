import { createWriteStream, readFileSync } from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { resolve } from 'path';

// Wczytaj konfigurację strony
const siteConfig = JSON.parse(readFileSync('src/data/json/site-config.json', 'utf8'));
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

async function generateSitemap() {
  try {
    console.log('Rozpoczynam generowanie sitemap.xml...');
    
    // Ścieżka do wygenerowanego pliku sitemap
    const outputPath = resolve('dist/sitemap.xml');
    
    // Utwórz strumień sitemap
    const sitemapStream = new SitemapStream({ hostname: baseUrl });
    
    // Utwórz strumień zapisu do pliku
    const writeStream = createWriteStream(outputPath);
    sitemapStream.pipe(writeStream);
    
    // Dodaj wszystkie strony do sitemap
    pages.forEach(page => {
      sitemapStream.write(page);
      console.log(`Dodano do sitemap: ${baseUrl}${page.url}`);
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
    process.exit(1);
  }
}

// Uruchom generowanie sitemap
generateSitemap();
