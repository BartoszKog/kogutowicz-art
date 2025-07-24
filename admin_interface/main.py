import flet as ft
import json
import os
from pathlib import Path
import shutil
import threading

class AdminInterface:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "Interfejs Administratora - Strona Artysty"
        self.page.theme_mode = ft.ThemeMode.LIGHT
        self.page.window.height = 800
        self.page.window.width = 800
        
        # Ścieżki do plików JSON
        self.base_path = Path(__file__).parent.parent
        self.json_path = self.base_path / "src" / "data" / "json"
        self.images_path = self.base_path / "images"
        
        # Stan aplikacji
        self.current_file = None
        self.current_data = None
        self.unsaved_changes = False
        # Komponenty UI
        self.setup_ui()

    def setup_ui(self):
        """Konfiguruje interfejs użytkownika"""
        # AppBar
        self.page.appbar = ft.AppBar(
            title=ft.Text("Panel Administracyjny", weight=ft.FontWeight.BOLD),
            leading=ft.Icon(ft.Icons.ADMIN_PANEL_SETTINGS, size=40),
            bgcolor="#1976d2",
            color="#ffffff"
        )
        
        # Obsługa skrótów klawiszowych
        self.page.on_keyboard_event = self.on_keyboard_event
        
        # Boczny panel nawigacji w kontenerze z określoną wysokością
        self.rail = ft.Container(
            content=ft.NavigationRail(
                selected_index=0,
                label_type=ft.NavigationRailLabelType.ALL,
                min_width=100,
                min_extended_width=200,
                destinations=[
                    ft.NavigationRailDestination(
                        icon=ft.Icons.PERSON,
                        selected_icon=ft.Icons.PERSON_OUTLINED,
                        label="O Artyście"
                    ),
                    ft.NavigationRailDestination(
                        icon=ft.Icons.STAR,
                        selected_icon=ft.Icons.STAR_OUTLINED,
                        label="Wyróżnione"
                    ),
                    ft.NavigationRailDestination(
                        icon=ft.Icons.PHOTO_LIBRARY,
                        selected_icon=ft.Icons.PHOTO_LIBRARY_OUTLINED,
                        label="Galeria"
                    ),
                    ft.NavigationRailDestination(
                        icon=ft.Icons.SHOPPING_CART,
                        selected_icon=ft.Icons.SHOPPING_CART_OUTLINED,
                        label="Sklep"
                    ),
                    ft.NavigationRailDestination(
                        icon=ft.Icons.LANGUAGE,
                        selected_icon=ft.Icons.LANGUAGE_OUTLINED,
                        label="Interfejs"
                    ),
                    ft.NavigationRailDestination(
                        icon=ft.Icons.SETTINGS,
                        selected_icon=ft.Icons.SETTINGS_OUTLINED,
                        label="Ustawienia"
                    ),
                ],
                on_change=self.rail_changed
            ),
            height=self.page.window.height - 64  # Odejmujemy wysokość AppBar
        )
        
        # Główny obszar zawartości z przewijaniem i ograniczoną szerokością
        self.content_area = ft.Container(
            content=ft.Column([
                ft.Text("Ładowanie sekcji 'O Artyście'...", size=20, color="#757575")
            ], scroll=ft.ScrollMode.AUTO),
            padding=20,
            expand=True,
            width=1000  # Maksymalna szerokość 1000px dla optymalnej czytelności
        )
        
        # Stały kontener dla przycisków akcji na dole
        self.action_buttons_container = ft.Container(
            content=ft.Row([]),
            padding=ft.padding.symmetric(horizontal=20, vertical=10),
            bgcolor=ft.Colors.ON_TERTIARY,
            border=ft.border.only(top=ft.BorderSide(1, ft.Colors.OUTLINE_VARIANT))
        )
        
        # Powiadomienia
        self.snackbar = ft.SnackBar(content=ft.Text(""))
        self.page.overlay.append(self.snackbar)
        
        # Layout główny - container z pełną wysokością i wyśrodkowaną zawartością
        main_content = ft.Column([
            ft.Row([
                self.rail,
                ft.VerticalDivider(width=1),
                ft.Container(
                    content=self.content_area,
                    alignment=ft.alignment.center,
                    expand=True
                )
            ], expand=True),
            self.action_buttons_container
        ], expand=True)
        
        self.page.add(main_content)
        
        # Automatyczne załadowanie sekcji "O Artyście" na początku
        self.load_section(0)

    def rail_changed(self, e):
        """Obsługuje zmianę w nawigacji"""
        if self.unsaved_changes:
            self.show_unsaved_changes_dialog(e.control.selected_index)
        else:
            self.load_section(e.control.selected_index)

    def load_section(self, index):
        """Ładuje odpowiednią sekcję"""
        sections = ["about", "featured", "gallery", "shop", "ui", "site-config"]
        self.current_file = sections[index]
        self.load_data()
        
        if index == 0:
            self.show_about_form()
        elif index == 1:
            self.show_featured_form()
        elif index == 2:
            self.show_gallery_form()
        elif index == 3:
            self.show_shop_form()
        elif index == 4:
            self.show_ui_form()
        elif index == 5:
            self.show_site_config_form()

    def load_data(self):
        """Ładuje dane z pliku JSON"""
        try:
            self._loading_data = True  # Ustaw flagę ładowania
            json_file = self.json_path / f"{self.current_file}.json"
            with open(json_file, 'r', encoding='utf-8') as f:
                self.current_data = json.load(f)
            self.unsaved_changes = False
            self.update_title()
            self.update_buttons_state()
            self._loading_data = False  # Wyłącz flagę ładowania
        except FileNotFoundError:
            self._loading_data = False
            self.show_message("Błąd: Nie znaleziono pliku JSON", "#f44336")
            self.current_data = None
        except json.JSONDecodeError:
            self._loading_data = False
            self.show_message("Błąd: Nieprawidłowy format JSON", "#f44336")
            self.current_data = None

    def clean_data_before_save(self, data):
        """Usuwa puste wartości z danych przed zapisem"""
        if isinstance(data, list):
            cleaned_list = []
            for item in data:
                cleaned_item = self.clean_data_before_save(item)
                if cleaned_item:  # Dodaj tylko niepuste elementy
                    cleaned_list.append(cleaned_item)
            return cleaned_list
        elif isinstance(data, dict):
            cleaned_dict = {}
            for key, value in data.items():
                # Specjalne traktowanie kategorii w galerii - zawsze zachowaj jako listę
                if key == "categories" and self.current_file == "gallery":
                    if isinstance(value, list):
                        # Usuń puste stringi z kategorii, ale zachowaj pustą listę jeśli wszystkie są puste
                        cleaned_categories = [cat.strip() for cat in value if cat.strip()]
                        cleaned_dict[key] = cleaned_categories
                    else:
                        cleaned_dict[key] = []
                elif isinstance(value, str):
                    # Usuń puste stringi
                    if value.strip():
                        cleaned_dict[key] = value.strip()
                elif isinstance(value, list):
                    # Dla innych list, usuń puste elementy
                    cleaned_list = [item for item in value if item and str(item).strip()]
                    if cleaned_list:
                        cleaned_dict[key] = cleaned_list
                elif value is not None and value != "":
                    # Zachowaj wszystkie inne niepuste wartości
                    cleaned_dict[key] = value
            return cleaned_dict
        else:
            return data

    def save_data(self):
        """Zapisuje dane do pliku JSON"""
        try:
            # Wyczyść dane przed zapisem
            cleaned_data = self.clean_data_before_save(self.current_data)
            
            json_file = self.json_path / f"{self.current_file}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
            self.unsaved_changes = False
            self.update_title()
            self.update_buttons_state()
            self.show_message("Zmiany zostały zapisane pomyślnie", "#4caf50")
        except Exception as e:
            self.show_message(f"Błąd podczas zapisywania: {str(e)}", "#f44336")

    def show_message(self, message, color):
        """Wyświetla powiadomienie"""
        self.snackbar.content = ft.Text(message, color=color)
        self.snackbar.open = True
        self.page.update()

    def show_unsaved_changes_dialog(self, new_index):
        """Pokazuje dialog o niezapisanych zmianach"""
        def close_dialog(e):
            self.page.close(dialog)

        dialog = ft.AlertDialog(
            modal=True,
            title=ft.Text("Niezapisane zmiany", color="#f57c00"),
            content=ft.Text("Masz niezapisane zmiany. Aby zmienić sekcję, najpierw zapisz zmiany lub anuluj je używając przycisków na dole strony."),
            actions=[
                ft.TextButton("OK", on_click=close_dialog),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )
        
        self.page.open(dialog)

    def update_title(self):
        """Aktualizuje tytuł AppBar w zależności od stanu zmian"""
        if self.unsaved_changes:
            self.page.appbar.title = ft.Text("Panel Administracyjny - Niezapisane zmiany", weight=ft.FontWeight.BOLD)
        else:
            self.page.appbar.title = ft.Text("Panel Administracyjny", weight=ft.FontWeight.BOLD)
        self.page.update()

    def update_buttons_state(self):
        """Aktualizuje stan przycisków w aktualnie wyświetlanej sekcji"""
        # Znaleźć przyciski w content_area i zaktualizować ich stan
        if hasattr(self, 'current_save_button'):
            self.current_save_button.disabled = not self.unsaved_changes
        if hasattr(self, 'current_cancel_button'):
            self.current_cancel_button.disabled = not self.unsaved_changes
        self.page.update()

    def create_action_buttons(self, form_refresh_func=None, show_add_button=False, add_button_text="Dodaj nowy element", add_button_callback=None):
        """Tworzy przyciski akcji i umieszcza je w stałym kontenerze na dole"""
        buttons = []
        
        # Przycisk dodawania (jeśli wymagany)
        if show_add_button and add_button_callback:
            add_button = ft.ElevatedButton(
                add_button_text,
                icon=ft.Icons.ADD,
                on_click=add_button_callback
            )
            buttons.append(add_button)
        
        # Przycisk zapisywania
        save_button = ft.ElevatedButton(
            "Zapisz zmiany",
            icon=ft.Icons.SAVE,
            on_click=lambda e: self.validate_and_save_data(),
            disabled=not self.unsaved_changes
        )
        
        # Przycisk anulowania
        cancel_button = ft.OutlinedButton(
            "Anuluj",
            icon=ft.Icons.CANCEL,
            on_click=lambda e: self.load_data() or (form_refresh_func() if form_refresh_func else None),
            disabled=not self.unsaved_changes
        )
        
        buttons.extend([save_button, cancel_button])
        
        # Zapisz referencje do przycisków dla późniejszego aktualizowania
        self.current_save_button = save_button
        self.current_cancel_button = cancel_button
        
        # Umieść przyciski w stałym kontenerze
        self.action_buttons_container.content = ft.Row(buttons, spacing=10)
        self.page.update()

    def get_used_images(self):
        """Zwraca listę ścieżek obrazów już używanych w galerii"""
        used_images = set()
        
        # Sprawdź wszystkie sekcje danych
        try:
            # Sprawdź gallery.json
            gallery_path = self.json_path / "gallery.json"
            if gallery_path.exists():
                with open(gallery_path, 'r', encoding='utf-8') as f:
                    gallery_data = json.load(f)
                    for item in gallery_data:
                        if isinstance(item, dict) and "image" in item:
                            used_images.add(item["image"])
            
            # Sprawdź featured.json
            featured_path = self.json_path / "featured.json"
            if featured_path.exists():
                with open(featured_path, 'r', encoding='utf-8') as f:
                    featured_data = json.load(f)
                    for item in featured_data:
                        if isinstance(item, dict) and "image" in item:
                            used_images.add(item["image"])
            
            # Sprawdź shop.json
            shop_path = self.json_path / "shop.json"
            if shop_path.exists():
                with open(shop_path, 'r', encoding='utf-8') as f:
                    shop_data = json.load(f)
                    for item in shop_data:
                        if isinstance(item, dict) and "image" in item:
                            used_images.add(item["image"])
            
            # Sprawdź about.json (artistPhoto)
            about_path = self.json_path / "about.json"
            if about_path.exists():
                with open(about_path, 'r', encoding='utf-8') as f:
                    about_data = json.load(f)
                    if "artistPhoto" in about_data:
                        used_images.add(about_data["artistPhoto"])
            
        except Exception as e:
            print(f"Błąd podczas sprawdzania używanych obrazów: {e}")
        
        return used_images

    def create_image_picker(self, current_image="", on_change=None):
        """Tworzy komponent wyboru obrazu"""
        
        # Funkcja pomocnicza do obliczania rozmiaru pliku
        def get_image_info(image_path):
            """Zwraca informacje o obrazie (rozmiar pliku)"""
            if not image_path:
                return ""
            
            try:
                full_path = self.base_path / image_path
                if full_path.exists():
                    file_size_bytes = full_path.stat().st_size
                    if file_size_bytes < 1024:
                        file_size = f"{file_size_bytes} B"
                    elif file_size_bytes < 1024 * 1024:
                        file_size = f"{file_size_bytes / 1024:.1f} KB"
                    else:
                        file_size = f"{file_size_bytes / (1024 * 1024):.1f} MB"
                    return f"Rozmiar: {file_size}"
                else:
                    return "Plik nie istnieje"
            except:
                return "Błąd odczytu pliku"
        
        # Pole tekstowe na ścieżkę
        image_field = ft.TextField(
            label="Ścieżka do obrazu",
            value=current_image,
            read_only=True,
            expand=True
        )
        
        # Wyświetlanie obrazu z informacją o rozmiarze
        image_display = ft.Image(
            src=f"../{current_image}" if current_image else "",
            width=150,
            height=150,
            fit=ft.ImageFit.COVER,
            visible=bool(current_image)
        )
        
        # Dodaj informacje o pliku pod obrazem
        image_info_text = ft.Text(
            get_image_info(current_image),
            size=12,
            color="#757575",
            visible=bool(current_image)
        )
        
        # Funkcja do aktualizacji wyświetlania obrazu
        def update_image_display(image_path):
            image_display.src = f"../{image_path}" if image_path else ""
            image_display.visible = bool(image_path)
            image_info_text.value = get_image_info(image_path)
            image_info_text.visible = bool(image_path)
        
        def pick_image(e):
            def close_picker(e):
                self.page.close(picker_dialog)

            def select_image(image_path):
                update_image_display(image_path)
                image_field.value = image_path
                if on_change:
                    on_change(image_path)
                self.unsaved_changes = True
                self.update_title()
                self.update_buttons_state()
                self.page.close(picker_dialog)
                self.page.update()

            # Dodaj sprawdzenie czy foldery istnieją
            if not self.images_path.exists():
                self.show_message("Folder 'images' nie istnieje", "#f44336")
                return
                
            image_list = ft.Column(scroll=ft.ScrollMode.AUTO, height=400)
            
            # Pobierz listę już używanych obrazów
            used_images = self.get_used_images()
            
            # Dodaj informację gdy brak obrazów
            has_images = False
            
            for folder in ["featured", "gallery"]:
                folder_path = self.images_path / folder
                if folder_path.exists():
                    folder_images = []
                    for ext in ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.webp"]:
                        folder_images.extend(list(folder_path.glob(ext)))
                    
                    if folder_images:
                        has_images = True
                        image_list.controls.append(
                            ft.Text(f"Folder: {folder}", weight=ft.FontWeight.BOLD, size=16)
                        )
                        
                        for img_file in folder_images:
                            rel_path = f"images/{folder}/{img_file.name}"
                            is_used = rel_path in used_images
                            
                            # Oblicz rozmiar pliku
                            try:
                                file_size_bytes = img_file.stat().st_size
                                if file_size_bytes < 1024:
                                    file_size = f"{file_size_bytes} B"
                                elif file_size_bytes < 1024 * 1024:
                                    file_size = f"{file_size_bytes / 1024:.1f} KB"
                                else:
                                    file_size = f"{file_size_bytes / (1024 * 1024):.1f} MB"
                            except:
                                file_size = "Nieznany rozmiar"
                            
                            # Ustal kolory w zależności od tego, czy obraz jest używany
                            if is_used:
                                # Obraz już używany - podświetl na żółto/pomarańczowo
                                tile_color = "#fff3e0"  # Jasnopomarańczowy
                                subtitle_text = f"{img_file.suffix.upper()} • {file_size} (UŻYWANY)"
                                subtitle_color = "#ff9800"  # Pomarańczowy
                            else:
                                # Obraz nie używany - normalny kolor
                                tile_color = None
                                subtitle_text = f"{img_file.suffix.upper()} • {file_size}"
                                subtitle_color = None
                            
                            image_list.controls.append(
                                ft.ListTile(
                                    leading=ft.Image(src=f"../{rel_path}", width=50, height=50, fit=ft.ImageFit.COVER),
                                    title=ft.Text(img_file.name),
                                    subtitle=ft.Text(subtitle_text, color=subtitle_color),
                                    bgcolor=tile_color,
                                    on_click=lambda e, path=rel_path: select_image(path)
                                )
                            )
            
            if not has_images:
                image_list.controls.append(
                    ft.Text("Brak dostępnych obrazów. Dodaj pliki do folderów images/featured lub images/gallery", 
                           color="#757575", text_align=ft.TextAlign.CENTER)
                )
            else:
                # Dodaj legendę na górze
                legend = ft.Container(
                    content=ft.Column([
                        ft.Text("Legenda:", weight=ft.FontWeight.BOLD, size=14),
                        ft.Row([
                            ft.Container(
                                content=ft.Text("Obraz już używany", size=12),
                                bgcolor="#fff3e0",
                                padding=ft.padding.symmetric(horizontal=8, vertical=4),
                                border_radius=4
                            ),
                            ft.Container(
                                content=ft.Text("Obraz dostępny", size=12),
                                bgcolor="#f5f5f5",
                                padding=ft.padding.symmetric(horizontal=8, vertical=4),
                                border_radius=4
                            )
                        ])
                    ]),
                    margin=ft.margin.only(bottom=10)
                )
                image_list.controls.insert(0, legend)
            
            picker_dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Wybierz obraz"),
                content=ft.Container(content=image_list, width=600, height=500),
                actions=[
                    ft.TextButton("Anuluj", on_click=close_picker)
                ]
            )
            
            self.page.open(picker_dialog)

        # Kontener do aktualizacji obrazu
        image_container = ft.Column([
            ft.Row([
                image_field,
                ft.ElevatedButton("Wybierz obraz", on_click=pick_image)
            ]),
            image_display,
            image_info_text
        ])
        
        return image_container

    def get_existing_categories(self):
        """Zwraca listę wszystkich unikalnych kategorii z galerii"""
        categories = set()
        
        if self.current_data and isinstance(self.current_data, list):
            for item in self.current_data:
                if isinstance(item, dict) and "categories" in item:
                    item_categories = item["categories"]
                    if isinstance(item_categories, list):
                        for cat in item_categories:
                            if cat and cat.strip():
                                categories.add(cat.strip())
        
        return sorted(list(categories))
    
    def get_gallery_categories(self):
        """Zwraca listę wszystkich unikalnych kategorii z pliku gallery.json"""
        try:
            gallery_path = self.json_path / "gallery.json"
            if gallery_path.exists():
                with open(gallery_path, 'r', encoding='utf-8') as file:
                    gallery_data = json.load(file)
                    
                categories = set()
                for item in gallery_data:
                    if isinstance(item, dict) and "categories" in item:
                        item_categories = item["categories"]
                        if isinstance(item_categories, list):
                            for cat in item_categories:
                                if cat and cat.strip():
                                    categories.add(cat.strip())
                
                return sorted(list(categories))
        except Exception as e:
            print(f"Błąd podczas pobierania kategorii galerii: {e}")
        
        return []

    def create_gallery_category_dropdown(self, current_value="", on_change=None):
        """Tworzy dropdown z kategoriami galerii dla sekcji featured"""
        gallery_categories = self.get_gallery_categories()
        
        options = [ft.dropdown.Option("", "-- Nie wybrano --")]
        for category in gallery_categories:
            # Użyj pierwszej litery wielkiej dla wyświetlania
            display_name = category.capitalize()
            options.append(ft.dropdown.Option(category, display_name))
        
        dropdown = ft.Dropdown(
            label="Kategoria galerii (dla linku)",
            value=current_value,
            options=options,
            on_change=on_change
        )
        
        return dropdown

    def create_category_selector(self, current_categories=None, on_change=None):
        """Tworzy selektor kategorii z Dropdown i prostym interfejsem"""
        if current_categories is None:
            current_categories = []
        
        existing_categories = self.get_existing_categories()
        
        # Pole tekstowe pokazujące aktualne kategorie
        categories_text = ft.TextField(
            label="Kategorie (oddzielone przecinkami)",
            value=", ".join(current_categories),
            multiline=True,
            min_lines=1,
            max_lines=3
        )
        
        # Dropdown z istniejącymi kategoriami
        dropdown = ft.Dropdown(
            label="Wybierz z istniejących kategorii",
            options=[ft.dropdown.Option(cat) for cat in existing_categories],
            width=300
        )
        
        def add_category_from_dropdown(e):
            """Dodaje kategorię z dropdown do pola tekstowego"""
            if dropdown.value:
                current_cats = [cat.strip() for cat in categories_text.value.split(",") if cat.strip()]
                if dropdown.value not in current_cats:
                    current_cats.append(dropdown.value)
                    categories_text.value = ", ".join(current_cats)
                    if on_change:
                        on_change(current_cats)
                    categories_text.update()
                dropdown.value = None
                dropdown.update()
        
        def on_text_change(e):
            """Obsługuje zmiany w polu tekstowym kategorii"""
            # Sprawdź czy to nie jest inicjalizacja (bez aktywnej edycji)
            if hasattr(self, '_loading_data') and self._loading_data:
                return
                
            current_cats = [cat.strip() for cat in e.control.value.split(",") if cat.strip()]
            if on_change:
                on_change(current_cats)
        
        categories_text.on_change = on_text_change
        
        # Kontener z informacją o dostępnych kategoriach
        info_text = ft.Text(
            f"Dostępne kategorie: {', '.join(existing_categories)}" if existing_categories else "Brak istniejących kategorii",
            size=12,
            color="#757575"
        )
        
        return ft.Column([
            categories_text,
            ft.Row([
                dropdown,
                ft.ElevatedButton(
                    "Dodaj",
                    on_click=add_category_from_dropdown,
                    height=40
                )
            ]),
            info_text
        ])

    def show_about_form(self):
        """Pokazuje formularz edycji sekcji 'O Artyście'"""
        if not self.current_data:
            return

        # Pola formularza
        artist_name = ft.TextField(
            label="Imię i nazwisko artysty",
            value=self.current_data.get("artistName", ""),
            on_change=lambda e: self.update_field("artistName", e.control.value)
        )
        
        # Wybór zdjęcia artysty
        artist_photo = self.create_image_picker(
            self.current_data.get("artistPhoto", ""),
            lambda path: self.update_field("artistPhoto", path)
        )
        
        # Biografia (lista akapitów)
        biography_section = ft.Column([
            ft.Row([
                ft.Text("Biografia:", weight=ft.FontWeight.BOLD),
                ft.IconButton(
                    ft.Icons.ADD,
                    tooltip="Dodaj akapit",
                    on_click=lambda e: self.add_list_item_inline("biography", biography_section)
                )
            ])
        ])
        
        for i, paragraph in enumerate(self.current_data.get("biography", [])):
            row = ft.Row([
                ft.TextField(
                    label=f"Akapit biografii {i+1}",
                    value=paragraph,
                    multiline=True,
                    min_lines=2,
                    max_lines=5,
                    expand=True,
                    on_change=lambda e, idx=i: self.update_list_field("biography", idx, e.control.value)
                ),
                ft.IconButton(
                    ft.Icons.DELETE,
                    tooltip="Usuń akapit",
                    on_click=lambda e, idx=i: self.remove_list_item_inline("biography", idx, biography_section)
                )
            ])
            biography_section.controls.append(row)
        
        # Edukacja
        education_section = ft.Column([
            ft.Row([
                ft.Text("Edukacja:", weight=ft.FontWeight.BOLD),
                ft.IconButton(
                    ft.Icons.ADD,
                    tooltip="Dodaj pozycję edukacyjną",
                    on_click=lambda e: self.add_list_item_inline("education", education_section)
                )
            ])
        ])
        
        for i, item in enumerate(self.current_data.get("education", [])):
            row = ft.Row([
                ft.TextField(
                    label=f"Edukacja {i+1}",
                    value=item,
                    expand=True,
                    on_change=lambda e, idx=i: self.update_list_field("education", idx, e.control.value)
                ),
                ft.IconButton(
                    ft.Icons.DELETE,
                    tooltip="Usuń pozycję edukacyjną",
                    on_click=lambda e, idx=i: self.remove_list_item_inline("education", idx, education_section)
                )
            ])
            education_section.controls.append(row)
        
        # Osiągnięcia
        achievements_section = ft.Column([
            ft.Row([
                ft.Text("Osiągnięcia:", weight=ft.FontWeight.BOLD),
                ft.IconButton(
                    ft.Icons.ADD,
                    tooltip="Dodaj osiągnięcie",
                    on_click=lambda e: self.add_list_item_inline("achievements", achievements_section)
                )
            ])
        ])
        
        for i, item in enumerate(self.current_data.get("achievements", [])):
            row = ft.Row([
                ft.TextField(
                    label=f"Osiągnięcie {i+1}",
                    value=item,
                    expand=True,
                    on_change=lambda e, idx=i: self.update_list_field("achievements", idx, e.control.value)
                ),
                ft.IconButton(
                    ft.Icons.DELETE,
                    tooltip="Usuń osiągnięcie",
                    on_click=lambda e, idx=i: self.remove_list_item_inline("achievements", idx, achievements_section)
                )
            ])
            achievements_section.controls.append(row)
        
        # Wybrane wystawy
        exhibitions_section = ft.Column([
            ft.Row([
                ft.Text("Wybrane wystawy:", weight=ft.FontWeight.BOLD),
                ft.IconButton(
                    ft.Icons.ADD,
                    tooltip="Dodaj wystawę",
                    on_click=lambda e: self.add_list_item_inline("exhibitions", exhibitions_section)
                )
            ])
        ])
        
        for i, item in enumerate(self.current_data.get("exhibitions", [])):
            row = ft.Row([
                ft.TextField(
                    label=f"Wystawa {i+1}",
                    value=item,
                    expand=True,
                    on_change=lambda e, idx=i: self.update_list_field("exhibitions", idx, e.control.value)
                ),
                ft.IconButton(
                    ft.Icons.DELETE,
                    tooltip="Usuń wystawę",
                    on_click=lambda e, idx=i: self.remove_list_item_inline("exhibitions", idx, exhibitions_section)
                )
            ])
            exhibitions_section.controls.append(row)
        
        # Zawartość formularza
        form_content = ft.Column([
            ft.Text("Edycja sekcji 'O Artyście'", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            artist_name,
            ft.Text("Zdjęcie artysty:", weight=ft.FontWeight.BOLD),
            artist_photo,
            biography_section,
            education_section,
            achievements_section,
            exhibitions_section
        ], scroll=ft.ScrollMode.AUTO)

        self.content_area.content = form_content
        
        # Utwórz przyciski akcji w stałym kontenerze
        self.create_action_buttons(self.show_about_form)

    def update_field(self, field_name, value):
        """Aktualizuje pole w danych"""
        self.current_data[field_name] = value
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()

    def update_list_field(self, list_name, index, value):
        """Aktualizuje element listy w danych"""
        if list_name not in self.current_data:
            self.current_data[list_name] = []
        
        # Rozszerz listę jeśli to konieczne
        while len(self.current_data[list_name]) <= index:
            self.current_data[list_name].append("")
            
        self.current_data[list_name][index] = value
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()

    def update_item_field(self, index, field_name, value):
        """Aktualizuje pole w elemencie listy"""
        if 0 <= index < len(self.current_data):
            self.current_data[index][field_name] = value
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()

    def add_list_item(self, list_name, form_refresh_func):
        """Dodaje nowy element do listy"""
        if list_name not in self.current_data:
            self.current_data[list_name] = []
        
        self.current_data[list_name].append("")
        self.unsaved_changes = True
        form_refresh_func()

    def remove_list_item(self, list_name, index, form_refresh_func):
        """Usuwa element z listy"""
        if list_name in self.current_data and 0 <= index < len(self.current_data[list_name]):
            self.current_data[list_name].pop(index)
            self.unsaved_changes = True
            form_refresh_func()

    def add_list_item_inline(self, list_name, section_container):
        """Dodaje nowy element do listy bez pełnego odświeżania"""
        if list_name not in self.current_data:
            self.current_data[list_name] = []
        
        self.current_data[list_name].append("")
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()
        
        # Dodaj nowy wiersz do istniejącego kontenera
        new_index = len(self.current_data[list_name]) - 1
        
        if list_name == "biography":
            label = f"Akapit biografii {new_index + 1}"
            multiline = True
            min_lines = 2
            max_lines = 5
        elif list_name == "education":
            label = f"Edukacja {new_index + 1}"
            multiline = False
            min_lines = 1
            max_lines = 1
        elif list_name == "achievements":
            label = f"Osiągnięcie {new_index + 1}"
            multiline = False
            min_lines = 1
            max_lines = 1
        elif list_name == "exhibitions":
            label = f"Wystawa {new_index + 1}"
            multiline = False
            min_lines = 1
            max_lines = 1
        elif list_name == "exhibitions":
            label = f"Wystawa {new_index + 1}"
            multiline = False
            min_lines = 1
            max_lines = 1
        
        new_row = ft.Row([
            ft.TextField(
                label=label,
                value="",
                multiline=multiline,
                min_lines=min_lines,
                max_lines=max_lines,
                expand=True,
                on_change=lambda e, idx=new_index: self.update_list_field(list_name, idx, e.control.value)
            ),
            ft.IconButton(
                ft.Icons.DELETE,
                tooltip=f"Usuń {label.lower()}",
                on_click=lambda e, idx=new_index: self.remove_list_item_inline(list_name, idx, section_container)
            )
        ])
        
        section_container.controls.append(new_row)
        self.page.update()

    def remove_list_item_inline(self, list_name, index, section_container):
        """Usuwa element z listy bez pełnego odświeżania"""
        if list_name in self.current_data and 0 <= index < len(self.current_data[list_name]):
            self.current_data[list_name].pop(index)
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            
            # Usuń odpowiedni wiersz z kontenera (pomijając pierwszy wiersz z nagłówkiem)
            if index + 1 < len(section_container.controls):
                section_container.controls.pop(index + 1)
                
                # Zaktualizuj etykiety i indeksy w pozostałych wierszach
                for i, row_control in enumerate(section_container.controls[1:], 0):  # Pomijamy nagłówek
                    if isinstance(row_control, ft.Row) and len(row_control.controls) >= 2:
                        text_field = row_control.controls[0]
                        delete_button = row_control.controls[1]
                        
                        # Zaktualizuj etykietę
                        if list_name == "biography":
                            text_field.label = f"Akapit biografii {i + 1}"
                        elif list_name == "education":
                            text_field.label = f"Edukacja {i + 1}"
                        elif list_name == "achievements":
                            text_field.label = f"Osiągnięcie {i + 1}"
                        elif list_name == "exhibitions":
                            text_field.label = f"Wystawa {i + 1}"
                        elif list_name == "exhibitions":
                            text_field.label = f"Wystawa {i + 1}"
                        
                        # Zaktualizuj callback'i
                        text_field.on_change = lambda e, idx=i: self.update_list_field(list_name, idx, e.control.value)
                        delete_button.on_click = lambda e, idx=i: self.remove_list_item_inline(list_name, idx, section_container)
            
            self.page.update()

    def add_featured_item_inline(self, items_container):
        """Dodaje nowy element do sekcji wyróżnione bez pełnego odświeżania"""
        new_item = {
            "id": max([item.get("id", 0) for item in self.current_data] + [0]) + 1,
            "title": "",
            "description": "",
            "image": "",
            "galleryCategory": ""
        }
        self.current_data.append(new_item)
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()
        
        new_index = len(self.current_data) - 1
        
        item_card = ft.Card(
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                        ft.Text(f"Element {new_index + 1}", weight=ft.FontWeight.BOLD),
                        ft.Row([
                            ft.Text("Pozycja:", size=12),
                            ft.TextField(
                                value=str(new_index + 1),
                                width=60,
                                height=40,
                                text_align=ft.TextAlign.CENTER,
                                input_filter=ft.NumbersOnlyInputFilter(),
                                on_submit=lambda e, idx=new_index: self.move_to_position(idx, e.control.value)
                            ),
                            ft.IconButton(
                                ft.Icons.KEYBOARD_ARROW_UP,
                                tooltip="Przesuń w górę",
                                disabled=new_index == 0,  # Wyłącz dla pierwszego elementu
                                on_click=lambda e, idx=new_index: self.move_item_up(idx)
                            ),
                            ft.IconButton(
                                ft.Icons.KEYBOARD_ARROW_DOWN,
                                tooltip="Przesuń w dół",
                                disabled=new_index == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                on_click=lambda e, idx=new_index: self.move_item_down(idx)
                            ),
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń element",
                                on_click=lambda e, idx=new_index: self.delete_featured_item_inline(idx, items_container)
                            )
                        ])
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                    ft.TextField(
                        label="Tytuł",
                        value="",
                        on_change=lambda e, idx=new_index: self.update_item_field(idx, "title", e.control.value)
                    ),
                    ft.TextField(
                        label="Opis",
                        value="",
                        multiline=True,
                        on_change=lambda e, idx=new_index: self.update_item_field(idx, "description", e.control.value)
                    ),
                    self.create_gallery_category_dropdown(
                        "",
                        lambda e, idx=new_index: self.update_item_field(idx, "galleryCategory", e.control.value)
                    ),
                    ft.Text("Obraz:", weight=ft.FontWeight.BOLD),
                    self.create_image_picker(
                        "",
                        lambda path, idx=new_index: self.update_item_field(idx, "image", path)
                    )
                ]),
                padding=15
            )
        )
        
        items_container.controls.append(item_card)
        self.page.update()
        
        # Przewiń do nowo dodanego elementu
        def scroll_to_new_item():
            if hasattr(self.content_area.content, 'scroll_to'):
                self.content_area.content.scroll_to(offset=-1, duration=300)
                self.page.update()
        
        # Opóźnione przewijanie
        timer = threading.Timer(0.1, scroll_to_new_item)
        timer.start()

    def delete_featured_item_inline(self, index, items_container):
        """Usuwa element z sekcji wyróżnione bez pełnego odświeżania"""
        def confirm_delete(e):
            self.current_data.pop(index)
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            
            # Znaleźć i usuń odpowiednią kartę
            if index + 2 < len(items_container.controls):
                items_container.controls.pop(index + 2)
                
                # Zaktualizuj numery elementów w pozostałych kartach
                for i, card in enumerate(items_container.controls[2:], 0):
                    if isinstance(card, ft.Card):
                        title_row = card.content.content.controls[0]
                        if isinstance(title_row, ft.Row) and len(title_row.controls) >= 2:
                            title_text = title_row.controls[0]
                            delete_button = title_row.controls[1]
                            
                            title_text.value = f"Element {i + 1}"
                            delete_button.on_click = lambda e, idx=i: self.delete_featured_item_inline(idx, items_container)
            
            self.page.close(dialog)
            self.page.update()

        def cancel_delete(e):
            self.page.close(dialog)

        dialog = ft.AlertDialog(
            modal=True,
            title=ft.Text("Potwierdź usunięcie"),
            content=ft.Text("Czy na pewno chcesz usunąć ten element?"),
            actions=[
                ft.TextButton("Usuń", on_click=confirm_delete),
                ft.TextButton("Anuluj", on_click=cancel_delete),
            ]
        )
        
        self.page.open(dialog)

    def show_featured_form(self):
        """Pokazuje formularz edycji sekcji 'Wyróżnione'"""
        if not self.current_data:
            return

        # Kontener na wszystkie elementy
        form_container = ft.Column([
            ft.Text("Edycja sekcji 'Wyróżnione'", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
        ], scroll=ft.ScrollMode.AUTO)

        # Lista elementów
        for i, item in enumerate(self.current_data):
            item_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Element {i+1}", weight=ft.FontWeight.BOLD),
                            ft.Row([
                                ft.Text("Pozycja:", size=12),
                                ft.TextField(
                                    value=str(i+1),
                                    width=60,
                                    height=40,
                                    text_align=ft.TextAlign.CENTER,
                                    input_filter=ft.NumbersOnlyInputFilter(),
                                    on_submit=lambda e, idx=i: self.move_to_position(idx, e.control.value),
                                    on_blur=lambda e, idx=i: self.move_to_position(idx, e.control.value)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_UP,
                                    tooltip="Przesuń w górę",
                                    disabled=i == 0,  # Wyłącz dla pierwszego elementu
                                    on_click=lambda e, idx=i: self.move_item_up(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_DOWN,
                                    tooltip="Przesuń w dół",
                                    disabled=i == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                    on_click=lambda e, idx=i: self.move_item_down(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.DELETE,
                                    tooltip="Usuń element",
                                    on_click=lambda e, idx=i: self.delete_featured_item_inline(idx, form_container)
                                )
                            ])
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.TextField(
                            label="Tytuł",
                            value=item.get("title", ""),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "title", e.control.value)
                        ),
                        ft.TextField(
                            label="Opis",
                            value=item.get("description", ""),
                            multiline=True,
                            on_change=lambda e, idx=i: self.update_item_field(idx, "description", e.control.value)
                        ),
                        self.create_gallery_category_dropdown(
                            item.get("galleryCategory", ""),
                            lambda e, idx=i: self.update_item_field(idx, "galleryCategory", e.control.value)
                        ),
                        ft.Text("Obraz:", weight=ft.FontWeight.BOLD),
                        self.create_image_picker(
                            item.get("image", ""),
                            lambda path, idx=i: self.update_item_field(idx, "image", path)
                        )
                    ]),
                    padding=15
                )
            )
            form_container.controls.append(item_card)

        self.content_area.content = form_container
        
        # Utwórz przyciski akcji w stałym kontenerze
        self.create_action_buttons(
            form_refresh_func=self.show_featured_form,
            show_add_button=True,
            add_button_text="Dodaj nowy element",
            add_button_callback=lambda e: self.add_featured_item_inline(form_container)
        )

    def show_gallery_form(self):
        """Pokazuje formularz edycji galerii"""
        if not self.current_data:
            return

        def add_new_artwork():
            new_artwork = {
                "id": max([item.get("id", 0) for item in self.current_data] + [0]) + 1,
                "title": "",
                "description": "",
                "technique": "",
                "dimensions": "",
                "year": 2024,
                "image": "",
                "categories": [],
                "available": True
            }
            self.current_data.append(new_artwork)
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            
            new_index = len(self.current_data) - 1
            
            artwork_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Dzieło {new_index + 1}", weight=ft.FontWeight.BOLD),
                            ft.Row([
                                ft.Text("Pozycja:", size=12),
                                ft.TextField(
                                    value=str(new_index + 1),
                                    width=60,
                                    height=40,
                                    text_align=ft.TextAlign.CENTER,
                                    input_filter=ft.NumbersOnlyInputFilter(),
                                    on_submit=lambda e, idx=new_index: self.move_to_position(idx, e.control.value),
                                    on_blur=lambda e, idx=new_index: self.move_to_position(idx, e.control.value)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_UP,
                                    tooltip="Przesuń w górę",
                                    disabled=new_index == 0,  # Wyłącz dla pierwszego elementu
                                    on_click=lambda e, idx=new_index: self.move_item_up(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_DOWN,
                                    tooltip="Przesuń w dół",
                                    disabled=new_index == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                    on_click=lambda e, idx=new_index: self.move_item_down(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.DELETE,
                                    tooltip="Usuń dzieło",
                                    on_click=lambda e, idx=new_index: delete_artwork_inline(idx)
                                )
                            ])
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.Row([
                            ft.TextField(
                                label="Tytuł",
                                value="",
                                expand=True,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "title", e.control.value)
                            ),
                            ft.TextField(
                                label="Rok",
                                value="2024",
                                width=100,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "year", int(e.control.value) if e.control.value.isdigit() else 2024)
                            )
                        ]),
                        ft.TextField(
                            label="Opis",
                            value="",
                            multiline=True,
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "description", e.control.value)
                        ),
                        ft.Row([
                            ft.TextField(
                                label="Technika",
                                value="",
                                expand=True,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "technique", e.control.value)
                            ),
                            ft.TextField(
                                label="Wymiary",
                                value="",
                                expand=True,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "dimensions", e.control.value)
                            )
                        ]),
                        self.create_category_selector(
                            [],
                            lambda categories, idx=new_index: self.update_item_field(idx, "categories", categories)
                        ),
                        ft.Switch(
                            label="Dostępne",
                            value=True,
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "available", e.control.value)
                        ),
                        ft.Text("Obraz:", weight=ft.FontWeight.BOLD),
                        self.create_image_picker(
                            "",
                            lambda path, idx=new_index: self.update_item_field(idx, "image", path)
                        )
                    ]),
                    padding=15
                )
            )
            
            form_container.controls.append(artwork_card)
            self.page.update()
            
            # Przewiń do nowo dodanego elementu
            def scroll_to_new_item():
                if hasattr(self.content_area.content, 'scroll_to'):
                    self.content_area.content.scroll_to(offset=-1, duration=300)
                    self.page.update()
            
            # Opóźnione przewijanie
            timer = threading.Timer(0.1, scroll_to_new_item)
            timer.start()

        def delete_artwork_inline(index):
            def confirm_delete(e):
                self.current_data.pop(index)
                self.unsaved_changes = True
                self.update_title()
                self.update_buttons_state()
                
                if index + 2 < len(form_container.controls):
                    form_container.controls.pop(index + 2)
                    
                    for i, card in enumerate(form_container.controls[2:], 0):
                        if isinstance(card, ft.Card):
                            title_row = card.content.content.controls[0]
                            if isinstance(title_row, ft.Row) and len(title_row.controls) >= 2:
                                title_text = title_row.controls[0]
                                delete_button = title_row.controls[1]
                                
                                title_text.value = f"Dzieło {i + 1}"
                                delete_button.on_click = lambda e, idx=i: delete_artwork_inline(idx)
                
                self.page.close(dialog)
                self.page.update()

            def cancel_delete(e):
                self.page.close(dialog)

            dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Potwierdź usunięcie"),
                content=ft.Text("Czy na pewno chcesz usunąć ten obraz z galerii?"),
                actions=[
                    ft.TextButton("Usuń", on_click=confirm_delete),
                    ft.TextButton("Anuluj", on_click=cancel_delete),
                ]
            )
            
            self.page.open(dialog)

        # Kontener główny
        form_container = ft.Column([
            ft.Text("Edycja galerii", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
        ], scroll=ft.ScrollMode.AUTO)

        # Lista dzieł sztuki
        for i, artwork in enumerate(self.current_data):
            artwork_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Dzieło {i+1}", weight=ft.FontWeight.BOLD),
                            ft.Row([
                                ft.Text("Pozycja:", size=12),
                                ft.TextField(
                                    value=str(i+1),
                                    width=60,
                                    height=40,
                                    text_align=ft.TextAlign.CENTER,
                                    input_filter=ft.NumbersOnlyInputFilter(),
                                    on_submit=lambda e, idx=i: self.move_to_position(idx, e.control.value),
                                    on_blur=lambda e, idx=i: self.move_to_position(idx, e.control.value)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_UP,
                                    tooltip="Przesuń w górę",
                                    disabled=i == 0,  # Wyłącz dla pierwszego elementu
                                    on_click=lambda e, idx=i: self.move_item_up(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_DOWN,
                                    tooltip="Przesuń w dół",
                                    disabled=i == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                    on_click=lambda e, idx=i: self.move_item_down(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.DELETE,
                                    tooltip="Usuń dzieło",
                                    on_click=lambda e, idx=i: delete_artwork_inline(idx)
                                )
                            ])
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.Row([
                            ft.TextField(
                                label="Tytuł",
                                value=artwork.get("title", ""),
                                expand=True,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "title", e.control.value)
                            ),
                            ft.TextField(
                                label="Rok",
                                value=str(artwork.get("year", "")),
                                width=100,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "year", int(e.control.value) if e.control.value.isdigit() else 2024)
                            )
                        ]),
                        ft.TextField(
                            label="Opis",
                            value=artwork.get("description", ""),
                            multiline=True,
                            on_change=lambda e, idx=i: self.update_item_field(idx, "description", e.control.value)
                        ),
                        ft.Row([
                            ft.TextField(
                                label="Technika",
                                value=artwork.get("technique", ""),
                                expand=True,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "technique", e.control.value)
                            ),
                            ft.TextField(
                                label="Wymiary",
                                value=artwork.get("dimensions", ""),
                                expand=True,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "dimensions", e.control.value)
                            )
                        ]),
                        self.create_category_selector(
                            artwork.get("categories", []),
                            lambda categories, idx=i: self.update_item_field(idx, "categories", categories)
                        ),
                        ft.Switch(
                            label="Dostępne",
                            value=artwork.get("available", True),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "available", e.control.value)
                        ),
                        ft.Text("Obraz:", weight=ft.FontWeight.BOLD),
                        self.create_image_picker(
                            artwork.get("image", ""),
                            lambda path, idx=i: self.update_item_field(idx, "image", path)
                        )
                    ]),
                    padding=15
                )
            )
            form_container.controls.append(artwork_card)

        self.content_area.content = form_container
        
        # Utwórz przyciski akcji w stałym kontenerze
        self.create_action_buttons(
            form_refresh_func=self.show_gallery_form,
            show_add_button=True,
            add_button_text="Dodaj nowe dzieło",
            add_button_callback=lambda e: add_new_artwork()
        )

    def show_shop_form(self):
        """Pokazuje formularz edycji sklepu"""
        if not self.current_data:
            return

        def add_new_product():
            new_product = {
                "id": max([item.get("id", 0) for item in self.current_data] + [100]) + 1,
                "title": "",
                "description": "",
                "dimensions": "",
                "price": 0,
                "image": "",
                "available": True,
                "originalArtworkId": 1,
                "purchaseUrl": ""
            }
            self.current_data.append(new_product)
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            
            new_index = len(self.current_data) - 1
            
            product_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Produkt {new_index + 1}", weight=ft.FontWeight.BOLD),
                            ft.Row([
                                ft.Text("Pozycja:", size=12),
                                ft.TextField(
                                    value=str(new_index + 1),
                                    width=60,
                                    height=40,
                                    text_align=ft.TextAlign.CENTER,
                                    input_filter=ft.NumbersOnlyInputFilter(),
                                    on_submit=lambda e, idx=new_index: self.move_to_position(idx, e.control.value),
                                    on_blur=lambda e, idx=new_index: self.move_to_position(idx, e.control.value)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_UP,
                                    tooltip="Przesuń w górę",
                                    disabled=new_index == 0,  # Wyłącz dla pierwszego elementu
                                    on_click=lambda e, idx=new_index: self.move_item_up(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_DOWN,
                                    tooltip="Przesuń w dół",
                                    disabled=new_index == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                    on_click=lambda e, idx=new_index: self.move_item_down(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.DELETE,
                                    tooltip="Usuń produkt",
                                    on_click=lambda e, idx=new_index: delete_product_inline(idx)
                                )
                            ])
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.TextField(
                            label="Nazwa produktu",
                            value="",
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "title", e.control.value)
                        ),
                        ft.TextField(
                            label="Opis produktu",
                            value="",
                            multiline=True,
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "description", e.control.value)
                        ),
                        ft.TextField(
                            label="Wymiary (np. 40 x 30 cm)",
                            value="",
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "dimensions", e.control.value)
                        ),
                        ft.Row([
                            ft.TextField(
                                label="Cena (PLN)",
                                value=str(new_product.get("price", 0)),
                                width=150,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "price", float(e.control.value) if e.control.value.replace(".", "").isdigit() else 0)
                            ),
                            ft.TextField(
                                label="ID oryginalnego dzieła",
                                value=str(new_product.get("originalArtworkId", 1)),
                                width=200,
                                on_change=lambda e, idx=new_index: self.update_item_field(idx, "originalArtworkId", int(e.control.value) if e.control.value.isdigit() else 1)
                            )
                        ]),
                        ft.TextField(
                            label="URL zakupu",
                            value="",
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "purchaseUrl", e.control.value)
                        ),
                        ft.Switch(
                            label="Dostępny",
                            value=True,
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "available", e.control.value)
                        ),
                        ft.Text("Obraz produktu:", weight=ft.FontWeight.BOLD),
                        self.create_image_picker(
                            "",
                            lambda path, idx=new_index: self.update_item_field(idx, "image", path)
                        )
                    ]),
                    padding=15
                )
            )
            
            form_container.controls.append(product_card)
            self.page.update()
            
            # Przewiń do nowo dodanego elementu
            def scroll_to_new_item():
                if hasattr(self.content_area.content, 'scroll_to'):
                    self.content_area.content.scroll_to(offset=-1, duration=300)
                    self.page.update()
            
            # Opóźnione przewijanie
            timer = threading.Timer(0.1, scroll_to_new_item)
            timer.start()

        def delete_product_inline(index):
            def confirm_delete(e):
                self.current_data.pop(index)
                self.unsaved_changes = True
                self.update_title()
                self.update_buttons_state()
                
                if index + 2 < len(form_container.controls):
                    form_container.controls.pop(index + 2)
                    
                    for i, card in enumerate(form_container.controls[2:], 0):
                        if isinstance(card, ft.Card):
                            title_row = card.content.content.controls[0]
                            if isinstance(title_row, ft.Row) and len(title_row.controls) >= 2:
                                title_text = title_row.controls[0]
                                delete_button = title_row.controls[1]
                                
                                title_text.value = f"Produkt {i + 1}"
                                delete_button.on_click = lambda e, idx=i: delete_product_inline(idx)
                
                self.page.close(dialog)
                self.page.update()

            def cancel_delete(e):
                self.page.close(dialog)

            dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Potwierdź usunięcie"),
                content=ft.Text("Czy na pewno chcesz usunąć ten produkt ze sklepu?"),
                actions=[
                    ft.TextButton("Usuń", on_click=confirm_delete),
                    ft.TextButton("Anuluj", on_click=cancel_delete),
                ]
            )
            
            self.page.open(dialog)

        # Kontener główny
        form_container = ft.Column([
            ft.Text("Edycja sklepu", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
        ], scroll=ft.ScrollMode.AUTO)

        # Lista produktów
        for i, product in enumerate(self.current_data):
            product_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Produkt {i+1}", weight=ft.FontWeight.BOLD),
                            ft.Row([
                                ft.Text("Pozycja:", size=12),
                                ft.TextField(
                                    value=str(i+1),
                                    width=60,
                                    height=40,
                                    text_align=ft.TextAlign.CENTER,
                                    input_filter=ft.NumbersOnlyInputFilter(),
                                    on_submit=lambda e, idx=i: self.move_to_position(idx, e.control.value),
                                    on_blur=lambda e, idx=i: self.move_to_position(idx, e.control.value)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_UP,
                                    tooltip="Przesuń w górę",
                                    disabled=i == 0,  # Wyłącz dla pierwszego elementu
                                    on_click=lambda e, idx=i: self.move_item_up(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.KEYBOARD_ARROW_DOWN,
                                    tooltip="Przesuń w dół",
                                    disabled=i == len(self.current_data) - 1,  # Wyłącz dla ostatniego elementu
                                    on_click=lambda e, idx=i: self.move_item_down(idx)
                                ),
                                ft.IconButton(
                                    ft.Icons.DELETE,
                                    tooltip="Usuń produkt",
                                    on_click=lambda e, idx=i: delete_product_inline(idx)
                                )
                            ])
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.TextField(
                            label="Nazwa produktu",
                            value=product.get("title", ""),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "title", e.control.value)
                        ),
                        ft.TextField(
                            label="Opis produktu",
                            value=product.get("description", ""),
                            multiline=True,
                            on_change=lambda e, idx=i: self.update_item_field(idx, "description", e.control.value)
                        ),
                        ft.TextField(
                            label="Wymiary (np. 40 x 30 cm)",
                            value=product.get("dimensions", ""),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "dimensions", e.control.value)
                        ),
                        ft.Row([
                            ft.TextField(
                                label="Cena (PLN)",
                                value=str(product.get("price", 0)),
                                width=150,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "price", float(e.control.value) if e.control.value.replace(".", "").isdigit() else 0)
                            ),
                            ft.TextField(
                                label="ID oryginalnego dzieła",
                                value=str(product.get("originalArtworkId", 1)),
                                width=200,
                                on_change=lambda e, idx=i: self.update_item_field(idx, "originalArtworkId", int(e.control.value) if e.control.value.isdigit() else 1)
                            )
                        ]),
                        ft.TextField(
                            label="URL zakupu",
                            value=product.get("purchaseUrl", ""),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "purchaseUrl", e.control.value)
                        ),
                        ft.Switch(
                            label="Dostępny",
                            value=product.get("available", True),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "available", e.control.value)
                        ),
                        ft.Text("Obraz produktu:", weight=ft.FontWeight.BOLD),
                        self.create_image_picker(
                            product.get("image", ""),
                            lambda path, idx=i: self.update_item_field(idx, "image", path)
                        )
                    ]),
                    padding=15
                )
            )
            form_container.controls.append(product_card)

        self.content_area.content = form_container
        
        # Utwórz przyciski akcji w stałym kontenerze
        self.create_action_buttons(
            form_refresh_func=self.show_shop_form,
            show_add_button=True,
            add_button_text="Dodaj nowy produkt",
            add_button_callback=lambda e: add_new_product()
        )

    def validate_data(self, data_type, data):
        """Waliduje dane przed zapisem"""
        errors = []
        
        if data_type == "about":
            if not data.get("artistName", "").strip():
                errors.append("Imię i nazwisko artysty jest wymagane")
            if not data.get("artistPhoto", "").strip():
                errors.append("Zdjęcie artysty jest wymagane")
            if not data.get("biography") or len(data.get("biography", [])) == 0:
                errors.append("Biografia jest wymagana")
            
            # Dodaj sprawdzenie długości
            if len(data.get("artistName", "")) > 100:
                errors.append("Imię i nazwisko artysty nie może być dłuższe niż 100 znaków")
                
        elif data_type in ["featured", "gallery", "shop"]:
            if not isinstance(data, list):
                errors.append("Dane muszą być listą")
            else:
                for i, item in enumerate(data):
                    if not item.get("title", "").strip():
                        errors.append(f"Element {i+1}: Tytuł jest wymagany")
                    if not item.get("image", "").strip():
                        errors.append(f"Element {i+1}: Obraz jest wymagany")
                    
                    # Sprawdź długość tytułu
                    if len(item.get("title", "")) > 200:
                        errors.append(f"Element {i+1}: Tytuł nie może być dłuższy niż 200 znaków")
                    
                    if data_type == "gallery":
                        year = item.get("year")
                        if not year or not isinstance(year, int) or year < 1900 or year > 2100:
                            errors.append(f"Element {i+1}: Rok musi być liczbą między 1900 a 2100")
                    
                    if data_type == "shop":
                        price = item.get("price", 0)
                        if not isinstance(price, (int, float)) or price < 0 or price > 1000000:
                            errors.append(f"Element {i+1}: Cena musi być liczbą między 0 a 1,000,000")
        
        return errors

    def validate_and_save_data(self):
        """Waliduje i zapisuje dane"""
        if not self.current_data:
            self.show_message("Brak danych do zapisania", "#f44336")
            return False
            
        errors = self.validate_data(self.current_file, self.current_data)
        
        if errors:
            error_message = "Błędy walidacji:\n" + "\n".join(errors)
            self.show_validation_error_dialog(error_message)
            return False
        
        self.save_data()
        return True

    def show_validation_error_dialog(self, error_message):
        """Pokazuje dialog z błędami walidacji"""
        def close_dialog(e):
            self.page.close(dialog)

        dialog = ft.AlertDialog(
            modal=True,
            title=ft.Text("Błędy walidacji", color="#f44336"),
            content=ft.Container(
                content=ft.Text(error_message, selectable=True),
                width=400,
                height=200
            ),
            actions=[
                ft.TextButton("Zamknij", on_click=close_dialog)
            ]
        )
        
        self.page.open(dialog)

    def on_keyboard_event(self, e: ft.KeyboardEvent):
        """Obsługuje zdarzenia klawiatury"""
        # Ctrl+S - zapisz zmiany
        if e.key == "S" and e.ctrl and not e.shift and not e.alt:
            if self.unsaved_changes:
                self.validate_and_save_data()
            e.page.update()

    def move_item_up(self, index):
        """Przesuwa element w górę na liście"""
        if index > 0 and index < len(self.current_data):
            # Zamień miejscami z poprzednim elementem
            self.current_data[index], self.current_data[index - 1] = \
                self.current_data[index - 1], self.current_data[index]
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            # Odśwież odpowiedni formularz w zależności od aktualnej sekcji
            self.refresh_current_form()
            # Przewiń do nowej pozycji elementu
            self.scroll_to_item(index - 1)

    def move_item_down(self, index):
        """Przesuwa element w dół na liście"""
        if index >= 0 and index < len(self.current_data) - 1:
            # Zamień miejscami z następnym elementem
            self.current_data[index], self.current_data[index + 1] = \
                self.current_data[index + 1], self.current_data[index]
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            # Odśwież odpowiedni formularz w zależności od aktualnej sekcji
            self.refresh_current_form()
            # Przewiń do nowej pozycji elementu
            self.scroll_to_item(index + 1)

    def move_to_position(self, current_index, new_position_str):
        """Przenosi element na określoną pozycję"""
        try:
            # Sprawdź czy wartość to liczba całkowita
            if not new_position_str or not new_position_str.strip():
                return
            
            new_position = int(new_position_str.strip())
            
            # Sprawdź czy pozycja jest w prawidłowym zakresie (1-indexed)
            if new_position < 1 or new_position > len(self.current_data):
                self.show_message(f"Pozycja musi być między 1 a {len(self.current_data)}", "#f44336")
                return
            
            # Konwertuj do 0-indexed
            new_index = new_position - 1
            
            # Jeśli pozycja się nie zmieniła, nic nie rób
            if current_index == new_index:
                return
            
            # Zapobiegaj podwójnemu wykonaniu - dodaj sprawdzenie czy operacja już trwa
            if hasattr(self, '_moving_in_progress') and self._moving_in_progress:
                return
            
            self._moving_in_progress = True
            
            # Przemieszczaj element krok po kroku w kierunku docelowej pozycji
            if current_index < new_index:
                # Przemieszczaj w dół (w kierunku większych indeksów)
                for i in range(current_index, new_index):
                    self.current_data[i], self.current_data[i + 1] = \
                        self.current_data[i + 1], self.current_data[i]
            else:
                # Przemieszczaj w górę (w kierunku mniejszych indeksów)
                for i in range(current_index, new_index, -1):
                    self.current_data[i], self.current_data[i - 1] = \
                        self.current_data[i - 1], self.current_data[i]
            
            self.unsaved_changes = True
            self.update_title()
            self.update_buttons_state()
            
            # Odśwież formularz
            self.refresh_current_form()
            
            # Przewiń do nowej pozycji
            self.scroll_to_item(new_index)
            
            # Resetuj flagę po krótkim opóźnieniu
            def reset_flag():
                self._moving_in_progress = False
            
            timer = threading.Timer(0.5, reset_flag)
            timer.start()
            
        except ValueError:
            self.show_message("Pozycja musi być liczbą całkowitą", "#f44336")
            if hasattr(self, '_moving_in_progress'):
                self._moving_in_progress = False

    def scroll_to_item(self, item_index):
        """Przewija do określonego elementu"""
        def do_scroll():
            try:
                # Alternatywne podejście - używamy scroll_to z bardziej precyzyjnymi wartościami
                if hasattr(self.content_area, 'content'):
                    # Różne wysokości dla różnych sekcji
                    if self.current_file == "gallery":
                        # Galeria ma większe karty z wieloma polami
                        item_height = 750  # Zwiększona wysokość dla galerii
                        header_height = 80
                        # Przewiń więcej w górę, aby pokazać więcej kontekstu
                        viewport_offset_ratio = 0.15  # Pokazuj element bliżej góry (mniej w dół)
                    elif self.current_file == "shop":
                        # Sklep ma średnie karty
                        item_height = 650
                        header_height = 80
                        viewport_offset_ratio = 0.2
                    else:
                        # Featured i about mają mniejsze karty
                        item_height = 550
                        header_height = 80
                        viewport_offset_ratio = 0.25
                    
                    # Oblicz pozycję tak, aby element był lepiej widoczny
                    viewport_height = self.page.window.height - 200  # Wysokość okna minus UI
                    target_offset = max(0, header_height + (item_index * item_height) - (viewport_height * viewport_offset_ratio))
                    
                    # Przewiń do obliczonej pozycji
                    if hasattr(self.content_area.content, 'scroll_to'):
                        self.content_area.content.scroll_to(offset=target_offset, duration=300)
                    elif hasattr(self.content_area.content, 'scroll'):
                        # Alternatywne podejście - ustaw scroll bezpośrednio
                        self.content_area.content.scroll = ft.ScrollMode.AUTO
                    
                    self.page.update()
                    
                    # Dodatkowe podświetlenie elementu (opcjonalne)
                    self.highlight_moved_item(item_index)
                    
            except Exception as e:
                print(f"Błąd podczas przewijania: {e}")
        
        # Opóźnione przewijanie, aby dać czas na odświeżenie interfejsu
        timer = threading.Timer(0.3, do_scroll)
        timer.start()

    def highlight_moved_item(self, item_index):
        """Tymczasowo podświetla przeniesiony element"""
        def remove_highlight():
            try:
                # Usuń podświetlenie po 2 sekundach
                if hasattr(self.content_area, 'content') and hasattr(self.content_area.content, 'controls'):
                    # Znajdź kartę elementu i przywróć normalny kolor
                    cards = [ctrl for ctrl in self.content_area.content.controls if isinstance(ctrl, ft.Card)]
                    if item_index + 2 < len(self.content_area.content.controls):  # +2 bo są nagłówek i divider
                        target_control = self.content_area.content.controls[item_index + 2]
                        if isinstance(target_control, ft.Card):
                            if hasattr(target_control, 'bgcolor'):
                                target_control.bgcolor = None
                                self.page.update()
            except:
                pass
        
        try:
            # Podświetl element na żółto przez 2 sekundy
            if hasattr(self.content_area, 'content') and hasattr(self.content_area.content, 'controls'):
                if item_index + 2 < len(self.content_area.content.controls):  # +2 bo są nagłówek i divider
                    target_control = self.content_area.content.controls[item_index + 2]
                    if isinstance(target_control, ft.Card):
                        target_control.bgcolor = "#fff3e0"  # Jasnopomarańczowy
                        self.page.update()
                        
                        # Usuń podświetlenie po 2 sekundach
                        timer = threading.Timer(2.0, remove_highlight)
                        timer.start()
        except:
            pass

    def refresh_current_form(self):
        """Odświeża aktualnie wyświetlany formularz"""
        if self.current_file == "about":
            self.show_about_form()
        elif self.current_file == "featured":
            self.show_featured_form()
        elif self.current_file == "gallery":
            self.show_gallery_form()
        elif self.current_file == "shop":
            self.show_shop_form()
        elif self.current_file == "ui":
            self.show_ui_form()
        elif self.current_file == "site-config":
            self.show_site_config_form()
            
    def show_ui_form(self):
        """Pokazuje formularz do edycji tekstów interfejsu użytkownika"""
        if not self.current_data:
            self.show_message("Brak danych do wyświetlenia", "#f44336")
            return
        
        self.content_area.content = ft.Column([
            ft.Text("Edycja tekstów interfejsu", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(height=20),
            
            # Sekcja Nawigacji
            ft.Text("Nawigacja", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Strona Główna",
                        value=self.current_data.get("navigation", {}).get("home", ""),
                        on_change=lambda e: self.update_nested_field("navigation", "home", e.control.value)
                    ),
                    ft.TextField(
                        label="Galeria",
                        value=self.current_data.get("navigation", {}).get("gallery", ""),
                        on_change=lambda e: self.update_nested_field("navigation", "gallery", e.control.value)
                    ),
                    ft.TextField(
                        label="O Artyście",
                        value=self.current_data.get("navigation", {}).get("about", ""),
                        on_change=lambda e: self.update_nested_field("navigation", "about", e.control.value)
                    ),
                    ft.TextField(
                        label="Sklep",
                        value=self.current_data.get("navigation", {}).get("shop", ""),
                        on_change=lambda e: self.update_nested_field("navigation", "shop", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor=ft.Colors.ON_TERTIARY,
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Sekcja Górny Pasek
            ft.Text("Górny pasek", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Kontakt",
                        value=self.current_data.get("topBar", {}).get("contact", ""),
                        on_change=lambda e: self.update_nested_field("topBar", "contact", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor=ft.Colors.ON_TERTIARY,
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Sekcja Tytuły Stron
            ft.Text("Tytuły stron", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Wyróżnione Prace - Tytuł",
                        value=self.current_data.get("sections", {}).get("featuredWorks", ""),
                        on_change=lambda e: self.update_nested_field("sections", "featuredWorks", e.control.value)
                    ),
                    ft.TextField(
                        label="Wyróżnione Prace - Opis",
                        value=self.current_data.get("sections", {}).get("featuredWorksDescription", ""),
                        multiline=True,
                        min_lines=2,
                        max_lines=4,
                        on_change=lambda e: self.update_nested_field("sections", "featuredWorksDescription", e.control.value)
                    ),
                    ft.TextField(
                        label="Galeria - Tytuł",
                        value=self.current_data.get("sections", {}).get("galleryTitle", ""),
                        on_change=lambda e: self.update_nested_field("sections", "galleryTitle", e.control.value)
                    ),
                    ft.TextField(
                        label="O Artyście - Tytuł",
                        value=self.current_data.get("sections", {}).get("aboutTitle", ""),
                        on_change=lambda e: self.update_nested_field("sections", "aboutTitle", e.control.value)
                    ),
                    ft.TextField(
                        label="Sklep - Tytuł",
                        value=self.current_data.get("sections", {}).get("shopTitle", ""),
                        on_change=lambda e: self.update_nested_field("sections", "shopTitle", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor=ft.Colors.ON_TERTIARY,
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Sekcja Nazwy Języków
            ft.Text("Nazwy języków", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Pierwszy język",
                        value=self.current_data.get("languages", {}).get("firstLanguage", ""),
                        on_change=lambda e: self.update_nested_field("languages", "firstLanguage", e.control.value)
                    ),
                    ft.TextField(
                        label="Drugi język",
                        value=self.current_data.get("languages", {}).get("secondLanguage", ""),
                        on_change=lambda e: self.update_nested_field("languages", "secondLanguage", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor=ft.Colors.ON_TERTIARY,
                border_radius=8
            ),
            
        ], scroll=ft.ScrollMode.AUTO)
        
        self.update_buttons_state()
        self.page.update()
        
    def update_nested_field(self, section, field, value):
        """Aktualizuje zagnieżdżone pole w danych"""
        if hasattr(self, '_loading_data') and self._loading_data:
            return
        
        if section not in self.current_data:
            self.current_data[section] = {}
        
        self.current_data[section][field] = value
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()
        
    def show_site_config_form(self):
        """Pokazuje formularz do edycji ustawień witryny"""
        if not self.current_data:
            self.show_message("Brak danych do wyświetlenia", "#f44336")
            return
        
        self.content_area.content = ft.Column([
            ft.Text("Ustawienia witryny", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(height=20),
            
            # Sekcja podstawowych danych
            ft.Text("Podstawowe informacje", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Nazwa witryny",
                        value=self.current_data.get("siteName", ""),
                        hint_text="Np. Portfolio Artystyczne",
                        on_change=lambda e: self.update_site_config_field("siteName", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor="#f5f5f5",
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Sekcja kontaktowa
            ft.Text("Dane kontaktowe", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="E-mail",
                        value=self.current_data.get("contact", {}).get("email", ""),
                        hint_text="kontakt@example.com",
                        on_change=lambda e: self.update_nested_field("contact", "email", e.control.value)
                    ),
                    ft.TextField(
                        label="Telefon",
                        value=self.current_data.get("contact", {}).get("phone", ""),
                        hint_text="+48 123 456 789",
                        on_change=lambda e: self.update_nested_field("contact", "phone", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor="#f5f5f5",
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Sekcja mediów społecznościowych
            ft.Text("Media społecznościowe", size=18, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    ft.TextField(
                        label="Facebook",
                        value=self.current_data.get("socialMedia", {}).get("facebook", ""),
                        hint_text="https://facebook.com/strona",
                        on_change=lambda e: self.update_nested_field("socialMedia", "facebook", e.control.value)
                    ),
                    ft.TextField(
                        label="Instagram",
                        value=self.current_data.get("socialMedia", {}).get("instagram", ""),
                        hint_text="https://instagram.com/profil",
                        on_change=lambda e: self.update_nested_field("socialMedia", "instagram", e.control.value)
                    ),
                ]),
                padding=10,
                bgcolor="#f5f5f5",
                border_radius=8
            ),
            
            ft.Divider(height=20),
            
            # Informacja o zastosowaniu
            ft.Container(
                content=ft.Column([
                    ft.Icon(ft.Icons.INFO, color="#1976d2", size=24),
                    ft.Text(
                        "Te ustawienia wpływają na całą witrynę niezależnie od wybranego języka. "
                        "Zmiana nazwy witryny automatycznie zaktualizuje ją w nagłówku i stopce.",
                        size=12,
                        color="#1976d2",
                        text_align=ft.TextAlign.CENTER
                    ),
                ]),
                padding=15,
                bgcolor="#e3f2fd",
                border_radius=8,
                border=ft.border.all(1, "#90caf9")
            ),
            
        ], scroll=ft.ScrollMode.AUTO)
        
        self.update_buttons_state()
        self.page.update()
        
    def update_site_config_field(self, field, value):
        """Aktualizuje pole w konfiguracji witryny"""
        if hasattr(self, '_loading_data') and self._loading_data:
            return
        
        self.current_data[field] = value
        self.unsaved_changes = True
        self.update_title()
        self.update_buttons_state()

def main(page: ft.Page):
    AdminInterface(page)

if __name__ == "__main__":
    ft.app(target=main)
