# Interfejs Administratora - Strona Artysty

Aplikacja do zarządzania zawartością strony artysty napisana w bibliotece Flet (Python).

## Funkcjonalności

- **Edycja sekcji "O Artyście"**: Zarządzanie informacjami o artyście, biografią, edukacją i osiągnięciami
- **Zarządzanie wyróżnionymi dziełami**: Dodawanie, edycja i usuwanie wyróżnionych dzieł
- **Edycja galerii**: Pełne zarządzanie galerią dzieł sztuki z kategoriami i szczegółami
- **Zarządzanie sklepem**: Edycja produktów dostępnych w sklepie online

## Instalacja i uruchomienie

### Wymagania
- Python 3.7 lub nowszy

### Kroki instalacji

1. **Przejdź do folderu admin_interface**
   ```bash
   cd admin_interface
   ```

2. **Aktywuj środowisko wirtualne**
   ```bash
   # Windows
   .\venv\Scripts\Activate.ps1
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Zainstaluj zależności (jeśli jeszcze nie zainstalowane)**
   ```bash
   pip install -r requirements.txt
   ```

4. **Uruchom aplikację**
   ```bash
   python main.py
   ```

## Korzystanie z aplikacji

### Nawigacja
- Użyj bocznego panelu nawigacji, aby przełączać się między sekcjami
- Aplikacja ostrzeże Cię o niezapisanych zmianach przy próbie zmiany sekcji

### Wybór obrazów
- Kliknij przycisk "Wybierz obraz" aby otworzyć okno wyboru
- Obrazy są automatycznie skanowane z folderów `images/featured/` i `images/gallery/`
- Po wybraniu obrazu zostanie on wyświetlony w podglądzie

### Zapisywanie zmian
- Wszystkie zmiany są śledzone w czasie rzeczywistym
- Użyj przycisku "Zapisz zmiany" aby zapisać modyfikacje do plików JSON
- Przycisk "Anuluj" przywraca ostatnio zapisany stan

### Powiadomienia
- Aplikacja wyświetla powiadomienia o sukcesie/błędzie operacji
- Powiadomienia pojawiają się na dole ekranu

## Struktura danych

### about.json
```json
{
  "artistName": "string",
  "artistPhoto": "string",
  "biography": ["string"],
  "education": ["string"],
  "achievements": ["string"]
}
```

### featured.json
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "image": "string"
  }
]
```

### gallery.json
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "technique": "string",
    "dimensions": "string",
    "year": "number",
    "image": "string",
    "categories": ["string"],
    "available": "boolean"
  }
]
```

### shop.json
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "price": "number",
    "image": "string",
    "available": "boolean",
    "originalArtworkId": "number",
    "purchaseUrl": "string"
  }
]
```

## Uwagi techniczne

- Aplikacja automatycznie skanuje foldery z obrazami przy wyborze plików
- Wszystkie zmiany są zapisywane do plików JSON z kodowaniem UTF-8
- Środowisko wirtualne zapewnia izolację zależności
- Aplikacja obsługuje walidację podstawowych typów danych
