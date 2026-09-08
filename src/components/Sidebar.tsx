import React, { useState, useMemo } from 'react';
import {
  History,
  Palette,
  Bookmark,
  User,
  Download,
  Globe,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Search,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  X,
  FileJson,
  KeyRound,
  Languages,
  ArrowRightLeft,
  Volume2,
  Laptop,
  FolderDown,
  Gamepad2,
  Trophy,
  ShieldAlert,
} from 'lucide-react';
import {
  HistoryEntry,
  Bookmark as BookmarkType,
  BrowserAccount,
  BrowserThemeConfig,
  ThemePreset,
  DownloadItem,
  SidebarViewType,
  DesktopSetupConfig,
} from '../types.ts';
import {
  getHistory,
  clearHistory,
  deleteHistoryItem,
  THEME_PRESETS,
  saveBrowserTheme,
  saveActiveAccount,
  getAccountsList,
  saveAccountsList,
  getBookmarks,
  saveBookmarks,
  saveLanguage,
  getAutoTranslateEnabled,
  saveAutoTranslateEnabled,
  getTargetTranslateLanguage,
  saveTargetTranslateLanguage,
  getDesktopSetupConfig,
  saveDesktopSetupConfig,
  getGameStats,
  saveGameStats,
  PRODUCER_FULL_NAME,
} from '../utils/storage.ts';
import {
  ALL_LANGUAGES,
  LANGUAGE_REGIONS,
  getLanguageOption,
  searchLanguages,
  t,
} from '../data/languages.ts';
import { ApiKeysPanel } from './ApiKeysPanel.tsx';
import { SecurityPanel } from './SecurityPanel.tsx';
import { DownloadsPanel } from './DownloadsPanel.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: SidebarViewType;
  onSelectView: (view: SidebarViewType) => void;
  onNavigate: (url: string, newTab?: boolean) => void;
  account: BrowserAccount;
  onAccountChange: (account: BrowserAccount) => void;
  theme: BrowserThemeConfig;
  onThemeChange: (theme: BrowserThemeConfig) => void;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onOpenTranslateModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onNavigate,
  account,
  onAccountChange,
  theme,
  onThemeChange,
  currentLang,
  onLanguageChange,
  onOpenTranslateModal,
}) => {
  const [historySearch, setHistorySearch] = useState('');
  const [langSearch, setLangSearch] = useState('');
  const [langRegionFilter, setLangRegionFilter] = useState('all');
  const [autoTranslateEnabled, setAutoTranslateEnabledState] = useState<boolean>(() => getAutoTranslateEnabled());
  const [targetTranslateLang, setTargetTranslateLangState] = useState<string>(() => getTargetTranslateLanguage());

  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({ [new Date().getFullYear()]: true });
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const searchedLanguagesList = useMemo(() => {
    return searchLanguages(langSearch, langRegionFilter);
  }, [langSearch, langRegionFilter]);

  const handleToggleAutoTranslate = (val: boolean) => {
    setAutoTranslateEnabledState(val);
    saveAutoTranslateEnabled(val);
  };

  const handleSelectTargetTranslateLang = (code: string) => {
    setTargetTranslateLangState(code);
    saveTargetTranslateLanguage(code);
  };

  // Group History by Year -> Month -> Day
  const historyList = useMemo(() => getHistory(), [isOpen, activeView]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return historyList;
    const term = historySearch.toLowerCase();
    return historyList.filter(
      (h) => h.title.toLowerCase().includes(term) || h.url.toLowerCase().includes(term)
    );
  }, [historyList, historySearch]);

  const groupedHistory = useMemo(() => {
    const groups: Record<number, Record<string, Record<string, HistoryEntry[]>>> = {};

    filteredHistory.forEach((entry) => {
      const year = entry.year || new Date().getFullYear();
      const monthKey = `${entry.monthName || 'Ay'} (${entry.month || 1})`;
      const dayKey = `${entry.day || 1} ${entry.monthName || ''} - ${entry.dayName || ''}`;

      if (!groups[year]) groups[year] = {};
      if (!groups[year][monthKey]) groups[year][monthKey] = {};
      if (!groups[year][monthKey][dayKey]) groups[year][monthKey][dayKey] = [];

      groups[year][monthKey][dayKey].push(entry);
    });

    return groups;
  }, [filteredHistory]);

  const [isConfirmingClearHistory, setIsConfirmingClearHistory] = useState(false);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAllHistory = () => {
    clearHistory();
    setIsConfirmingClearHistory(false);
    onSelectView('history'); // re-render
  };

  // Preset theme handler
  const handlePresetSelect = (presetKey: ThemePreset) => {
    const newConfig = { ...THEME_PRESETS[presetKey] };
    onThemeChange(newConfig);
    saveBrowserTheme(newConfig);
  };

  // Custom Color Handlers
  const handleCustomColorChange = (key: keyof BrowserThemeConfig, val: string) => {
    const newConfig: BrowserThemeConfig = {
      ...theme,
      preset: 'custom',
      [key]: val,
    };
    onThemeChange(newConfig);
    saveBrowserTheme(newConfig);
  };

  // Account creation & switching
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newAcc: BrowserAccount = {
      id: `acc_${Date.now()}`,
      name: newAccountName.trim(),
      email: newAccountEmail.trim() || `${newAccountName.toLowerCase().replace(/\s+/g, '')}@novabrowser.local`,
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const list = getAccountsList();
    const updated = [...list, newAcc];
    saveAccountsList(updated);
    saveActiveAccount(newAcc);
    onAccountChange(newAcc);

    setNewAccountName('');
    setNewAccountEmail('');
    setShowCreateAccount(false);
  };

  const handleSwitchAccount = (acc: BrowserAccount) => {
    saveActiveAccount(acc);
    onAccountChange(acc);
  };

  const handleSyncToSetupFolder = () => {
    const setupCfg = getDesktopSetupConfig();
    const stats = getGameStats();
    const fullUserData = {
      userAccount: account,
      producerLiabilityWaiver: {
        producer: PRODUCER_FULL_NAME,
        accepted: setupCfg.liabilityAccepted,
        signedAt: setupCfg.consentAcceptedAt,
        status: 'RESMI_SORUMSUZLUK_MUOFIYETI_ONAYLANDI',
      },
      installationTargetDirectory: setupCfg.userDataPath,
      platform: setupCfg.platform,
      userBookmarks: getBookmarks(),
      userHistory: getHistory(),
      userGameStats: {
        apexDriveKm: stats.apexDriveKm,
        apexDriveBestScore: stats.apexDriveBestScore,
        dinoHighScore: stats.dinoHighScore,
        lastPlayedAt: stats.lastPlayedAt,
      },
      syncTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullUserData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (account.name || 'User').replace(/[^a-zA-Z0-9_\-]/g, '_');
    a.download = `Nova_UserData_${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSyncNotice(`Tüm kullanıcı verileri kurulum ve indirme bölgenize (${setupCfg.userDataPath}) başarıyla senkronize edildi.`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleExportData = () => {
    const data = {
      account,
      history: getHistory(),
      theme,
      gameStats: getGameStats(),
      setupConfig: getDesktopSetupConfig(),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-browser-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      id="nova-sidebar-container"
      className="fixed inset-y-0 left-0 z-40 w-[380px] sm:w-[440px] md:w-[460px] max-w-full shadow-2xl flex flex-col transition-transform duration-200 border-r border-white/10"
      style={{
        backgroundColor: theme.tabBarBg,
        color: theme.textColor,
      }}
    >
      {/* Sidebar Header with Title & Quick Info */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md"
            style={{ backgroundColor: theme.accentColor }}
          >
            ✦
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight block text-white">
              Nova {t('settings', currentLang, 'Tarayıcı Menüsü & Ayarlar')}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>{getLanguageOption(currentLang).flag} {getLanguageOption(currentLang).nativeName}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                <ShieldCheck className="w-3 h-3 inline" /> NovaShield Aktif
              </span>
            </span>
          </div>
        </div>
        <button
          type="button"
          id="btn-close-sidebar"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('close_tab', currentLang, 'Kapat')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spacious 2-Row Navigation Tab Strip with High Readability */}
      <div className="p-2 border-b border-white/10 bg-black/30 space-y-1.5 text-xs">
        {/* Row 1: Core Navigation (History, Theme, Bookmarks, Downloads) */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            id="btn-tab-history"
            onClick={() => onSelectView('history')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'history'
                ? 'bg-indigo-600/30 text-white font-semibold border-indigo-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('history', currentLang, 'Tarihsel Geçmiş')}
          >
            <History className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('history', currentLang, 'Geçmiş')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-theme"
            onClick={() => onSelectView('theme')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'theme'
                ? 'bg-indigo-600/30 text-white font-semibold border-indigo-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('theme', currentLang, 'Görünüm & Renkler')}
          >
            <Palette className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('theme', currentLang, 'Tema')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-bookmarks"
            onClick={() => onSelectView('bookmarks')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'bookmarks'
                ? 'bg-indigo-600/30 text-white font-semibold border-indigo-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('bookmarks', currentLang, 'Yer İmleri')}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('bookmarks', currentLang, 'İmler')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-downloads"
            onClick={() => onSelectView('downloads')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'downloads'
                ? 'bg-blue-600/30 text-white font-semibold border-blue-500/50 shadow-sm ring-1 ring-blue-500/30'
                : 'bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border-blue-500/20'
            }`}
            title={t('downloads', currentLang, 'İndirme Yöneticisi')}
          >
            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('downloads', currentLang, 'İndirmeler')}</span>
          </button>
        </div>

        {/* Row 2: Languages, Security, APIs & Account Sync */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            id="btn-tab-languages"
            onClick={() => onSelectView('languages')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'languages'
                ? 'bg-indigo-600/40 text-indigo-200 font-semibold border-indigo-400/60 shadow-md ring-1 ring-indigo-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('languages', currentLang, '145+ Dil & Çeviri')}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('languages', currentLang, 'Diller')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-security"
            onClick={() => onSelectView('security')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'security'
                ? 'bg-emerald-600/30 text-emerald-200 font-semibold border-emerald-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('security', currentLang, 'NovaShield Güvenlik Kalkanı')}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('security', currentLang, 'Güvenlik')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-apikeys"
            onClick={() => onSelectView('apikeys')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'apikeys'
                ? 'bg-indigo-600/30 text-indigo-200 font-semibold border-indigo-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('api_keys', currentLang, 'API Anahtarları & Entegrasyonlar')}
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('api_keys', currentLang, 'API’ler')}</span>
          </button>

          <button
            type="button"
            id="btn-tab-account"
            onClick={() => onSelectView('account')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
              activeView === 'account'
                ? 'bg-indigo-600/30 text-white font-semibold border-indigo-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title={t('accounts', currentLang, 'Hesap & Senkronizasyon')}
          >
            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">{t('accounts', currentLang, 'Hesap')}</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* VIEW 1: HISTORY (Categorized by Year > Month > Day) */}
        {activeView === 'history' && (
          <div id="sidebar-view-history" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                {t('history_title', currentLang, 'Tarihsel Geçmiş (Yıl / Ay / Gün)')}
              </h3>
              {historyList.length > 0 && (
                <div>
                  {isConfirmingClearHistory ? (
                    <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800/80 px-2 py-1 rounded-lg animate-in fade-in">
                      <span className="text-[10px] text-rose-200">{t('delete_confirm_short', currentLang, 'Silinsin mi?')}</span>
                      <button
                        type="button"
                        onClick={handleClearAllHistory}
                        className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                      >
                        {t('yes', currentLang, 'Evet')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearHistory(false)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                      >
                        {t('cancel', currentLang, 'İptal')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="btn-clear-history-all"
                      onClick={() => setIsConfirmingClearHistory(true)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t('clear', currentLang, 'Temizle')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* History Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
              <input
                type="text"
                placeholder={t('history_search_placeholder', currentLang, 'Geçmişte ara...')}
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/20 border border-white/10 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Hierarchical Tree */}
            {Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center py-8 opacity-60">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{t('no_history', currentLang, 'Henüz kayıtlı bir geçmiş bulunmuyor.')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedHistory)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([yearStr, months]) => {
                    const year = Number(yearStr);
                    const isYearOpen = expandedYears[year] ?? true;

                    return (
                      <div key={year} className="border border-white/10 rounded-xl overflow-hidden bg-black/10">
                        {/* Year Header */}
                        <div
                          onClick={() => toggleYear(year)}
                          className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 font-semibold text-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{year}</span>
                          </div>
                          {isYearOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>

                        {/* Months in this Year */}
                        {isYearOpen && (
                          <div className="p-2 space-y-2 border-t border-white/5">
                            {Object.entries(months).map(([monthKey, days]) => {
                              const mKey = `${year}_${monthKey}`;
                              const isMonthOpen = expandedMonths[mKey] ?? true;

                              return (
                                <div key={monthKey} className="pl-2 border-l border-white/10 space-y-1.5">
                                  <div
                                    onClick={() => toggleMonth(mKey)}
                                    className="py-1 px-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/5 font-medium text-slate-300"
                                  >
                                    <span className="text-[11px]">{monthKey}</span>
                                    {isMonthOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </div>

                                  {/* Days in Month */}
                                  {isMonthOpen && (
                                    <div className="space-y-2 pl-2">
                                      {(Object.entries(days) as [string, HistoryEntry[]][]).map(([dayKey, entries]) => (
                                        <div key={dayKey} className="space-y-1">
                                          <div className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider">
                                            📅 {dayKey}
                                          </div>
                                          <div className="space-y-1">
                                            {entries.map((item) => (
                                              <div
                                                key={item.id}
                                                className="group p-2 rounded-lg bg-black/20 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/30 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                                                onClick={() => onNavigate(item.url)}
                                              >
                                                <div className="min-w-0 flex-1">
                                                  <div className="truncate font-medium text-slate-200">
                                                    {item.title}
                                                  </div>
                                                  <div className="truncate text-[10px] opacity-60 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {item.timeStr} • {item.url}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteHistoryItem(item.id);
                                                    onSelectView('history');
                                                  }}
                                                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                                                  title={t('delete_from_history', currentLang, 'Geçmişten sil')}
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: THEME & COLORS */}
        {activeView === 'theme' && (
          <div id="sidebar-view-theme" className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              {t('theme_title', currentLang, 'Tarayıcı Rengi ve Teması')}
            </h3>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold opacity-80">{t('chrome_presets', currentLang, 'Chrome Hazır Renk Temaları')}</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'chrome-dark', name: 'Chrome Dark', color: '#60a5fa', bg: '#111827' },
                    { id: 'chrome-light', name: 'Chrome Light', color: '#2563eb', bg: '#ffffff' },
                    { id: 'midnight-blue', name: 'Midnight Blue', color: '#38bdf8', bg: '#0a1128' },
                    { id: 'emerald', name: 'Emerald', color: '#10b981', bg: '#064e3b' },
                    { id: 'neon-purple', name: 'Neon Purple', color: '#a855f7', bg: '#1e1035' },
                    { id: 'amber-gold', name: 'Amber Gold', color: '#f59e0b', bg: '#271b07' },
                    { id: 'sunset-rose', name: 'Rose Gold', color: '#f43f5e', bg: '#2e0e18' },
                  ] as const
                ).map((preset) => {
                  const isSelected = theme.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 font-semibold text-white'
                          : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate text-xs">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Palette */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <label className="text-[11px] font-semibold opacity-80">{t('custom_color_picker', currentLang, 'Özel Renk Seçici')}</label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{t('accent_color', currentLang, 'Vurgu Rengi')}:</span>
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t('tab_bar_color', currentLang, 'Sekme Çubuğu Rengi')}:</span>
                  <input
                    type="color"
                    value={theme.tabBarBg}
                    onChange={(e) => handleCustomColorChange('tabBarBg', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t('omnibar_header_color', currentLang, 'Adres Çubuğu / Başlık Rengi')}:</span>
                  <input
                    type="color"
                    value={theme.headerBg}
                    onChange={(e) => handleCustomColorChange('headerBg', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t('page_bg_color', currentLang, 'Sayfa Arka Planı')}:</span>
                  <input
                    type="color"
                    value={theme.contentBg}
                    onChange={(e) => handleCustomColorChange('contentBg', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BOOKMARKS */}
        {activeView === 'bookmarks' && (
          <div id="sidebar-view-bookmarks" className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              {t('saved_bookmarks', currentLang, 'Kayıtlı Yer İmleri')}
            </h3>
            <div className="space-y-1.5">
              {getBookmarks().length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {t('no_bookmarks', currentLang, 'Henüz kayıtlı yer imi yok.')}
                </div>
              ) : (
                getBookmarks().map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    onClick={() => onNavigate(b.url)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-slate-200">{b.title}</div>
                      <div className="text-[10px] opacity-60 truncate">{b.url}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3.5: API KEYS & INTEGRATIONS */}
        {activeView === 'apikeys' && (
          <ApiKeysPanel currentLang={currentLang} />
        )}

        {/* VIEW 3.6: NOVA SHIELD SECURITY & WAIVER EXCEPTIONS */}
        {activeView === 'security' && (
          <SecurityPanel onNavigate={(url) => onNavigate(url)} currentLang={currentLang} />
        )}

        {/* VIEW 4: ACCOUNT & SYNC */}
        {activeView === 'account' && (
          <div id="sidebar-view-account" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                {t('account_sync_title', currentLang, 'Profil & Sekmeler Arası Hesap')}
              </h3>
            </div>

            {/* Active Account Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shadow"
                  style={{ backgroundColor: account.avatarColor }}
                >
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white">{account.name}</div>
                  <div className="text-[11px] text-indigo-200">{account.email}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 pt-1 border-t border-indigo-500/20">
                🔒 <strong>{t('sync_label', currentLang, 'Senkronizasyon:')}</strong> {t('sync_desc', currentLang, 'Bu hesap tüm açık sekmelerde ve yeni pencerelerde siz değiştirene kadar aktif kalır.')}
              </p>
            </div>

            {/* Accounts List & Switcher */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold opacity-80">{t('existing_accounts', currentLang, 'Mevcut Hesaplar')}</label>
              <div className="space-y-1.5">
                {getAccountsList().map((acc) => {
                  const isActive = acc.id === account.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSwitchAccount(acc)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/20 font-semibold text-white'
                          : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: acc.avatarColor }}
                        >
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div>{acc.name}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create New Account Button */}
            {!showCreateAccount ? (
              <button
                type="button"
                id="btn-show-create-account"
                onClick={() => setShowCreateAccount(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-indigo-500 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t('add_new_account', currentLang, 'Yeni Hesap / Profil Ekle')}
              </button>
            ) : (
              <form onSubmit={handleCreateAccount} className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
                <div className="font-semibold text-[11px]">{t('create_profile', currentLang, 'Yeni Profil Oluştur')}</div>
                <input
                  type="text"
                  placeholder={t('account_name_placeholder', currentLang, 'Kullanıcı veya Hesap Adı')}
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder={t('account_email_placeholder', currentLang, 'E-posta / Gmail adresi')}
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    {t('create_and_switch', currentLang, 'Oluştur ve Geçiş Yap')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAccount(false)}
                    className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    {t('cancel', currentLang, 'İptal')}
                  </button>
                </div>
              </form>
            )}

            {/* Sync Notice Alert */}
            {syncNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncNotice}</span>
              </div>
            )}

            {/* Desktop Setup Directory & Liability Waiver Card */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-blue-400" />
                  Masaüstü Kurulum & Veri Bölgesi
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  {getDesktopSetupConfig().platform.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-start gap-1.5">
                  <FolderDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kayıt & İndirme Klasörü:</span>
                    <span className="font-mono text-blue-300 break-all">{getDesktopSetupConfig().userDataPath}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-1.5 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">Yapımcı Sorumsuzluk Muafiyeti:</span>
                    <span>Yapımcı <strong>{PRODUCER_FULL_NAME}</strong> hiçbir eylemden veya veriden sorumlu değildir. Onay tutanağı kalıcıdır.</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  id="btn-sync-to-setup-folder"
                  onClick={handleSyncToSetupFolder}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                  title="Tüm kullanıcı verilerini kurulum indirme bölgesine kaydeder"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Kullanıcı Verilerini Kurulum Klasörüne Senkronize Et</span>
                </button>
              </div>
            </div>

            {/* Game Stats Linked to Account */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  Kullanıcı Oyun İstatistikleri
                </span>
                <span className="text-[10px] text-slate-400">Hesaba Bağlı</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">🏎️ Apex Drive</div>
                  <div className="font-bold text-emerald-400 text-sm">{getGameStats().apexDriveKm} KM</div>
                  <div className="text-[9px] text-slate-400">En İyi: {getGameStats().apexDriveBestScore} Puan</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">🦖 Dinozor Koşusu</div>
                  <div className="font-bold text-amber-400 text-sm">{getGameStats().dinoHighScore}</div>
                  <div className="text-[9px] text-slate-400">En Yüksek Skor</div>
                </div>
              </div>
            </div>

            {/* Export Local Data */}
            <div className="pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <FileJson className="w-4 h-4" />
                {t('export_local_data', currentLang, 'Yerel Verilerimi Dışa Aktar (JSON)')}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: LANGUAGES & SYSTEM-WIDE TRANSLATION */}
        {activeView === 'languages' && (
          <div id="sidebar-view-languages" className="space-y-3.5 pb-6">
            {/* Header & Description */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-white">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  {t('languages', currentLang, 'Diller ve Çeviri')}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {t('select_language', currentLang, '145+ dünya dili ile tüm sistemi ve web sitelerini çevirin')}
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                145+ Dil
              </span>
            </div>

            {/* Quick Open Full Translation Tool */}
            {onOpenTranslateModal && (
              <button
                type="button"
                id="btn-open-translate-full"
                onClick={onOpenTranslateModal}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600/30 to-blue-600/30 hover:from-indigo-600/50 hover:to-blue-600/50 border border-indigo-500/30 text-indigo-200 hover:text-white flex items-center justify-between text-xs transition-all shadow-sm group"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{t('translate', currentLang, 'Canlı Çeviri & Tercüme Aracını Aç')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            )}

            {/* Web Translation Preferences Card */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-xs text-white">
                    {t('auto_translate', currentLang, 'Web Sayfalarını Otomatik Çevir')}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTranslateEnabled}
                    onChange={(e) => handleToggleAutoTranslate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                Yabancı dildeki web sitelerini ziyaret ettiğinizde tüm sayfayı anında hedef dilinize otomatik tercüme eder.
              </p>

              {/* Target Page Translation Language Selector */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300">
                  {t('target_language', currentLang, 'Hedef Çeviri Dili')}:
                </span>
                <select
                  value={targetTranslateLang}
                  onChange={(e) => handleSelectTargetTranslateLang(e.target.value)}
                  className="px-2 py-1 bg-slate-800 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {ALL_LANGUAGES.map((l) => (
                    <option key={`target-${l.code}`} value={l.code}>
                      {l.flag} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Search & Region Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="145+ dilden ara (örn: Türkçe, English, Deutsch, 日本語)..."
                  className="w-full pl-8 pr-8 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                {langSearch && (
                  <button
                    type="button"
                    onClick={() => setLangSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Region Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                {LANGUAGE_REGIONS.map((reg) => {
                  const isActive = langRegionFilter === reg.id;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setLangRegionFilter(reg.id)}
                      className={`px-2 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {reg.icon} {reg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages List (145+ items) */}
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {searchedLanguagesList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {t('no_results', currentLang, 'Aramanızla eşleşen dil bulunamadı.')}
                </div>
              ) : (
                searchedLanguagesList.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  const isTarget = targetTranslateLang === lang.code;

                  return (
                    <div
                      key={lang.code}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 font-semibold text-white shadow-sm'
                          : 'border-white/5 hover:border-white/20 bg-black/20 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onLanguageChange(lang.code);
                          saveLanguage(lang.code);
                          setTargetTranslateLangState(lang.code);
                          saveTargetTranslateLanguage(lang.code);
                        }}
                        className="flex-1 flex items-center gap-2.5 min-w-0 pr-2"
                      >
                        <span className="text-base select-none">{lang.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-white">{lang.nativeName}</span>
                            {lang.nativeName !== lang.name && (
                              <span className="text-[10.5px] text-slate-400 truncate">({lang.name})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500">
                            <span className="font-mono uppercase bg-white/5 px-1 py-0.2 rounded text-[9px]">{lang.code}</span>
                            <span>•</span>
                            <span>{lang.region}</span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {t('active', currentLang, 'Aktif')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onLanguageChange(lang.code);
                              saveLanguage(lang.code);
                            }}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-indigo-600/80 text-slate-400 hover:text-white text-[10px] transition-colors border border-white/5 cursor-pointer"
                          >
                            {t('select_btn', currentLang, 'Seç')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VIEW: DOWNLOADS (Chrome-style download manager in Sidebar) */}
        {activeView === 'downloads' && (
          <DownloadsPanel
            currentLang={currentLang}
            onNavigate={onNavigate}
            onCloseSidebar={onClose}
          />
        )}
      </div>

      {/* Sleek Interface Server & Shield Status Footer */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 shrink-0">
        <div className="text-[10px] text-slate-500 flex flex-col gap-1 font-mono">
          <div className="flex items-center justify-between">
            <span>Server: active_root/folder11</span>
            <span className="text-emerald-400 font-sans">Shielded</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Virus Protection: Active</span>
            <span className="text-blue-400 font-sans font-medium">Ultra V54</span>
          </div>
        </div>
      </div>
    </div>
  );
};
