@echo off
title Nova Browser V54 - Engine Core
color 0a

:: 1. Calisma Dizinini Sabitle (Hem mutlak yola hem tasinabilir yola uyumlu)
set "MAIN_DIR=C:\Users\wq\Desktop\nova-browser-v54\nova-browser-v54\nova-browser-v54\nova-browser-v54"
if not exist "%MAIN_DIR%" set "MAIN_DIR=%~dp0"
cd /d "%MAIN_DIR%"

:: 2. Port 3000'de Askida Kalan Eski Islemleri Temizle (Cakismayi Onler)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: 3. En Uygun Tarayici Motorunu Tespit Et (Edge -> Chrome -> Varsayilan)
set "APP_BIN="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "APP_BIN=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "APP_BIN=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "APP_BIN=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "APP_BIN=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

:: 4. Arka Planda Node.js / TSX Motorunu Baslat
start "NovaServerHost" /min cmd /c "npx tsx server.ts || npm start"

:: 5. Sunucunun Hazir Olmasini Bekle (Dinamik Ping)
set /a ATTEMPTS=0
:WAIT_SERVER
set /a ATTEMPTS+=1
timeout /t 1 /nobreak >nul
powershell -Command "$r = try{(Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 1).StatusCode}catch{0}; exit ($r -eq 200 ? 0 : 1)" >nul 2>&1
if %errorlevel% neq 0 (
    if %ATTEMPTS% lss 10 goto WAIT_SERVER
)

:: 6. Uygulama Penceresini (Penceresiz Saf Uygulama Modunda) Baslat
if defined APP_BIN (
    start "" "%APP_BIN%" --app="http://localhost:3000" --user-data-dir="%LocalAppData%\NovaBrowser\LocalProfile" --no-first-run --no-default-browser-check
) else (
    start "" "http://localhost:3000"
)

exit