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
        <img src="${correctedImagePath}" alt="${artwork.title || 'Obraz'}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${artwork.title || 'Bez tytułu'}</h3>
        ${artwork.description ? `<p class="text-gray-600">${artwork.description}</p>` : ''}
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
          ${artwork.available ? 'Dostępny' : 'Niedostępny'}
        </p>
      </div>
    `;
    
    // Dodaj event listener dla trybu skupienia
    artworkElement.addEventListener('click', () => {
      openFocusMode(index, artworks);
    });
    
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
    const correctedImagePath = correctImagePath(product.image);    // Sprawdź czy produkt jest dostępny
    const isAvailable = product.available !== false;
    const buttonClass = isAvailable 
      ? 'shop-purchase-button bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 inline-block font-semibold transition-all duration-300 transform'
      : 'bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block';
    const buttonText = isAvailable ? 'Przejdź do zakupu' : 'Niedostępne';
    const buttonAttributes = isAvailable 
      ? `href="${product.purchaseUrl}" target="_blank" rel="noopener noreferrer"`
      : 'onclick="return false;"';
    
    productElement.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${correctedImagePath}" alt="${product.title || 'Produkt'}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${product.title || 'Bez tytułu'}</h3>
        ${product.description ? `<p class="text-gray-600">${product.description}</p>` : ''}
        ${product.price ? `<p class="text-purple-600 font-bold mt-2">${product.price} zł</p>` : ''}        <div class="mt-4 flex items-center justify-between">
          <a ${buttonAttributes} class="${buttonClass}">
            ${buttonText}
          </a>
          ${!isAvailable ? '<span class="text-gray-400 font-semibold text-sm">Sprzedane</span>' : ''}
        </div>
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
    // Sprawdź, czy artwork ma kategorie i czy którakolwiek z kategorii pasuje
    artwork.categories && Array.isArray(artwork.categories) &&
    artwork.categories.some(cat => cat && cat.toLowerCase() === searchCategory)
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
        const textWithNonBreakingSpaces = paragraph.replace(/\b([aiozwunazeprzypod])\s+/gi, '$1&nbsp;');
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
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprzypod])\s+/gi, '$1&nbsp;');
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
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprzypod])\s+/gi, '$1&nbsp;');
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
        const textWithNonBreakingSpaces = item.replace(/\b([aiozwunazeprzypod])\s+/gi, '$1&nbsp;');
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
  overlay: null
};

// Funkcja do otwierania trybu skupienia
function openFocusMode(artworkIndex, artworks) {
  focusModeState.currentIndex = artworkIndex;
  focusModeState.artworks = artworks;
  focusModeState.isOpen = true;
  
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
        <p class="focus-mode-availability mt-2"></p>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  focusModeState.overlay = overlay;
  
  // Dodaj event listenery dla przycisków
  const closeButton = overlay.querySelector('.focus-close-button');
  const prevButton = overlay.querySelector('.focus-nav-button.prev');
  const nextButton = overlay.querySelector('.focus-nav-button.next');
  
  closeButton.addEventListener('click', closeFocusMode);
  prevButton.addEventListener('click', () => navigateGallery('prev'));
  nextButton.addEventListener('click', () => navigateGallery('next'));
  
  // Zamknij po kliknięciu na overlay (poza kontenerem)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeFocusMode();
    }
  });
}

// Funkcja do wyświetlania aktualnego obrazu
function displayCurrentArtwork() {
  if (!focusModeState.overlay) return;
  
  const artwork = focusModeState.artworks[focusModeState.currentIndex];
  if (!artwork) return;
  
  const image = focusModeState.overlay.querySelector('.focus-mode-image');
  const title = focusModeState.overlay.querySelector('.focus-mode-info h3');
  const details = focusModeState.overlay.querySelector('.focus-mode-details');
  const description = focusModeState.overlay.querySelector('.focus-mode-description');
  const availability = focusModeState.overlay.querySelector('.focus-mode-availability');
  
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
  if (artwork.technique) detailsArray.push(artwork.technique);
  if (artwork.dimensions) detailsArray.push(artwork.dimensions);
  if (artwork.year) detailsArray.push(artwork.year);
  
  details.innerHTML = detailsArray.length > 0 
    ? `<p class="text-gray-500">${detailsArray.join(' • ')}</p>`
    : '';
  
  // Opis
  description.textContent = artwork.description || '';
  description.style.display = artwork.description ? 'block' : 'none';
  
  // Dostępność
  availability.innerHTML = `
    <span class="${artwork.available ? 'text-green-600' : 'text-gray-400'} font-semibold">
      ${artwork.available ? 'Dostępny' : 'Niedostępny'}
    </span>
  `;
  
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
  
  // Pokaż/ukryj przyciski nawigacji w zależności od liczby obrazów
  const hasMultipleImages = focusModeState.artworks.length > 1;
  prevButton.style.display = hasMultipleImages ? 'flex' : 'none';
  nextButton.style.display = hasMultipleImages ? 'flex' : 'none';
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

// Uruchom pobieranie danych po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  setupMobileMenu();
  // 3D efekt będzie inicjalizowany w renderArtistPage()
});

// Cleanup przy opuszczeniu strony
window.addEventListener('beforeunload', () => {
  if (artistPhoto3DCleanup) {
    artistPhoto3DCleanup();
    artistPhoto3DCleanup = null;
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