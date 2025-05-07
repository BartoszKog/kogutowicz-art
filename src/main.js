// Główny plik JavaScript dla aplikacji
console.log('Portfolio artystyczne załadowane!');

// Zmienne do przechowywania danych
let galleryArtworks = [];
let featuredArtworks = [];
let shopProducts = [];
let artistData = {}; // Nowa zmienna dla danych o artyście

// Funkcja do korygowania ścieżek do obrazów w zależności od podstrony
function correctImagePath(imagePath) {
  const basePath = getBasePath();
  // Sprawdź, czy jesteśmy na podstronie
  const isSubpage = window.location.pathname.includes('/pages/');
  
  // Jeśli jesteśmy na podstronie, dodaj prefix '../..' oraz podstawową ścieżkę, jeśli jesteśmy na GitHub Pages
  if (isSubpage) {
    return `../../${imagePath}`;
  } else {
    return `${basePath}/${imagePath}`;
  }
}

// Funkcja pomocnicza do pobierania podstawowej ścieżki
function getBasePath() {
  // W środowisku produkcyjnym GitHub Pages będzie miał prefiks z nazwą repozytorium
  const isGitHubPages = window.location.hostname.includes('github.io');
  return isGitHubPages ? '/kogutowicz-art' : '';
}

// Funkcja do pobierania danych z plików JSON
async function fetchData() {
  try {
    const basePath = getBasePath();
    
    // Pobieranie danych dla galerii
    const galleryResponse = await fetch(`${basePath}/src/data/json/gallery.json`);
    galleryArtworks = await galleryResponse.json();
    
    // Pobieranie danych dla wyróżnionych dzieł
    const featuredResponse = await fetch(`${basePath}/src/data/json/featured.json`);
    featuredArtworks = await featuredResponse.json();
    
    // Pobieranie danych dla sklepu
    const shopResponse = await fetch(`${basePath}/src/data/json/shop.json`);
    shopProducts = await shopResponse.json();
    
    // Pobieranie danych o artyście
    const aboutResponse = await fetch(`${basePath}/src/data/json/about.json`);
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
  
  // Zbierz wszystkie unikalne kategorie
  const categories = new Set();
  galleryArtworks.forEach(artwork => {
    artwork.categories.forEach(category => categories.add(category));
  });
  
  // Dodaj przycisk "Wszystkie"
  const allButton = document.createElement('button');
  allButton.className = 'px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2';
  allButton.textContent = 'Wszystkie';
  allButton.addEventListener('click', () => {
    renderGalleryArtworks();
    highlightActiveFilter(allButton);
  });
  filterContainer.appendChild(allButton);
  
  // Dodaj przyciski dla każdej kategorii
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200';
    button.textContent = category;
    button.addEventListener('click', () => {
      const filteredArtworks = filterArtworksByCategory(category);
      renderGalleryArtworks(filteredArtworks);
      highlightActiveFilter(button);
    });
    filterContainer.appendChild(button);
  });
  
  function highlightActiveFilter(activeButton) {
    // Resetuj style wszystkich przycisków
    filterContainer.querySelectorAll('button').forEach(btn => {
      btn.className = 'px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200';
    });
    // Podświetl aktywny przycisk
    activeButton.className = 'px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2';
  }
  
  // Domyślnie podświetl "Wszystkie"
  highlightActiveFilter(allButton);
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

// Uruchom pobieranie danych po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', fetchData);

// Eksport funkcji dla możliwości użycia w innych modułach
export { 
  renderFeaturedArtworks, 
  renderGalleryArtworks, 
  renderShopProducts,
  renderArtistPage,
  getArtworkById,
  getProductById,
  filterArtworksByCategory
};