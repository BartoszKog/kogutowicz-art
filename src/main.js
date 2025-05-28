// Główny plik JavaScript dla aplikacji
console.log('Portfolio artystyczne załadowane!');

// Zmienne do przechowywania danych
let galleryArtworks = [];
let featuredArtworks = [];
let shopProducts = [];
let artistData = {}; // Nowa zmienna dla danych o artyście

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
  
  // Usuń wiodące "/" jeśli występuje w ścieżce obrazu
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Jeśli jesteśmy na podstronie (pages/), dodaj odpowiednie prefiksy
  if (currentPath.includes('/pages/') || currentPath.includes('/gallery.html') || 
      currentPath.includes('/about.html') || currentPath.includes('/shop.html')) {
    if (basePath) {
      // Na GitHub Pages dla podstron
      return `${basePath}/${cleanImagePath}`;
    } else {
      // Lokalnie dla podstron
      return `../../${cleanImagePath}`;
    }
  } else {
    // Strona główna
    return `${basePath}/${cleanImagePath}`;
  }
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
    
    // Pobieranie danych dla galerii
    const galleryResponse = await fetch(`${jsonBasePath}/src/data/json/gallery.json`);
    galleryArtworks = await galleryResponse.json();
    // Pobieranie danych dla wyróżnionych dzieł
    const featuredResponse = await fetch(`${jsonBasePath}/src/data/json/featured.json`);
    featuredArtworks = await featuredResponse.json();
    
    // Pobieranie danych dla sklepu
    const shopResponse = await fetch(`${jsonBasePath}/src/data/json/shop.json`);
    shopProducts = await shopResponse.json();
    
    // Pobieranie danych o artyście
    const aboutResponse = await fetch(`${jsonBasePath}/src/data/json/about.json`);
    artistData = await aboutResponse.json();
    
    // Po załadowaniu danych, inicjalizuj aplikację
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
  
  featuredArtworks.forEach(artwork => {
    const artworkElement = document.createElement('div');
    artworkElement.className = 'bg-white rounded shadow-md overflow-hidden';
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(artwork.image);
    
    artworkElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${correctedImagePath}" alt="${artwork.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${artwork.title}</h3>
        <p class="text-gray-600">${artwork.description}</p>
      </div>
    `;
    
    featuredContainer.appendChild(artworkElement);
  });
}

// Funkcja do renderowania dzieł w galerii
function renderGalleryArtworks(artworks = galleryArtworks) {
  const galleryContainer = document.querySelector('.gallery-artworks');
  if (!galleryContainer) return;

  galleryContainer.innerHTML = '';
  
  artworks.forEach(artwork => {
    const artworkElement = document.createElement('div');
    artworkElement.className = 'bg-white rounded shadow-md overflow-hidden';
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(artwork.image);
    
    artworkElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${correctedImagePath}" alt="${artwork.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${artwork.title}</h3>
        <p class="text-gray-600">${artwork.technique}, ${artwork.dimensions}, ${artwork.year}</p>
        <p class="text-sm mt-2">${artwork.description}</p>
        <p class="mt-2 ${artwork.available ? 'text-green-600' : 'text-red-600'}">
          ${artwork.available ? 'Dostępny' : 'Sprzedany'}
        </p>
      </div>
    `;
    
    galleryContainer.appendChild(artworkElement);
  });
}

// Funkcja do renderowania produktów w sklepie
function renderShopProducts() {
  const shopContainer = document.querySelector('.shop-products');
  if (!shopContainer) return;

  shopContainer.innerHTML = '';
  
  shopProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'bg-white rounded shadow-md overflow-hidden';
    
    // Użyj funkcji correctImagePath do skorygowania ścieżki obrazu
    const correctedImagePath = correctImagePath(product.image);
    
    productElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${correctedImagePath}" alt="${product.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${product.title}</h3>
        <p class="text-gray-600">${product.description}</p>
        <p class="text-purple-600 font-bold mt-2">${product.price} zł</p>
        <a href="${product.purchaseUrl}" target="_blank" rel="noopener noreferrer" 
           class="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block">
          Przejdź do zakupu
        </a>
      </div>
    `;
    
    shopContainer.appendChild(productElement);
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

// Funkcja do filtrowania artworków po kategorii
function filterArtworksByCategory(category) {
  if (!category) return galleryArtworks;
  
  // Konwertuj szukaną kategorię na małe litery
  const searchCategory = category.toLowerCase();
  
  return galleryArtworks.filter(artwork => 
    // Sprawdź, czy którakolwiek z kategorii dzieła pasuje (niezależnie od wielkości liter)
    artwork.categories.some(cat => cat.toLowerCase() === searchCategory)
  );
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
    artwork.categories.forEach(category => {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
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
  allButton.textContent = `Wszystkie (${galleryArtworks.length})`;
  allButton.setAttribute('data-category', 'wszystkie');
  allButton.addEventListener('click', () => {
    renderGalleryArtworks();
    highlightActiveFilter(allButton);
  });
  filterContainer.appendChild(allButton);
  
  // Dodaj przyciski dla każdej kategorii z licznikiem
  sortedCategories.forEach(category => {
    const count = categoryCount.get(category);
    const button = document.createElement('button');
    button.className = 'category-chip category-chip-inactive';
    button.textContent = `${category} (${count})`;
    button.setAttribute('data-category', category);
    button.addEventListener('click', () => {
      const filteredArtworks = filterArtworksByCategory(category);
      renderGalleryArtworks(filteredArtworks);
      highlightActiveFilter(button);
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
  
  // Domyślnie podświetl "Wszystkie"
  highlightActiveFilter(allButton);
  
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
  
  // Aktualizuj tytuł strony
  document.querySelector('h1').textContent = artistData.artistName || "O Artyście";
  
  // Aktualizuj zdjęcie artysty
  if (artistPhotoContainer && artistData.artistPhoto) {
    artistPhotoContainer.innerHTML = `
      <img src="${correctImagePath(artistData.artistPhoto)}" alt="${artistData.artistName}" 
           class="w-full h-full object-cover rounded">
    `;
  }
  
  // Aktualizuj biografię
  if (biographyContainer && artistData.biography) {
    biographyContainer.innerHTML = '';
    artistData.biography.forEach(paragraph => {
      const p = document.createElement('p');
      p.className = 'text-gray-700 mb-4';
      p.textContent = paragraph;
      biographyContainer.appendChild(p);
    });
  }
  
  // Aktualizuj wykształcenie
  if (educationContainer && artistData.education) {
    educationContainer.innerHTML = '';
    artistData.education.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-disc list-inside text-gray-700';
      li.textContent = item;
      educationContainer.appendChild(li);
    });
  }
  
  // Aktualizuj osiągnięcia
  if (achievementsContainer && artistData.achievements) {
    achievementsContainer.innerHTML = '';
    artistData.achievements.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-disc list-inside text-gray-700';
      li.textContent = item;
      achievementsContainer.appendChild(li);
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

// Uruchom pobieranie danych po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  setupMobileMenu();
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
  setupMobileMenu
};