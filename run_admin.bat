@echo off
REM Skrypt uruchamiający panel administracyjny strony artysty
echo Uruchamianie panelu administracyjnego...
echo.

REM Przejście do folderu admin_interface
cd /d "%~dp0admin_interface"

REM Sprawdzenie czy folder admin_interface istnieje
if not exist "venv" (
    echo BŁĄD: Nie znaleziono środowiska wirtualnego w folderze admin_interface
    echo Upewnij się, że środowisko zostało poprawnie utworzone.
    pause
    exit /b 1
)

REM Aktywacja środowiska wirtualnego
echo Aktywacja środowiska wirtualnego...
call venv\Scripts\activate

REM Sprawdzenie czy plik main.py istnieje
if not exist "main.py" (
    echo BŁĄD: Nie znaleziono pliku main.py
    pause
    exit /b 1
)

REM Uruchomienie aplikacji
echo Uruchamianie interfejsu administratora...
echo.
python main.py

REM Powrót do głównego folderu
cd /d "%~dp0"

echo.
echo Panel administracyjny został zamknięty.
pause
