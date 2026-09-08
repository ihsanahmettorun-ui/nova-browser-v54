import {
  BrowserAccount,
  HistoryEntry,
  Bookmark,
  BrowserThemeConfig,
  ThemePreset,
  MandatoryConsentState,
  DownloadItem,
  TopSite,
  CustomApiKey,
  ApprovedUnsafeSite,
  DesktopSetupConfig,
  UserAccountBackupData,
} from '../types.ts';

const STORAGE_KEYS = {
  CONSENT: 'nova_consent_v54',
  ACTIVE_ACCOUNT: 'nova_active_account_v54',
  ACCOUNTS_LIST: 'nova_accounts_list_v54',
  HISTORY: 'nova_browser_history_v54',
  BOOKMARKS: 'nova_browser_bookmarks_v54',
  THEME: 'nova_browser_theme_v54',
  DOWNLOADS: 'nova_browser_downloads_v54',
  LANGUAGE: 'nova_browser_lang_v54',
  ZOOM: 'nova_browser_zoom_v54',
  TABS_SESSION: 'nova_browser_tabs_v54',
  TOP_SITES: 'nova_browser_topsites_v54',
  API_KEYS: 'nova_browser_api_keys_v54',
  UNSAFE_SITES: 'nova_browser_approved_unsafe_sites_v54',
  SETUP_CONFIG: 'nova_browser_desktop_setup_v54',
  GAME_STATS: 'nova_browser_game_stats_v54',
};

// Broadcast channel for multi-tab/window real-time synchronization
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('nova_browser_sync');
  }
} catch {
  // fallback to window storage events
}

export function broadcastAccountChange(account: BrowserAccount | null) {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'ACCOUNT_CHANGED', account });
    }
  } catch {
    // ignore
  }
}

export function subscribeToBrowserSync(callback: (type: string, payload: any) => void): () => void {
  const handleBcMessage = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data.type, event.data);
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.ACTIVE_ACCOUNT) {
      try {
        const account = event.newValue ? JSON.parse(event.newValue) : null;
        callback('ACCOUNT_CHANGED', { account });
      } catch {
        // ignore
      }
    }
    if (event.key === STORAGE_KEYS.THEME) {
      try {
        const theme = event.newValue ? JSON.parse(event.newValue) : null;
        callback('THEME_CHANGED', { theme });
      } catch {
        // ignore
      }
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handleBcMessage);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

// 1. Mandatory Consent
export function getConsentState(): MandatoryConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConsentState(state: MandatoryConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// 2. Active Account
export function getActiveAccount(): BrowserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // Default guest profile if none
  const defaultGuest: BrowserAccount = {
    id: 'guest_primary',
    name: 'Nova Kullanıcısı',
    email: 'kullanici@novabrowser.local',
    avatarColor: '#6366f1',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  saveActiveAccount(defaultGuest);
  return defaultGuest;
}

export function saveActiveAccount(account: BrowserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, JSON.stringify(account));
  } catch {
    // ignore
  }
  broadcastAccountChange(account);
}

export function getAccountsList(): BrowserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_LIST);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {
    // ignore
  }
  const initial = [getActiveAccount()];
  saveAccountsList(initial);
  return initial;
}

export function saveAccountsList(accounts: BrowserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

// 3. History Management (Categorized by Year, Month, Day)
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function addHistoryEntry(url: string, title: string): HistoryEntry {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = MONTH_NAMES[now.getMonth()];
  const day = now.getDate();
  const dayName = DAY_NAMES[now.getDay()];
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const entry: HistoryEntry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    url: url || 'nova://newtab',
    title: title || url || 'Yeni Sekme',
    timestamp: now.getTime(),
    year,
    month,
    monthName,
    day,
    dayName,
    timeStr,
  };

  try {
    const list = getHistory();
    // Do not add consecutive exact duplicates
    if (list.length > 0 && list[0].url === entry.url) {
      return list[0];
    }
    const updated = [entry, ...list].slice(0, 1000); // keep up to 1000 items
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return entry;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function deleteHistoryItem(id: string): void {
  try {
    const list = getHistory().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// 4. Bookmarks
export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // Default bookmarks
  const defaultBookmarks: Bookmark[] = [
    { id: 'b1', title: 'Vikipedi Özgür Ansiklopedi', url: 'https://tr.wikipedia.org', createdAt: Date.now() },
    { id: 'b2', title: 'DuckDuckGo Arama', url: 'https://duckduckgo.com', createdAt: Date.now() },
    { id: 'b3', title: 'GitHub Geliştirici Platformu', url: 'https://github.com', createdAt: Date.now() },
    { id: 'b4', title: 'Open Library Kitaplar', url: 'https://openlibrary.org', createdAt: Date.now() },
    { id: 'b5', title: 'Internet Archive', url: 'https://archive.org', createdAt: Date.now() },
  ];
  saveBookmarks(defaultBookmarks);
  return defaultBookmarks;
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
}

export function toggleBookmark(title: string, url: string): boolean {
  const current = getBookmarks();
  const existsIndex = current.findIndex(b => b.url === url);
  if (existsIndex >= 0) {
    current.splice(existsIndex, 1);
    saveBookmarks(current);
    return false; // removed
  } else {
    current.push({
      id: `bm_${Date.now()}`,
      title: title || url,
      url,
      createdAt: Date.now(),
    });
    saveBookmarks(current);
    return true; // added
  }
}

// 5. Themes
export const DEFAULT_THEME: BrowserThemeConfig = {
  preset: 'chrome-dark',
  accentColor: '#3b82f6',
  tabBarBg: '#1e293b',
  headerBg: '#1e293b',
  contentBg: '#0f172a',
  textColor: '#e2e8f0',
};

export const THEME_PRESETS: Record<ThemePreset, BrowserThemeConfig> = {
  'chrome-dark': {
    preset: 'chrome-dark',
    accentColor: '#3b82f6',
    tabBarBg: '#1e293b',
    headerBg: '#1e293b',
    contentBg: '#0f172a',
    textColor: '#e2e8f0',
  },
  'chrome-light': {
    preset: 'chrome-light',
    accentColor: '#2563eb',
    tabBarBg: '#e2e8f0',
    headerBg: '#ffffff',
    contentBg: '#f8fafc',
    textColor: '#0f172a',
  },
  'midnight-blue': {
    preset: 'midnight-blue',
    accentColor: '#38bdf8',
    tabBarBg: '#0f172a',
    headerBg: '#1e293b',
    contentBg: '#020617',
    textColor: '#e0f2fe',
  },
  'emerald': {
    preset: 'emerald',
    accentColor: '#10b981',
    tabBarBg: '#064e3b',
    headerBg: '#065f46',
    contentBg: '#022c22',
    textColor: '#ecfdf5',
  },
  'neon-purple': {
    preset: 'neon-purple',
    accentColor: '#a855f7',
    tabBarBg: '#1e1035',
    headerBg: '#2e1065',
    contentBg: '#130924',
    textColor: '#faf5ff',
  },
  'amber-gold': {
    preset: 'amber-gold',
    accentColor: '#f59e0b',
    tabBarBg: '#271b07',
    headerBg: '#451a03',
    contentBg: '#180e03',
    textColor: '#fffbeb',
  },
  'sunset-rose': {
    preset: 'sunset-rose',
    accentColor: '#f43f5e',
    tabBarBg: '#2e0e18',
    headerBg: '#4c0519',
    contentBg: '#1f070f',
    textColor: '#fff1f2',
  },
  'custom': {
    preset: 'custom',
    accentColor: '#3b82f6',
    tabBarBg: '#0f172a',
    headerBg: '#1e293b',
    contentBg: '#0b1120',
    textColor: '#f8fafc',
  },
};

export function getBrowserTheme(): BrowserThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function saveBrowserTheme(theme: BrowserThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  } catch {
    // ignore
  }
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'THEME_CHANGED', theme });
    }
  } catch {
    // ignore
  }
}

// 6. Downloads Management (Chrome-style with mandatory liability disclaimer on every download)
export const DOWNLOAD_DISCLAIMER_TEXT =
  "UYARI VE KESİN SORUMLULUK REDDİ: Bu uygulamanın yapımcısı ve yazarı Orhan Süleyman Torun'dur. İndirilen ve yapılan bütün işlemlerden, dosyalardan, virüs, veri kaybı, hasar veya doğabilecek her türlü olay ve hukuki sonuçtan yapımcı Orhan Süleyman Torun kesinlikle sorumlu tutulamaz. Tüm sorumluluk münhasıran kullanıcıya aittir.";

export const OFFICIAL_LEGAL_RECORD_FILENAME =
  'NovaBrowser_Hukuki_Onay_Belgesi_Orhan_Suleyman_Torun.txt';

export function isLegalRecord(item: DownloadItem | null | undefined): boolean {
  if (!item) return false;
  if (item.isLegalConsentRecord) return true;
  const name = (item.filename || '').toLowerCase();
  return (
    name.includes('hukuki_onay_belgesi') ||
    name.includes('orhan_suleyman_torun') ||
    name.includes('sorumluluk_reddi') ||
    name.includes('legal_consent')
  );
}

export function getDownloads(): DownloadItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    if (!raw) {
      return [];
    }
    const parsed: DownloadItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      disclaimer: item.disclaimer || DOWNLOAD_DISCLAIMER_TEXT,
      isLegalConsentRecord: isLegalRecord(item),
    }));
  } catch {
    return [];
  }
}

export function saveDownloads(list: DownloadItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(list));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'DOWNLOADS_UPDATED', downloads: list });
    }
    window.dispatchEvent(new CustomEvent('nova_downloads_change', { detail: list }));
  } catch {
    // ignore
  }
}

export function addDownload(
  url: string,
  filename?: string,
  size = '2.8 MB',
  fileType?: string,
  startInProgress = false,
  isLegalDoc = false
): DownloadItem {
  const cleanName =
    filename || url.split('/').pop()?.split('?')[0] || `nova-download-${Date.now()}`;
  const ext = cleanName.split('.').pop()?.toLowerCase() || fileType || 'bin';

  const item: DownloadItem = {
    id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    filename: cleanName,
    url,
    size,
    status: startInProgress ? 'in_progress' : 'completed',
    progress: startInProgress ? 15 : 100,
    timestamp: Date.now(),
    speed: startInProgress ? '3.6 MB/sn' : undefined,
    timeLeft: startInProgress ? '4 sn kaldı' : undefined,
    fileType: ext,
    disclaimer: DOWNLOAD_DISCLAIMER_TEXT,
    isLegalConsentRecord: isLegalDoc || isLegalRecord({ filename: cleanName } as any),
  };

  const current = getDownloads();
  const next = [item, ...current.filter((x) => x.id !== item.id)].slice(0, 100);
  saveDownloads(next);

  // If starting in progress, run simulated Chrome progress
  if (startInProgress) {
    let currProg = 15;
    const interval = setInterval(() => {
      currProg += Math.floor(Math.random() * 25) + 15;
      if (currProg >= 100) {
        clearInterval(interval);
        updateDownload(item.id, {
          progress: 100,
          status: 'completed',
          speed: undefined,
          timeLeft: undefined,
        });
      } else {
        const remainingSec = Math.max(1, Math.ceil((100 - currProg) / 25));
        updateDownload(item.id, {
          progress: currProg,
          speed: `${(Math.random() * 2 + 2.5).toFixed(1)} MB/sn`,
          timeLeft: `${remainingSec} sn kaldı`,
        });
      }
    }, 450);
  }

  return item;
}

export function updateDownload(id: string, updates: Partial<DownloadItem>): void {
  const current = getDownloads();
  const next = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        disclaimer: DOWNLOAD_DISCLAIMER_TEXT,
        isLegalConsentRecord: item.isLegalConsentRecord || updates.isLegalConsentRecord,
      };
    }
    return item;
  });
  saveDownloads(next);
}

// Protected Legal Record Deletion Prevention:
// The legal consent document protecting Orhan Süleyman Torun CANNOT be deleted unless the user uninstalls the app completely!
export function deleteDownload(id: string): { success: boolean; requiresAppUninstall?: boolean; item?: DownloadItem } {
  const current = getDownloads();
  const target = current.find((item) => item.id === id);

  if (target && isLegalRecord(target)) {
    // Notify application that a protected legal document deletion was attempted
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nova_legal_record_delete_attempt', {
          detail: {
            item: target,
            producer: 'Orhan Süleyman Torun',
            message:
              'DİKKAT: Bu belge yapımcı Orhan Süleyman Torun\'un sorumluluk muafiyetini gösteren resmi hukuki onay kaydıdır. Bu belgenin silinebilmesi için Nova Browser uygulamasını ve tüm kullanıcı verilerini bilgisayarınızdan tamamen silmeniz (kaldırmanız) zorunludur.',
          },
        })
      );
    }
    return { success: false, requiresAppUninstall: true, item: target };
  }

  const next = current.filter((item) => item.id !== id);
  saveDownloads(next);
  return { success: true };
}

export function clearDownloads(forceAll = false): { deletedCount: number; protectedCount: number } {
  const current = getDownloads();
  if (forceAll) {
    saveDownloads([]);
    return { deletedCount: current.length, protectedCount: 0 };
  }

  // Preserve protected legal consent documents
  const protectedItems = current.filter((item) => isLegalRecord(item));
  const deletedCount = current.length - protectedItems.length;

  saveDownloads(protectedItems);

  if (protectedItems.length > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nova_downloads_cleared_protected_kept', {
        detail: {
          protectedCount: protectedItems.length,
          message:
            'Yapımcı Orhan Süleyman Torun yasal onay belgeleri sistem gereği korunmuştur ve silinmemiştir.',
        },
      })
    );
  }

  return { deletedCount, protectedCount: protectedItems.length };
}

// Complete App Uninstall & All Data Purge:
// Only through full uninstall can legal records be wiped
export function uninstallAppAndResetAll(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    // Dispatch reset notification
    if (syncChannel) {
      syncChannel.postMessage({ type: 'APP_UNINSTALLED_RESET' });
    }
  } catch {
    // ignore
  }
  // Reload clean application state
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function pauseDownload(id: string): void {
  updateDownload(id, {
    status: 'paused',
    speed: undefined,
    timeLeft: 'Duraklatıldı',
  });
}

export function resumeDownload(id: string): void {
  const current = getDownloads().find(x => x.id === id);
  if (!current) return;

  updateDownload(id, {
    status: 'in_progress',
    speed: '3.1 MB/sn',
    timeLeft: 'Devam ediyor...',
  });

  let prog = current.progress;
  const interval = setInterval(() => {
    prog += Math.floor(Math.random() * 20) + 15;
    if (prog >= 100) {
      clearInterval(interval);
      updateDownload(id, {
        progress: 100,
        status: 'completed',
        speed: undefined,
        timeLeft: undefined,
      });
    } else {
      updateDownload(id, {
        progress: prog,
        speed: '3.4 MB/sn',
        timeLeft: `${Math.ceil((100 - prog) / 20)} sn kaldı`,
      });
    }
  }, 450);
}

export function cancelDownload(id: string): void {
  updateDownload(id, {
    status: 'cancelled',
    speed: undefined,
    timeLeft: 'İptal Edildi',
  });
}

export function retryDownload(id: string): void {
  const item = getDownloads().find(x => x.id === id);
  if (!item) return;

  updateDownload(id, {
    status: 'in_progress',
    progress: 10,
    speed: '4.1 MB/sn',
    timeLeft: 'Yeniden başlatılıyor...',
  });

  let prog = 10;
  const interval = setInterval(() => {
    prog += Math.floor(Math.random() * 25) + 15;
    if (prog >= 100) {
      clearInterval(interval);
      updateDownload(id, {
        progress: 100,
        status: 'completed',
        speed: undefined,
        timeLeft: undefined,
      });
    } else {
      updateDownload(id, {
        progress: prog,
        speed: '3.9 MB/sn',
        timeLeft: `${Math.ceil((100 - prog) / 25)} sn kaldı`,
      });
    }
  }, 450);
}

// 7. Language & System-Wide Translation Preferences
const TRANSLATE_STORAGE_KEYS = {
  AUTO_TRANSLATE: 'nova_browser_auto_translate_v54',
  TARGET_TRANSLATE_LANG: 'nova_browser_target_translate_lang_v54',
  ALWAYS_TRANSLATE_LANGS: 'nova_browser_always_translate_langs_v54',
};

export function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'tr';
  } catch {
    return 'tr';
  }
}

export function saveLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch {
    // ignore
  }
}

export function getAutoTranslateEnabled(): boolean {
  try {
    return localStorage.getItem(TRANSLATE_STORAGE_KEYS.AUTO_TRANSLATE) === 'true';
  } catch {
    return false;
  }
}

export function saveAutoTranslateEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(TRANSLATE_STORAGE_KEYS.AUTO_TRANSLATE, String(enabled));
  } catch {
    // ignore
  }
}

export function getTargetTranslateLanguage(): string {
  try {
    return localStorage.getItem(TRANSLATE_STORAGE_KEYS.TARGET_TRANSLATE_LANG) || getSavedLanguage() || 'tr';
  } catch {
    return 'tr';
  }
}

export function saveTargetTranslateLanguage(lang: string): void {
  try {
    localStorage.setItem(TRANSLATE_STORAGE_KEYS.TARGET_TRANSLATE_LANG, lang);
  } catch {
    // ignore
  }
}

export function getAlwaysTranslateLanguages(): string[] {
  try {
    const raw = localStorage.getItem(TRANSLATE_STORAGE_KEYS.ALWAYS_TRANSLATE_LANGS);
    return raw ? JSON.parse(raw) : ['en', 'de', 'fr', 'ru', 'es', 'ja', 'zh'];
  } catch {
    return ['en', 'de', 'fr', 'ru', 'es', 'ja', 'zh'];
  }
}

export function saveAlwaysTranslateLanguages(langs: string[]): void {
  try {
    localStorage.setItem(TRANSLATE_STORAGE_KEYS.ALWAYS_TRANSLATE_LANGS, JSON.stringify(langs));
  } catch {
    // ignore
  }
}

// 8. Sık Ziyaret Edilenler / Top Sites (Kısayollar)
export const DEFAULT_TOP_SITES: TopSite[] = [
  {
    id: 'ts_apexdrive',
    title: 'Araba Oyunu (ApexDrive)',
    url: 'https://apexdrive-global-driving-0000.ai.studio',
    domain: 'apexdrive-global-driving-0000.ai.studio',
    icon: '🏎️',
    color: '#3b82f6',
  },
  {
    id: 'ts_dino',
    title: 'Dinozor Oyunu (Çevrimdışı)',
    url: 'nova://dino',
    domain: 'nova://dino',
    icon: '🦖',
    color: '#f59e0b',
  },
  { id: 'ts_google', title: 'Google', url: 'https://google.com', domain: 'google.com', icon: '🔍', color: '#4285f4' },
  { id: 'ts_youtube', title: 'YouTube', url: 'https://youtube.com', domain: 'youtube.com', icon: '▶️', color: '#ff0000' },
  { id: 'ts_wikipedia', title: 'Vikipedi', url: 'https://tr.wikipedia.org', domain: 'wikipedia.org', icon: '📚', color: '#ffffff' },
  { id: 'ts_github', title: 'GitHub', url: 'https://github.com', domain: 'github.com', icon: '💻', color: '#24292e' },
  { id: 'ts_twitter', title: 'Twitter / X', url: 'https://x.com', domain: 'x.com', icon: '✖️', color: '#1d9bf0' },
  { id: 'ts_reddit', title: 'Reddit', url: 'https://reddit.com', domain: 'reddit.com', icon: '🤖', color: '#ff4500' },
  { id: 'ts_trendyol', title: 'Trendyol', url: 'https://trendyol.com', domain: 'trendyol.com', icon: '🛍️', color: '#f27a1a' },
  { id: 'ts_haberler', title: 'Haberler', url: 'https://haberler.com', domain: 'haberler.com', icon: '📰', color: '#e53e3e' },
  { id: 'ts_eksisozluk', title: 'Ekşi Sözlük', url: 'https://eksisozluk.com', domain: 'eksisozluk.com', icon: '🟢', color: '#2e7d32' },
  { id: 'ts_duckduckgo', title: 'DuckDuckGo', url: 'https://duckduckgo.com', domain: 'duckduckgo.com', icon: '🦆', color: '#de5833' },
  { id: 'ts_openlibrary', title: 'Open Library', url: 'https://openlibrary.org', domain: 'openlibrary.org', icon: '📖', color: '#e1d9cc' },
  { id: 'ts_archive', title: 'Archive.org', url: 'https://archive.org', domain: 'archive.org', icon: '🏛️', color: '#333333' },
];

export function getTopSites(): TopSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOP_SITES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure ApexDrive is present in top sites
        const hasApex = parsed.some(
          (s: TopSite) =>
            s.url.includes('apexdrive') || s.title.toLowerCase().includes('apexdrive')
        );
        if (!hasApex) {
          const updated = [DEFAULT_TOP_SITES[0], ...parsed];
          saveTopSites(updated);
          return updated;
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Initialize defaults
  saveTopSites(DEFAULT_TOP_SITES);
  return DEFAULT_TOP_SITES;
}

export function saveTopSites(sites: TopSite[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOP_SITES, JSON.stringify(sites));
  } catch {
    // ignore
  }
}

export function addTopSite(site: Omit<TopSite, 'id'>): TopSite {
  let domain = 'web';
  try {
    const parsed = new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    domain = site.title.toLowerCase().replace(/\s+/g, '') + '.com';
  }

  const newSite: TopSite = {
    id: `ts_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: site.title.trim() || domain,
    url: site.url.startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
    domain,
    icon: site.icon || '🌐',
    color: site.color || '#3b82f6',
    isCustom: true,
  };

  const current = getTopSites();
  const updated = [newSite, ...current.filter(s => s.url !== newSite.url)];
  saveTopSites(updated);
  return newSite;
}

export function updateTopSite(id: string, updates: Partial<TopSite>): TopSite[] {
  const current = getTopSites();
  const updated = current.map(s => (s.id === id ? { ...s, ...updates } : s));
  saveTopSites(updated);
  return updated;
}

export function deleteTopSite(id: string): TopSite[] {
  const current = getTopSites();
  const updated = current.filter(s => s.id !== id);
  saveTopSites(updated);
  return updated;
}

export function resetDefaultTopSites(): TopSite[] {
  saveTopSites(DEFAULT_TOP_SITES);
  return DEFAULT_TOP_SITES;
}

// -------------------------------------------------------------
// API KEYS & INTEGRATIONS STORAGE
// -------------------------------------------------------------

export const DEFAULT_API_SERVICES: CustomApiKey[] = [
  {
    id: 'api_youtube',
    serviceKey: 'youtube',
    serviceName: 'YouTube Data API v3',
    category: 'video',
    apiKey: '',
    description: 'Google Cloud Console YouTube Data API v3 anahtarı. Video arama, trendler, oynatma listeleri ve video meta verilerini canlı çekmek için kullanılır.',
    docUrl: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_gemini',
    serviceKey: 'gemini',
    serviceName: 'Google Gemini AI',
    category: 'ai',
    apiKey: '',
    description: 'Google AI Studio Gemini API anahtarı. Nova AI Akıllı Özet, web sayfası analizi ve soru-cevap asistanı için kullanılır.',
    docUrl: 'https://aistudio.google.com/app/apikey',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_google_search',
    serviceKey: 'google_search',
    serviceName: 'Google Custom Search (CSE) API',
    category: 'search',
    apiKey: '',
    description: 'Google Programlanabilir Arama Motoru API anahtarı. Google sonuçlarını doğrudan NovaSearch sonuçlarına entegre eder.',
    docUrl: 'https://developers.google.com/custom-search/v1/overview',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_tavily',
    serviceKey: 'tavily',
    serviceName: 'Tavily Real-Time Search API',
    category: 'search',
    apiKey: '',
    description: 'Yapay zeka için optimize edilmiş gerçek zamanlı web arama motoru API anahtarı.',
    docUrl: 'https://tavily.com',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_newsapi',
    serviceKey: 'newsapi',
    serviceName: 'NewsAPI (Haber & Manşetler)',
    category: 'news',
    apiKey: '',
    description: 'Dünya ve Türkiye genelindeki haber kaynaklarından anlık son dakika manşetleri ve makale arama API anahtarı.',
    docUrl: 'https://newsapi.org/register',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_openai',
    serviceKey: 'openai',
    serviceName: 'OpenAI (ChatGPT / GPT-4o)',
    category: 'ai',
    apiKey: '',
    description: 'OpenAI platformu API anahtarı (sk-...). GPT modelleri ve AI destekli web araması için kullanılır.',
    docUrl: 'https://platform.openai.com/api-keys',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_github',
    serviceKey: 'github',
    serviceName: 'GitHub Personal Access Token',
    category: 'developer',
    apiKey: '',
    description: 'GitHub geliştirici tokeni (ghp_...). Repolar, kod aramaları ve GitHub API limitlerini artırmak için kullanılır.',
    docUrl: 'https://github.com/settings/tokens',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_weather',
    serviceKey: 'weather',
    serviceName: 'OpenWeatherMap API',
    category: 'weather',
    apiKey: '',
    description: 'Canlı hava durumu, 7 günlük tahmin ve hava kalitesi verileri için OpenWeather API anahtarı.',
    docUrl: 'https://openweathermap.org/api',
    isActive: false,
    updatedAt: Date.now(),
  },
  {
    id: 'api_unsplash',
    serviceKey: 'unsplash',
    serviceName: 'Unsplash HD Fotoğraf API',
    category: 'search',
    apiKey: '',
    description: 'Yüksek kaliteli telifsiz fotoğraf ve görsel arama için Unsplash Developer API anahtarı.',
    docUrl: 'https://unsplash.com/developers',
    isActive: false,
    updatedAt: Date.now(),
  },
];

export function getCustomApiKeys(): CustomApiKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!raw) {
      // Initialize with defaults
      saveCustomApiKeys(DEFAULT_API_SERVICES);
      return DEFAULT_API_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure any newly introduced default service is present
      const existingKeys = new Set(parsed.map((p: CustomApiKey) => p.serviceKey));
      const missing = DEFAULT_API_SERVICES.filter(d => !existingKeys.has(d.serviceKey));
      if (missing.length > 0) {
        const combined = [...parsed, ...missing];
        saveCustomApiKeys(combined);
        return combined;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_API_SERVICES;
}

export function saveCustomApiKeys(keys: CustomApiKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

export function updateApiKeyEntry(id: string, updates: Partial<CustomApiKey>): CustomApiKey[] {
  const current = getCustomApiKeys();
  const updated = current.map(item => {
    if (item.id === id) {
      const merged = { ...item, ...updates, updatedAt: Date.now() };
      if (updates.apiKey !== undefined) {
        merged.isActive = Boolean(updates.apiKey && updates.apiKey.trim().length > 0);
      }
      return merged;
    }
    return item;
  });
  saveCustomApiKeys(updated);
  return updated;
}

export function addNewCustomApiKey(entry: Omit<CustomApiKey, 'id' | 'updatedAt'>): CustomApiKey[] {
  const current = getCustomApiKeys();
  const newEntry: CustomApiKey = {
    ...entry,
    id: `api_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    isActive: Boolean(entry.apiKey && entry.apiKey.trim().length > 0),
    updatedAt: Date.now(),
  };
  const updated = [...current, newEntry];
  saveCustomApiKeys(updated);
  return updated;
}

export function deleteCustomApiKeyEntry(id: string): CustomApiKey[] {
  const current = getCustomApiKeys();
  const updated = current.filter(item => item.id !== id);
  saveCustomApiKeys(updated);
  return updated;
}

export function getApiKeyForService(serviceKey: string): string | null {
  const all = getCustomApiKeys();
  const found = all.find(a => a.serviceKey === serviceKey && a.apiKey && a.apiKey.trim().length > 0);
  return found ? found.apiKey.trim() : null;
}

export function saveCustomApiKey(entry: Partial<CustomApiKey> & { serviceKey: string; apiKey: string }): CustomApiKey[] {
  const current = getCustomApiKeys();
  const existing = current.find(a => a.serviceKey === entry.serviceKey);
  if (existing) {
    return updateApiKeyEntry(existing.id, {
      apiKey: entry.apiKey,
      isActive: Boolean(entry.apiKey && entry.apiKey.trim().length > 0),
      ...(entry.serviceName ? { serviceName: entry.serviceName } : {}),
      ...(entry.description ? { description: entry.description } : {}),
    });
  } else {
    return addNewCustomApiKey({
      serviceKey: entry.serviceKey,
      serviceName: entry.serviceName || entry.serviceKey,
      category: entry.category || 'custom',
      apiKey: entry.apiKey,
      description: entry.description || '',
      docUrl: entry.docUrl || '',
      isActive: Boolean(entry.apiKey && entry.apiKey.trim().length > 0),
    });
  }
}

// -------------------------------------------------------------
// Approved Unsafe Sites (Strict Per-Site User Waiver & Bypass)
// -------------------------------------------------------------

export function getApprovedUnsafeSites(): ApprovedUnsafeSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNSAFE_SITES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveApprovedUnsafeSites(sites: ApprovedUnsafeSite[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNSAFE_SITES, JSON.stringify(sites));
  } catch {
    // ignore
  }
}

export function isSiteApprovedUnsafe(urlOrDomain: string): boolean {
  if (!urlOrDomain) return false;
  let targetDomain = urlOrDomain.toLowerCase().trim();
  try {
    if (urlOrDomain.startsWith('http://') || urlOrDomain.startsWith('https://')) {
      targetDomain = new URL(urlOrDomain).hostname.toLowerCase();
    }
  } catch {
    // use raw
  }
  targetDomain = targetDomain.replace(/^www\./, '');
  const list = getApprovedUnsafeSites();
  return list.some(item => {
    const itemDomain = item.domain.toLowerCase().replace(/^www\./, '');
    return itemDomain === targetDomain || targetDomain.endsWith('.' + itemDomain);
  });
}

export function addApprovedUnsafeSite(site: ApprovedUnsafeSite): ApprovedUnsafeSite[] {
  const current = getApprovedUnsafeSites();
  const domainClean = site.domain.toLowerCase().replace(/^www\./, '');
  const filtered = current.filter(s => s.domain.toLowerCase().replace(/^www\./, '') !== domainClean);
  const updated = [site, ...filtered];
  saveApprovedUnsafeSites(updated);
  return updated;
}

export function revokeApprovedUnsafeSite(domain: string): ApprovedUnsafeSite[] {
  const current = getApprovedUnsafeSites();
  const domainClean = domain.toLowerCase().replace(/^www\./, '');
  const updated = current.filter(s => s.domain.toLowerCase().replace(/^www\./, '') !== domainClean);
  saveApprovedUnsafeSites(updated);
  return updated;
}

export function clearAllApprovedUnsafeSites(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.UNSAFE_SITES);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// 10. DESKTOP SETUP & INSTALLATION STORAGE (ORHAN SÜLEYMAN TORUN)
// -------------------------------------------------------------

export const PRODUCER_FULL_NAME = 'Orhan Süleyman Torun';

export const DEFAULT_SETUP_CONFIG: DesktopSetupConfig = {
  producer: PRODUCER_FULL_NAME,
  platform: 'windows',
  installPath: 'C:\\Program Files\\NovaBrowser\\',
  userDataPath: 'C:\\Users\\Kullanici\\AppData\\Local\\NovaBrowser\\UserData',
  consentAcceptedAt: new Date().toISOString(),
  liabilityAccepted: true,
  installerFilename: 'NovaBrowser_v54_Setup_Orhan_Suleyman_Torun.exe',
};

export function getDesktopSetupConfig(): DesktopSetupConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETUP_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETUP_CONFIG,
        ...parsed,
        producer: PRODUCER_FULL_NAME, // Always enforce Orhan Süleyman Torun
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETUP_CONFIG;
}

export function saveDesktopSetupConfig(config: Partial<DesktopSetupConfig>): DesktopSetupConfig {
  const current = getDesktopSetupConfig();
  const updated: DesktopSetupConfig = {
    ...current,
    ...config,
    producer: PRODUCER_FULL_NAME,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.SETUP_CONFIG, JSON.stringify(updated));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'SETUP_CONFIG_UPDATED', config: updated });
    }
  } catch {
    // ignore
  }
  return updated;
}

// -------------------------------------------------------------
// 11. GAME STATS (APEX DRIVE & OFFLINE DINO)
// -------------------------------------------------------------

export interface GameStats {
  apexDriveKm: number;
  apexDriveBestScore: number;
  dinoHighScore: number;
  lastPlayedAt: string;
}

export const DEFAULT_GAME_STATS: GameStats = {
  apexDriveKm: 0,
  apexDriveBestScore: 0,
  dinoHighScore: 0,
  lastPlayedAt: new Date().toISOString(),
};

export function getGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (raw) return { ...DEFAULT_GAME_STATS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_GAME_STATS;
}

export function saveGameStats(stats: Partial<GameStats>): GameStats {
  const current = getGameStats();
  const updated = { ...current, ...stats, lastPlayedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// -------------------------------------------------------------
// 12. EXPORT & SYNC USER DATA TO SETUP DIRECTORY
// -------------------------------------------------------------

export function generateLegalRecordText(
  producer = PRODUCER_FULL_NAME,
  account: BrowserAccount = getActiveAccount(),
  setupConfig: DesktopSetupConfig = getDesktopSetupConfig()
): string {
  const now = new Date();
  return `================================================================================
NOVA BROWSER & NOVASEARCH MASAÜSTÜ SİSTEMİ
RESMİ HUKUKİ ONAY, KULLANIM TAAHHÜDÜ VE KESİN SORUMLULUK REDDİ TUTANAĞI
================================================================================

1. TARAFLAR VE YAPIMCI BİLGİSİ:
--------------------------------------------------------------------------------
YAPIMCI / GELİŞTİRİCİ: ${producer}
UYGULAMA ADI:          Nova Browser & NovaSearch V54 Multi-Engine
PLATFORM:              ${setupConfig.platform.toUpperCase()} Uyumlu Kurulum
KURULUM KLASÖRÜ:       ${setupConfig.installPath}
KULLANICI VERİ YOLU:   ${setupConfig.userDataPath}
ONAY TARİHİ:           ${now.toLocaleString('tr-TR')} (${now.toISOString()})

2. KULLANICI KİMLİK VE HESAP BİLGİLERİ:
--------------------------------------------------------------------------------
KULLANICI ADI:         ${account.name}
KULLANICI E-POSTA:     ${account.email}
HESAP ID:              ${account.id}
OTURUM KAYIT TARİHİ:   ${account.createdAt}

3. YAPIMCININ KESİN VE TAM SORUMSUZLUK BEYANI (ZORUNLU ŞART):
--------------------------------------------------------------------------------
Bu uygulamanın yapımcısı ve telif sahibi ORHAN SÜLEYMAN TORUN'dur.

Kullanıcı; işbu Nova Browser uygulamasını bilgisayarına indirmek, kurmak ve 
çalıştırmak suretiyle aşağıdaki hükümleri gayrikabili rücu kabul, beyan ve 
taahhüt etmiştir:

a) Yapımcı Orhan Süleyman Torun; kullanıcının tarayıcı üzerinden gerçekleştirdiği
   HİÇBİR EYLEMDEN, indirdiği HER TÜRLÜ DOSYADAN (yazılım, çalıştırılabilir dosya,
   arşiv, belge, medya), girdiği web sitelerinden veya yaptığı işlemlerden kesinlikle
   sorumlu tutulamaz.
   
b) İndirilen dosyaların açılması veya çalıştırılması sonucu kullanıcının 
   bilgisayarında, donanımında veya işletim sisteminde meydana gelebilecek virüs,
   trojan, truva atı, fidye yazılımı (ransomware), sistem hasarı, veri kaybı veya
   bozulmalarından ötürü yapımcı Orhan Süleyman Torun'a hiçbir hukuki, cezai,
   tazminat veya mali sorumluluk yüklenemez.
   
c) Kullanıcının gerçekleştirdiği tüm yasal, idari ve cezai sorumluluk münhasıran 
   kullanıcının kendisine aittir.

4. ONAY BELGESİNİN SİLİNMEZLİĞİ VE UYGULAMA KALDIRMA HÜKMÜ:
--------------------------------------------------------------------------------
İşbu hukuki onay belgesi, yapımcı Orhan Süleyman Torun'un yasal sorumluluk 
muafiyetini kanıtlayan resmi bir dijital tutanaktır.

KULLANICI, BU ONAY BELGESİNİ VEYA SİSTEMDEKİ ONAY TUTANAKLARINI SİLMEK İSTİYORSA,
NOVA BROWSER UYGULAMASINI VE TÜM KULLANICI VERİLERİNİ BİLGİSAYARINDAN TAMAMEN
SİLMEK (UNINSTALL / KALDIRMAK) ZORUNDADIR. UYGULAMA KURULU VE KULLANIMDA OLDUĞU
MÜDDETÇE BU ONAY BELGESİ SİLİNEMEZ, GEÇERSİZ KILINAMAZ.

5. ONAY VE TAAHHÜT:
--------------------------------------------------------------------------------
Kullanıcı "${account.name}", yukarıdaki tüm maddeleri eksiksiz okuduğunu, yapımcı
Orhan Süleyman Torun'un hiçbir sorumluluğunun bulunmadığını peşinen kabul ettiğini 
ve işbu tutanağı dijital iradesiyle imzaladığını beyan eder.

Dijital Doğrulama Damgası: SHA256-${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}
================================================================================
`;
}

export function buildUserAccountBackupData(): UserAccountBackupData {
  const account = getActiveAccount();
  const setupConfig = getDesktopSetupConfig();
  const gameStats = getGameStats();

  let history: HistoryEntry[] = [];
  try {
    const rawH = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (rawH) history = JSON.parse(rawH);
  } catch {
    // ignore
  }

  let bookmarks: Bookmark[] = [];
  try {
    const rawB = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (rawB) bookmarks = JSON.parse(rawB);
  } catch {
    // ignore
  }

  return {
    account,
    history,
    bookmarks,
    downloads: getDownloads(),
    tabs: [],
    theme: {
      preset: 'chrome-dark',
      accentColor: '#3b82f6',
      tabBarBg: '#1e293b',
      headerBg: '#1e293b',
      contentBg: '#0f172a',
      textColor: '#e2e8f0',
    },
    setupConfig,
    gameStats,
    exportedAt: new Date().toISOString(),
  };
}

export function downloadFileBlob(filename: string, content: string, mimeType = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // ignore
  }
}



