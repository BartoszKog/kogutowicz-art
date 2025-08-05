# Generowanie Sitemap.xml

## Opis
Ten projekt automatycznie generuje plik `sitemap.xml` podczas procesu budowania strony. Sitemap zawiera wszystkie główne strony witryny i jest dostępny pod adresem `https://kogutowiczart.pl/sitemap.xml`.

## Strony uwzględnione w sitemap
1. **Strona główna** (`/`) - priorytet: 1.0, częstotliwość: co tydzień
2. **Galeria** (`/src/pages/gallery.html`) - priorytet: 0.8, częstotliwość: co tydzień  
3. **O Artyście** (`/src/pages/about.html`) - priorytet: 0.7, częstotliwość: co miesiąc
4. **Sklep** (`/src/pages/shop.html`) - priorytet: 0.6, częstotliwość: co tydzień

## Automatyzacja
- Sitemap jest generowany automatycznie podczas `npm run build`
- Proces jest zintegrowany z workflow GitHub Actions
- Plik jest tworzony w katalogu `dist/` obok pliku `index.html`

## Konfiguracja
- Bazowy URL pobierany jest z pliku `src/data/json/site-config.json`
- Generator używa pakietu `sitemap` z npm
- Ustawienia częstotliwości i priorytetu można zmodyfikować w pliku `vite.config.js`

## Struktura pliku sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kogutowiczart.pl/</loc>
    <lastmod>2025-08-05T22:10:26.528Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... inne strony -->
</urlset>
```

## Weryfikacja
Po wdrożeniu można sprawdzić sitemap:
- Bezpośrednio: https://kogutowiczart.pl/sitemap.xml
- W Google Search Console: Sitemaps → Dodaj nowy sitemap

## Pliki związane z generowaniem sitemap
- `vite.config.js` - główna logika generowania
- `scripts/generate-sitemap.js` - niezależny skrypt (opcjonalny)
- `src/data/json/site-config.json` - konfiguracja bazowego URL
