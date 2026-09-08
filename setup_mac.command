#!/bin/bash
# Çalışılan proje dizinine dinamik kilitlen
TARGET_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$TARGET_DIR"

clear
echo "=============================================================================="
echo "    NOVA BROWSER V54 - macOS PRODUCTION DEPLOYER"
echo "=============================================================================="
echo ""

# 1. Kütüphaneleri kontrol et
if [ -d "node_modules" ]; then
    echo "[1/2] Kütüphaneler zaten yüklü, indirme atlandı."
else
    echo "[1/2] Kütüphaneler kuruluyor..."
    npm install --no-audit --no-fund
fi

# 2. Apple .app Paketini İnşa Et
echo "[2/2] Apple uygulama simgesi hazırlanıyor..."
SHORTCUT_PATH="$HOME/Desktop/Nova Browser V54.app"
rm -rf "$SHORTCUT_PATH"
mkdir -p "$SHORTCUT_PATH/Contents/MacOS"
mkdir -p "$SHORTCUT_PATH/Contents/Resources"

# Mavi Nova İkonunu kopyala
if [ -f "$TARGET_DIR/assets/favicon.png" ]; then
    cp "$TARGET_DIR/assets/favicon.png" "$SHORTCUT_PATH/Contents/Resources/app_icon.png" 2>/dev/null
fi

cat << 'EOF' > "$SHORTCUT_PATH/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>core_run</string>
    <key>CFBundleIconFile</key>
    <string>app_icon</string>
    <key>CFBundleName</key>
    <string>Nova Browser V54</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

# Arka planda gizli çalışacak Apple yürütücüsü
cat << 'EOF' > "$SHORTCUT_PATH/Contents/MacOS/core_run"
#!/bin/bash
# M1/M2/M3 ve Intel Mac'lerde Node.js yolunu otomatik algıla
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

APP_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
# Eğer app masaüstündeyse projenin ana klasörünü bul
if [ ! -f "$APP_DIR/package.json" ]; then
    APP_DIR="$HOME/Desktop/nova-browser-v54/nova-browser-v54/nova-browser-v54/nova-browser-v54"
fi

cd "$APP_DIR"
# Port 3000 çakışmasını temizle
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Sunucuyu arka planda sessizce başlat (Terminal açılmaz)
npx tsx server.ts >/dev/null 2>&1 &

# Tarayıcıyı 2 saniye sonra doğrudan uygulama penceresi modunda aç
sleep 2
open -a "Google Chrome" --args --app="http://localhost:3000" 2>/dev/null || open "http://localhost:3000"
EOF

chmod +x "$SHORTCUT_PATH/Contents/MacOS/core_run"
touch "$SHORTCUT_PATH"

echo ""
echo "=============================================================================="
echo "[BAŞARILI] macOS Masaüstü Uygulaması (Gizli Sunuculu) Hazır!"
echo "=============================================================================="