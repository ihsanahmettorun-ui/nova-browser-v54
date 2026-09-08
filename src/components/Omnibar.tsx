import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Home,
  ShieldCheck,
  ShieldAlert,
  Star,
  Search,
  Sparkles,
  Menu,
  Palette,
  History,
  Bookmark,
  Download,
  User,
  SlidersHorizontal,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { TabItem, BrowserThemeConfig, BrowserAccount, DownloadItem } from '../types.ts';
import { toggleBookmark, getBookmarks, isSiteApprovedUnsafe, getDownloads } from '../utils/storage.ts';
import { t } from '../data/languages.ts';
import { ChromeDownloadBubble } from './ChromeDownloadBubble.tsx';
import { GoogleAppsMenu } from './GoogleAppsMenu.tsx';

interface OmnibarProps {
  activeTab: TabItem;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onToggleSidebar: (view?: string) => void;
  account: BrowserAccount;
  theme: BrowserThemeConfig;
  currentLang?: string;
  onOpenAiSummary?: () => void;
}

export const Omnibar: React.FC<OmnibarProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  onToggleSidebar,
  account,
  theme,
  currentLang = 'tr',
  onOpenAiSummary,
}) => {
  const [inputValue, setInputValue] = useState(activeTab.url);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showDownloadBubble, setShowDownloadBubble] = useState(false);
  const [downloadsList, setDownloadsList] = useState<DownloadItem[]>(() => getDownloads());

  // Listen to downloads changes and track in_progress
  useEffect(() => {
    const handleDownloadsChange = () => {
      setDownloadsList(getDownloads());
    };
    window.addEventListener('nova_downloads_change', handleDownloadsChange);
    const interval = setInterval(handleDownloadsChange, 800);
    return () => {
      window.removeEventListener('nova_downloads_change', handleDownloadsChange);
      clearInterval(interval);
    };
  }, []);

  const activeDownloadsCount = downloadsList.filter(
    (d) => d.status === 'in_progress' || d.status === 'paused'
  ).length;

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimerRef = useRef<any>(null);

  // Sync input value when active tab changes
  useEffect(() => {
    setInputValue(activeTab.url === 'nova://newtab' || activeTab.url === 'nova://search' ? '' : activeTab.url);
    // Check if current url is bookmarked
    const bms = getBookmarks();
    setIsBookmarked(bms.some((b) => b.url === activeTab.url));
  }, [activeTab.url, activeTab.id]);

  // Fetch live suggestions as user types in Omnibar
  useEffect(() => {
    if (!isFocused || inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(inputValue.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 7));
        }
      } catch {
        // ignore
      }
    }, 180);

    return () => clearTimeout(suggestTimerRef.current);
  }, [inputValue, isFocused]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSuggestionIdx >= 0 && suggestions[activeSuggestionIdx]) {
      submitQueryOrUrl(suggestions[activeSuggestionIdx]);
    } else {
      submitQueryOrUrl(inputValue);
    }
  };

  const submitQueryOrUrl = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    setIsFocused(false);
    setSuggestions([]);
    setActiveSuggestionIdx(-1);
    inputRef.current?.blur();
    onNavigate(clean);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSuggestions([]);
      setActiveSuggestionIdx(-1);
      inputRef.current?.blur();
    }
  };

  const handleBookmarkToggle = () => {
    const res = toggleBookmark(activeTab.title, activeTab.url);
    setIsBookmarked(res);
  };

  const isSecure = activeTab.url.startsWith('https://') || activeTab.url.startsWith('nova://');
  const isUnsafeApproved = isSiteApprovedUnsafe(activeTab.url);

  return (
    <div
      id="nova-omnibar-container"
      className="flex items-center h-12 bg-[#1E293B] px-4 gap-3 border-b border-slate-800 shadow-lg select-none relative"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.textColor,
      }}
    >
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          id="btn-nav-back"
          onClick={onGoBack}
          disabled={!activeTab.canGoBack}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors"
          title={`${t('nav_back', currentLang, 'Geri')} (Alt + Sol Ok)`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          id="btn-nav-forward"
          onClick={onGoForward}
          disabled={!activeTab.canGoForward}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors"
          title={`${t('nav_forward', currentLang, 'İleri')} (Alt + Sağ Ok)`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          id="btn-nav-reload"
          onClick={onReload}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title={activeTab.isLoading ? t('stop', currentLang, 'Durdur') : `${t('nav_reload', currentLang, 'Yenile')} (Ctrl+R)`}
        >
          {activeTab.isLoading ? (
            <X className="w-4 h-4 text-rose-400" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          id="btn-nav-home"
          onClick={onGoHome}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title={t('nav_home', currentLang, 'Ana Sayfa')}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibar Input Box */}
      <div className="flex-1 relative">
        <form onSubmit={handleFormSubmit} className="relative flex items-center bg-[#0F172A] rounded-full px-3.5 py-1 border border-slate-700 hover:border-blue-500/50 focus-within:border-blue-500 transition-colors shadow-inner">
          <div className="flex items-center mr-2 shrink-0">
            <button
              type="button"
              id="btn-security-lock-status"
              onClick={() => setShowSecurityModal(true)}
              className="flex items-center transition-colors cursor-pointer"
              title={isUnsafeApproved ? t('security_unsafe_approved_tooltip', currentLang, 'Kullanıcı Onaylı Güvensiz Site (Kalkan Kapalı)') : isSecure ? t('security_secure_tooltip', currentLang, 'Güvenli Bağlantı (NovaShield Aktif)') : t('security_unsecure_tooltip', currentLang, 'Güvensiz Bağlantı')}
            >
              {isUnsafeApproved ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : isSecure ? (
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              )}
            </button>
          </div>

          <input
            ref={inputRef}
            id="nova-omnibar-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('omnibar_placeholder', currentLang, 'Bir web adresi yazın veya NovaSearch ile arayın...')}
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Right Omnibar Actions & Optimized Pill */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="hidden sm:inline-block text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-tight font-medium">
              Nova Optimized
            </span>

            {inputValue && (
              <button
                type="button"
                id="btn-clear-omnibar-input"
                onClick={() => setInputValue('')}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title={t('clear', currentLang, 'Temizle')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              id="btn-toggle-bookmark-star"
              onClick={handleBookmarkToggle}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? t('remove_bookmark', currentLang, 'Yer imlerinden kaldır') : `${t('add_bookmark', currentLang, 'Yer imlerine ekle')} (Ctrl+D)`}
            >
              <Star className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </form>

        {/* Live Search & Autocomplete Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div
            id="nova-omnibar-suggestions-menu"
            className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-40 py-1"
          >
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                id={`suggestion-item-${idx}`}
                onMouseDown={() => submitQueryOrUrl(item)}
                className={`px-3.5 py-2 text-xs flex items-center gap-2.5 cursor-pointer transition-colors ${
                  idx === activeSuggestionIdx
                    ? 'bg-blue-600/30 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Toolbar Quick Buttons */}
      <div className="flex items-center gap-1.5">
        {onOpenAiSummary && (
          <button
            type="button"
            id="btn-open-ai-summary"
            onClick={onOpenAiSummary}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700/50 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            title={t('ai_assistant', currentLang, 'AI Sayfa Özeti & Asistan')}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* History Quick Open */}
        <button
          type="button"
          id="btn-quick-history"
          onClick={() => onToggleSidebar('history')}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('history', currentLang, 'Tarihsel Geçmiş (Yıl / Ay / Gün)')}
        >
          <History className="w-4 h-4" />
        </button>

        {/* Theme & Color Quick Open */}
        <button
          type="button"
          id="btn-quick-theme"
          onClick={() => onToggleSidebar('theme')}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('theme', currentLang, 'Tarayıcı Rengi ve Teması')}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Bookmarks Quick Open */}
        <button
          type="button"
          id="btn-quick-bookmarks"
          onClick={() => onToggleSidebar('bookmarks')}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('bookmarks', currentLang, 'Yer İmleri')}
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Chrome-Style Downloads Quick Open & Live Tray */}
        <div className="relative">
          <button
            type="button"
            id="btn-quick-downloads"
            onClick={() => setShowDownloadBubble((prev) => !prev)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
              activeDownloadsCount > 0
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50 shadow-sm shadow-blue-500/20'
                : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
            title={`${t('downloads', currentLang, 'İndirilenler')} ${activeDownloadsCount > 0 ? `(${activeDownloadsCount} aktif)` : ''}`}
          >
            <Download className={`w-4 h-4 ${activeDownloadsCount > 0 ? 'animate-bounce' : ''}`} />
            {activeDownloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-slate-900">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          {/* Chrome Download Tray Bubble */}
          <ChromeDownloadBubble
            isOpen={showDownloadBubble}
            onClose={() => setShowDownloadBubble(false)}
            onOpenFullDownloads={() => onNavigate('nova://downloads')}
            currentLang={currentLang}
          />
        </div>

        {/* 9-Dot Google & Nova Apps Menu */}
        <div className="flex items-center">
          <GoogleAppsMenu
            onNavigate={(url) => onNavigate(url)}
            currentLang={currentLang}
            onOpenSettings={() => onToggleSidebar()}
            onOpenSecurity={() => setShowSecurityModal(true)}
          />
        </div>

        {/* Active Account Avatar */}
        <button
          type="button"
          id="btn-user-account-menu"
          onClick={() => onToggleSidebar('account')}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-700/50 transition-colors ml-1 border border-slate-700/50 cursor-pointer"
          title={`${t('account', currentLang, 'Hesap')}: ${account.name}`}
        >
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-white/20 shadow-lg shadow-blue-900/20"
          >
            {account.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-300 max-w-[80px] truncate hidden md:inline">
            {account.name}
          </span>
        </button>

        {/* Full Sidebar Toggle */}
        <button
          type="button"
          id="btn-toggle-main-sidebar"
          onClick={() => onToggleSidebar()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('settings', currentLang, 'Tüm Menü ve Ayarlar')}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Security & NovaShield Cyber Protection Modal */}
      {showSecurityModal && (
        <div
          id="security-info-modal-backdrop"
          onClick={() => setShowSecurityModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            id="security-info-modal-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {t('novashield_title', currentLang, 'NovaShield Siber Güvenlik Kalkanı')}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      {t('active_protection', currentLang, 'Aktif Koruma')}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">{t('realtime_web_protection', currentLang, 'Gerçek Zamanlı Web & API Koruma Sistemi')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white block">{t('tls_encryption', currentLang, 'TLS / SSL Uçtan Uca Şifreleme')}</span>
                    <span className="text-[11px] text-slate-400">{t('tls_encryption_desc', currentLang, 'Verileriniz ve formlarınız şifrelenerek aktarılır')}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400">{t('secure', currentLang, 'Güvenli')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white block">{t('malware_shield', currentLang, 'Virüs, Truva Atı & Zararlı Yazılım Kalkanı')}</span>
                    <span className="text-[11px] text-slate-400">{t('malware_shield_desc', currentLang, 'Zararlı scriptler, madenciler ve .exe tuzakları taranır')}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-400">{t('active_badge', currentLang, 'Devrede')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white block">{t('tracker_blocker', currentLang, 'İzleyici & Casus Yazılım Engelleyici')}</span>
                    <span className="text-[11px] text-slate-400">{t('tracker_blocker_desc', currentLang, 'Üçüncü taraf reklam ağları ve takip çerezleri engellendi')}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400">{t('protected', currentLang, 'Korunuyor')}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] break-all text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold mb-0.5">{t('scanned_address', currentLang, 'Taranan Adres:')}</span>
                {activeTab.url}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSecurityModal(false);
                  onToggleSidebar('security');
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('security_exceptions_btn', currentLang, '🛡️ Güvenlik & İstisnalar')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
              >
                {t('ok', currentLang, 'Tamam')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
