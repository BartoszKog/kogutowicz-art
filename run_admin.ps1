# Skrypt PowerShell uruchamiający panel administracyjny
Write-Host "Uruchamianie panelu administracyjnego..." -ForegroundColor Green
Write-Host ""

# Przejście do folderu admin_interface
$adminPath = Join-Path $PSScriptRoot "admin_interface"

if (-not (Test-Path $adminPath)) {
    Write-Host "BŁĄD: Nie znaleziono folderu admin_interface" -ForegroundColor Red
    Read-Host "Naciśnij Enter aby kontynuować"
    exit 1
}

Set-Location $adminPath

# Sprawdzenie czy środowisko wirtualne istnieje
if (-not (Test-Path "venv")) {
    Write-Host "BŁĄD: Nie znaleziono środowiska wirtualnego w folderze admin_interface" -ForegroundColor Red
    Write-Host "Upewnij się, że środowisko zostało poprawnie utworzone." -ForegroundColor Yellow
    Read-Host "Naciśnij Enter aby kontynuować"
    exit 1
}

# Aktywacja środowiska wirtualnego
Write-Host "Aktywacja środowiska wirtualnego..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Sprawdzenie czy plik main.py istnieje
if (-not (Test-Path "main.py")) {
    Write-Host "BŁĄD: Nie znaleziono pliku main.py" -ForegroundColor Red
    Read-Host "Naciśnij Enter aby kontynuować"
    exit 1
}

# Uruchomienie aplikacji
Write-Host "Uruchamianie interfejsu administratora..." -ForegroundColor Green
Write-Host ""
python main.py

# Powrót do głównego folderu
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Panel administracyjny został zamknięty." -ForegroundColor Green
Read-Host "Naciśnij Enter aby kontynuować"
