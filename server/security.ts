/**
 * NovaShield - Real-Time Cybersecurity, Anti-Malware, Anti-Phishing & Tracker Shield Engine
 */

export interface SecurityScanResult {
  isSafe: boolean;
  threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'blocked';
  threatType?: 'phishing' | 'malware' | 'cryptominer' | 'clickjacking' | 'deceptive' | 'untrusted_tld';
  threatScore: number; // 0 (safest) to 100 (lethal)
  details: string[];
  blockedTrackersCount: number;
}

// Known malicious / high-risk TLDs and patterns
const HIGH_RISK_TLDS = ['.ru', '.su', '.top', '.zip', '.mov', '.work', '.click', '.gq', '.cf', '.tk', '.ml'];

// Common phishing domain brand impersonations (homoglyphs / typosquats)
const PHISHING_PATTERNS = [
  /paypa[l1i]\.[\w.-]+/i,
  /g[o0]{2}g[l1]e\./i,
  /faceb[o0]{2}k\./i,
  /appl[e1]-security\./i,
  /micr[o0]s[o0]ft-support\./i,
  /binance-login\./i,
  /metamask-wallet\./i,
  /netf[l1]ix-account\./i,
  /turkiye-gov-tr\./i,
  /e-devlet-giris\./i,
  /garanti-bbva-giris\./i,
  /akbank-direkt-giris\./i,
  /isbank-sube-giris\./i,
];

// Crypto drainer / miner script patterns
const CRYPTO_MINER_PATTERNS = [
  'coinhive.min.js',
  'cryptonight.wasm',
  'coin-have.com',
  'crypto-loot.com',
  'webminepool.com',
  'monerominer',
];

// Known invasive ad / tracking network domains to block
export const TRACKER_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'adnxs.com',
  'criteo.com',
  'outbrain.com',
  'taboola.com',
  'scorecardresearch.com',
  'zedo.com',
  'popads.net',
  'propellerads.com',
  'adpushup.com',
  'trafficjunky.net',
  'exoclick.com',
];

/**
 * Perform deep security scan on a URL
 */
export function scanUrlSecurity(rawUrl: string): SecurityScanResult {
  const result: SecurityScanResult = {
    isSafe: true,
    threatLevel: 'safe',
    threatScore: 0,
    details: [],
    blockedTrackersCount: 0,
  };

  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Whitelist trusted major platforms immediately
    const TRUSTED_DOMAINS = [
      'google.com',
      'google.com.tr',
      'youtube.com',
      'youtu.be',
      'poki.com',
      'poki.com.tr',
      'poki.cz',
      'poki.io',
      'poki-gdn.com',
      'crazygames.com',
      'krunker.io',
      'armorgames.com',
      'itch.io',
      'roblox.com',
      'oyunkolu.com',
      '1001oyun.com',
      'friv.com',
      'y8.com',
      'twoplayergames.org',
      'gameflare.com',
      'miniclip.com',
      'chess.com',
      'lichess.org',
      'geoguessr.com',
      'github.com',
      'wikipedia.org',
      'wikimedia.org',
      'w3.org',
      'mozilla.org',
      'openai.com',
      'microsoft.com',
      'apple.com',
      'twitter.com',
      'x.com',
      'reddit.com',
      'stackoverflow.com',
      'medium.com',
      'unsplash.com',
      'open-meteo.com',
      'openweathermap.org',
      'tavily.com',
      'newsapi.org',
      'openlibrary.org',
      'archive.org',
      'hurriyet.com.tr',
      'milliyet.com.tr',
      'ntv.com.tr',
      'sozcu.com.tr',
      'bbc.com',
      'cnn.com',
      'trendyol.com',
      'hepsiburada.com',
      'sahibinden.com',
      'n11.com',
      'amazon.com',
      'amazon.com.tr',
      'spotify.com',
      'netflix.com',
      'twitch.tv',
    ];

    if (TRUSTED_DOMAINS.some((td) => hostname === td || hostname.endsWith('.' + td))) {
      result.isSafe = true;
      result.threatLevel = 'safe';
      result.threatScore = 0;
      result.details.push('Doğrulanmış güvenli alan adı sertifikası (Doğrulanmış Otorite).');
      return result;
    }

    // 1. Phishing & Brand Impersonation check
    for (const pattern of PHISHING_PATTERNS) {
      if (pattern.test(hostname)) {
        result.isSafe = false;
        result.threatLevel = 'dangerous';
        result.threatType = 'phishing';
        result.threatScore = 95;
        result.details.push('Oltalama (Phishing) / Sahte Kimlik Tespiti: Bu web adresi tanınmış bir markayı veya bankacılık arayüzünü taklit ediyor olabilir.');
        return result;
      }
    }

    // 2. High-risk suspicious TLD check
    if (HIGH_RISK_TLDS.some((tld) => hostname.endsWith(tld))) {
      result.threatScore += 45;
      result.details.push('Yüksek riskli TLD uzantısı tespit edildi.');
    }

    // 3. Raw IP address as hostname without SSL
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) && parsed.protocol === 'http:') {
      result.threatScore += 50;
      result.threatType = 'suspicious' as any;
      result.details.push('Şifrelenmemiş doğrudan IP adresi erişimi tespit edildi.');
    }

    // 4. Executable / dangerous direct payload extension in pathname
    const pathname = parsed.pathname.toLowerCase();
    if (/\.(exe|scr|vbs|bat|cmd|pif|hta|msi|ps1)$/.test(pathname)) {
      result.isSafe = false;
      result.threatLevel = 'blocked';
      result.threatType = 'malware';
      result.threatScore = 100;
      result.details.push('Potansiyel Zararlı Yazılım / Çalıştırılabilir Dosya (.exe, .vbs vb.) indirme tuzağı tespit edildi.');
      return result;
    }

    // Calculate final verdict
    if (result.threatScore >= 70) {
      result.isSafe = false;
      result.threatLevel = 'dangerous';
      result.threatType = 'malware';
    } else if (result.threatScore >= 40) {
      result.isSafe = true; // allow with caution
      result.threatLevel = 'suspicious';
    } else {
      result.isSafe = true;
      result.threatLevel = 'safe';
      result.details.push('NovaShield: Güvenli web standardı.');
    }
  } catch {
    // Malformed URL
    result.isSafe = false;
    result.threatLevel = 'suspicious';
    result.threatScore = 50;
    result.details.push('Geçersiz veya şüpheli URL formatı.');
  }

  return result;
}

/**
 * Scan and sanitize HTML content to strip cryptominers, clickjacking traps, and tracker beacons
 */
export function sanitizeAndShieldHtml(
  $: any,
  rawUrl: string
): { sanitizedHtml: string; blockedTrackersCount: number; neutralizedThreats: string[] } {
  let blockedCount = 0;
  const neutralized: string[] = [];

  // 1. Remove dangerous Cryptominers and suspicious scripts
  $('script').each((_: any, el: any) => {
    const src = ($(el).attr('src') || '').toLowerCase();
    const content = $(el).html() || '';

    const hasMiner =
      CRYPTO_MINER_PATTERNS.some((pattern) => src.includes(pattern) || content.includes(pattern));

    if (hasMiner) {
      $(el).remove();
      blockedCount++;
      neutralized.push('Gizli Kripto Para Madenciliği (Crypto Miner) Scripti engellendi.');
    }

    // 2. Remove known Ad / Tracker scripts
    const isTracker = TRACKER_DOMAINS.some((td) => src.includes(td));
    if (isTracker) {
      $(el).remove();
      blockedCount++;
    }
  });

  // 3. Strip deceptive invisible clickjacking full-screen overlays
  $('div, iframe, a').each((_: any, el: any) => {
    const style = ($(el).attr('style') || '').toLowerCase();
    if (
      (style.includes('position:fixed') || style.includes('position: fixed') || style.includes('position:absolute')) &&
      (style.includes('opacity:0') || style.includes('opacity: 0') || style.includes('z-index:99999') || style.includes('z-index: 999999')) &&
      (style.includes('width:100%') || style.includes('height:100%') || style.includes('left:0'))
    ) {
      $(el).remove();
      blockedCount++;
      neutralized.push('Görünmez Tıklama Kaçırma (Clickjacking) katmanı temizlendi.');
    }
  });

  // 4. Remove tracking pixels / 1x1 image beacons
  $('img').each((_: any, el: any) => {
    const w = $(el).attr('width');
    const h = $(el).attr('height');
    const src = ($(el).attr('src') || '').toLowerCase();
    if ((w === '1' && h === '1') || (w === '0' && h === '0') || TRACKER_DOMAINS.some((td) => src.includes(td))) {
      $(el).remove();
      blockedCount++;
    }
  });

  return {
    sanitizedHtml: $.html(),
    blockedTrackersCount: blockedCount,
    neutralizedThreats: neutralized,
  };
}

/**
 * Render a high-impact Cyber Security Warning screen for blocked / malicious sites
 * featuring a strict, mandatory legal waiver & exception form
 */
export function renderSecurityWarningHtml(
  targetUrl: string,
  scanResult: SecurityScanResult
): string {
  let domain = 'web-sitesi';
  try {
    domain = new URL(targetUrl).hostname.replace(/^www\./, '');
  } catch {
    domain = targetUrl;
  }

  const threatName =
    scanResult.threatType === 'phishing'
      ? 'Oltalama (Phishing / Sahte Kimlik) Saldırısı'
      : scanResult.threatType === 'cryptominer'
      ? 'Kripto Para Madencisi (Cryptominer)'
      : scanResult.threatType === 'malware'
      ? 'Zararlı Yazılım / Virüs (Malware) Tehdidi'
      : scanResult.threatType === 'untrusted_tld'
      ? 'Yüksek Riskli Alan Adı / Şüpheli TLD'
      : 'Güvensiz ve Riskli Web Sitesi';

  return `
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NovaShield - Güvenlik Engeli ve Zorunlu Onay Formu</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: #080c14;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px 16px;
          }
          .shield-card {
            background: radial-gradient(circle at top, #1e142b 0%, #0c1220 70%, #080c14 100%);
            border: 2px solid #ef4444;
            box-shadow: 0 0 60px rgba(239, 68, 68, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.85);
            border-radius: 24px;
            max-width: 680px;
            width: 100%;
            padding: 36px 28px;
            position: relative;
            overflow: hidden;
          }
          .badge-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 8px;
          }
          .badge-shield {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.4);
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .badge-score {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(220, 38, 38, 0.25);
            color: #ef4444;
            border: 1px solid #ef4444;
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
          }
          .header-center {
            text-align: center;
            margin-bottom: 20px;
          }
          .icon-circle {
            width: 68px;
            height: 68px;
            background: rgba(239, 68, 68, 0.12);
            border: 2px solid #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 16px;
            box-shadow: 0 0 28px rgba(239, 68, 68, 0.4);
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .subtext {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
          }
          .url-box {
            background: #030712;
            border: 1px solid #374151;
            border-radius: 10px;
            padding: 10px 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #f87171;
            word-break: break-all;
            margin: 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .reasons-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(75, 85, 99, 0.4);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 20px;
          }
          .reasons-box h4 {
            font-size: 11px;
            color: #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .reasons-box ul {
            list-style: none;
            padding: 0;
          }
          .reasons-box li {
            font-size: 12px;
            color: #fca5a5;
            display: flex;
            align-items: flex-start;
            gap: 6px;
            margin-bottom: 4px;
            line-height: 1.4;
          }
          .safe-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
          }
          .btn-primary {
            flex: 1;
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: #2563eb;
            color: white;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .btn-primary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
          .waiver-toggle-btn {
            width: 100%;
            background: rgba(30, 41, 59, 0.6);
            border: 1px dashed #64748b;
            color: #cbd5e1;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .waiver-toggle-btn:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: #94a3b8;
          }
          .waiver-form {
            background: #0f172a;
            border: 1px solid #b91c1c;
            border-radius: 14px;
            padding: 20px;
            margin-top: 16px;
            display: none;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .disclaimer-banner {
            background: rgba(220, 38, 38, 0.15);
            border-left: 4px solid #ef4444;
            padding: 12px 14px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 12px;
            line-height: 1.5;
            color: #fecaca;
          }
          .disclaimer-banner strong {
            color: #ffffff;
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
          }
          .form-group {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
            cursor: pointer;
            user-select: none;
          }
          .form-group input[type="checkbox"] {
            width: 17px;
            height: 17px;
            margin-top: 2px;
            accent-color: #dc2626;
            cursor: pointer;
            shrink: 0;
          }
          .form-group span {
            font-size: 12px;
            color: #cbd5e1;
            line-height: 1.4;
          }
          .text-challenge {
            margin: 16px 0;
            background: #030712;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #374151;
          }
          .text-challenge label {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 6px;
          }
          .text-challenge input[type="text"] {
            width: 100%;
            background: #111827;
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: 8px 12px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            font-family: monospace;
            outline: none;
          }
          .text-challenge input[type="text"]:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          }
          .btn-danger-submit {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-danger-submit.enabled {
            background: #dc2626;
            color: white;
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
            cursor: pointer;
          }
          .btn-danger-submit.enabled:hover {
            background: #b91c1c;
          }
          .btn-danger-submit.disabled {
            background: #1f2937;
            color: #6b7280;
            cursor: not-allowed;
            opacity: 0.6;
          }
          .help-note {
            font-size: 11px;
            color: #64748b;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="shield-card">
          <div class="badge-row">
            <div class="badge-shield">🛡️ NovaShield Koruma Kalkanı</div>
            <div class="badge-score">⚠️ Tehdit Skoru: %${scanResult.threatScore}</div>
          </div>

          <div class="header-center">
            <div class="icon-circle">🚫</div>
            <h1>${threatName}</h1>
            <p class="subtext">
              NovaShield Güvenlik Sistemi, bu web sitesinin güvenliğinizi, kimlik bilgilerinizi veya cihazınızı riske atabileceğini tespit etti ve bağlantıyı engelledi.
            </p>
          </div>

          <div class="url-box">
            <span>🔴</span>
            <span>${targetUrl}</span>
          </div>

          <div class="reasons-box">
            <h4>Tespit Edilen Güvenlik Tehditleri:</h4>
            <ul>
              ${scanResult.details.map((d) => `<li><span>⚠️</span><span>${d}</span></li>`).join('')}
            </ul>
          </div>

          <div class="safe-actions">
            <button class="btn-primary" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'nova://search'}, '*')">
              🏠 Güvenli Ana Sayfaya Dön
            </button>
            <button class="btn-primary" style="background:#0284c7;" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'https://www.google.com'}, '*')">
              🔍 Google'da Güvenle Ara
            </button>
          </div>

          <!-- Strict Mandatory Waiver Accordion & Form -->
          <button type="button" class="waiver-toggle-btn" id="btn-toggle-waiver" onclick="toggleWaiverForm()">
            <span>⚠️ Bu Güvensiz Site İçin Özel Onay ve Sorumluluk Formunu Aç</span>
            <span id="waiver-arrow">▼</span>
          </button>

          <div class="waiver-form" id="waiver-form-container">
            <div class="disclaimer-banner">
              <strong>ZORUNLU SORUMLULUK FERAGATNAMESİ:</strong>
              Bu web sitesi güvenli olarak doğrulanmamıştır ve zararlı/şüpheli öğeler barındırabilir. Siteyi açmak istiyorsanız ve onaylıyorsanız; gelişebilecek ve olan bütün olaylardan (virüs/zararlı yazılım bulaşması, veri kaybı, dolandırıcılık veya güvenlik açıkları) Nova Browser, altyapı sağlayıcıları ve geliştiricileri <u>KESİNLİKLE SORUMLU DEĞİLDİR</u>. Tüm sorumluluk kullanıcıya aittir.
            </div>

            <form id="strict-unsafe-form" onsubmit="handleFormSubmit(event)">
              <label class="form-group">
                <input type="checkbox" id="check-1" onchange="validateForm()" />
                <span>Bu web sitesinin (${domain}) güvenli olmadığını ve yüksek siber güvenlik riski taşıdığını anladım.</span>
              </label>

              <label class="form-group">
                <input type="checkbox" id="check-2" onchange="validateForm()" />
                <span>Gelişebilecek ve doğabilecek bütün olaylardan, veri kayıplarından ve zararlardan Nova Browser'ın sorumlu olmadığını, tüm sorumluluğu üstlendiğimi onaylıyorum.</span>
              </label>

              <label class="form-group">
                <input type="checkbox" id="check-3" onchange="validateForm()" />
                <span>Yalnızca bu site için NovaShield güvenlik kalkanını geçici olarak kapatmayı ve siteyi açmayı kabul ediyorum.</span>
              </label>

              <div class="text-challenge">
                <label for="text-confirm-input">Onaylamak için kutuya büyük harflerle <strong>ONAYLIYORUM</strong> yazınız:</label>
                <input
                  type="text"
                  id="text-confirm-input"
                  placeholder="ONAYLIYORUM"
                  autocomplete="off"
                  oninput="validateForm()"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-unsafe"
                class="btn-danger-submit disabled"
                disabled
              >
                ⚠️ Riskleri Kabul Ederek Güvenliği Bu Site İçin Kapat ve Aç
              </button>

              <p class="help-note">
                Bu onay yalnızca "${domain}" alan adı için geçerlidir. Diğer tüm web siteleri tam koruma altında kalmaya devam eder.
              </p>
            </form>
          </div>
        </div>

        <script>
          function toggleWaiverForm() {
            var el = document.getElementById('waiver-form-container');
            var arrow = document.getElementById('waiver-arrow');
            if (el.style.display === 'block') {
              el.style.display = 'none';
              arrow.innerText = '▼';
            } else {
              el.style.display = 'block';
              arrow.innerText = '▲';
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }

          function validateForm() {
            var c1 = document.getElementById('check-1').checked;
            var c2 = document.getElementById('check-2').checked;
            var c3 = document.getElementById('check-3').checked;
            var txt = (document.getElementById('text-confirm-input').value || '').trim().toUpperCase();
            var btn = document.getElementById('btn-submit-unsafe');

            var isValid = c1 && c2 && c3 && (txt === 'ONAYLIYORUM' || txt === 'KABUL EDIYORUM' || txt === 'KABUL EDİYORUM');

            if (isValid) {
              btn.disabled = false;
              btn.className = 'btn-danger-submit enabled';
            } else {
              btn.disabled = true;
              btn.className = 'btn-danger-submit disabled';
            }
          }

          function handleFormSubmit(e) {
            e.preventDefault();
            var c1 = document.getElementById('check-1').checked;
            var c2 = document.getElementById('check-2').checked;
            var c3 = document.getElementById('check-3').checked;
            var txt = (document.getElementById('text-confirm-input').value || '').trim().toUpperCase();

            if (!c1 || !c2 || !c3 || (txt !== 'ONAYLIYORUM' && txt !== 'KABUL EDIYORUM' && txt !== 'KABUL EDİYORUM')) {
              alert('Lütfen formdaki tüm 3 onay kutusunu işaretleyin ve kutuya ONAYLIYORUM yazınız.');
              return;
            }

            var targetUrl = ${JSON.stringify(targetUrl)};
            var domain = ${JSON.stringify(domain)};
            var threatType = ${JSON.stringify(scanResult.threatType || 'unknown')};
            var threatScore = ${scanResult.threatScore};

            // Notify parent Nova Browser to register this site in local approved unsafe list
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'NOVA_APPROVE_UNSAFE_SITE',
                domain: domain,
                url: targetUrl,
                threatType: threatType,
                threatScore: threatScore,
                approvedAt: new Date().toISOString()
              }, '*');
            }

            // Redirect through proxy with bypass token
            window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl) + '&bypass_shield=1&bypass_domain=' + encodeURIComponent(domain);
          }
        </script>
      </body>
    </html>
  `;
}

