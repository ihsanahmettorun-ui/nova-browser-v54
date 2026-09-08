import { extractYouTubeId, isYouTubeUrl } from './youtube.js';

export function renderYouTubeAppHtml(url: string, videoId: string | null): string {
  let initialQuery = '';
  try {
    const parsed = new URL(url);
    initialQuery = parsed.searchParams.get('search_query') || parsed.searchParams.get('q') || '';
  } catch {
    // ignore
  }

  const isWatchMode = Boolean(videoId);
  const currentVid = videoId || '';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouTube HD - Nova Browser</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --yt-red: #ff0000;
      --yt-bg: #0f0f0f;
      --yt-card: #181818;
      --yt-border: #272727;
      --yt-text: #f1f1f1;
      --yt-muted: #aaaaaa;
      --yt-chip-bg: #272727;
      --yt-chip-active: #ffffff;
    }
    body {
      background: var(--yt-bg);
      color: var(--yt-text);
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    /* Top Bar */
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--yt-border);
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .yt-icon {
      background: #ff0000;
      color: #fff;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 13px;
      letter-spacing: -0.5px;
      box-shadow: 0 0 12px rgba(255, 0, 0, 0.4);
    }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .logo-text span {
      font-size: 11px;
      color: #38bdf8;
      margin-left: 4px;
      font-weight: 500;
      background: rgba(56, 189, 248, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .nav-center {
      flex: 1;
      max-width: 600px;
    }
    .search-form {
      display: flex;
      width: 100%;
      background: #121212;
      border: 1px solid #303030;
      border-radius: 40px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .search-form:focus-within {
      border-color: #3ea6ff;
    }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 9px 18px;
      color: #fff;
      font-size: 14px;
      outline: none;
    }
    .search-btn {
      background: #222222;
      border: none;
      border-left: 1px solid #303030;
      color: #fff;
      padding: 0 20px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .search-btn:hover {
      background: #333;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .api-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      padding: 5px 10px;
      border-radius: 20px;
      border: 1px solid rgba(34, 197, 94, 0.3);
      font-weight: 500;
    }
    .api-badge-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
    }
    .ext-btn {
      background: #272727;
      color: #fff;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 18px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.2s;
      border: 1px solid #3a3a3a;
    }
    .ext-btn:hover {
      background: #3f3f3f;
    }
    /* Main Layout */
    .container {
      flex: 1;
      padding: 16px 24px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }
    /* Categories */
    .chips-wrapper {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 16px;
      scrollbar-width: none;
    }
    .chips-wrapper::-webkit-scrollbar { display: none; }
    .chip {
      background: var(--yt-chip-bg);
      color: var(--yt-text);
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .chip:hover {
      background: #3f3f3f;
    }
    .chip.active {
      background: #fff;
      color: #0f0f0f;
    }
    /* Watch Layout */
    .watch-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media (min-width: 1024px) {
      .watch-layout {
        grid-template-columns: 1fr 380px;
      }
    }
    .player-box {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid #262626;
    }
    .player-box iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .video-details {
      margin-top: 14px;
    }
    .video-title {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .video-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--yt-border);
    }
    .channel-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .channel-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e11d48;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #fff;
      font-size: 16px;
    }
    .channel-name {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
    }
    .subscribe-btn {
      background: #fff;
      color: #0f0f0f;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .subscribe-btn:hover {
      background: #e5e5e5;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      background: #272727;
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .action-btn:hover {
      background: #3a3a3a;
    }
    /* Video Grid */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px 16px;
    }
    .video-card {
      background: transparent;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .video-card:hover .thumb-img {
      transform: scale(1.04);
    }
    .thumb-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      background: #202020;
    }
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .duration-badge {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .video-card:hover .play-overlay {
      opacity: 1;
    }
    .play-icon-circle {
      width: 44px;
      height: 44px;
      background: rgba(255, 0, 0, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .play-icon-circle svg {
      width: 20px;
      height: 20px;
      fill: #fff;
      margin-left: 2px;
    }
    .meta {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }
    .meta-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #334155;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: bold;
      color: #94a3b8;
    }
    .meta-details {
      flex: 1;
      overflow: hidden;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
      color: #f1f1f1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .card-channel {
      font-size: 12px;
      color: var(--yt-muted);
      margin-bottom: 2px;
    }
    .card-subinfo {
      font-size: 12px;
      color: var(--yt-muted);
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Loading Spinner */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 16px;
      color: var(--yt-muted);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--yt-red);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- Header / Navigation Bar -->
  <header class="nav">
    <a href="https://www.youtube.com" onclick="navigateHome(event)" class="nav-left">
      <div class="logo-badge">
        <div class="yt-icon">▶</div>
        <div class="logo-text">YouTube <span>HD ENGINE</span></div>
      </div>
    </a>

    <div class="nav-center">
      <form class="search-form" onsubmit="handleSearchSubmit(event)">
        <input
          id="search-box"
          class="search-input"
          type="text"
          placeholder="YouTube'da Ara veya Video URL'si Girin..."
          value="${initialQuery ? initialQuery.replace(/"/g, '&quot;') : ''}"
        />
        <button type="submit" class="search-btn">
          🔍
        </button>
      </form>
    </div>

    <div class="nav-right">
      <div id="api-status-badge" class="api-badge">
        <span class="api-badge-dot"></span>
        <span id="api-status-text">YouTube API v3 Aktif</span>
      </div>
      <a href="${url}" target="_blank" class="ext-btn">
        Resmi Sitede Aç ↗
      </a>
    </div>
  </header>

  <main class="container">
    ${
      isWatchMode
        ? `
    <!-- Watch Video View -->
    <div class="watch-layout">
      <div class="watch-main">
        <div class="player-box">
          <iframe
            id="yt-active-iframe"
            src="https://www.youtube-nocookie.com/embed/${currentVid}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        <div class="video-details">
          <h1 id="active-video-title" class="video-title">YouTube HD Video</h1>
          <div class="video-actions">
            <div class="channel-info">
              <div class="channel-avatar">YT</div>
              <div>
                <div id="active-channel-name" class="channel-name">YouTube Kanalı</div>
                <div style="font-size: 12px; color: #888;">Resmi İçerik</div>
              </div>
              <button class="subscribe-btn">Abone Ol</button>
            </div>
            <div class="action-buttons">
              <button class="action-btn" id="btn-like" onclick="this.innerHTML = '❤️ Beğenildi'; this.style.color = '#ef4444';">👍 Beğen</button>
              <button class="action-btn" id="btn-share" onclick="copyVideoLink('${currentVid}')">🔗 Paylaş</button>
              <button class="action-btn" onclick="navigateHome()">🏠 Ana Sayfa</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 class="section-title">İlgili ve Popüler Videolar</h3>
          <div id="related-videos-grid" class="video-grid">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Videolar yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="watch-sidebar">
        <h3 class="section-title" style="font-size: 15px;">Önerilen Sıradaki Videolar</h3>
        <div id="sidebar-videos-list" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    </div>
    `
        : `
    <!-- Home / Trending / Search View -->
    <div class="chips-wrapper">
      <button class="chip active" onclick="filterCategory('trending', this)">🔥 Trendler</button>
      <button class="chip" onclick="filterCategory('Müzik', this)">🎵 Müzik</button>
      <button class="chip" onclick="filterCategory('Oyun', this)">🎮 Oyun</button>
      <button class="chip" onclick="filterCategory('Haberler', this)">📰 Haberler</button>
      <button class="chip" onclick="filterCategory('Teknoloji', this)">💻 Teknoloji</button>
      <button class="chip" onclick="filterCategory('Spor', this)">🏆 Spor</button>
      <button class="chip" onclick="filterCategory('Sinema', this)">🎬 Sinema</button>
      <button class="chip" onclick="filterCategory('Eğitim', this)">🎓 Eğitim</button>
      <button class="chip" onclick="filterCategory('Komedi', this)">😄 Komedi</button>
    </div>

    <div id="home-video-grid" class="video-grid">
      <div class="loading-state" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>YouTube içerikleri yükleniyor...</p>
      </div>
    </div>
    `
    }
  </main>

  <script>
    const isWatch = ${isWatchMode ? 'true' : 'false'};
    const currentVideoId = '${currentVid}';
    let userApiKey = '';

    // Read configured user API key from localStorage if available
    try {
      const storageKeyNames = ['nova_browser_api_keys_v54', 'nova_browser_api_keys', 'nova_api_keys'];
      for (const kName of storageKeyNames) {
        const raw = localStorage.getItem(kName);
        if (raw) {
          const keys = JSON.parse(raw);
          if (Array.isArray(keys)) {
            const yt = keys.find(k => (k.serviceKey === 'youtube' || k.id === 'api_youtube') && k.apiKey);
            if (yt && yt.apiKey && yt.apiKey.trim().length > 0) {
              userApiKey = yt.apiKey.trim();
              break;
            }
          }
        }
      }
    } catch(e) {}

    // Update status badge
    const statusTextEl = document.getElementById('api-status-text');
    if (statusTextEl) {
      if (userApiKey) {
        statusTextEl.textContent = 'Özel YouTube API v3 Aktif 🟢';
      } else {
        statusTextEl.textContent = 'YouTube HD Motoru Aktif 🟢';
      }
    }

    function handleSearchSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('search-box');
      const q = (input ? input.value : '').trim();
      if (!q) return;

      // If user pasted a YouTube video URL directly
      const match = q.match(/(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/|shorts\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i);
      if (match && match[1]) {
        playVideo(match[1]);
        return;
      }

      if (isWatch) {
        // Navigate back to YouTube results or load directly
        loadSearchResults(q);
      } else {
        loadSearchResults(q);
      }
    }

    function navigateHome(e) {
      if (e) e.preventDefault();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'NOVA_NAVIGATE', url: 'https://www.youtube.com' }, '*');
      } else {
        window.location.href = '/api/proxy?url=' + encodeURIComponent('https://www.youtube.com');
      }
    }

    function playVideo(vidId, title, channel) {
      const targetUrl = 'https://www.youtube.com/watch?v=' + vidId;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'NOVA_NAVIGATE', url: targetUrl }, '*');
      } else {
        window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl);
      }
    }

    function copyVideoLink(vidId) {
      const link = 'https://www.youtube.com/watch?v=' + vidId;
      const shareBtn = document.getElementById('btn-share');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          if (shareBtn) {
            const orig = shareBtn.innerHTML;
            shareBtn.innerHTML = '✅ Kopyalandı!';
            setTimeout(() => { shareBtn.innerHTML = orig; }, 2000);
          }
        }).catch(() => {
          if (shareBtn) shareBtn.innerHTML = '✅ Bağlantı Hazır';
        });
      }
    }

    async function filterCategory(category, btn) {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const grid = document.getElementById('home-video-grid');
      if (grid) {
        grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><div class="spinner"></div><p>' + category + ' videoları yükleniyor...</p></div>';
      }

      if (category === 'trending') {
        loadTrendingVideos();
      } else {
        loadSearchResults(category);
      }
    }

    async function loadTrendingVideos() {
      const grid = document.getElementById('home-video-grid');
      if (!grid) return;

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/trending?region=TR' + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          renderVideoCards(data.videos, grid);
        } else {
          loadSearchResults('trend videolar');
        }
      } catch (err) {
        loadSearchResults('trend videolar');
      }
    }

    async function loadSearchResults(query) {
      const grid = document.getElementById('home-video-grid') || document.getElementById('related-videos-grid');
      if (!grid) return;

      grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><div class="spinner"></div><p>"' + query + '" için videolar aranıyor...</p></div>';

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/search?q=' + encodeURIComponent(query) + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          renderVideoCards(data.videos, grid);
        } else {
          grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>Video bulunamadı.</p></div>';
        }
      } catch (err) {
        grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>Videolar yüklenirken bir hata oluştu.</p></div>';
      }
    }

    async function loadWatchRelated(videoId) {
      const relatedGrid = document.getElementById('related-videos-grid');
      const sidebarList = document.getElementById('sidebar-videos-list');

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/search?q=populer müzik videoları' + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          if (relatedGrid) renderVideoCards(data.videos.slice(0, 12), relatedGrid);
          if (sidebarList) {
            sidebarList.innerHTML = data.videos.slice(0, 8).map(v => \`
              <div onclick="playVideo('\${v.id}')" style="display:flex; gap:10px; cursor:pointer; background:#181818; padding:8px; border-radius:10px; transition:background 0.2s;">
                <img src="\${v.thumbnail}" style="width:110px; aspect-ratio:16/9; object-fit:cover; border-radius:8px;" />
                <div style="overflow:hidden;">
                  <div style="font-size:12px; font-weight:600; color:#fff; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">\${v.title}</div>
                  <div style="font-size:11px; color:#aaa; margin-top:4px;">\${v.channel}</div>
                </div>
              </div>
            \`).join('');
          }
        }
      } catch(e) {}
    }

    function renderVideoCards(videos, container) {
      container.innerHTML = videos.map(v => {
        const firstLetter = (v.channel || 'Y').charAt(0).toUpperCase();
        const durationHtml = v.duration ? '<div class="duration-badge">' + v.duration + '</div>' : '';
        const viewsHtml = v.views ? '<span>' + v.views + '</span>' : '';
        const timeHtml = v.publishedTime ? '<span>• ' + v.publishedTime + '</span>' : '';

        return \`
          <div class="video-card" onclick="playVideo('\${v.id}', '\${encodeURIComponent(v.title)}', '\${encodeURIComponent(v.channel)}')">
            <div class="thumb-wrapper">
              <img class="thumb-img" src="\${v.thumbnail}" alt="\${v.title}" loading="lazy" />
              \${durationHtml}
              <div class="play-overlay">
                <div class="play-icon-circle">
                  <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
            </div>
            <div class="meta">
              <div class="meta-avatar">\${firstLetter}</div>
              <div class="meta-details">
                <div class="card-title" title="\${v.title}">\${v.title}</div>
                <div class="card-channel">\${v.channel}</div>
                <div class="card-subinfo">\${viewsHtml} \${timeHtml}</div>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Auto-initialize based on current mode
    window.addEventListener('DOMContentLoaded', () => {
      const query = '${initialQuery ? initialQuery.replace(/'/g, "\\'") : ''}';
      if (isWatch) {
        loadWatchRelated(currentVideoId);
      } else if (query) {
        loadSearchResults(query);
      } else {
        loadTrendingVideos();
      }
    });
  </script>
</body>
</html>
  `;
}
