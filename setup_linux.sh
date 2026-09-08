#!/bin/bash
PROJ_DIR="C:/Users/wq/Desktop/nova-browser-v54/nova-browser-v54/nova-browser-v54/nova-browser-v54"
if [ ! -d "$PROJ_DIR" ]; then
  PROJ_DIR="$(cd "$(dirname "$0")" && pwd)"
fi
cd "$PROJ_DIR"

clear
echo "=============================================================================="
echo "    NOVA BROWSER V54 - LINUX PRODUCTION DEPLOYER"
echo "=============================================================================="
echo ""

# Paketler zaten varsa tekrar indirme yapma
if [ -d "node_modules" ]; then
    echo "[1/2] Kütüphaneler zaten mevcut, indirme atlandı."
else
    echo "[1/2] Kütüphaneler kuruluyor..."
    npm install --no-audit --no-fund
fi

echo "[2/2] Linux masaüstü başlatıcısı ekleniyor..."
LINUX_DESKTOP="$HOME/Desktop/nova-browser.desktop"
ICON_PATH="$PROJ_DIR/assets/favicon.png"
if [ ! -f "$ICON_PATH" ]; then
    ICON_PATH="$PROJ_DIR/assets/favicon.ico"
fi

cat << EOF > "$LINUX_DESKTOP"
[Desktop Entry]
Version=1.0
Type=Application
Name=Nova Browser V54
Exec=bash -c "cd '$PROJ_DIR' && (lsof -ti:3000 | xargs kill -9 2>/dev/null); npx tsx server.ts & sleep 2 && (google-chrome --app='http://localhost:3000' || xdg-open 'http://localhost:3000')"
Icon=$ICON_PATH
Terminal=false
Categories=Network;WebBrowser;
EOF

chmod +x "$LINUX_DESKTOP"
echo "[BAŞARILI] Linux Başlatıcısı assets logosuyla masaüstüne eklendi!"