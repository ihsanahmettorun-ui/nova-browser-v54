#!/bin/bash
# ==============================================================================
# NOVA BROWSER V54 - UNIVERSAL RUNTIME ENGINE (MAC & LINUX)
# Developer: Orhan Süleyman Torun
# ==============================================================================

# Script'in çalıştığı dizine dinamik kilitlen
cd "$(dirname "$0")"

clear
echo "=============================================================================="
echo "    NOVA BROWSER V54 - MULTIPLATFORM RUNTIME INSTANCE"
echo "=============================================================================="
echo ""

# 1. Paket Denetimi
if [ ! -f "package.json" ]; then
    echo "[HATA] package.json dosyası bulunamadı! Lütfen dosyaları tam açın."
    exit 1
fi

# 2. Node.js Denetimi
if ! command -v node &> /dev/null; then
    echo "[HATA] Node.js kurulu değil! Lütfen Node.js kurun."
    exit 1
fi

# 3. Bağımlılıkların Yüklenmesi
if [ ! -d "node_modules" ]; then
    echo "[1/2] Bağımlılıklar yükleniyor (npm install)..."
    npm install --no-audit --no-fund
    if [ $? -ne 0 ]; then
        echo "[HATA] npm install başarısız oldu!"
        exit 1
    fi
fi

# 4. Port 3000 Çakışmasını Temizle
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "[2/2] Nova Browser yerel sunucusu başlatılıyor: http://localhost:3000"
echo "=============================================================================="

# 5. Tarayıcıyı Arka Planda Aç
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Google Chrome App Modu veya Varsayılan Tarayıcı
    (sleep 2 && open -a "Google Chrome" --args --app="http://localhost:3000" 2>/dev/null || open "http://localhost:3000") &
else
    # Linux - Chrome App Modu veya xdg-open
    (sleep 2 && google-chrome --app="http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null) &
fi

# 6. TSX ile Sunucuyu Canlı Çalıştır
npx tsx server.ts || npm start