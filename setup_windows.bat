@echo off
title Nova Browser V54 - Automated Production Installer
color 0b
cls

:: 1. Proje Dizinini Belirle
set "PROJ_DIR=%~dp0"
if "%PROJ_DIR:~-1%"=="\" set "PROJ_DIR=%PROJ_DIR:~0,-1%"
cd /d "%PROJ_DIR%"

echo ==============================================================================
echo       NOVA BROWSER V54 - OTOMATIK GUVENLI KURULUM MOTORU
echo       Gelistirici: Orhan Suleyman Torun
echo ==============================================================================
echo.

:: 2. Node.js Denetimi
echo [1/3] Node.js calisma motoru denetleniyor...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js kurulu degil!
    pause
    exit /b 1
)
echo [TAMAM] Node.js dogrulandi.

:: 3. Bagimliliklari Esitle
echo.
echo [2/3] Kutuphaneler senkronize ediliyor...
call npm install --no-audit --no-fund >nul 2>&1
echo [TAMAM] Paketler esitlendi.

:: 4. MAVI NOVA SİMGESİNİ (assets\favicon.ico) BUL VE MASAÜSTÜNE İŞLE
echo.
echo [3/3] Masaustu kisayoluna mavi Nova simgesi enjekte ediliyor...

set "RUN_BAT=%PROJ_DIR%\run_hidden_server.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\Nova Browser V54.lnk"

:: Simgeleri sırasıyla assets klasöründe ara
set "ICON_PATH="
if exist "%PROJ_DIR%\assets\favicon.ico" set "ICON_PATH=%PROJ_DIR%\assets\favicon.ico"
if not defined ICON_PATH if exist "%PROJ_DIR%\..\assets\favicon.ico" set "ICON_PATH=%PROJ_DIR%\..\assets\favicon.ico"
if not defined ICON_PATH if exist "%PROJ_DIR%\dist\favicon.ico" set "ICON_PATH=%PROJ_DIR%\dist\favicon.ico"
if not defined ICON_PATH if exist "%PROJ_DIR%\favicon.ico" set "ICON_PATH=%PROJ_DIR%\favicon.ico"

:: PowerShell ile Kısayolu ve Mavi Simgeyi Hatasız Oluştur
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT%'); " ^
  "$s.TargetPath = '%RUN_BAT%'; " ^
  "$s.WorkingDirectory = '%PROJ_DIR%'; " ^
  "if ('%ICON_PATH%' -ne '') { $s.IconLocation = '%ICON_PATH%,0' }; " ^
  "$s.Description = 'Nova Browser V54 Web Tarayicisi'; " ^
  "$s.Save()" >nul 2>&1

:: Windows Simge Önbelleğini Yenile (Dişli simgesinin anında mavi logoya dönmesi için)
ie4uinit.exe -show >nul 2>&1

echo [TAMAM] Klasordeki parlak mavi Nova logosu masaustune basariyla uygulandi!
echo.
echo ==============================================================================
echo [BASARILI] Nova Browser V54 Kurulumu Tamamlandi!
echo ==============================================================================
echo.
echo Tarayiciyi baslatmak icin bir tusa basin...
pause >nul
start "" "%RUN_BAT%"
exit /b 0