// Główny plik JavaScript dla aplikacji
console.log('Portfolio artystyczne załadowane!');

// Zmienne do przechowywania danych
let galleryArtworks = [];
let featuredArtworks = [];
let shopProducts = [];
let artistData = {}; // Nowa zmienna dla danych o artyście
let currentLanguage = 'pl'; // Domyślny język
let uiTexts = {}; // Teksty interfejsu użytkownika
let siteConfig = {}; // Konfiguracja witryny

// Funkcja pomocnicza do pobierania podstawowej ścieżki
function getBasePath() {
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Na GitHub Pages używamy prefiksu z nazwą repozytorium
  // Lokalnie używamy pustej ścieżki bazowej
  return isGitHubPages ? '/kogutowicz-art' : '';
}

// Funkcja do korygowania ścieżek do obrazów w zależności od podstrony i środowiska
function correctImagePath(imagePath) {
  const basePath = getBasePath();
  const currentPath = window.location.pathname;
  
  console.log('correctImagePath:', { imagePath, basePath, currentPath });
  
  // Usuń wiodące "/" jeśli występuje w ścieżce obrazu
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  let finalPath;
  
  // Jeśli jesteśmy na podstronie (pages/), dodaj odpowiednie prefiksy
  if (currentPath.includes('/pages/') || currentPath.includes('/gallery.html') || 
      currentPath.includes('/about.html') || currentPath.includes('/shop.html')) {
    if (basePath) {
      // Na GitHub Pages dla podstron
      finalPath = `${basePath}/${cleanImagePath}`;
    } else {
      // Lokalnie dla podstron
      finalPath = `../../${cleanImagePath}`;
    }
  } else {
    // Strona główna
    if (basePath) {
      finalPath = `${basePath}/${cleanImagePath}`;
    } else {
      // Lokalnie na stronie głównej - po prostu użyj relatywnej ścieżki
      finalPath = `./${cleanImagePath}`;
    }
  }
  
  console.log('correctImagePath wynik:', finalPath);
  return finalPath;
}

// Funkcja do pobierania danych z plików JSON
async function fetchData() {
  try {
    const basePath = getBasePath();
    const currentPath = window.location.pathname;
    
    // Ustal prawidłową ścieżkę bazową dla plików JSON w zależności od lokalizacji
    let jsonBasePath = basePath;
    if (currentPath.includes('/pages/') && !basePath) {
      // Jeśli jesteśmy na podstronie lokalnie, dodaj ścieżkę względną
      jsonBasePath = '../..';
    }
    
    // Pobieranie danych UI w odpowiednim języku
    const uiSuffix = currentLanguage === 'en' ? '_en' : '';
    const uiResponse = await fetch(`${jsonBasePath}/src/data/json/ui${uiSuffix}.json`);
    uiTexts = await uiResponse.json();
    
    // Pobieranie danych dla galerii
    const galleryResponse = await fetch(`${jsonBasePath}/src/data/json/gallery.json`);
    galleryArtworks = await galleryResponse.json();
    
    // Pobieranie tłumaczeń galerii jeśli język angielski
    if (currentLanguage === 'en') {
      const galleryTranslationsResponse = await fetch(`${jsonBasePath}/src/data/json/gallery_en.json`);
      const galleryTranslations = await galleryTranslationsResponse.json();
      
      // Połącz dane z tłumaczeniami
      galleryArtworks = galleryArtworks.map(artwork => {
        const translation = galleryTranslations.find(t => t.id === artwork.id);
        return translation ? { ...artwork, ...translation } : artwork;
      });
    }
    
    // Pobieranie danych dla wyróżnionych dzieł
    const featuredResponse = await fetch(`${jsonBasePath}/src/data/json/featured.json`);
    featuredArtworks = await featuredResponse.json();
    
    // Pobieranie tłumaczeń wyróżnionych dzieł jeśli język angielski
    if (currentLanguage === 'en') {
      const featuredTranslationsResponse = await fetch(`${jsonBasePath}/src/data/json/featured_en.json`);
      const featuredTranslations = await featuredTranslationsResponse.json();
      
      // Połącz dane z tłumaczeniami
      featuredArtworks = featuredArtworks.map(artwork => {
        const translation = featuredTranslations.find(t => t.id === artwork.id);
        return translation ? { ...artwork, ...translation } : artwork;
      });
    }
    
    // Pobieranie danych dla sklepu
    const shopResponse = await fetch(`${jsonBasePath}/src/data/json/shop.json`);
    shopProducts = await shopResponse.json();
    
    // Pobieranie tłumaczeń sklepu jeśli język angielski
    if (currentLanguage === 'en') {
      const shopTranslationsResponse = await fetch(`${jsonBasePath}/src/data/json/shop_en.json`);
      const shopTranslations = await shopTranslationsResponse.json();
      
      // Połącz dane z tłumaczeniami
      shopProducts = shopProducts.map(product => {
        const translation = shopTranslations.find(t => t.id === product.id);
        return translation ? { ...product, ...translation } : product;
      });
    }
    
    // Pobieranie danych o artyście
    const aboutSuffix = currentLanguage === 'en' ? '_en' : '';
    const aboutResponse = await fetch(`${jsonBasePath}/src/data/json/about${aboutSuffix}.json`);
    artistData = await aboutResponse.json();
    
    // Jeśli język angielski, dodatkowo pobierz zdjęcie z polskiego pliku
    if (currentLanguage === 'en') {
      const aboutPlResponse = await fetch(`${jsonBasePath}/src/data/json/about.json`);
      const aboutPlData = await aboutPlResponse.json();
      // Dodaj zdjęcie z polskiego pliku do danych angielskich
      if (aboutPlData.artistPhoto) {
        artistData.artistPhoto = aboutPlData.artistPhoto;
      }
    }
    
    // Pobieranie konfiguracji witryny (niezależnej od języka)
    const siteConfigResponse = await fetch(`${jsonBasePath}/src/data/json/site-config.json`);
    siteConfig = await siteConfigResponse.json();
    
    // Po załadowaniu danych, zaktualizuj interfejs
    updateUITexts();
    updateSiteConfiguration();
    initializeApp();
  } catch (error) {
    console.error('Błąd podczas ładowania danych:', error);
  }
}

// Funkcja do renderowania dzieł na stronie głównej
function renderFeaturedArtworks() {
  const featuredContainer = document.querySelector('.featured-artworks');
  if (!featuredContainer) return;

  featuredContainer.innerHTML = '';
  
  featuredArtworks.forEach((artwork, index) => {
    const artworkElement = document.createElement('div');
    artworkElement.className = 'featured-artwork-item';
    
    // Dodaj atrybut z indeksem dla trybu skupienia
    artworkElement.setAttribute('data-artwork-index', index);
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(artwork.image);
    
    artworkElement.innerHTML = `
      <div class="featured-artwork-image">
        <img src="${correctedImagePath}" alt="${artwork.title || 'Obraz'}" loading="lazy">
      </div>
      <div class="featured-artwork-info">
        <h3>${artwork.title || 'Bez tytułu'}</h3>
        ${artwork.description ? `<p>${artwork.description}</p>` : ''}
      </div>
    `;
    
    // Dodaj event listener dla trybu skupienia
    artworkElement.addEventListener('click', () => {
      openFocusMode(index, featuredArtworks, 'featured');
    });
    
    // Dodaj hover effect z lepszą responsywnością
    artworkElement.addEventListener('mouseenter', () => {
      artworkElement.style.transform = 'translateY(-4px)';
    });
    
    artworkElement.addEventListener('mouseleave', () => {
      artworkElement.style.transform = 'translateY(0)';
    });
    
    featuredContainer.appendChild(artworkElement);
  });
  
  // Dodaj funkcjonalność smooth scrolling dla featured artworks
  setupFeaturedScrolling();
  
  // Dodaj inteligentne wyśrodkowanie kafelków
  setupSmartCentering();
}

// Funkcja do renderowania dzieł w galerii
function renderGalleryArtworks(artworks = galleryArtworks) {
  const galleryContainer = document.querySelector('.gallery-artworks');
  if (!galleryContainer) return;

  galleryContainer.innerHTML = '';
  
  artworks.forEach((artwork, index) => {
    const artworkElement = document.createElement('div');
    artworkElement.className = 'bg-white rounded shadow-md overflow-hidden';
    
    // Dodaj atrybut z indeksem dla trybu skupienia
    artworkElement.setAttribute('data-artwork-index', index);
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(artwork.image);
      artworkElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${correctedImagePath}" alt="${artwork.title || 'Obraz'}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${artwork.title || 'Bez tytułu'}</h3>
        ${(artwork.technique || artwork.dimensions || artwork.year) ? 
          `<p class="text-gray-600">${[artwork.technique, artwork.dimensions, artwork.year].filter(Boolean).join(', ')}</p>` : 
          ''}
        ${artwork.description ? `<p class="text-sm mt-2">${artwork.description}</p>` : ''}
        <p class="mt-2 ${artwork.available ? 'text-green-600' : 'text-gray-400'}">
          ${artwork.available ? (uiTexts.common?.available || 'Dostępny') : (uiTexts.common?.unavailable || 'Niedostępny')}
        </p>
      </div>
    `;
    
    // Dodaj event listener dla trybu skupienia
    artworkElement.addEventListener('click', () => {
      openFocusMode(index, artworks, 'gallery');
    });
    
    galleryContainer.appendChild(artworkElement);
  });
}

// Funkcja do renderowania produktów w sklepie
function renderShopProducts() {
  const shopContainer = document.querySelector('.shop-products');
  if (!shopContainer) return;

  shopContainer.innerHTML = '';
  
  // Sprawdź czy są jakieś produkty
  if (!shopProducts || shopProducts.length === 0) {
    // Usuń grid layout dla pustego stanu
    shopContainer.className = 'flex items-center justify-center min-h-64';
    shopContainer.innerHTML = `
      <div class="text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
        <p class="text-lg text-gray-600">${uiTexts.sections?.shopEmpty || 'Aktualnie nie ma niczego wystawionego na sprzedaż'}</p>
      </div>
    `;
    return;
  }
  
  // Przywróć grid layout dla produktów
  shopContainer.className = 'shop-products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  
  shopProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'bg-white rounded shadow-md overflow-hidden';
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(product.image);    // Sprawdź czy produkt jest dostępny
    const isAvailable = product.available !== false;
    const buttonClass = isAvailable 
      ? 'shop-purchase-button bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 inline-block font-semibold transition-all duration-300 transform'
      : 'bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block';
    const buttonText = isAvailable ? (uiTexts.common?.goToPurchase || 'Przejdź do zakupu') : (uiTexts.common?.notAvailable || 'Niedostępne');
    const buttonAttributes = isAvailable 
      ? `href="${product.purchaseUrl}" target="_blank" rel="noopener noreferrer"`
      : 'onclick="return false;"';
    
    productElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer shop-product-image" data-product-id="${product.id}">
        <img src="${correctedImagePath}" alt="${product.title || 'Produkt'}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${product.title || 'Bez tytułu'}</h3>
        ${product.description ? `<p class="text-gray-600">${product.description}</p>` : ''}
        ${product.dimensions ? `<p class="text-sm text-gray-500 mt-1"><span class="font-medium">${uiTexts.common?.dimensions || 'Wymiary'}:</span> ${product.dimensions}</p>` : ''}
        ${product.price ? `<p class="text-purple-600 font-bold mt-2">${product.price} zł</p>` : ''}        <div class="mt-4 flex items-center justify-between">
          <a ${buttonAttributes} class="${buttonClass}">
            ${buttonText}
          </a>
          ${!isAvailable ? `<span class="text-gray-400 font-semibold text-sm">${uiTexts.common?.sold || 'Sprzedane'}</span>` : ''}
        </div>
      </div>
    `;
    
    shopContainer.appendChild(productElement);
  });
  
  // Dodaj event listenery dla kliknięć na obrazy produktów
  const productImages = document.querySelectorAll('.shop-product-image');
  productImages.forEach(imageDiv => {
    imageDiv.addEventListener('click', (e) => {
      const productId = parseInt(imageDiv.getAttribute('data-product-id'));
      const productIndex = shopProducts.findIndex(product => product.id === productId);
      if (productIndex !== -1) {
        // Otwórz tryb skupienia dla tego produktu (bez nawigacji)
        openFocusMode(0, [shopProducts[productIndex]], 'shop');
      }
    });
  });
}

// Funkcja pomocnicza - pobranie dzieła po ID
function getArtworkById(id) {
  return galleryArtworks.find(artwork => artwork.id === id);
}

// Funkcja pomocnicza - pobranie produktu po ID
function getProductById(id) {
  return shopProducts.find(product => product.id === id);
}

// Funkcja pomocnicza do konwersji URL-friendly slug z powrotem na oryginalną kategorię
function decodeUrlToCategory(urlSlug, availableCategories) {
  if (!urlSlug) return null;
  
  // Dekoduj URL - zamień myślniki na spacje
  const decodedSlug = urlSlug.replace(/-/g, ' ');
  
  // Sprawdź czy to dokładnie pasuje do którejś kategorii
  if (availableCategories.includes(decodedSlug)) {
    return decodedSlug;
  }
  
  // Jeśli nie, spróbuj dopasować po konwersji polskich znaków
  const slugWithoutPolish = decodedSlug
    .replace(/a/g, 'ą')
    .replace(/c/g, 'ć')
    .replace(/e/g, 'ę')
    .replace(/l/g, 'ł')
    .replace(/n/g, 'ń')
    .replace(/o/g, 'ó')
    .replace(/s/g, 'ś')
    .replace(/z/g, 'ź');
  
  // Sprawdź różne warianty polskich znaków
  for (const category of availableCategories) {
    const categoryNormalized = category
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z');
    
    if (categoryNormalized === decodedSlug) {
      return category;
    }
  }
  
  return null;
}

// Funkcja do filtrowania artworków po kategorii
function filterArtworksByCategory(category) {
  if (!category) return galleryArtworks;
  
  // Konwertuj szukaną kategorię na małe litery
  const searchCategory = category.toLowerCase();
    return galleryArtworks.filter(artwork => 
    // Sprawdź, czy artwork ma kategorie i czy którakolwiek z kategorii pasuje
    artwork.categories && Array.isArray(artwork.categories) &&
    artwork.categories.some(cat => cat && cat.toLowerCase() === searchCategory)
  );
}

// Funkcja do tłumaczenia kategorii
function translateCategory(category) {
  // Sprawdź czy istnieje tłumaczenie dla tej kategorii
  if (uiTexts.categories && uiTexts.categories[category]) {
    return uiTexts.categories[category];
  }
  // Jeśli nie ma tłumaczenia, zwróć oryginalną kategorię
  return category;
}

// Funkcja do obsługi filtrowania kategorii w galerii
function setupCategoryFilters() {
  const filterContainer = document.querySelector('.category-filters');
  if (!filterContainer) return;
  
  // Dodaj stan ładowania
  filterContainer.className = 'category-filters loading';
    // Zbierz wszystkie unikalne kategorie i policz liczbę dzieł w każdej
  const categoryCount = new Map();
  galleryArtworks.forEach(artwork => {
    if (artwork.categories && Array.isArray(artwork.categories)) {
      artwork.categories.forEach(category => {
        if (category && category.trim()) {
          categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        }
      });
    }
  });
  
  // Sortuj kategorie według liczby dzieł (malejąco)
  const sortedCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Wyczyść kontener
  filterContainer.innerHTML = '';
  
  // Dodaj przycisk "Wszystkie"
  const allButton = document.createElement('button');
  allButton.className = 'category-chip category-chip-active';
  allButton.textContent = `${translateCategory('wszystkie')} (${galleryArtworks.length})`;
  allButton.setAttribute('data-category', 'wszystkie');
  allButton.addEventListener('click', () => {
    renderGalleryArtworks();
    highlightActiveFilter(allButton);
    // Aktualizuj URL hash
    window.history.replaceState(null, null, window.location.pathname);
  });
  filterContainer.appendChild(allButton);
  
  // Dodaj przyciski dla każdej kategorii z licznikiem
  sortedCategories.forEach(category => {
    const count = categoryCount.get(category);
    const button = document.createElement('button');
    button.className = 'category-chip category-chip-inactive';
    button.textContent = `${translateCategory(category)} (${count})`;
    button.setAttribute('data-category', category);
    button.addEventListener('click', () => {
      const filteredArtworks = filterArtworksByCategory(category);
      renderGalleryArtworks(filteredArtworks);
      highlightActiveFilter(button);
      // Aktualizuj URL hash - użyj tej samej konwersji co w hero sliderze
      const urlFriendlyCategory = category
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/\s+/g, '-');
      window.history.replaceState(null, null, `${window.location.pathname}#${urlFriendlyCategory}`);
    });
    filterContainer.appendChild(button);  });
  
  function highlightActiveFilter(activeButton) {
    // Resetuj style wszystkich przycisków
    filterContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.className = 'category-chip category-chip-inactive';
    });
    // Podświetl aktywny przycisk
    activeButton.className = 'category-chip category-chip-active';
  }
  
  // Sprawdź, czy URL zawiera hash z kategorią
  const urlHash = window.location.hash.substring(1); // Usuń # z początku
  // Dekoduj URL hash do oryginalnej kategorii
  const decodedCategory = decodeUrlToCategory(urlHash, sortedCategories);
  let initialCategory = null;
  let activeButton = allButton;
  
  if (decodedCategory && decodedCategory !== 'wszystkie') {
    // Znajdź przycisk odpowiadający kategorii z hash
    const categoryButton = Array.from(filterContainer.querySelectorAll('.category-chip'))
      .find(btn => btn.getAttribute('data-category') === decodedCategory);
    
    if (categoryButton) {
      initialCategory = decodedCategory;
      activeButton = categoryButton;
    }
  }
  
  // Zastosuj odpowiedni filtr
  if (initialCategory) {
    const filteredArtworks = filterArtworksByCategory(initialCategory);
    renderGalleryArtworks(filteredArtworks);
  } else {
    renderGalleryArtworks();
  }
  
  // Podświetl odpowiedni przycisk
  highlightActiveFilter(activeButton);
  
  // Usuń stan ładowania po krótkim opóźnieniu dla animacji
  setTimeout(() => {
    filterContainer.classList.remove('loading');
  }, 300);
}

// Nowa funkcja do renderowania strony "O Artyście"
function renderArtistPage() {
  // Sprawdź, czy jesteśmy na stronie "O Artyście"
  const aboutContainer = document.querySelector('.about-artist-content');
  if (!aboutContainer) return;
  
  // Pobierz elementy, które będziemy aktualizować
  const artistPhotoContainer = document.querySelector('.artist-photo');
  const biographyContainer = document.querySelector('.artist-biography');
  const educationContainer = document.querySelector('.artist-education');
  const achievementsContainer = document.querySelector('.artist-achievements');
  const exhibitionsContainer = document.querySelector('.artist-exhibitions');

  // Aktualizuj tytuł strony
  const h1Element = document.querySelector('h1');
  if (h1Element) {
    h1Element.textContent = artistData.artistName || "O Artyście";
  }
  // Aktualizuj zdjęcie artysty
  if (artistPhotoContainer && artistData.artistPhoto) {
    artistPhotoContainer.innerHTML = `
      <img src="${correctImagePath(artistData.artistPhoto)}" alt="${artistData.artistName || 'Artysta'}" 
           class="w-full h-full object-cover rounded">
    `;
    
    // Dodaj klasę has-image żeby ukryć placeholder i tło
    artistPhotoContainer.classList.add('has-image');
    
    // Inicjalizuj 3D efekt po załadowaniu obrazu
    const img = artistPhotoContainer.querySelector('img');
    if (img) {
      img.onload = () => {
        // Wyczyść poprzedni efekt jeśli istnieje
        if (artistPhoto3DCleanup) {
          artistPhoto3DCleanup();
        }
        // Uruchom nowy efekt 3D
        artistPhoto3DCleanup = initialize3DArtistPhoto();
      };
      
      // Jeśli obraz jest już załadowany
      if (img.complete) {
        // Wyczyść poprzedni efekt jeśli istnieje
        if (artistPhoto3DCleanup) {
          artistPhoto3DCleanup();
        }
        // Uruchom nowy efekt 3D
        artistPhoto3DCleanup = initialize3DArtistPhoto();
      }
    }
  }
    // Aktualizuj biografię
  if (biographyContainer && artistData.biography && Array.isArray(artistData.biography) && artistData.biography.length > 0) {
    biographyContainer.innerHTML = '';
    artistData.biography.forEach(paragraph => {
      if (paragraph && paragraph.trim()) {
        const p = document.createElement('p');
        p.className = 'text-gray-700 mb-4';
        // Zabezpieczenie przed sierotkami - dodaj niełamliwe spacje po krótkich słowach
        const textWithNonBreakingSpaces = paragraph.replace(/\b([aiozwunazeprypod])\s+/gi, '$1&nbsp;');
        p.innerHTML = textWithNonBreakingSpaces;
        biographyContainer.appendChild(p);
      }
    });
  }
    // Aktualizuj wykształcenie
  if (educationContainer && artistData.education && Array.isArray(artistData.education) && artistData.education.length > 0) {
    educationContainer.innerHTML = '';
    artistData.education.forEach(item => {
      if (item && item.trim()) {
        const li = document.createElement('li');
        li.className = 'list-disc list-inside text-gray-700';
        // Zabezpieczenie przed sierotkami - dodaj niełamliwe spacje po krótkich słowach
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprypod])\s+/gi, '$1&nbsp;');
        li.innerHTML = textWithNonBreakingSpaces;
        educationContainer.appendChild(li);
      }
    });
  }
    // Aktualizuj osiągnięcia
  if (achievementsContainer && artistData.achievements && Array.isArray(artistData.achievements) && artistData.achievements.length > 0) {
    achievementsContainer.innerHTML = '';
    artistData.achievements.forEach(item => {
      if (item && item.trim()) {
        const li = document.createElement('li');
        li.className = 'list-disc list-inside text-gray-700';
        // Zabezpieczenie przed sierotkami - dodaj niełamliwe spacje po krótkich słowach
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprypod])\s+/gi, '$1&nbsp;');
        li.innerHTML = textWithNonBreakingSpaces;
        achievementsContainer.appendChild(li);
      }
    });
  }
  
  // Aktualizuj wystawy
  if (exhibitionsContainer && artistData.exhibitions && Array.isArray(artistData.exhibitions) && artistData.exhibitions.length > 0) {
    exhibitionsContainer.innerHTML = '';
    artistData.exhibitions.forEach(item => {
      if (item && item.trim()) {
        const li = document.createElement('li');
        li.className = 'list-disc list-inside text-gray-700';
        // Zabezpieczenie przed sierotkami - dodaj niełamliwe spacje po krótkich słowach
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprypod])\s+/gi, '$1&nbsp;');
        li.innerHTML = textWithNonBreakingSpaces;
        exhibitionsContainer.appendChild(li);
      }
    });
  }
}

// Funkcja inicjalizująca aplikację po załadowaniu danych
function initializeApp() {
  // Sprawdzenie, jaka strona jest obecnie załadowana
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('gallery.html')) {
    renderGalleryArtworks();
    setupCategoryFilters();
  } else if (currentPath.includes('shop.html')) {
    renderShopProducts();
  } else if (currentPath.includes('about.html')) {
    renderArtistPage();
  } else {
    // Strona główna
    renderFeaturedArtworks();
    setupGlobalScrollBehavior();
  }
}

// Funkcja do obsługi responsywnego menu
function setupMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!mobileMenuButton || !mobileMenu) return;
  
  let isMenuOpen = false;
  
  // Funkcja do przełączania menu
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
      mobileMenu.classList.remove('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
      mobileMenuButton.setAttribute('aria-label', 'Zamknij menu');
      
      // Zmień ikonę na X
      mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      
      // Dodaj focus trap dla dostępności
      mobileMenu.focus();
    } else {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Otwórz menu');
      
      // Zmień ikonę z powrotem na hamburger
      mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `;
    }
  }
  // Obsługa kliknięcia przycisku menu
  mobileMenuButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  
  // Obsługa klawisza Enter i Space na przycisku menu
  mobileMenuButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    }
  });
  
  // Zamknij menu przy zmianie rozmiaru okna na większy
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isMenuOpen) { // 768px to breakpoint md w Tailwind
      toggleMenu();
    }
  });
  
  // Zamknij menu po kliknięciu w link (dla lepszego UX)
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) {
        toggleMenu();
      }
    });
  });
  
  // Obsługa klawisza Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      toggleMenu();
      mobileMenuButton.focus(); // Przywróć focus do przycisku
    }
  });
  
  // Zamknij menu po kliknięciu poza nim
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      toggleMenu();
    }
  });
  
  // Obsługa nawigacji klawiaturą w menu
  mobileMenu.addEventListener('keydown', (e) => {
    const menuLinks = mobileMenu.querySelectorAll('a');
    const currentIndex = Array.from(menuLinks).indexOf(document.activeElement);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < menuLinks.length - 1 ? currentIndex + 1 : 0;
      menuLinks[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuLinks.length - 1;
      menuLinks[prevIndex].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      menuLinks[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      menuLinks[menuLinks.length - 1].focus();
    }
  });
}

// ===== TRYB SKUPIENIA NA OBRAZIE =====

// Zmienne globalne dla trybu skupienia
let focusModeState = {
  isOpen: false,
  currentIndex: 0,
  artworks: [],
  overlay: null,
  source: 'gallery', // Domyślnie gallery
  isMaximized: false // Dodajemy flagę dla stanu maksymalizacji
};

// Funkcja do otwierania trybu skupienia
function openFocusMode(artworkIndex, artworks, source = 'gallery') {
  focusModeState.currentIndex = artworkIndex;
  focusModeState.artworks = artworks;
  focusModeState.isOpen = true;
  focusModeState.source = source; // Dodaj informację o źródle
  
  // Zapobiegaj przewijaniu tła
  document.body.classList.add('focus-mode-open');
  
  // Utwórz overlay jeśli nie istnieje
  if (!focusModeState.overlay) {
    createFocusModeOverlay();
  }
  
  // Wyświetl aktualny obraz
  displayCurrentArtwork();
  
  // Pokaż overlay
  focusModeState.overlay.classList.add('active');
  
  // Dodaj event listenery
  setupFocusModeEventListeners();
}

// Funkcja do zamykania trybu skupienia
function closeFocusMode() {
  if (!focusModeState.isOpen) return;
  
  focusModeState.isOpen = false;
  focusModeState.isMaximized = false; // Resetuj flagę maksymalizacji
  document.body.classList.remove('focus-mode-open');
  
  if (focusModeState.overlay) {
    focusModeState.overlay.classList.remove('active');
    
    // Usuń overlay po animacji
    setTimeout(() => {
      if (focusModeState.overlay && !focusModeState.isOpen) {
        focusModeState.overlay.remove();
        focusModeState.overlay = null;
      }
    }, 300);
  }
  
  // Usuń event listenery
  removeFocusModeEventListeners();
}

// Funkcja do tworzenia overlay
function createFocusModeOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'focus-mode-overlay';
  
  overlay.innerHTML = `
    <button class="focus-close-button" aria-label="Zamknij tryb skupienia">
      <svg class="focus-close-icon" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="focus-maximize-button" aria-label="Maksymalizuj obraz">
      <svg class="focus-maximize-icon" viewBox="0 0 24 24">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="focus-nav-button prev" aria-label="Poprzedni obraz">
      <svg class="focus-nav-icon" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="focus-nav-button next" aria-label="Następny obraz">
      <svg class="focus-nav-icon" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div class="focus-mode-container">
      <img class="focus-mode-image" src="" alt="" />
      
      <div class="focus-mode-info">
        <h3 class="text-2xl font-bold mb-2"></h3>
        <div class="focus-mode-details"></div>
        <p class="focus-mode-description mt-3 text-gray-700"></p>
        <div class="focus-mode-availability-or-purchase mt-3"></div>
        <div class="focus-mode-gallery-button mt-4" style="display: none;">
          <a href="#" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block">
            <span class="gallery-button-text">Zobacz w Galerii</span>
          </a>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  focusModeState.overlay = overlay;
  
  // Dodaj event listenery dla przycisków
  const closeButton = overlay.querySelector('.focus-close-button');
  const maximizeButton = overlay.querySelector('.focus-maximize-button');
  const prevButton = overlay.querySelector('.focus-nav-button.prev');
  const nextButton = overlay.querySelector('.focus-nav-button.next');
  
  closeButton.addEventListener('click', closeFocusMode);
  maximizeButton.addEventListener('click', toggleMaximizeImage);
  prevButton.addEventListener('click', () => navigateGallery('prev'));
  nextButton.addEventListener('click', () => navigateGallery('next'));
  
  // Zamknij po kliknięciu na overlay (poza kontenerem)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeFocusMode();
    }
  });
}

// Funkcja do tworzenia linku do galerii z kategorią
function getCategoryLink(artwork) {
  if (!artwork.galleryCategory) {
    return './src/pages/gallery.html';
  }
  
  // Zamień polskie znaki na łacińskie i spacje na myślniki dla URL-friendly hash
  const categorySlug = artwork.galleryCategory
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/\s+/g, '-');
    
  return `./src/pages/gallery.html#${categorySlug}`;
}

// Funkcja do wyświetlania aktualnego obrazu
function displayCurrentArtwork() {
  if (!focusModeState.overlay) return;
  
  const artwork = focusModeState.artworks[focusModeState.currentIndex];
  if (!artwork) return;
  
  // Zachowaj stan maksymalizacji przy zmianie obrazu
  const container = focusModeState.overlay.querySelector('.focus-mode-container');
  const info = focusModeState.overlay.querySelector('.focus-mode-info');
  const maximizeButton = focusModeState.overlay.querySelector('.focus-maximize-button');
  const maximizeIcon = maximizeButton.querySelector('.focus-maximize-icon');
  
  // Zastosuj stan maksymalizacji na podstawie flagi zamiast resetowania
  if (focusModeState.isMaximized) {
    container.classList.add('maximized');
    info.style.display = 'none';
    
    // Ustaw ikonę na zmniejszenie (ta sama co w toggleMaximizeImage)
    maximizeIcon.innerHTML = `
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    maximizeButton.setAttribute('aria-label', 'Zmniejsz obraz');
  } else {
    container.classList.remove('maximized');
    info.style.display = 'block';
    
    // Ustaw ikonę na maksymalizację
    maximizeIcon.innerHTML = `
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    maximizeButton.setAttribute('aria-label', 'Maksymalizuj obraz');
  }
  
  const image = focusModeState.overlay.querySelector('.focus-mode-image');
  const title = focusModeState.overlay.querySelector('.focus-mode-info h3');
  const details = focusModeState.overlay.querySelector('.focus-mode-details');
  const description = focusModeState.overlay.querySelector('.focus-mode-description');
  const availabilityOrPurchase = focusModeState.overlay.querySelector('.focus-mode-availability-or-purchase');
  
  // Ustaw obraz
  image.classList.add('loading');
  const correctedImagePath = correctImagePath(artwork.image);
  image.src = correctedImagePath;
  image.alt = artwork.title || 'Obraz';
  
  // Usuń efekt ładowania po załadowaniu obrazu
  image.onload = () => {
    image.classList.remove('loading');
  };
  
  // Ustaw informacje
  title.textContent = artwork.title || 'Bez tytułu';
  
  // Szczegóły techniczne
  const detailsArray = [];
  if (focusModeState.source === 'shop') {
    // Dla produktów ze sklepu - opis i wymiary w jednej linii
    if (artwork.description) detailsArray.push(artwork.description);
    if (artwork.dimensions) detailsArray.push(artwork.dimensions);
  } else {
    // Dla galerii i featured - standardowe szczegóły techniczne
    if (artwork.technique) detailsArray.push(artwork.technique);
    if (artwork.dimensions) detailsArray.push(artwork.dimensions);
    if (artwork.year) detailsArray.push(artwork.year);
  }
  
  details.innerHTML = detailsArray.length > 0 
    ? `<p class="text-gray-500">${detailsArray.join(' • ')}</p>`
    : '';
  
  // Opis - dla sklepu już jest w details, więc ukryj
  if (focusModeState.source === 'shop') {
    description.style.display = 'none';
  } else {
    description.textContent = artwork.description || '';
    description.style.display = artwork.description ? 'block' : 'none';
  }
  
  // Różne informacje w zależności od źródła
  if (focusModeState.source === 'shop') {
    // Dla produktów ze sklepu - cena i przycisk zakupu w jednej linii
    const isAvailable = artwork.available !== false;
    const price = artwork.price ? `<span class="text-purple-600 font-bold text-lg">${artwork.price} zł</span>` : '';
    const buttonClass = isAvailable 
      ? 'bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 font-semibold transition-all duration-300 transform hover:scale-105 inline-block'
      : 'bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block';
    const buttonText = isAvailable ? (uiTexts.common?.goToPurchase || 'Przejdź do zakupu') : (uiTexts.common?.notAvailable || 'Niedostępne');
    const buttonAttributes = isAvailable 
      ? `href="${artwork.purchaseUrl}" target="_blank" rel="noopener noreferrer"`
      : 'onclick="return false;"';
    
    availabilityOrPurchase.innerHTML = `
      <div class="flex items-center justify-center gap-4">
        ${price}
        <a ${buttonAttributes} class="${buttonClass}">
          ${buttonText}
        </a>
      </div>
    `;
  } else if (focusModeState.source === 'gallery') {
    // Dla galerii - status dostępności
    availabilityOrPurchase.innerHTML = `
      <span class="${artwork.available ? 'text-green-600' : 'text-gray-400'} font-semibold">
        ${artwork.available ? (uiTexts.common?.available || 'Dostępny') : (uiTexts.common?.unavailable || 'Niedostępny')}
      </span>
    `;
  } else {
    // Dla featured artworks - ukryj sekcję
    availabilityOrPurchase.innerHTML = '';
  }
  
  // Obsługa przycisku galerii dla featured artworks
  const galleryButtonContainer = focusModeState.overlay.querySelector('.focus-mode-gallery-button');
  const galleryButtonLink = galleryButtonContainer?.querySelector('a');
  const galleryButtonText = galleryButtonContainer?.querySelector('.gallery-button-text');
  
  if (focusModeState.source === 'featured' && artwork.galleryCategory) {
    // Pokaż przycisk dla featured artworks z kategorią galerii
    galleryButtonContainer.style.display = 'block';
    const categoryLink = getCategoryLink(artwork);
    galleryButtonLink.href = categoryLink;
    galleryButtonText.textContent = uiTexts.common?.viewInGallery || 'Zobacz w Galerii';
  } else {
    // Ukryj przycisk dla innych źródeł lub gdy brak kategorii
    galleryButtonContainer.style.display = 'none';
  }
  
  // Zaktualizuj widoczność przycisków nawigacji
  updateNavigationButtons();
}

// Funkcja do nawigacji w galerii
function navigateGallery(direction) {
  const totalArtworks = focusModeState.artworks.length;
  
  if (direction === 'next') {
    focusModeState.currentIndex = (focusModeState.currentIndex + 1) % totalArtworks;
  } else if (direction === 'prev') {
    focusModeState.currentIndex = (focusModeState.currentIndex - 1 + totalArtworks) % totalArtworks;
  }
  
  displayCurrentArtwork();
}

// Funkcja do aktualizowania przycisków nawigacji
function updateNavigationButtons() {
  if (!focusModeState.overlay) return;
  
  const prevButton = focusModeState.overlay.querySelector('.focus-nav-button.prev');
  const nextButton = focusModeState.overlay.querySelector('.focus-nav-button.next');
  
  // Ukryj strzałki dla produktów ze sklepu (nie ma nawigacji między produktami)
  if (focusModeState.source === 'shop') {
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    return;
  }
  
  // Pokaż/ukryj przyciski nawigacji w zależności od liczby obrazów (dla galerii i featured)
  const hasMultipleImages = focusModeState.artworks.length > 1;
  prevButton.style.display = hasMultipleImages ? 'flex' : 'none';
  nextButton.style.display = hasMultipleImages ? 'flex' : 'none';
}

// Funkcja do przełączania trybu maksymalizacji obrazu
function toggleMaximizeImage() {
  if (!focusModeState.overlay) return;
  
  const container = focusModeState.overlay.querySelector('.focus-mode-container');
  const image = focusModeState.overlay.querySelector('.focus-mode-image');
  const info = focusModeState.overlay.querySelector('.focus-mode-info');
  const maximizeButton = focusModeState.overlay.querySelector('.focus-maximize-button');
  const maximizeIcon = maximizeButton.querySelector('.focus-maximize-icon');
  
  const isMaximized = container.classList.contains('maximized');
  
  if (isMaximized) {
    // Przywróć normalny widok
    container.classList.remove('maximized');
    info.style.display = 'block';
    focusModeState.isMaximized = false; // Aktualizuj flagę
    
    // Zmień ikonę na maksymalizację
    maximizeIcon.innerHTML = `
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    maximizeButton.setAttribute('aria-label', 'Maksymalizuj obraz');
  } else {
    // Maksymalizuj obraz
    container.classList.add('maximized');
    info.style.display = 'none';
    focusModeState.isMaximized = true; // Aktualizuj flagę
    
    // Zmień ikonę na zmniejszenie
    maximizeIcon.innerHTML = `
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    maximizeButton.setAttribute('aria-label', 'Zmniejsz obraz');
  }
}

// Event listenery dla trybu skupienia
let focusModeKeyHandler;
let focusModeResizeHandler;

function setupFocusModeEventListeners() {
  // Obsługa klawiszy
  focusModeKeyHandler = (e) => {
    if (!focusModeState.isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeFocusMode();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigateGallery('prev');
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateGallery('next');
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleMaximizeImage();
        break;
    }
  };
  
  // Obsługa resize
  focusModeResizeHandler = () => {
    if (focusModeState.isOpen) {
      displayCurrentArtwork();
    }
  };
  
  document.addEventListener('keydown', focusModeKeyHandler);
  window.addEventListener('resize', focusModeResizeHandler);
}

function removeFocusModeEventListeners() {
  if (focusModeKeyHandler) {
    document.removeEventListener('keydown', focusModeKeyHandler);
  }
  if (focusModeResizeHandler) {
    window.removeEventListener('resize', focusModeResizeHandler);
  }
}

// Funkcja do konfiguracji scrollowania dla featured artworks
function setupFeaturedScrolling() {
  // ===== KONFIGURACJA CZUŁOŚCI SCROLLOWANIA =====
  // INSTRUKCJA: Aby zmienić czułość scrollowania, modyfikuj wartości poniżej
  // 
  // deadZone: Im mniejsza wartość, tym mniejsza strefa martwa w środku
  // maxSpeed: Im większa wartość, tym szybsze scrollowanie na skrajach
  // minSpeed: Prędkość tuż za strefą martwą
  // edgeBoost: Mnożnik prędkości na samych krawędziach (1.0 = bez boostu)
  // accelerationCurve: 1.0 = liniowa, >1.0 = bardziej agresywna na skrajach
  // animationInterval: Mniejsza wartość = płynniejsza animacja (ale więcej CPU)
  const SCROLL_CONFIG = {
    // Strefy martwe (wartości 0-1, gdzie 0 = brak strefy martwej, 1 = cały kontener)
    deadZone: {
      small: 0.08,   // < 600px szerokości
      medium: 0.12,  // 600-900px szerokości
      large: 0.15    // > 900px szerokości
    },
    
    // Maksymalne prędkości scrollowania (piksele na ramkę)
    maxSpeed: {
      small: 120,      // < 600px szerokości
      medium: 130,     // 600-900px szerokości
      large: 140       // > 900px szerokości
    },
    
    // Minimalna prędkość tuż za strefą martwą
    minSpeed: 300,
    
    // Boost prędkości na skrajach (mnożnik gdy kursor jest bardzo blisko krawędzi)
    edgeBoost: 100,
    
    // Próg dla określenia "krawędzi" (0.9 = ostatnie 10% szerokości)
    edgeThreshold: 0.8,
    
    // Krzywa przyspieszenia (1.0 = liniowa, >1.0 = bardziej agresywna na skrajach)
    accelerationCurve: 1,
    
    // Częstotliwość animacji (ms) - mniejsza wartość = płynniejsza animacja
    animationInterval: 12,
    
    // Czułość wheel scroll (mnożnik dla kółka myszy)
    wheelSensitivity: {
      small: 95,    // < 600px szerokości
      medium: 85,   // 600-900px szerokości
      large: 75     // > 900px szerokości
    },
    
    // Skok dla nawigacji klawiaturą (piksele)
    keyboardJump: {
      small: 200,    // < 600px szerokości
      medium: 250,   // 600-900px szerokości
      large: 300     // > 900px szerokości
    }
  };
  // ===== KONIEC KONFIGURACJI =====

  const featuredContainer = document.querySelector('.featured-artworks.horizontal-scroll');
  const featuredWrapper = document.querySelector('.featured-artworks-container');
  if (!featuredContainer || !featuredWrapper) return;

  let isScrolling = false;
  let scrollTimeout;
  let autoScrollInterval = null;
  
  // Funkcja do wykrywania czy to urządzenie mobilne
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
  };

  // Desktop mouse hover scrolling (tylko na desktopie i nie na bardzo szerokich ekranach)
  if (!isMobileDevice()) {
    // Sprawdź czy ekran nie jest zbyt szeroki (powyżej 2200px wyłączamy funkcjonalność)
    const isVeryWideScreen = () => window.innerWidth >= 2200;
    
    let mouseX = 0;
    let isHovering = false;
    
    featuredWrapper.addEventListener('mouseenter', () => {
      if (isVeryWideScreen()) return; // Wyłącz na bardzo szerokich ekranach
      isHovering = true;
    });
    
    featuredWrapper.addEventListener('mouseleave', () => {
      isHovering = false;
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    });
    
    featuredWrapper.addEventListener('mousemove', (e) => {
      if (!isHovering || isVeryWideScreen()) return; // Wyłącz na bardzo szerokich ekranach
      
      const rect = featuredWrapper.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const centerPoint = containerWidth / 2;
      
      // Określ pozycję kursora względem centrum (od -1 do 1)
      const position = (relativeX - centerPoint) / centerPoint;
      
      // Adaptacyjna strefa martwa w zależności od szerokości okna
      let deadZone;
      if (containerWidth < 600) {
        deadZone = SCROLL_CONFIG.deadZone.small;
      } else if (containerWidth < 900) {
        deadZone = SCROLL_CONFIG.deadZone.medium;
      } else {
        deadZone = SCROLL_CONFIG.deadZone.large;
      }
      
      if (Math.abs(position) < deadZone) {
        // W strefie martwej - zatrzymaj auto scroll
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
        return;
      }
      
      // Oblicz prędkość scrollowania z wykładniczą krzywą dla lepszej czułości
      const normalizedPosition = (Math.abs(position) - deadZone) / (1 - deadZone);
      
      // Użyj funkcji potęgowej dla bardziej agresywnego scrollowania na skrajach
      const accelerationCurve = Math.pow(normalizedPosition, SCROLL_CONFIG.accelerationCurve);
      
      // Dodatkowo zwiększ prędkość gdy kursor jest bardzo blisko krawędzi
      const isAtEdge = Math.abs(position) > SCROLL_CONFIG.edgeThreshold;
      const edgeBoost = isAtEdge ? SCROLL_CONFIG.edgeBoost : 1.0;
      
      // Adaptacyjna maksymalna prędkość w zależności od szerokości ekranu
      let baseMaxSpeed;
      if (containerWidth < 600) {
        baseMaxSpeed = SCROLL_CONFIG.maxSpeed.small;
      } else if (containerWidth < 900) {
        baseMaxSpeed = SCROLL_CONFIG.maxSpeed.medium;
      } else {
        baseMaxSpeed = SCROLL_CONFIG.maxSpeed.large;
      }
      
      const maxSpeed = baseMaxSpeed * edgeBoost;
      const minSpeed = SCROLL_CONFIG.minSpeed;
      
      const speed = minSpeed + (maxSpeed - minSpeed) * accelerationCurve;
      // Debug info (możesz usunąć po testach)
      // console.log(`Width: ${containerWidth}, DeadZone: ${deadZone.toFixed(2)}, Position: ${position.toFixed(2)}, Speed: ${speed.toFixed(1)}`);
      
      const direction = position > 0 ? 1 : -1; // 1 = w prawo, -1 = w lewo
      
      // Zatrzymaj poprzedni interval
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
      
      // Rozpocznij nowy auto scroll z wyższą częstotliwością
      autoScrollInterval = setInterval(() => {
        if (!isHovering) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
          return;
        }
        
        const scrollAmount = speed * direction;
        featuredContainer.scrollLeft += scrollAmount;
        
        // Sprawdź czy doszliśmy do końca
        const isAtStart = featuredContainer.scrollLeft <= 0;
        const isAtEnd = featuredContainer.scrollLeft >= (featuredContainer.scrollWidth - featuredContainer.clientWidth);
        
        if ((direction < 0 && isAtStart) || (direction > 0 && isAtEnd)) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
      }, SCROLL_CONFIG.animationInterval);
    });
  }

  // Smooth scrolling behavior (wheel event)
  featuredContainer.addEventListener('wheel', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    // Pozwól na normalne scrollowanie pionowe gdy doszliśmy do końca horizontal scroll
    const isAtStart = featuredContainer.scrollLeft === 0;
    const isAtEnd = featuredContainer.scrollLeft >= (featuredContainer.scrollWidth - featuredContainer.clientWidth);
    
    // Jeśli scrollujemy poziomo (wheel delta X) lub jesteśmy w środku contentu
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || (!isAtStart && !isAtEnd)) {
      e.preventDefault();
      
      // Adaptacyjna czułość scrollowania w zależności od szerokości okna
      const containerWidth = featuredContainer.getBoundingClientRect().width;
      let scrollMultiplier;
      if (containerWidth < 600) {
        scrollMultiplier = SCROLL_CONFIG.wheelSensitivity.small;
      } else if (containerWidth < 900) {
        scrollMultiplier = SCROLL_CONFIG.wheelSensitivity.medium;
      } else {
        scrollMultiplier = SCROLL_CONFIG.wheelSensitivity.large;
      }
      
      const scrollAmount = e.deltaY * scrollMultiplier;
      featuredContainer.scrollLeft += scrollAmount;
      
      // Oznacz, że scrollujemy poziomo
      isScrolling = true;
      
      // Reset flag po krótkiej przerwie
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }
  }, { passive: false });

  // Touch support for mobile - ulepszona wersja
  let touchStartX = 0;
  let touchStartY = 0;
  let isHorizontalSwipe = false;
  let touchStartTime = 0;
  let initialScrollLeft = 0;

  featuredContainer.addEventListener('touchstart', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isHorizontalSwipe = false;
    initialScrollLeft = featuredContainer.scrollLeft;
    
    // Zatrzymaj autoScroll jeśli jest aktywny
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }, { passive: true });

  featuredContainer.addEventListener('touchmove', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    if (!touchStartX || !touchStartY) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    
    const deltaX = touchCurrentX - touchStartX;
    const deltaY = touchCurrentY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Określ kierunek swipe tylko raz na początku
    if (!isHorizontalSwipe && (absDeltaX > 15 || absDeltaY > 15)) {
      if (absDeltaX > absDeltaY && absDeltaX > 15) {
        isHorizontalSwipe = true;
        // Tylko teraz próbuj preventDefault
        if (e.cancelable) {
          e.preventDefault();
        }
      } else {
        console.log('Wykryto pionowy scroll (touch) - anuluj swipe');
        isHorizontalSwipe = false;
        return;
      }
    }
    
    // Jeśli to horizontal swipe, wykonaj scrollowanie ręcznie
    if (isHorizontalSwipe && e.cancelable) {
      e.preventDefault();
      const newScrollLeft = initialScrollLeft - deltaX;
      featuredContainer.scrollLeft = Math.max(0, Math.min(newScrollLeft, featuredContainer.scrollWidth - featuredContainer.clientWidth));
    }
  }, { passive: false });

  featuredContainer.addEventListener('touchend', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    // Proste czyszczenie zmiennych - bez momentum scrolling
    touchStartX = 0;
    touchStartY = 0;
    isHorizontalSwipe = false;
    touchStartTime = 0;
    initialScrollLeft = 0;
  }, { passive: true });

  // Obsługa przerwania touch (np. gdy przychodzi telefon)
  featuredContainer.addEventListener('touchcancel', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    // Przywróć oryginalną pozycję jeśli touch został przerwany
    if (initialScrollLeft !== 0) {
      featuredContainer.scrollLeft = initialScrollLeft;
    }
    
    // Wyczyść zmienne
    touchStartX = 0;
    touchStartY = 0;
    isHorizontalSwipe = false;
    touchStartTime = 0;
    initialScrollLeft = 0;
  }, { passive: true });

  // Keyboard navigation
  featuredContainer.addEventListener('keydown', (e) => {
    // Wyłącz na bardzo szerokich ekranach
    if (window.innerWidth >= 2200) return;
    
    // Adaptacyjna prędkość nawigacji klawiaturą
    const containerWidth = featuredContainer.getBoundingClientRect().width;
    let keyboardScrollAmount;
    if (containerWidth < 600) {
      keyboardScrollAmount = SCROLL_CONFIG.keyboardJump.small;
    } else if (containerWidth < 900) {
      keyboardScrollAmount = SCROLL_CONFIG.keyboardJump.medium;
    } else {
      keyboardScrollAmount = SCROLL_CONFIG.keyboardJump.large;
    }
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      featuredContainer.scrollLeft -= keyboardScrollAmount;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      featuredContainer.scrollLeft += keyboardScrollAmount;
    }
  });

  // Make container focusable for keyboard navigation (tylko jeśli nie jest bardzo szeroki ekran)
  if (window.innerWidth < 1600) {
    featuredContainer.setAttribute('tabindex', '0');
  }

  // Funkcja do zarządzania podpowiedzią desktop scroll
  function setupDesktopScrollHint() {
    const hint = document.querySelector('.desktop-scroll-hint');
    const container = document.querySelector('.featured-artworks-container');
    const featuredContainer = document.querySelector('.featured-artworks.horizontal-scroll');
    
    if (!hint || !container || !featuredContainer || isMobileDevice()) return;
    
    let hintTimeout;
    let hasInteracted = false;
    
    // Funkcja sprawdzająca czy przewijanie jest potrzebne
    function checkIfScrollingNeeded() {
      const containerWidth = featuredContainer.clientWidth;
      const scrollWidth = featuredContainer.scrollWidth;
      return scrollWidth > containerWidth;
    }
    
    // Funkcja do pokazywania/ukrywania podpowiedzi w zależności od potrzeby przewijania
    function updateHintVisibility() {
      const needsScrolling = checkIfScrollingNeeded();
      
      if (!needsScrolling) {
        // Jeśli nie potrzeba przewijania, ukryj podpowiedź
        hint.style.display = 'none';
      } else {
        // Jeśli potrzeba przewijania, pokaż podpowiedź (jeśli użytkownik jeszcze nie wchodził w interakcję)
        hint.style.display = 'block';
        if (!hasInteracted) {
          // Pokaż podpowiedź po chwili
          setTimeout(() => {
            if (!hasInteracted && checkIfScrollingNeeded()) {
              hint.classList.add('visible');
            }
          }, 2000);
        }
      }
    }
    
    // Sprawdź przy załadowaniu
    updateHintVisibility();
    
    // Sprawdź przy zmianie rozmiaru okna
    window.addEventListener('resize', () => {
      setTimeout(updateHintVisibility, 100);
    });
    
    // Sprawdź gdy obrazy się załadują
    const images = featuredContainer.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete) {
        updateHintVisibility();
      } else {
        img.addEventListener('load', updateHintVisibility);
      }
    });
    
    // Ukryj podpowiedź po pierwszej interakcji
    const hideHintOnInteraction = () => {
      hasInteracted = true;
      hint.classList.remove('visible');
      
      setTimeout(() => {
        hint.style.display = 'none';
      }, 500);
    };
    
    container.addEventListener('mouseenter', hideHintOnInteraction, { once: true });
    featuredContainer.addEventListener('wheel', hideHintOnInteraction, { once: true });
  }
  
  // Wywołaj funkcję setup podpowiedzi
  setupDesktopScrollHint();
  
  // Obsługa zmiany rozmiaru okna - dostosuj funkcjonalność do nowej szerokości
  const handleResize = () => {
    const isVeryWide = window.innerWidth >= 1600;
    
    if (isVeryWide) {
      // Zatrzymaj auto scroll jeśli jest aktywny
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
      // Usuń tabindex na bardzo szerokich ekranach
      featuredContainer.removeAttribute('tabindex');
    } else {
      // Przywróć tabindex na węższych ekranach
      featuredContainer.setAttribute('tabindex', '0');
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // Wywołaj od razu na start
  
  // Ustaw obsługę resize dla smooth scrolling
  setupFeaturedResizeHandler();
}

// Enhanced scroll behavior for the entire page when featured section is in view
function setupGlobalScrollBehavior() {
  const featuredSection = document.querySelector('.featured-artworks-container');
  if (!featuredSection) return;

  let featuredSectionInView = false;

  // Observe when featured section enters/leaves viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      featuredSectionInView = entry.isIntersecting;
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px'
  });

  observer.observe(featuredSection);

  // Global wheel event handler
  window.addEventListener('wheel', (e) => {
    if (!featuredSectionInView) return;

    const featuredContainer = document.querySelector('.featured-artworks.horizontal-scroll');
    if (!featuredContainer) return;

    const isAtStart = featuredContainer.scrollLeft === 0;
    const isAtEnd = featuredContainer.scrollLeft >= (featuredContainer.scrollWidth - featuredContainer.clientWidth);

    // Jeśli scrollujemy w dół i jesteśmy na początku horizontal scroll
    if (e.deltaY > 0 && isAtStart) {
      // Pozwól na normalne scrollowanie w dół
      return;
    }

    // Jeśli scrollujemy w górę i jesteśmy na końcu horizontal scroll
    if (e.deltaY < 0 && isAtEnd) {
      // Pozwól na normalne scrollowanie w górę
      return;
    }

    // W przeciwnym razie, scrolluj horizontalnie jeśli to jest główny kierunek
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5) {
      e.preventDefault();
      featuredContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

// Function to animate featured artworks when they come into view
function observeFeaturedArtworks() {
  const featuredSection = document.querySelector('.featured-artworks');
  if (!featuredSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  observer.observe(featuredSection);
}

// Function to animate contact section when it comes into view
function observeContactSection() {
  const contactSection = document.querySelector('.contact-section');
  if (!contactSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  observer.observe(contactSection);
}

// Function to handle top bar visibility on homepage
function initTopBarScrollBehavior() {
  const topBar = document.getElementById('top-bar');
  if (!topBar) return;
  
  // Sprawdź czy jesteśmy na stronie głównej
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.endsWith('/index.html') || 
                     currentPath === '' || currentPath.includes('kogutowicz-art') && !currentPath.includes('/pages/');
  
  if (!isHomePage) {
    // Na innych stronach górny pasek pozostaje zawsze widoczny
    return;
  }
  
  // Na stronie głównej obserwuj scrollowanie
  const contactSection = document.querySelector('.contact-section');
  if (!contactSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Gdy sekcja kontaktowa jest widoczna, ukryj górny pasek
        topBar.style.transform = 'translateY(-100%)';
        topBar.style.opacity = '0';
      } else {
        // Gdy sekcja kontaktowa nie jest widoczna, pokaż górny pasek
        topBar.style.transform = 'translateY(0)';
        topBar.style.opacity = '1';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  observer.observe(contactSection);
}

// Inicjalizacja kontroli animacji Lottie dla ikon social media
function initLottieControls() {
  const socialLinks = document.querySelectorAll('.social-icon-link');
  
  socialLinks.forEach(link => {
    const lottiePlayer = link.querySelector('lottie-player');
    
    if (lottiePlayer) {
      // Ustaw animację jako zatrzymaną na początku
      lottiePlayer.addEventListener('ready', () => {
        lottiePlayer.stop();
      });
      
      // Uruchom animację przy hover
      link.addEventListener('mouseenter', () => {
        lottiePlayer.play();
      });
      
      // Zatrzymaj animację i zresetuj do początku przy opuszczeniu
      link.addEventListener('mouseleave', () => {
        lottiePlayer.stop();
        lottiePlayer.seek(0);
      });
    }
  });
}

// Dodaj inicjalizację kontroli Lottie do głównej funkcji init
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded - inicjalizacja rozpoczęta');
  
  // Inicjalizuj selektor języka jako pierwszy
  initializeLanguageSelector();
  
  // Załaduj dane a potem zaktualizuj opcje języków
  await fetchData();
  updateUITexts();
  await updateLanguageOptions();
  setupMobileMenu();
  
  // Inicjalizuj slider tylko na stronie głównej
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.endsWith('/index.html') || 
                     currentPath === '' || currentPath.includes('kogutowicz-art') && !currentPath.includes('/pages/');
  
  console.log('Ścieżka:', currentPath, 'Czy strona główna:', isHomePage);
  
  if (isHomePage) {
    console.log('Inicjalizuję hero slider...');
    // Inicjalizuj hero slider
    heroSlider = new HeroSlider();
    
    // Inicjalizuj obserwator dla sekcji featured artworks
    observeFeaturedArtworks();
    // Inicjalizuj obserwator dla sekcji kontaktowej
    observeContactSection();
    // Inicjalizuj obserwator dla górnego paska
    initTopBarScrollBehavior();
  } else {
    console.log('Nie jestem na stronie głównej, pomijam slider');
    // Na innych stronach też inicjalizuj obserwację górnego paska (ale z inną logiką)
    initTopBarScrollBehavior();
  }
  
  // 3D efekt będzie inicjalizowany w renderArtistPage()
  initLottieControls(); // Dodaj tutaj
  
  // Inicjalizuj animacje ikon społecznościowych w górnym pasku
  initTopBarSocialIcons();
});

// Funkcja do obsługi animacji Lottie na hover dla ikon społecznościowych w górnym pasku
function initTopBarSocialIcons() {
  const socialIcons = document.querySelectorAll('.top-social-icon, .footer-github-icon');
  
  socialIcons.forEach(icon => {
    const staticIcon = icon.querySelector('.social-icon-static');
    const animatedIcon = icon.querySelector('.social-icon-animated');
    
    if (staticIcon && animatedIcon) {
      // Upewnij się, że Lottie jest zatrzymane na starcie
      animatedIcon.stop();
      
      // Na hover - pokaż animację Lottie i ukryj SVG
      icon.addEventListener('mouseenter', () => {
        staticIcon.style.opacity = '0';
        animatedIcon.style.opacity = '1';
        animatedIcon.play();
      });
      
      // Po opuszczeniu - wróć do SVG i ukryj Lottie
      icon.addEventListener('mouseleave', () => {
        staticIcon.style.opacity = '1';
        animatedIcon.style.opacity = '0';
        animatedIcon.stop();
        animatedIcon.seek(0); // Wróć do pierwszej klatki
      });
    }
  });
  
  // Dodaj obsługę hover dla całego linka autora
  const authorLinks = document.querySelectorAll('.footer-author-link');
  
  authorLinks.forEach(authorLink => {
    const githubIcon = authorLink.querySelector('.footer-github-icon');
    if (githubIcon) {
      const staticIcon = githubIcon.querySelector('.social-icon-static');
      const animatedIcon = githubIcon.querySelector('.social-icon-animated');
      
      if (staticIcon && animatedIcon) {
        // Na hover całego linka - animuj ikonę GitHub
        authorLink.addEventListener('mouseenter', () => {
          staticIcon.style.opacity = '0';
          animatedIcon.style.opacity = '1';
          animatedIcon.play();
        });
        
        // Po opuszczeniu całego linka - zatrzymaj animację
        authorLink.addEventListener('mouseleave', () => {
          staticIcon.style.opacity = '1';
          animatedIcon.style.opacity = '0';
          animatedIcon.stop();
          animatedIcon.seek(0);
        });
      }
    }
  });
}

// Cleanup przy opuszczeniu strony
window.addEventListener('beforeunload', () => {
  if (artistPhoto3DCleanup) {
    artistPhoto3DCleanup();
    artistPhoto3DCleanup = null;
  }
  
  if (heroSlider) {
    heroSlider.destroy();
    heroSlider = null;
  }
});

// Eksport funkcji dla możliwości użycia w innych modułach
export { 
  renderFeaturedArtworks, 
  renderGalleryArtworks, 
  renderShopProducts,
  renderArtistPage,
  getArtworkById,
  getProductById,
  filterArtworksByCategory,
  setupMobileMenu,
  openFocusMode,
  closeFocusMode
};

// ===== 3D EFEKT ZDJĘCIA ARTYSTY - REAGUJE NA KURSOR =====

// Funkcja do inicjalizacji 3D efektu dla zdjęcia artysty
function initialize3DArtistPhoto() {
  const artistPhoto = document.querySelector('.artist-photo');
  if (!artistPhoto) return;

  const img = artistPhoto.querySelector('img');
  if (!img) return;
  // Parametry efektu - delikatniejsze nachylenie niż w standardowych przykładach
  const maxRotation = 3; // Zmniejszone 
  const perspective = 1000;
  
  // Funkcja do obliczania transformacji na podstawie pozycji kursora
  function updateTransform(e) {
    // Pobierz pozycję i rozmiary elementu
    const rect = artistPhoto.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Oblicz pozycję kursora względem centrum elementu
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Oblicz różnicę od centrum (w pikselach)
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    
    // Normalizuj do zakresu -1 do 1 na podstawie odległości od centrum ekranu
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Użyj globalnej pozycji dla bardziej subtelnego efektu
    const normalizedX = (mouseX - screenCenterX) / screenCenterX;
    const normalizedY = (mouseY - screenCenterY) / screenCenterY;
    
    // Oblicz kąty rotacji (odwrócone dla naturalnego efektu)
    const rotateY = normalizedX * maxRotation;
    const rotateX = -normalizedY * maxRotation;
    
    // Zastosuj transformację
    if (img) {
      img.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
    }
    
    // Dodaj klasę active dla efektu świetlnego
    artistPhoto.classList.add('active');
  }
  
  // Funkcja do resetowania transformacji
  function resetTransform() {
    if (img) {
      img.style.transform = `
        perspective(${perspective}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
    }
    
    // Usuń klasę active
    artistPhoto.classList.remove('active');
  }
  
  // Event listenery
  document.addEventListener('mousemove', updateTransform);
  
  // Reset przy opuszczeniu okna przeglądarki
  document.addEventListener('mouseleave', resetTransform);
  
  // Reset na urządzeniach dotykowych
  document.addEventListener('touchstart', resetTransform);
  document.addEventListener('touchend', resetTransform);
  
  // Cleanup function
  return function cleanup() {
    document.removeEventListener('mousemove', updateTransform);
    document.removeEventListener('mouseleave', resetTransform);
    document.removeEventListener('touchstart', resetTransform);
    document.removeEventListener('touchend', resetTransform);
    resetTransform();
  };
}

// Globalna zmienna do przechowywania funkcji cleanup
let artistPhoto3DCleanup = null;

// Slider functionality for homepage hero section
class HeroSlider {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.slideImages = [];
    this.autoPlayInterval = null;
    this.autoPlayDelay = 8000; // 8 sekund
    this.container = document.getElementById('slider-container');
    this.dotsContainer = document.getElementById('slider-dots');
    this.prevButton = document.getElementById('prev-slide');
    this.nextButton = document.getElementById('next-slide');
    this.overlayContent = document.querySelector('#hero-slider .text-center');
    
    console.log('HeroSlider konstruktor:', {
      container: this.container,
      overlayContent: this.overlayContent,
      dotsContainer: this.dotsContainer
    });
    
    // Będziemy używać danych z featured.json
    this.featuredData = [];
    
    this.init();
  }

  async init() {
    console.log('HeroSlider.init() rozpoczęty');
    if (!this.container) {
      console.error('Brak kontenera slidera!');
      return;
    }
    
    // Pokazuj loader
    this.showLoader();
    
    try {
      console.log('Czekam na dane featured...');
      // Poczekaj aż dane featured zostaną załadowane
      await this.waitForFeaturedData();
      console.log('Dane featured załadowane:', this.featuredData);
      
      console.log('Rozpoczynam preload obrazów...');
      // Preload images
      await this.preloadImages();
      console.log('Obrazy preloadowane');
      
      // Ukryj loader
      this.hideLoader();
      
      console.log('Tworzę slides...');
      // Utwórz slides
      this.createSlides();
      
      console.log('Tworzę dots...');
      // Utwórz dots
      this.createDots();
      
      console.log('Dodaję event listenery...');
      // Dodaj event listenery
      this.addEventListeners();
      
      console.log('Pokazuję pierwszy slide...');
      // Pokaż pierwszy slide
      this.showSlide(0);
      
      console.log('Rozpocznij autoplay...');
      // Rozpocznij autoplay
      this.startAutoPlay();
      
      console.log('HeroSlider inicjalizacja zakończona pomyślnie');
      
    } catch (error) {
      console.error('Błąd podczas inicjalizacji slidera:', error);
      this.hideLoader();
    }
  }

  async waitForFeaturedData() {
    console.log('Czekam na featuredArtworks...', featuredArtworks);
    let attempts = 0;
    const maxAttempts = 50; // 5 sekund maksymalnie
    
    // Poczekaj aż dane featured zostaną załadowane
    while ((!featuredArtworks || featuredArtworks.length === 0) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`Próba ${attempts}/50 - featuredArtworks:`, featuredArtworks);
      }
    }
    
    if (!featuredArtworks || featuredArtworks.length === 0) {
      throw new Error('Nie udało się załadować danych featured po 5 sekundach');
    }
    
    this.featuredData = featuredArtworks;
    console.log('Dane featured załadowane pomyślnie:', this.featuredData);
  }

  showLoader() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="slider-image-preloader">
          <div class="spinner"></div>
        </div>
      `;
    }
  }

  hideLoader() {
    const loader = this.container?.querySelector('.slider-image-preloader');
    if (loader) {
      loader.remove();
    }
  }

  async preloadImages() {
    console.log('Rozpoczynam ładowanie obrazów featured:', this.featuredData);
    
    const imagePromises = this.featuredData.map(artwork => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Załadowano obraz: ${artwork.title} - ${img.src}`);
          resolve({ img, artwork });
        };
        img.onerror = () => {
          console.error(`Błąd ładowania obrazu: ${artwork.image}`);
          reject(new Error(`Nie można załadować obrazu: ${artwork.image}`));
        };
        const correctedPath = correctImagePath(artwork.image);
        console.log(`Próba załadowania: ${artwork.image} -> ${correctedPath}`);
        img.src = correctedPath;
      });
    });

    const results = await Promise.all(imagePromises);
    this.slideImages = results;
    console.log('Wszystkie obrazy załadowane:', this.slideImages);
  }

  createSlides() {
    console.log('createSlides rozpoczęte, container:', this.container);
    
    this.slideImages.forEach(({ img, artwork }, index) => {
      const slideElement = document.createElement('img');
      slideElement.className = 'slider-image';
      slideElement.src = img.src;
      slideElement.alt = artwork.title;
      slideElement.loading = 'eager';
      slideElement.style.objectFit = 'cover';
      slideElement.style.width = '100%';
      slideElement.style.height = '100%';
      
      // Dodaj do kontenera
      this.container.appendChild(slideElement);
      this.slides.push({ element: slideElement, artwork });
    });
    
    console.log('createSlides zakończone. Liczba slajdów:', this.slides.length);
  }

  createDots() {
    if (!this.dotsContainer) return;
    
    this.dotsContainer.innerHTML = '';
    
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Przejdź do slajdu ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      
      this.dotsContainer.appendChild(dot);
    });
  }

  addEventListeners() {
    console.log('Dodaję event listenery dla slidera...');
    
    // Sprawdź czy wszystkie elementy są dostępne
    console.log('Elementy slidera:', {
      container: !!this.container,
      prevButton: !!this.prevButton,
      nextButton: !!this.nextButton,
      dotsContainer: !!this.dotsContainer
    });
    
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    } else {
      console.warn('Brak przycisku prev!');
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    } else {
      console.warn('Brak przycisku next!');
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });

    // Pause autoplay on hover
    if (this.container) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    // Pointer events support for modern touch devices
    this.addPointerSupport();
    
    console.log('Event listenery zostały dodane');
  }

  addPointerSupport() {
    if (!this.container || !('PointerEvent' in window)) {
      console.log('Pointer events nie są dostępne lub brak kontenera');
      return;
    }
    
    console.log('Dodaję pointer events jako dodatkowe wsparcie dla gestów');
    
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let startTime = 0;
    let isHorizontalSwipe = false;
    
    const minSwipeDistance = 50;
    const maxSwipeTime = 800;
    const maxVerticalMovement = 150;
    const minHorizontalMovement = 30;
    
    this.container.addEventListener('pointerdown', (e) => {
      // Tylko dla touch pointers
      if (e.pointerType !== 'touch') return;
      
      console.log('🎯 PointerDown (touch) event otrzymany!', e);
      
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      isDragging = true;
      isHorizontalSwipe = false;
      
      this.pauseAutoPlay();
      
      // Przechwytuj pointer dla lepszej kontroli
      this.container.setPointerCapture(e.pointerId);
      
      console.log('Pointer start:', { startX, startY, timestamp: startTime });
    }, { passive: true });
    
    this.container.addEventListener('pointermove', (e) => {
      if (!isDragging || e.pointerType !== 'touch') return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      console.log('Pointer move:', { currentX, currentY, deltaX, deltaY });
      
      if (deltaX > minHorizontalMovement || deltaY > minHorizontalMovement) {
        if (deltaX > deltaY) {
          if (!isHorizontalSwipe) {
            isHorizontalSwipe = true;
            console.log('Wykryto poziomy swipe (pointer) - blokuję scrollowanie');
          }
          e.preventDefault();
        } else {
          console.log('Wykryto pionowy scroll (pointer) - anuluj swipe');
          isDragging = false;
          this.startAutoPlay();
          return;
        }
      }
    }, { passive: false });
    
    this.container.addEventListener('pointerup', (e) => {
      if (!isDragging || e.pointerType !== 'touch') return;
      
      console.log('🎯 PointerUp (touch) event otrzymany!', e);
      
      const endX = e.clientX;
      const endY = e.clientY;
      const endTime = Date.now();
      
      const deltaX = startX - endX;
      const deltaY = Math.abs(startY - endY);
      const swipeTime = endTime - startTime;
      const swipeDistance = Math.abs(deltaX);
      
      console.log('Pointer end details:', { 
        startX, 
        endX,
        deltaX, 
        deltaY, 
        swipeTime, 
        swipeDistance,
        isHorizontalSwipe
      });
      
      const isValidSwipe = 
        isHorizontalSwipe && 
        swipeDistance >= minSwipeDistance && 
        swipeTime <= maxSwipeTime && 
        deltaY <= maxVerticalMovement;
      
      if (isValidSwipe) {
        const direction = deltaX > 0 ? 'left (next)' : 'right (prev)';
        console.log('✅ Valid pointer swipe detected:', direction);
        
        if (deltaX > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        
        setTimeout(() => {
          this.startAutoPlay();
        }, 500);
      } else {
        console.log('❌ Invalid pointer swipe');
        this.startAutoPlay();
      }
      
      isDragging = false;
      isHorizontalSwipe = false;
    }, { passive: true });
    
    this.container.addEventListener('pointercancel', (e) => {
      if (isDragging && e.pointerType === 'touch') {
        console.log('Pointer cancelled');
        isDragging = false;
        isHorizontalSwipe = false;
        this.startAutoPlay();
      }
    }, { passive: true });
    
    console.log('Pointer support został dodany');
  }

  showSlide(index) {
    if (index < 0 || index >= this.slides.length) return;
    
    // Ukryj wszystkie slides
    this.slides.forEach((slide, i) => {
      slide.element.classList.remove('active');
    });
    
    // Pokaż wybrany slide
    this.slides[index].element.classList.add('active');
    
    // Aktualizuj tekst overlay
    this.updateOverlayContent(index);
    
    // Aktualizuj dots
    this.updateDots(index);
    
    this.currentSlide = index;
  }

  updateOverlayContent(index) {
    if (!this.overlayContent) return;
    
    const artwork = this.slides[index].artwork;
    const categorySlug = this.getCategorySlug(artwork);
    
    // Pobierz tekst przycisku w odpowiednim języku
    const buttonText = uiTexts.common?.viewInGallery || "Zobacz w Galerii";
    
    this.overlayContent.innerHTML = `
      <h1 class="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-fade-in">${artwork.title}</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-0 animate-fade-in-delay">
        ${artwork.description}
      </p>
      <div class="opacity-0 animate-fade-in-delay-2">
        <a href="./src/pages/gallery.html#${categorySlug}" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
          ${buttonText}
        </a>
      </div>
    `;
  }

  getCategorySlug(artwork) {
    // Użyj atrybutu galleryCategory z danych featured, jeśli istnieje
    const category = artwork.galleryCategory || 'wszystkie';
    
    // Zamień polskie znaki na łacińskie i spacje na myślniki dla URL-friendly hash
    return category
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/\s+/g, '-');
  }

  updateDots(activeIndex) {
    if (!this.dotsContainer) return;
    
    const dots = this.dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  goToSlide(index) {
    this.showSlide(index);
    this.restartAutoPlay();
  }

  startAutoPlay() {
    this.pauseAutoPlay(); // Upewnij się, że nie ma podwójnego autoplay
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  restartAutoPlay() {
    this.pauseAutoPlay();
    this.startAutoPlay();
  }

  destroy() {
    this.pauseAutoPlay();
    // Usuń event listenery jeśli potrzeba
  }

  // Metoda do odświeżenia slidera po zmianie języka
  async refreshSlider() {
    try {
      console.log('Rozpoczynam odświeżanie slidera po zmianie języka...');
      
      // Zatrzymaj autoplay
      this.pauseAutoPlay();
      
      // Przeładuj dane featured
      await this.waitForFeaturedData();
      console.log('Nowe dane featured załadowane:', this.featuredData);
      
      // Przeładuj obrazy (mogą być inne opisy)
      await this.preloadImages();
      console.log('Obrazy przeładowane');
      
      // Wyczyść stare slides
      this.slides = [];
      this.container.innerHTML = '';
      
      // Utwórz nowe slides
      this.createSlides();
      
      // Utwórz nowe dots
      this.createDots();
      
      // Pokaż pierwszy slide (lub aktualny jeśli możliwe)
      const slideIndex = this.currentSlide < this.slides.length ? this.currentSlide : 0;
      this.showSlide(slideIndex);
      
      // Wznów autoplay
      this.startAutoPlay();
      
      console.log('Slider został pomyślnie odświeżony po zmianie języka');
    } catch (error) {
      console.error('Błąd podczas odświeżania slidera:', error);
    }
  }
}

// Funkcja do inteligentnego wyśrodkowania kafelków
function setupSmartCentering() {
  const featuredContainer = document.querySelector('.featured-artworks.horizontal-scroll');
  if (!featuredContainer) return;

  function checkAndApplyCentering() {
    // Sprawdź czy wszystkie kafelki się mieszczą bez przewijania
    const containerWidth = featuredContainer.clientWidth;
    const scrollWidth = featuredContainer.scrollWidth;
    const needsScrolling = scrollWidth > containerWidth;
    
    // Jeśli nie potrzeba przewijania, wyśrodkuj kafelki
    if (!needsScrolling) {
      featuredContainer.style.justifyContent = 'center';
    } else {
      featuredContainer.style.justifyContent = 'flex-start';
    }
  }

  // Sprawdź przy załadowaniu
  checkAndApplyCentering();
  
  // Sprawdź przy zmianie rozmiaru okna
  window.addEventListener('resize', () => {
    setTimeout(checkAndApplyCentering, 100);
  });
  
  // Sprawdź gdy obrazy się załadują
  const images = featuredContainer.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      checkAndApplyCentering();
    } else {
      img.addEventListener('load', checkAndApplyCentering);
    }
  });
}

// Initialize hero slider on homepage
let heroSlider = null;

// Event listener dla zmiany rozmiaru okna (resize) - dla featured scrolling
function setupFeaturedResizeHandler() {
  const featuredContainer = document.querySelector('.featured-artworks.horizontal-scroll');
  if (!featuredContainer) return;
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Jeśli auto scroll jest aktywny, zatrzymaj go i pozwól na ponowne uruchomienie
      if (typeof autoScrollInterval !== 'undefined' && autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
      
      // Log debug info po resize (opcjonalne)
      const newWidth = featuredContainer.getBoundingClientRect().width;
      // console.log(`Window resized. New container width: ${newWidth}px. New config will be applied on next interaction.`);
    }, 250);
  });
}

// Funkcja do aktualizacji tekstów interfejsu
function updateUITexts() {
  if (!uiTexts.navigation) return;
  
  // Aktualizuj nawigację desktop
  const navElements = {
    'nav-home': uiTexts.navigation.home,
    'nav-gallery': uiTexts.navigation.gallery,
    'nav-about': uiTexts.navigation.about,
    'nav-shop': uiTexts.navigation.shop
  };
  
  Object.entries(navElements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  // Aktualizuj nawigację mobile
  const mobileNavElements = {
    'mobile-nav-home': uiTexts.navigation.home,
    'mobile-nav-gallery': uiTexts.navigation.gallery,
    'mobile-nav-about': uiTexts.navigation.about,
    'mobile-nav-shop': uiTexts.navigation.shop
  };
  
  Object.entries(mobileNavElements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  // Aktualizuj górny pasek
  const contactLink = document.getElementById('contact-link');
  if (contactLink && uiTexts.topBar) {
    contactLink.textContent = uiTexts.topBar.contact;
  }
  
  // Aktualizuj sekcje
  if (uiTexts.sections) {
    const featuredTitle = document.getElementById('featured-works-title');
    if (featuredTitle) featuredTitle.textContent = uiTexts.sections.featuredWorks;
    
    const featuredDescription = document.getElementById('featured-works-description');
    if (featuredDescription) featuredDescription.textContent = uiTexts.sections.featuredWorksDescription;
    
    const scrollHint = document.getElementById('scroll-hint');
    if (scrollHint) scrollHint.textContent = uiTexts.sections.scrollHint;
    
    // Aktualizuj tytuły stron
    const galleryTitle = document.getElementById('gallery-main-title');
    if (galleryTitle) galleryTitle.textContent = uiTexts.sections.galleryTitle;
    
    const aboutTitle = document.getElementById('about-main-title');
    if (aboutTitle) aboutTitle.textContent = uiTexts.sections.aboutTitle;
    
    const shopTitle = document.getElementById('shop-main-title');
    if (shopTitle) shopTitle.textContent = uiTexts.sections.shopTitle;
    
    const shopDescription = document.getElementById('shop-description');
    if (shopDescription) shopDescription.innerHTML = uiTexts.sections.shopDescription;
    
    // Aktualizuj sekcję kontaktową
    const contactTitle = document.getElementById('contact-title');
    if (contactTitle) contactTitle.textContent = uiTexts.sections.contact;
    
    const contactSubtitle = document.getElementById('contact-subtitle');
    if (contactSubtitle) contactSubtitle.textContent = uiTexts.sections.contactSubtitle;
    
    const followMeTitle = document.getElementById('follow-me-title');
    if (followMeTitle) followMeTitle.textContent = uiTexts.sections.followMe;
    
    const socialDescription = document.getElementById('social-description');
    if (socialDescription) socialDescription.textContent = uiTexts.sections.socialDescription;
    
    // Aktualizuj etykiety kontaktowe
    const emailLabel = document.getElementById('email-label');
    if (emailLabel) emailLabel.textContent = uiTexts.common.email;
    
    const phoneLabel = document.getElementById('phone-label');
    if (phoneLabel) phoneLabel.textContent = uiTexts.common.phone;
  }
  
  // Aktualizuj selektor języka
  const currentLanguageSpan = document.getElementById('current-language');
  if (currentLanguageSpan && uiTexts.languages) {
    currentLanguageSpan.textContent = currentLanguage === 'pl' ? uiTexts.languages.firstLanguage : uiTexts.languages.secondLanguage;
  }
  
  // Aktualizuj footer
  if (uiTexts.footer) {
    const footerRights = document.getElementById('footer-rights');
    if (footerRights) footerRights.textContent = uiTexts.footer.allRightsReserved;
    
    const footerIcons = document.getElementById('footer-icons');
    if (footerIcons) footerIcons.textContent = uiTexts.footer.icons;
    
    const footerAuthor = document.getElementById('footer-author');
    if (footerAuthor) footerAuthor.textContent = uiTexts.footer.websiteAuthor;
  }
}

// Funkcja do aktualizacji opcji języków w dropdown
async function updateLanguageOptions() {
  try {
    const basePath = getBasePath();
    const currentPath = window.location.pathname;
    
    // Ustal prawidłową ścieżkę bazową dla plików JSON w zależności od lokalizacji
    let jsonBasePath = basePath;
    if (currentPath.includes('/pages/') && !basePath) {
      // Jeśli jesteśmy na podstronie lokalnie, dodaj ścieżkę względną
      jsonBasePath = '../..';
    }
    
    // Pobierz tłumaczenia z obu języków
    const polishResponse = await fetch(`${jsonBasePath}/src/data/json/ui.json`);
    const polishTexts = await polishResponse.json();
    
    const englishResponse = await fetch(`${jsonBasePath}/src/data/json/ui_en.json`);
    const englishTexts = await englishResponse.json();
    
    // Aktualizuj opcje języków - pierwszy język zawsze z polskiego JSON, drugi z angielskiego
    const firstLanguageOption = document.getElementById('first-language-option');
    if (firstLanguageOption && polishTexts.languages) {
      firstLanguageOption.textContent = polishTexts.languages.firstLanguage;
    }
    
    const secondLanguageOption = document.getElementById('second-language-option');
    if (secondLanguageOption && englishTexts.languages) {
      secondLanguageOption.textContent = englishTexts.languages.secondLanguage;
    }
  } catch (error) {
    console.error('Błąd podczas ładowania opcji języków:', error);
  }
}

// Funkcja do aktualizacji konfiguracji witryny
function updateSiteConfiguration() {
  if (!siteConfig.siteName) return;
  
  // Aktualizuj nazwę witryny w nagłówku
  const portfolioTitles = document.querySelectorAll('#portfolio-title');
  portfolioTitles.forEach(title => {
    if (title) title.textContent = siteConfig.siteName;
  });
  
  // Aktualizuj nazwę witryny w stopce
  const footerSiteName = document.getElementById('footer-site-name');
  if (footerSiteName) footerSiteName.textContent = siteConfig.siteName;
  
  // Aktualizuj dane kontaktowe
  if (siteConfig.contact) {
    // Aktualizuj linki kontaktowe w górnym pasku - zmiana na dialog
    const contactLinks = document.querySelectorAll('#contact-link');
    contactLinks.forEach(link => {
      if (link) {
        // Usuń href i dodaj onclick dla dialogu
        link.removeAttribute('href');
        link.onclick = (e) => {
          e.preventDefault();
          showContactDialog();
        };
        link.style.cursor = 'pointer';
      }
    });
    
    // Aktualizuj email w sekcji kontaktowej
    const emailElements = document.querySelectorAll('[data-contact="email"]');
    emailElements.forEach(element => {
      if (element && siteConfig.contact.email) {
        if (element.tagName === 'A') {
          element.href = `mailto:${siteConfig.contact.email}`;
        }
        if (element.tagName === 'SPAN') {
          element.textContent = siteConfig.contact.email;
        }
      }
    });
    
    // Aktualizuj link do emaila w sekcji kontaktowej
    const emailLink = document.getElementById('contact-email-link');
    if (emailLink && siteConfig.contact.email) {
      emailLink.href = `mailto:${siteConfig.contact.email}`;
    }
    
    // Aktualizuj telefon w sekcji kontaktowej
    const phoneElements = document.querySelectorAll('[data-contact="phone"]');
    phoneElements.forEach(element => {
      if (element && siteConfig.contact.phone) {
        if (element.tagName === 'A') {
          element.href = `tel:${siteConfig.contact.phone.replace(/\s/g, '')}`;
        }
        if (element.tagName === 'SPAN') {
          element.textContent = siteConfig.contact.phone;
        }
      }
    });
    
    // Aktualizuj link do telefonu w sekcji kontaktowej
    const phoneLink = document.getElementById('contact-phone-link');
    if (phoneLink && siteConfig.contact.phone) {
      phoneLink.href = `tel:${siteConfig.contact.phone.replace(/\s/g, '')}`;
    }
  }
  
  // Aktualizuj linki do mediów społecznościowych
  if (siteConfig.socialMedia) {
    const facebookLinks = document.querySelectorAll('[data-social="facebook"]');
    facebookLinks.forEach(link => {
      if (link && siteConfig.socialMedia.facebook) {
        link.href = siteConfig.socialMedia.facebook;
      }
    });
    
    const instagramLinks = document.querySelectorAll('[data-social="instagram"]');
    instagramLinks.forEach(link => {
      if (link && siteConfig.socialMedia.instagram) {
        link.href = siteConfig.socialMedia.instagram;
      }
    });
  }
  
  // Dodaj event listenery do kopiowania danych kontaktowych
  const emailLink = document.getElementById('contact-email-link');
  const phoneLink = document.getElementById('contact-phone-link');
  
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = siteConfig.contact?.email || '';
      if (email) {
        copyToClipboard(email, 'email');
        e.target.blur(); // Usuń focus po kliknięciu
      }
    });
  }
  
  if (phoneLink) {
    phoneLink.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = siteConfig.contact?.phone || '';
      if (phone) {
        copyToClipboard(phone, 'phone');
        e.target.blur(); // Usuń focus po kliknięciu
      }
    });
  }
}

// Funkcja do zmiany języka
async function changeLanguage(newLanguage) {
  if (newLanguage === currentLanguage) return;
  
  currentLanguage = newLanguage;
  localStorage.setItem('selectedLanguage', currentLanguage);
  
  // Przeładuj dane w nowym języku
  await fetchData();
  
  // Aktualizuj interfejs użytkownika
  updateUITexts();
  updateLanguageOptions();
  
  // Sprawdź na której stronie jesteśmy i odśwież odpowiednią zawartość
  const currentPath = window.location.pathname;
  
  if (currentPath === '/' || currentPath.includes('index.html') || 
      (!currentPath.includes('/pages/') && !currentPath.includes('gallery.html') && !currentPath.includes('about.html') && !currentPath.includes('shop.html'))) {
    // Strona główna
    renderFeaturedArtworks();
    // Odśwież slider jeśli istnieje
    if (heroSlider && typeof heroSlider.refreshSlider === 'function') {
      heroSlider.refreshSlider();
    }
  } else if (currentPath.includes('about.html')) {
    // Strona o artyście
    if (typeof renderArtistPage === 'function') {
      renderArtistPage();
    }
  } else if (currentPath.includes('gallery.html')) {
    // Strona galerii - odśwież galerię i filtry kategorii
    renderGalleryArtworks();
    setupCategoryFilters();
    console.log('Galeria - język zmieniony na:', newLanguage);
  } else if (currentPath.includes('shop.html')) {
    // Strona sklepu - odśwież sklep
    setTimeout(() => renderShopProducts(), 50); // Małe opóźnienie żeby uiTexts były załadowane
    console.log('Sklep - język zmieniony na:', newLanguage);
  }
  
  // Jeśli tryb skupienia jest otwarty, odśwież jego zawartość
  if (focusModeState.isOpen) {
    updateFocusModeContent();
  }
  
  // Ponownie zaktualizuj opcje języków dla pewności
  await updateLanguageOptions();
}

// Funkcja do inicjalizacji selektora języka
function initializeLanguageSelector() {
  const languageSelector = document.getElementById('language-selector');
  const languageDropdown = document.getElementById('language-dropdown');
  const languageArrow = document.getElementById('language-arrow');
  const languageOptions = document.querySelectorAll('.language-option');
  
  if (!languageSelector || !languageDropdown) return;
  
  // Wczytaj zapisany język z localStorage
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage && (savedLanguage === 'pl' || savedLanguage === 'en')) {
    currentLanguage = savedLanguage;
  }
  
  // Obsługa kliknięcia na selektor
  languageSelector.addEventListener('click', (e) => {
    e.preventDefault();
    const isHidden = languageDropdown.classList.contains('hidden');
    
    if (isHidden) {
      languageDropdown.classList.remove('hidden');
      languageArrow.style.transform = 'rotate(180deg)';
    } else {
      languageDropdown.classList.add('hidden');
      languageArrow.style.transform = 'rotate(0deg)';
    }
  });
  
  // Obsługa wyboru języka
  languageOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      e.preventDefault();
      // Użyj currentTarget zamiast target, żeby zawsze mieć element <a> z data-lang
      const selectedLang = e.currentTarget.getAttribute('data-lang');
      
      if (selectedLang && selectedLang !== currentLanguage) {
        await changeLanguage(selectedLang);
      }
      
      // Zamknij dropdown
      languageDropdown.classList.add('hidden');
      languageArrow.style.transform = 'rotate(0deg)';
    });
  });
  
  // Zamknij dropdown przy kliknięciu poza nim
  document.addEventListener('click', (e) => {
    if (!languageSelector.contains(e.target)) {
      languageDropdown.classList.add('hidden');
      languageArrow.style.transform = 'rotate(0deg)';
    }
  });
}

// Funkcje dialogu kontaktowego
function showContactDialog() {
  // Usuń istniejący dialog jeśli istnieje
  const existingDialog = document.getElementById('contact-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // Pobierz dane kontaktowe z konfiguracji
  const email = siteConfig.contact?.email || 'malarzka.krakowska@gmail.com';
  const phone = siteConfig.contact?.phone || '+48 123 456 789';

  // Utwórz dialog
  const dialog = document.createElement('div');
  dialog.id = 'contact-dialog';
  dialog.className = 'fixed inset-0 bg-transparent flex items-center justify-center z-[9999] opacity-0 transition-opacity duration-300';
  
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform scale-90 transition-transform duration-300 relative" onclick="event.stopPropagation()">
      <!-- Przycisk X do zamknięcia -->
      <button 
        id="close-dialog-btn"
        class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="${currentLanguage === 'pl' ? 'Zamknij' : 'Close'}"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <h3 class="text-xl font-bold mb-6 text-gray-800 pr-8">${currentLanguage === 'pl' ? 'Kontakt' : 'Contact'}</h3>
      
      <div class="space-y-6">
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
          <div class="flex-1 flex flex-col justify-center">
            <p class="text-sm text-gray-600">${currentLanguage === 'pl' ? 'Email' : 'Email'}</p>
            <p class="font-medium text-gray-800" id="dialog-email">${email}</p>
          </div>
          <button 
            id="copy-email-btn"
            class="p-2 text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
            title="${currentLanguage === 'pl' ? 'Skopiuj email' : 'Copy email'}"
            data-text="${email}"
            data-type="email"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
        
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
          </svg>
          <div class="flex-1 flex flex-col justify-center">
            <p class="text-sm text-gray-600">${currentLanguage === 'pl' ? 'Telefon' : 'Phone'}</p>
            <p class="font-medium text-gray-800" id="dialog-phone">${phone}</p>
          </div>
          <button 
            id="copy-phone-btn"
            class="p-2 text-gray-500 hover:text-green-600 transition-colors flex-shrink-0"
            title="${currentLanguage === 'pl' ? 'Skopiuj telefon' : 'Copy phone'}"
            data-text="${phone}"
            data-type="phone"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Dodaj event listenery dla przycisków
  const closeBtn = document.getElementById('close-dialog-btn');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  
  closeBtn.addEventListener('click', closeContactDialog);
  copyEmailBtn.addEventListener('click', () => {
    const text = copyEmailBtn.getAttribute('data-text');
    const type = copyEmailBtn.getAttribute('data-type');
    copyToClipboard(text, type);
  });
  copyPhoneBtn.addEventListener('click', () => {
    const text = copyPhoneBtn.getAttribute('data-text');
    const type = copyPhoneBtn.getAttribute('data-type');
    copyToClipboard(text, type);
  });

  // Animacja wejścia
  setTimeout(() => {
    dialog.classList.remove('opacity-0');
    const dialogContent = dialog.querySelector('div div');
    dialogContent.classList.remove('scale-90');
    dialogContent.classList.add('scale-100');
  }, 10);

  // Zamknij przy kliknięciu w tło
  dialog.addEventListener('click', closeContactDialog);
}

function closeContactDialog() {
  const dialog = document.getElementById('contact-dialog');
  if (dialog) {
    dialog.classList.add('opacity-0');
    const dialogContent = dialog.querySelector('div div');
    if (dialogContent) {
      dialogContent.classList.remove('scale-100');
      dialogContent.classList.add('scale-90');
    }
    setTimeout(() => dialog.remove(), 300);
  }
}

function copyToClipboard(text, type) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyNotification(type);
    }).catch(() => {
      fallbackCopyTextToClipboard(text, type);
    });
  } else {
    fallbackCopyTextToClipboard(text, type);
  }
}

function fallbackCopyTextToClipboard(text, type) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyNotification(type);
  } catch (err) {
    console.error('Błąd kopiowania:', err);
  }
  
  document.body.removeChild(textArea);
}

function showCopyNotification(type) {
  // Usuń istniejące powiadomienie
  const existing = document.getElementById('copy-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'copy-notification';
  notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] transform translate-x-full transition-transform duration-300';
  
  const message = type === 'email' 
    ? (currentLanguage === 'pl' ? 'Email skopiowany!' : 'Email copied!') 
    : (currentLanguage === 'pl' ? 'Telefon skopiowany!' : 'Phone copied!');
  
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animacja wejścia
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 10);

  // Automatyczne ukrycie
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}