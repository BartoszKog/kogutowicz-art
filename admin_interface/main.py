import flet as ft
import json
import os
from pathlib import Path
import shutil

class AdminInterface:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "Interfejs Administratora - Strona Artysty"
        self.page.theme_mode = ft.ThemeMode.LIGHT
        self.page.window_width = 1200
        self.page.window_height = 800
        self.page.scroll = ft.ScrollMode.AUTO
        
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
            title=ft.Text("Panel Administracyjny"),
            bgcolor="#1976d2",
            color="#ffffff"
        )
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
            height=self.page.window_height - 64  # Odejmujemy wysokość AppBar
        )
          # Główny obszar zawartości
        self.content_area = ft.Container(
            content=ft.Column([
                ft.Text("Wybierz sekcję do edycji", size=20, color="#757575")
            ]),
            padding=20,
            expand=True
        )
        
        # Powiadomienia
        self.snackbar = ft.SnackBar(content=ft.Text(""))
        self.page.overlay.append(self.snackbar)
        
        # Layout główny - container z pełną wysokością
        main_layout = ft.Container(
            content=ft.Row([
                self.rail,
                ft.VerticalDivider(width=1),
                self.content_area
            ]),
            expand=True
        )
        self.page.add(main_layout)

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
        except FileNotFoundError:
            self.show_message("Błąd: Nie znaleziono pliku JSON", "#f44336")
            self.current_data = None
        except json.JSONDecodeError:
            self.show_message("Błąd: Nieprawidłowy format JSON", "#f44336")
            self.current_data = None

    def save_data(self):
        """Zapisuje dane do pliku JSON"""
        try:
            json_file = self.json_path / f"{self.current_file}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(self.current_data, f, ensure_ascii=False, indent=2)
            self.unsaved_changes = False
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
            dialog.open = False
            self.page.update()

        def save_and_continue(e):
            self.save_data()
            close_dialog(e)
            self.load_section(new_index)

        def discard_and_continue(e):
            self.unsaved_changes = False
            close_dialog(e)
            self.load_section(new_index)

        dialog = ft.AlertDialog(
            modal=True,
            title=ft.Text("Niezapisane zmiany"),
            content=ft.Text("Masz niezapisane zmiany. Co chcesz zrobić?"),
            actions=[
                ft.TextButton("Zapisz i kontynuuj", on_click=save_and_continue),
                ft.TextButton("Odrzuć zmiany", on_click=discard_and_continue),
                ft.TextButton("Anuluj", on_click=close_dialog),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )
        
        self.page.dialog = dialog
        dialog.open = True
        self.page.update()

    def create_image_picker(self, current_image="", on_change=None):
        """Tworzy komponent wyboru obrazu"""
        def pick_image(e):
            def close_picker(e):
                picker_dialog.open = False
                self.page.update()

            def select_image(image_path):
                image_display.src = f"../{image_path}"
                image_field.value = image_path
                if on_change:
                    on_change(image_path)
                self.unsaved_changes = True
                close_picker(None)
                self.page.update()

            # Lista obrazów
            image_list = ft.Column(scroll=ft.ScrollMode.AUTO, height=400)
            
            # Skanowanie folderów z obrazami
            for folder in ["featured", "gallery"]:
                folder_path = self.images_path / folder
                if folder_path.exists():
                    image_list.controls.append(
                        ft.Text(f"Folder: {folder}", weight=ft.FontWeight.BOLD, size=16)                    )
                    
                    # Obsługuje różne formaty obrazów
                    for ext in ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.webp"]:
                        for img_file in folder_path.glob(ext):
                            rel_path = f"images/{folder}/{img_file.name}"
                            image_list.controls.append(
                                ft.ListTile(
                                    leading=ft.Image(src=f"../{rel_path}", width=50, height=50, fit=ft.ImageFit.COVER),
                                    title=ft.Text(img_file.name),
                                    subtitle=ft.Text(f"Rozszerzenie: {img_file.suffix.upper()}"),
                                    on_click=lambda e, path=rel_path: select_image(path)
                                )
                            )

            picker_dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Wybierz obraz"),
                content=ft.Container(content=image_list, width=500),
                actions=[
                    ft.TextButton("Anuluj", on_click=close_picker)
                ]
            )
            
            self.page.dialog = picker_dialog
            picker_dialog.open = True
            self.page.update()

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
        
        return ft.Column([
            ft.Row([
                image_field,
                ft.ElevatedButton("Wybierz obraz", on_click=pick_image)
            ]),
            image_display
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
            lambda path: self.update_field("artistPhoto", path)        )
        
        # Biografia (lista akapitów)
        biography_section = ft.Column([
            ft.Row([
                ft.Text("Biografia:", weight=ft.FontWeight.BOLD),
                ft.IconButton(
                    ft.Icons.ADD,
                    tooltip="Dodaj akapit",
                    on_click=lambda e: self.add_list_item("biography", self.show_about_form)
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
                    on_click=lambda e, idx=i: self.remove_list_item("biography", idx, self.show_about_form)
                )
            ])
            biography_section.controls.append(row)
        
        # Edukacja
        education_fields = []
        for i, item in enumerate(self.current_data.get("education", [])):
            field = ft.TextField(
                label=f"Edukacja {i+1}",
                value=item,
                on_change=lambda e, idx=i: self.update_list_field("education", idx, e.control.value)
            )
            education_fields.append(field)
        
        # Osiągnięcia
        achievements_fields = []
        for i, item in enumerate(self.current_data.get("achievements", [])):
            field = ft.TextField(
                label=f"Osiągnięcie {i+1}",
                value=item,
                on_change=lambda e, idx=i: self.update_list_field("achievements", idx, e.control.value)
            )
            achievements_fields.append(field)        # Przyciski akcji
        action_buttons = ft.Row([
            ft.ElevatedButton(
                "Zapisz zmiany",
                icon=ft.Icons.SAVE,
                on_click=lambda e: self.validate_and_save_data()
            ),
            ft.OutlinedButton(
                "Anuluj",
                icon=ft.Icons.CANCEL,
                on_click=lambda e: self.load_data() or self.show_about_form()
            )
        ])        # Zawartość formularza
        form_content = ft.Column([
            ft.Text("Edycja sekcji 'O Artyście'", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            artist_name,
            ft.Text("Zdjęcie artysty:", weight=ft.FontWeight.BOLD),
            artist_photo,
            biography_section,
            ft.Text("Edukacja:", weight=ft.FontWeight.BOLD),
            *education_fields,
            ft.Text("Osiągnięcia:", weight=ft.FontWeight.BOLD),
            *achievements_fields,
            ft.Divider(),
            action_buttons
        ], scroll=ft.ScrollMode.AUTO)

        self.content_area.content = form_content
        self.page.update()

    def update_field(self, field_name, value):
        """Aktualizuje pole w danych"""
        self.current_data[field_name] = value
        self.unsaved_changes = True

    def update_list_field(self, list_name, index, value):
        """Aktualizuje element listy w danych"""
        if list_name not in self.current_data:
            self.current_data[list_name] = []
        
        # Rozszerz listę jeśli to konieczne
        while len(self.current_data[list_name]) <= index:
            self.current_data[list_name].append("")
            
        self.current_data[list_name][index] = value
        self.unsaved_changes = True

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

    def show_featured_form(self):
        """Pokazuje formularz edycji sekcji 'Wyróżnione'"""
        if not self.current_data:
            return

        def add_new_item():
            new_item = {
                "id": max([item.get("id", 0) for item in self.current_data] + [0]) + 1,
                "title": "",
                "description": "",
                "image": ""
            }
            self.current_data.append(new_item)
            self.unsaved_changes = True
            self.show_featured_form()

        def delete_item(index):
            def confirm_delete(e):
                self.current_data.pop(index)
                self.unsaved_changes = True
                dialog.open = False
                self.page.update()
                self.show_featured_form()

            def cancel_delete(e):
                dialog.open = False
                self.page.update()

            dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Potwierdź usunięcie"),
                content=ft.Text("Czy na pewno chcesz usunąć ten element?"),
                actions=[
                    ft.TextButton("Usuń", on_click=confirm_delete),
                    ft.TextButton("Anuluj", on_click=cancel_delete),
                ]
            )
            
            self.page.dialog = dialog
            dialog.open = True
            self.page.update()

        # Lista elementów
        items_list = []
        for i, item in enumerate(self.current_data):
            item_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Element {i+1}", weight=ft.FontWeight.BOLD),
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń element",
                                on_click=lambda e, idx=i: delete_item(idx)
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
            items_list.append(item_card)

        # Przyciski akcji
        action_buttons = ft.Row([
            ft.ElevatedButton(
                "Dodaj nowy element",
                icon=ft.Icons.ADD,
                on_click=lambda e: add_new_item()
            ),            ft.ElevatedButton(
                "Zapisz zmiany",
                icon=ft.Icons.SAVE,
                on_click=lambda e: self.validate_and_save_data()
            ),
            ft.OutlinedButton(
                "Anuluj",
                icon=ft.Icons.CANCEL,
                on_click=lambda e: self.load_data() or self.show_featured_form()
            )
        ])

        form_content = ft.Column([
            ft.Text("Edycja sekcji 'Wyróżnione'", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            *items_list,
            ft.Divider(),
            action_buttons
        ], scroll=ft.ScrollMode.AUTO)

        self.content_area.content = form_content
        self.page.update()

    def update_item_field(self, index, field_name, value):
        """Aktualizuje pole w elemencie listy"""
        self.current_data[index][field_name] = value
        self.unsaved_changes = True

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
            self.show_gallery_form()

        def delete_artwork(index):
            def confirm_delete(e):
                self.current_data.pop(index)
                self.unsaved_changes = True
                dialog.open = False
                self.page.update()
                self.show_gallery_form()

            def cancel_delete(e):
                dialog.open = False
                self.page.update()

            dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Potwierdź usunięcie"),
                content=ft.Text("Czy na pewno chcesz usunąć ten obraz z galerii?"),
                actions=[
                    ft.TextButton("Usuń", on_click=confirm_delete),
                    ft.TextButton("Anuluj", on_click=cancel_delete),
                ]
            )
            
            self.page.dialog = dialog
            dialog.open = True
            self.page.update()

        # Lista dzieł sztuki
        artworks_list = []
        for i, artwork in enumerate(self.current_data):
            artwork_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Dzieło {i+1}", weight=ft.FontWeight.BOLD),
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń dzieło",
                                on_click=lambda e, idx=i: delete_artwork(idx)
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
            artworks_list.append(artwork_card)

        # Przyciski akcji
        action_buttons = ft.Row([
            ft.ElevatedButton(
                "Dodaj nowe dzieło",
                icon=ft.Icons.ADD,
                on_click=lambda e: add_new_artwork()
            ),            ft.ElevatedButton(
                "Zapisz zmiany",
                icon=ft.Icons.SAVE,
                on_click=lambda e: self.validate_and_save_data()
            ),
            ft.OutlinedButton(
                "Anuluj",
                icon=ft.Icons.CANCEL,
                on_click=lambda e: self.load_data() or self.show_gallery_form()
            )
        ])

        form_content = ft.Column([
            ft.Text("Edycja galerii", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            *artworks_list,
            ft.Divider(),
            action_buttons
        ], scroll=ft.ScrollMode.AUTO)

        self.content_area.content = form_content
        self.page.update()

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
            self.show_shop_form()

        def delete_product(index):
            def confirm_delete(e):
                self.current_data.pop(index)
                self.unsaved_changes = True
                dialog.open = False
                self.page.update()
                self.show_shop_form()

            def cancel_delete(e):
                dialog.open = False
                self.page.update()

            dialog = ft.AlertDialog(
                modal=True,
                title=ft.Text("Potwierdź usunięcie"),
                content=ft.Text("Czy na pewno chcesz usunąć ten produkt ze sklepu?"),
                actions=[
                    ft.TextButton("Usuń", on_click=confirm_delete),
                    ft.TextButton("Anuluj", on_click=cancel_delete),
                ]
            )
            
            self.page.dialog = dialog
            dialog.open = True
            self.page.update()

        # Lista produktów
        products_list = []
        for i, product in enumerate(self.current_data):
            product_card = ft.Card(
                content=ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Produkt {i+1}", weight=ft.FontWeight.BOLD),
                            ft.IconButton(
                                ft.Icons.DELETE,
                                tooltip="Usuń produkt",
                                on_click=lambda e, idx=i: delete_product(idx)
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
            products_list.append(product_card)

        # Przyciski akcji
        action_buttons = ft.Row([
            ft.ElevatedButton(
                "Dodaj nowy produkt",
                icon=ft.Icons.ADD,
                on_click=lambda e: add_new_product()
            ),
            ft.ElevatedButton(
                "Zapisz zmiany",
                icon=ft.Icons.SAVE,
                on_click=lambda e: self.validate_and_save_data()
            ),
            ft.OutlinedButton(
                "Anuluj",
                icon=ft.Icons.CANCEL,
                on_click=lambda e: self.load_data() or self.show_shop_form()
            )
        ])

        form_content = ft.Column([
            ft.Text("Edycja sklepu", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            *products_list,
            ft.Divider(),
            action_buttons
        ], scroll=ft.ScrollMode.AUTO)

        self.content_area.content = form_content
        self.page.update()

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
                
        elif data_type in ["featured", "gallery", "shop"]:
            if not isinstance(data, list):
                errors.append("Dane muszą być listą")
            else:
                for i, item in enumerate(data):
                    if not item.get("title", "").strip():
                        errors.append(f"Element {i+1}: Tytuł jest wymagany")
                    if not item.get("image", "").strip():
                        errors.append(f"Element {i+1}: Obraz jest wymagany")
                    
                    if data_type == "gallery":
                        if not item.get("year") or not isinstance(item.get("year"), int):
                            errors.append(f"Element {i+1}: Rok musi być liczbą")
                    
                    if data_type == "shop":
                        price = item.get("price", 0)
                        if not isinstance(price, (int, float)) or price < 0:
                            errors.append(f"Element {i+1}: Cena musi być liczbą nieujemną")
        
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
            dialog.open = False
            self.page.update()

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
        
        self.page.dialog = dialog
        dialog.open = True
        self.page.update()


def main(page: ft.Page):
    AdminInterface(page)

if __name__ == "__main__":
    ft.app(target=main)
