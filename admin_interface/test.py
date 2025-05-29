import flet as ft

def main(page: ft.Page):
    page.title = "Test"
    page.add(ft.Text("Hello World"))

ft.app(target=main)
