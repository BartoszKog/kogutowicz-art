# Responsywne Menu Hamburgerowe

## Opis
Implementacja responsywnej nawigacji, która automatycznie przekształca się w menu hamburgerowe na wąskich ekranach (mniej niż 768px szerokości).

## Funkcjonalności

### 🖥️ Desktop (ekrany szerokie)
- Standardowa nawigacja pozioma z linkami widocznymi
- Hover efekty na linkach nawigacyjnych
- Aktywny link podświetlony fioletowym obramowaniem

### 📱 Mobile (ekrany wąskie)
- Menu hamburgerowe z trzema kreskami
- Kliknięcie pokazuje/ukrywa menu dropdown
- Ikona zmienia się na "X" gdy menu jest otwarte
- Płynne animacje CSS

## Dostępność (Accessibility)

### Nawigacja klawiaturą
- **Tab** - przechodzenie między elementami
- **Enter/Space** - aktywacja przycisku menu
- **Escape** - zamknięcie menu
- **Strzałki w górę/w dół** - nawigacja po linkach w menu
- **Home/End** - przejście do pierwszego/ostatniego linku

### Atrybuty ARIA
- `aria-label` - opisuje funkcję przycisku
- `aria-expanded` - informuje o stanie menu (otwarte/zamknięte)
- Focus management - prawidłowe zarządzanie focusem

### Obsługa dotyku
- Wsparcie dla gestów dotykowych
- Minimalne rozmiary celów dotykowych (44px)
- Responsywne na dotyk i kliknięcie

## Techniczne detale

### CSS Classes (Tailwind)
- `hidden md:flex` - ukrywa na mobile, pokazuje na desktop
- `md:hidden` - pokazuje tylko na mobile
- `transition-all` - płynne animacje

### JavaScript funkcje
- `setupMobileMenu()` - główna funkcja inicjalizacyjna
- `toggleMenu()` - przełączanie stanu menu
- Event listenery dla różnych interakcji

### Breakpointy
- **Mobile**: < 768px (Tailwind `md:` breakpoint)
- **Desktop**: ≥ 768px

## Struktura HTML

```html
<!-- Desktop Navigation -->
<ul class="hidden md:flex space-x-6">
    <!-- linki nawigacyjne -->
</ul>

<!-- Mobile Menu Button -->
<button id="mobile-menu-button" class="md:hidden">
    <!-- ikona hamburger/X -->
</button>

<!-- Mobile Menu Dropdown -->
<div id="mobile-menu" class="hidden md:hidden">
    <!-- linki nawigacyjne -->
</div>
```

## Testowanie

### Responsywność
1. Otwórz Developer Tools (F12)
2. Przełącz na Device Mode
3. Testuj różne rozmiary ekranów
4. Sprawdź przejścia między breakpointami

### Dostępność
1. Nawiguj używając tylko klawiatury
2. Testuj z screen readerem
3. Sprawdź kontrast kolorów
4. Zweryfikuj focus indicators

### Urządzenia mobilne
1. Testuj na rzeczywistych urządzeniach
2. Sprawdź gesty dotykowe
3. Przetestuj orientację pionową i poziomą

## Przyszłe ulepszenia

- [ ] Animacje slide-in/slide-out
- [ ] Podświetlenie aktywnej strony w menu mobilnym
- [ ] Submenu dla kategorii
- [ ] Swipe gestures do zamykania menu
- [ ] Dark mode support
