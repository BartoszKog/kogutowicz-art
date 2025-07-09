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
            bgcolor=ft.Colors.PRIMARY_CONTAINER,
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
        sections = ["about", "featured", "gallery", "shop"]
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

    def load_data(self):
        """Ładuje dane z pliku JSON"""
        try:
            json_file = self.json_path / f"{self.current_file}.json"
            with open(json_file, 'r', encoding='utf-8') as f:
                self.current_data = json.load(f)
            self.unsaved_changes = False
            self.update_title()
            self.update_buttons_state()
        except FileNotFoundError:
            self.show_message("Błąd: Nie znaleziono pliku JSON", "#f44336")
            self.current_data = None
        except json.JSONDecodeError:
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

    def create_image_picker(self, current_image="", on_change=None):
        """Tworzy komponent wyboru obrazu"""
        def pick_image(e):
            def close_picker(e):
                self.page.close(picker_dialog)

            def select_image(image_path):
                image_display.src = f"../{image_path}"
                image_display.visible = True  # Upewnij się, że obraz jest widoczny
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
                            image_list.controls.append(
                                ft.ListTile(
                                    leading=ft.Image(src=f"../{rel_path}", width=50, height=50, fit=ft.ImageFit.COVER),
                                    title=ft.Text(img_file.name),
                                    subtitle=ft.Text(f"Rozszerzenie: {img_file.suffix.upper()}"),
                                    on_click=lambda e, path=rel_path: select_image(path)
                                )
                            )
            
            if not has_images:
                image_list.controls.append(
                    ft.Text("Brak dostępnych obrazów. Dodaj pliki do folderów images/featured lub images/gallery", 
                           color="#757575", text_align=ft.TextAlign.CENTER)
                )
            
            picker_dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Wybierz obraz"),
                content=ft.Container(content=image_list, width=500),
                actions=[
                    ft.TextButton("Anuluj", on_click=close_picker)
                ]
            )
            
            self.page.open(picker_dialog)

        # Pole tekstowe na ścieżkę
        image_field = ft.TextField(
            label="Ścieżka do obrazu",
            value=current_image,
            read_only=True,
            expand=True
        )
        
        # Wyświetlanie obrazu
        image_display = ft.Image(
            src=f"../{current_image}" if current_image else "",
            width=150,
            height=150,
            fit=ft.ImageFit.COVER,
            visible=bool(current_image)
        )
        
        # Kontener do aktualizacji obrazu
        image_container = ft.Column([
            ft.Row([
                image_field,
                ft.ElevatedButton("Wybierz obraz", on_click=pick_image)
            ]),
            image_display
        ])
        
        return image_container

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
            "image": ""
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
                        ft.IconButton(
                            ft.Icons.DELETE,
                            tooltip="Usuń element",
                            on_click=lambda e, idx=new_index: self.delete_featured_item_inline(idx, items_container)
                        )
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
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń element",
                                on_click=lambda e, idx=i: self.delete_featured_item_inline(idx, form_container)
                            )
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
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń dzieło",
                                on_click=lambda e, idx=new_index: delete_artwork_inline(idx)
                            )
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
                        ft.TextField(
                            label="Kategorie (oddzielone przecinkami)",
                            value="",
                            on_change=lambda e, idx=new_index: self.update_item_field(idx, "categories", [cat.strip() for cat in e.control.value.split(",")])
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
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń dzieło",
                                on_click=lambda e, idx=i: delete_artwork_inline(idx)
                            )
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
                        ft.TextField(
                            label="Kategorie (oddzielone przecinkami)",
                            value=", ".join(artwork.get("categories", [])),
                            on_change=lambda e, idx=i: self.update_item_field(idx, "categories", [cat.strip() for cat in e.control.value.split(",")])
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
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń produkt",
                                on_click=lambda e, idx=new_index: delete_product_inline(idx)
                            )
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
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń produkt",
                                on_click=lambda e, idx=i: delete_product_inline(idx)
                            )
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

def main(page: ft.Page):
    AdminInterface(page)

if __name__ == "__main__":
    ft.app(target=main)
