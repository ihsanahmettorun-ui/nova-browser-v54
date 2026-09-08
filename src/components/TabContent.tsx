import React, { useRef, useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  ExternalLink,
  Sparkles,
  Layers,
  Globe,
  AlertCircle,
  Maximize2,
  Lock,
  Unlock,
  Sun,
  Moon,
  Languages,
  ArrowRightLeft,
  Check,
  ChevronDown,
} from 'lucide-react';
import { TabItem, BrowserThemeConfig, ApprovedUnsafeSite } from '../types.ts';
import { NovaSearchHome } from './NovaSearchHome.tsx';
import { YouTubeView } from './YouTubeView.tsx';
import { GoogleView } from './GoogleView.tsx';
import { DownloadsView } from './DownloadsView.tsx';
import { ApexDriveView } from './ApexDriveView.tsx';
import { OfflineDinoGame } from './OfflineDinoGame.tsx';
import {
  addHistoryEntry,
  isSiteApprovedUnsafe,
  addApprovedUnsafeSite,
  revokeApprovedUnsafeSite,
  getAutoTranslateEnabled,
  getTargetTranslateLanguage,
} from '../utils/storage.ts';
import { ALL_LANGUAGES, t } from '../data/languages.ts';

interface TabContentProps {
  tab: TabItem;
  isActive: boolean;
  onUpdateTab: (id: string, updates: Partial<TabItem>) => void;
  onNavigateUrl: (url: string, newTab?: boolean) => void;
  theme: BrowserThemeConfig;
  currentLang: string;
}

type ViewEngineMode = 'proxy' | 'embed';

export const TabContent: React.FC<TabContentProps> = ({
  tab,
  isActive,
  onUpdateTab,
  onNavigateUrl,
  theme,
  currentLang,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isSearchHome = tab.url === 'nova://newtab' || tab.url === 'nova://search';
  const isDownloads = tab.url === 'nova://downloads' || tab.url === 'chrome://downloads';
  const isApexDrive =
    tab.url.toLowerCase().includes('apexdrive') ||
    tab.url.startsWith('nova://apexdrive') ||
    tab.url.includes('apexdrive-global-driving');
  const isOfflineDino =
    tab.url === 'nova://dino' ||
    tab.url === 'nova://offline' ||
    tab.url === 'chrome://dino';
  const isYouTube =
    tab.url.toLowerCase().includes('youtube.com') ||
    tab.url.toLowerCase().includes('youtu.be') ||
    tab.url.startsWith('nova://youtube');
  const isGoogle =
    tab.url.toLowerCase().includes('google.com') ||
    tab.url.toLowerCase().includes('google.com.tr') ||
    tab.url.toLowerCase().includes('google.co.') ||
    tab.url.toLowerCase().includes('google.de') ||
    tab.url.toLowerCase().includes('google.fr') ||
    tab.url.startsWith('nova://google');

  // Engine mode state (Proxy bypasses X-Frame-Options/CSP of real sites; ApexDrive defaults to embed)
  const [engineMode, setEngineMode] = useState<ViewEngineMode>(() => (isApexDrive ? 'embed' : 'proxy'));
  const [hasIframeError, setHasIframeError] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isUnsafeApproved, setIsUnsafeApproved] = useState<boolean>(() => isSiteApprovedUnsafe(tab.url));

  // Live Page Translation states
  const [targetTranslateLang, setTargetTranslateLang] = useState<string>(() => getTargetTranslateLanguage());
  const [isTranslatingPage, setIsTranslatingPage] = useState(false);
  const [isPageTranslated, setIsPageTranslated] = useState(false);
  const [translatedNodeCount, setTranslatedNodeCount] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Web Dark Mode toggle for proxied websites
  const [isWebDarkMode, setIsWebDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nova_web_force_dark') === 'true';
    } catch {
      return false;
    }
  });

  const toggleWebDarkMode = () => {
    setIsWebDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nova_web_force_dark', String(next));
      } catch {}
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'NOVA_SET_THEME', isDark: next }, '*');
      }
      return next;
    });
  };

  // Synchronize when tab.url changes
  useEffect(() => {
    setHasIframeError(false);
    setAiSummary(null);
    setIsPageTranslated(false);
    setIsTranslatingPage(false);
    setTranslatedNodeCount(0);
    setIsUnsafeApproved(isSiteApprovedUnsafe(tab.url));
  }, [tab.url]);

  // Handle postMessage from proxy bridge script
  useEffect(() => {
    const handleBridgeMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, title, url, targetUrl, key, domain, threatType, threatScore, approvedAt, count, targetLang } = event.data;

      if (type === 'NOVA_PAGE_LOADED' || type === 'NOVA_TITLE_CHANGE') {
        if (title && title !== tab.title) {
          onUpdateTab(tab.id, {
            title,
            isLoading: false,
          });
          addHistoryEntry(tab.url, title);
        }

        // Auto-translate if enabled
        if (getAutoTranslateEnabled() && iframeRef.current?.contentWindow) {
          const autoTarget = getTargetTranslateLanguage();
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: 'NOVA_TRANSLATE_PAGE',
              targetLang: autoTarget || currentLang || 'tr',
              fromLang: 'auto'
            }, '*');
          }, 600);
        }
      }

      if (type === 'NOVA_TRANSLATING_START') {
        setIsTranslatingPage(true);
      }

      if (type === 'NOVA_PAGE_TRANSLATED') {
        setIsTranslatingPage(false);
        setIsPageTranslated(true);
        if (typeof count === 'number') {
          setTranslatedNodeCount(count);
        }
      }

      if (type === 'NOVA_PAGE_RESTORED') {
        setIsTranslatingPage(false);
        setIsPageTranslated(false);
        setTranslatedNodeCount(0);
      }

      if (type === 'NOVA_TRANSLATE_ERROR') {
        setIsTranslatingPage(false);
      }

      if (type === 'NOVA_APPROVE_UNSAFE_SITE' && domain) {
        addApprovedUnsafeSite({
          id: 'unsafe-' + Date.now(),
          domain: domain,
          url: url || tab.url,
          threatType: threatType || 'unknown',
          threatScore: threatScore || 50,
          approvedAt: approvedAt || new Date().toISOString(),
          disclaimerAcknowledged: true,
        });
        setIsUnsafeApproved(true);
      }

      if (type === 'NOVA_LINK_CLICK' && targetUrl) {
        onNavigateUrl(targetUrl);
      }

      if (type === 'NOVA_NAVIGATE' && url) {
        onNavigateUrl(url);
      }

      if (type === 'NOVA_DIRECT_OPEN' && url) {
        window.open(url, '_blank');
      }

      if (type === 'NOVA_HOTKEY' && key) {
        if (key === 't') onNavigateUrl('nova://newtab', true);
      }
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, [tab.id, tab.url, tab.title, onUpdateTab, onNavigateUrl, currentLang]);

  const handleTranslateCurrentPage = (selectedLang?: string) => {
    const lang = selectedLang || targetTranslateLang || currentLang || 'tr';
    if (selectedLang) setTargetTranslateLang(selectedLang);
    setShowLangMenu(false);
    setIsTranslatingPage(true);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'NOVA_TRANSLATE_PAGE',
        targetLang: lang,
        fromLang: 'auto',
      }, '*');
    }
  };

  const handleRestoreOriginalText = () => {
    setShowLangMenu(false);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'NOVA_RESTORE_ORIGINAL',
      }, '*');
    }
  };

  const handleRefresh = () => {
    onUpdateTab(tab.id, { isLoading: true });
    setHasIframeError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleRevokeUnsafeException = () => {
    revokeApprovedUnsafeSite(tab.url);
    setIsUnsafeApproved(false);
    handleRefresh();
  };

  const handleAiSummarize = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url, text: tab.title }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      }
    } catch {
      // ignore
    } finally {
      setIsSummarizing(false);
    }
  };

  // Determine iframe src according to engine mode and approved unsafe bypass state
  let targetSrc = '';
  if (!isSearchHome) {
    if (engineMode === 'proxy') {
      const bypassParam = isUnsafeApproved ? `&bypass_shield=1&bypass_domain=${encodeURIComponent(tab.url)}` : '';
      targetSrc = `/api/proxy?url=${encodeURIComponent(tab.url)}${bypassParam}`;
    } else {
      targetSrc = tab.url;
    }
  }

  // Domain name for display
  let domain = 'Web';
  try {
    domain = new URL(tab.url).hostname.replace(/^www\./, '');
  } catch {
    domain = tab.url;
  }

  return (
    <div
      id={`tab-viewport-${tab.id}`}
      className={`w-full h-full flex flex-col relative overflow-hidden ${
        isActive ? 'flex' : 'hidden'
      }`}
      style={{
        backgroundColor: theme.contentBg,
      }}
    >
      {/* Top Loading Progress Line */}
      {tab.isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-30 animate-pulse" />
      )}

      {/* RENDER VIEW ACCORDING TO URL */}
      {isSearchHome ? (
        <NovaSearchHome
          initialQuery={
            tab.inputUrl.startsWith('nova://search?q=')
              ? decodeURIComponent(tab.inputUrl.split('q=')[1] || '')
              : ''
          }
          onNavigateUrl={(url, newTab) => onNavigateUrl(url, newTab)}
          theme={theme}
          currentLang={currentLang}
        />
      ) : isApexDrive ? (
        <ApexDriveView
          url={tab.url.startsWith('nova://') ? 'https://apexdrive-global-driving-0000.ai.studio' : tab.url}
          onNavigateUrl={(url) => onNavigateUrl(url)}
          onUpdateTabTitle={(title) => onUpdateTab(tab.id, { title, isLoading: false })}
          theme={theme}
          currentLang={currentLang}
        />
      ) : isOfflineDino ? (
        <OfflineDinoGame
          onRetry={handleRefresh}
          onNavigateToCarGame={() => onNavigateUrl('https://apexdrive-global-driving-0000.ai.studio')}
          currentLang={currentLang}
          targetFailedUrl={tab.url}
        />
      ) : isDownloads ? (
        <DownloadsView
          currentLang={currentLang}
          theme={theme}
          onNavigate={(url) => onNavigateUrl(url)}
        />
      ) : isYouTube ? (
        <YouTubeView
          url={tab.url}
          tabId={tab.id}
          onNavigateUrl={(url) => onNavigateUrl(url)}
          onUpdateTabTitle={(title) => onUpdateTab(tab.id, { title, isLoading: false })}
          theme={theme}
          currentLang={currentLang}
        />
      ) : isGoogle ? (
        <GoogleView
          url={tab.url}
          tabId={tab.id}
          onNavigateUrl={(url) => onNavigateUrl(url)}
          onUpdateTabTitle={(title) => onUpdateTab(tab.id, { title, isLoading: false })}
          theme={theme}
          currentLang={currentLang}
        />
      ) : (
        <div className="w-full h-full flex flex-col">
          {/* Top Universal Website Security & Engine Bar */}
          <div className="h-7 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none z-20">
            <div className="flex items-center gap-2 truncate">
              {isUnsafeApproved ? (
                <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/40">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">{t('shield_disabled', currentLang, 'Güvenlik Kalkanı Kapalı (Kullanıcı Onaylı)')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">{t('secure_connection', currentLang, 'Güvenli Bağlantı (NovaShield)')}</span>
                </span>
              )}
              <span className="text-slate-600">|</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {domain}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Revoke Unsafe Exception Button */}
              {isUnsafeApproved && (
                <button
                  type="button"
                  onClick={handleRevokeUnsafeException}
                  className="px-2 py-0.5 rounded bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                  title="Bu site için kalkanı tekrar aç ve onay kaydını sil"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('enable_shield', currentLang, 'Kalkanı Aç')}</span>
                </button>
              )}

              {/* Engine Switcher */}
              <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setEngineMode('proxy')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    engineMode === 'proxy'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Güvenlik başlıklarını aşan Nova Proxy motoru"
                >
                  {t('proxy_mode', currentLang, 'Proxy Modu')}
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode('embed')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    engineMode === 'embed'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Doğrudan gömülü iframe modu"
                >
                  {t('embed_mode', currentLang, 'Embed Modu')}
                </button>
              </div>

              {/* Universal Live Webpage Translation Button & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id={`btn-translate-page-${tab.id}`}
                  onClick={() => setShowLangMenu((prev) => !prev)}
                  disabled={isTranslatingPage}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isPageTranslated
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : isTranslatingPage
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 animate-pulse'
                      : 'bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                  }`}
                  title="Sayfayı 145+ dilden herhangi birine canlı çevir"
                >
                  <Languages className="w-3 h-3 text-indigo-400" />
                  <span>
                    {isTranslatingPage
                      ? t('translating', currentLang, 'Çevriliyor...')
                      : isPageTranslated
                      ? `${t('translated', currentLang, 'Çevrildi')} (${translatedNodeCount || '✓'})`
                      : t('translate_page', currentLang, 'Sayfayı Çevir')}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                </button>

                {/* Dropdown Menu for Translation Target Languages */}
                {showLangMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-2 text-xs animate-in fade-in slide-in-from-top-1"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        {t('web_translate_select', currentLang, 'Web Çeviri Dili Seçin')}
                      </span>
                      {isPageTranslated && (
                        <button
                          type="button"
                          onClick={handleRestoreOriginalText}
                          className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                        >
                          {t('show_original', currentLang, 'Orijinali Göster')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                      {ALL_LANGUAGES.slice(0, 40).map((l) => {
                        const isCurrent = targetTranslateLang === l.code;
                        return (
                          <button
                            key={`tab-tr-${l.code}`}
                            type="button"
                            onClick={() => handleTranslateCurrentPage(l.code)}
                            className={`w-full px-2 py-1 rounded text-left text-[11px] flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-indigo-600/30 text-white font-medium'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">
                              {l.flag} {l.nativeName} ({l.name})
                            </span>
                            {isCurrent && isPageTranslated && <Check className="w-3 h-3 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleTranslateCurrentPage(targetTranslateLang)}
                        className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-center font-medium text-[11px] transition-colors"
                      >
                        {isPageTranslated ? 'Tekrar Çevir' : 'Şimdi Çevir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme (Dark / Light) Mode Toggle for loaded websites */}
              <button
                type="button"
                onClick={toggleWebDarkMode}
                className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isWebDarkMode
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
                title={isWebDarkMode ? 'Web Sitesi Açık Renk Modu' : 'Web Sitesi Koyu Renk Modu (Dark Mode)'}
              >
                {isWebDarkMode ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3 text-slate-400" />}
                <span className="hidden sm:inline">{isWebDarkMode ? 'Açık Renk' : 'Koyu Renk'}</span>
              </button>

              {/* Reload */}
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Yenile"
              >
                <RotateCw className="w-3 h-3" />
              </button>

              {/* AI Summarize */}
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={isSummarizing}
                className="px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Yapay zeka ile sayfa içeriğini özetle"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden md:inline">{isSummarizing ? 'Özetleniyor...' : 'AI Özeti'}</span>
              </button>

              {/* Open in new window / real browser */}
              <button
                type="button"
                onClick={() => window.open(tab.url, '_blank')}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                title="Gerçek siteyi yeni sekmede aç"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden lg:inline">Yeni Sekmede Aç</span>
              </button>
            </div>
          </div>

          {/* AI Summary Banner if active */}
          {aiSummary && (
            <div className="p-3 bg-slate-900 border-b border-blue-500/30 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-lg z-10">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-blue-300">Nova AI Sayfa Özeti:</span>
                  <p className="text-slate-300 leading-relaxed">{aiSummary}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiSummary(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          )}

          {/* Error Banner Fallback if iframe fails */}
          {hasIframeError && (
            <div className="p-3 bg-amber-950/80 border-b border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bu web sitesi gömülü çerçeve koruması içeriyor olabilir.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateUrl('nova://dino')}
                  className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer flex items-center gap-1"
                >
                  <span>🦖</span>
                  <span>Çevrimdışı Dino Oyunu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode(engineMode === 'proxy' ? 'embed' : 'proxy')}
                  className="px-2 py-1 rounded bg-amber-800 hover:bg-amber-700 text-white font-medium cursor-pointer"
                >
                  Diğer Modu Dene
                </button>
                <button
                  type="button"
                  onClick={() => window.open(tab.url, '_blank')}
                  className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer"
                >
                  Yeni Sekmede Aç 🚀
                </button>
              </div>
            </div>
          )}

          {/* Main Web Iframe - Loads the REAL website */}
          <iframe
            ref={iframeRef}
            id={`iframe-tab-${tab.id}`}
            src={targetSrc}
            className="w-full h-full border-none flex-1 bg-white"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock allow-orientation-lock allow-storage-access-by-user-activation"
            allow="fullscreen; autoplay; gamepad; pointer-lock; accelerometer; gyroscope; picture-in-picture; web-share; camera; microphone; clipboard-read; clipboard-write; display-capture; xr-spatial-tracking; midi; encrypted-media; payment; usb"
            referrerPolicy="no-referrer"
            onLoad={() => {
              onUpdateTab(tab.id, { isLoading: false });
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'NOVA_SET_THEME', isDark: isWebDarkMode }, '*');
              }
            }}
            onError={() => {
              setHasIframeError(true);
              onUpdateTab(tab.id, { isLoading: false });
            }}
          />
        </div>
      )}
    </div>
  );
};
