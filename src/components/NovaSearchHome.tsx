import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  Image as ImageIcon,
  BookOpen,
  Video,
  Play,
  Sparkles,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  X,
  Zap,
  Key,
  Newspaper,
  Code,
  Car,
  Gamepad2,
  ShieldCheck,
} from 'lucide-react';
import { GoogleAppsMenu } from './GoogleAppsMenu.tsx';
import { SearchResultItem } from '../../server/search.ts';
import { BrowserThemeConfig, TopSite } from '../types.ts';
import {
  getTopSites,
  addTopSite,
  deleteTopSite,
  updateTopSite,
  resetDefaultTopSites,
  getApiKeyForService,
} from '../utils/storage.ts';
import { getEntityKnowledge, EntityKnowledge } from '../utils/entityKnowledge.ts';
import { t } from '../data/languages.ts';

interface NovaSearchHomeProps {
  initialQuery?: string;
  onNavigateUrl: (url: string, newTab?: boolean) => void;
  theme: BrowserThemeConfig;
  currentLang: string;
}

const EMOJI_OPTIONS = ['🌐', '🔍', '▶️', '📚', '💻', '✖️', '🤖', '🛍️', '📰', '🟢', '📖', '🏛️', '🎮', '🎵', '⚡', '💼', '🚀', '🔥'];
const COLOR_OPTIONS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#1d9bf0'];

export const NovaSearchHome: React.FC<NovaSearchHomeProps> = ({
  initialQuery = '',
  onNavigateUrl,
  theme,
  currentLang,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'web' | 'videos' | 'images' | 'news' | 'books' | 'academic'>('web');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SearchResultItem | null>(null);

  // Dynamic Rich Entity Knowledge for any search
  const entityData: EntityKnowledge | null = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const wiki = results.find((r) => r.domain.includes('wikipedia') || r.domain.includes('vikipedi'));
    return getEntityKnowledge(searchQuery, wiki || results[0] || null);
  }, [searchQuery, results]);

  // Top Sites / Sık Ziyaret Edilenler State
  const [topSites, setTopSites] = useState<TopSite[]>(() => getTopSites());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<TopSite | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('🌐');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [addedShortcutMap, setAddedShortcutMap] = useState<Record<string, boolean>>({});

  // Autocomplete Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestDebounce = useRef<NodeJS.Timeout | null>(null);

  // Refresh top sites
  const refreshTopSites = () => {
    setTopSites(getTopSites());
  };

  // If initialQuery provided, search automatically
  useEffect(() => {
    if (initialQuery.trim()) {
      setSearchQuery(initialQuery);
      executeSearch(initialQuery, searchType);
    }
  }, [initialQuery]);

  // Autocomplete fetching
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || hasSearched) {
      setSuggestions([]);
      return;
    }

    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}&lang=${currentLang}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch {
        // ignore
      }
    }, 200);

    return () => {
      if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    };
  }, [searchQuery, hasSearched, currentLang]);

  const executeSearch = async (queryText: string, type: 'web' | 'videos' | 'images' | 'news' | 'books' | 'academic') => {
    const q = queryText.trim();
    if (!q) return;

    setShowSuggestions(false);
    setIsLoading(true);
    setHasSearched(true);
    setAiAnswer(null);

    try {
      // Check if user configured custom API keys (e.g. YouTube Data API v3 key)
      const ytApiKey = getApiKeyForService('youtube');
      const apiKeyParam = ytApiKey ? `&apiKey=${encodeURIComponent(ytApiKey)}` : '';

      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&type=${type}&lang=${currentLang}${apiKeyParam}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }

      if (type === 'web') {
        fetchAiAnswer(q);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiAnswer = async (queryText: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, lang: currentLang }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setAiAnswer(data.answer);
      }
    } catch {
      // ignore
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if input is a direct valid website URL (e.g. google.com, youtube.com, https://...)
    const trimmed = searchQuery.trim();
    if (/^https?:\/\//i.test(trimmed) || /^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
      onNavigateUrl(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return;
    }

    executeSearch(searchQuery, searchType);
  };

  const handleCategoryChange = (cat: 'web' | 'videos' | 'images' | 'news' | 'books' | 'academic') => {
    setSearchType(cat);
    if (searchQuery.trim()) {
      executeSearch(searchQuery, cat);
    }
  };

  // Top Sites Management Actions
  const handleOpenAddModal = () => {
    setEditingSite(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('🌐');
    setNewColor('#3b82f6');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (site: TopSite, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSite(site);
    setNewTitle(site.title);
    setNewUrl(site.url);
    setNewIcon(site.icon || '🌐');
    setNewColor(site.color || '#3b82f6');
    setIsAddModalOpen(true);
  };

  const handleDeleteSite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTopSite(id);
    refreshTopSites();
  };

  const handleResetDefaults = () => {
    resetDefaultTopSites();
    refreshTopSites();
  };

  const handleSaveModalSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    if (editingSite) {
      updateTopSite(editingSite.id, {
        title: newTitle.trim() || newUrl,
        url: newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
        icon: newIcon,
        color: newColor,
      });
    } else {
      addTopSite({
        title: newTitle.trim() || newUrl,
        url: newUrl.trim(),
        domain: '',
        icon: newIcon,
        color: newColor,
      });
    }

    setIsAddModalOpen(false);
    refreshTopSites();
  };

  return (
    <div
      id="nova-search-home-container"
      className="min-h-full w-full flex flex-col p-4 sm:p-6 overflow-y-auto relative"
      style={{
        backgroundColor: theme.contentBg,
        color: theme.textColor,
      }}
    >
      {/* Background Radial Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Google-Style Apps Navigation Bar */}
      <div className="w-full flex items-center justify-end gap-2 pb-2 relative z-20 flex-wrap">
        <button
          type="button"
          onClick={() => onNavigateUrl('https://apexdrive-global-driving-0000.ai.studio')}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-blue-500/40 shadow-sm transition-all cursor-pointer group"
          title={t('car_game_title', currentLang, 'ApexDrive: Araba Oyunu')}
        >
          <span className="text-base group-hover:scale-110 transition-transform">🏎️</span>
          <span className="hidden sm:inline">{t('car_game_short', currentLang, 'Araba Oyunu (ApexDrive)')}</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono border border-amber-500/30">
            EMBED & OFFLINE
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateUrl('nova://dino')}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
          title={t('dino_runner_name', currentLang, 'Çevrimdışı Dinozor Oyunu')}
        >
          <span>🦖</span>
          <span className="hidden md:inline">{t('dino_runner_short', currentLang, 'Dino Oyunu')}</span>
        </button>

        {/* 9-Dot Google-Style Apps Grid Menu */}
        <GoogleAppsMenu
          onNavigate={(url) => onNavigateUrl(url)}
          currentLang={currentLang}
        />
      </div>

      {/* Centered Search Hero / Top Bar */}
      <div
        className={`w-full max-w-3xl mx-auto transition-all duration-300 relative z-10 ${
          hasSearched ? 'mb-6' : 'my-auto'
        }`}
      >
        {/* Logo and Brand */}
        <div className="text-center mb-5 space-y-2">
          <div
            className="inline-flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              setHasSearched(false);
              setSearchQuery('');
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-900/40"
              style={{ backgroundColor: theme.accentColor }}
            >
              ✦
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Nova<span className="text-blue-500">Search</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  V54 Multi-Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {t('search_engine_subtitle', currentLang, 'Google Eşdeğeri Hızlı & Güvenli Canlı Arama Motoru')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Categories Tabs */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <button
            type="button"
            onClick={() => handleCategoryChange('web')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'web'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {t('all_web', currentLang, 'Tüm Web')}
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('videos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'videos'
                ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {t('videos_youtube', currentLang, 'Videolar & YouTube')}
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('news')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'news'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            {t('news', currentLang, 'Haberler')}
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('images')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'images'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t('images', currentLang, 'Görseller')}
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('books')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'books'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t('books', currentLang, 'Kitaplar')}
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('academic')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchType === 'academic'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            {t('academic_code', currentLang, 'Geliştirici & Kod')}
          </button>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative z-20">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="nova-search-main-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder={t('search_input_placeholder', currentLang, "Web'de arayın veya doğrudan bir site adresi (örn. youtube.com) girin...")}
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/95 border border-slate-700 hover:border-slate-600 focus:border-blue-500 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
              autoFocus={!initialQuery}
              autoComplete="off"
            />
            <button
              type="submit"
              id="btn-execute-novasearch"
              disabled={isLoading}
              className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  {t('search_btn', currentLang, 'Ara')}
                </>
              )}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && !hasSearched && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchQuery(s);
                    setShowSuggestions(false);
                    executeSearch(s, searchType);
                  }}
                  className="px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 cursor-pointer text-xs text-slate-200 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* SPEED DIALS / SIK ZİYARET EDİLENLER (Kısayollar Ekle/Sil/Düzenle) */}
        {!hasSearched && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {t('top_sites_title', currentLang, 'Sık Ziyaret Edilenler & Kısayollar')}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {topSites.length} {t('site_count', currentLang, 'site')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-add-top-site-shortcut"
                  onClick={handleOpenAddModal}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title={t('add_shortcut', currentLang, 'Kısayol Ekle')}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('add_shortcut', currentLang, 'Kısayol Ekle')}
                </button>
                <button
                  type="button"
                  id="btn-reset-top-sites-default"
                  onClick={handleResetDefaults}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={t('reset_defaults', currentLang, 'Varsayılan sitelere sıfırla')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Top Sites Responsive Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {topSites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => onNavigateUrl(site.url)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/60 transition-all hover:scale-105 group cursor-pointer text-center"
                >
                  {/* Action Buttons on Hover (Edit & Delete) */}
                  <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(site, e)}
                      className="p-1 rounded-md bg-slate-900/90 text-slate-300 hover:text-blue-400 hover:bg-slate-950 transition-colors shadow"
                      title={t('edit', currentLang, 'Düzenle')}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSite(site.id, e)}
                      className="p-1 rounded-md bg-slate-900/90 text-slate-300 hover:text-rose-400 hover:bg-slate-950 transition-colors shadow"
                      title={t('delete', currentLang, 'Kısayolu Sil')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Icon Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:shadow-blue-500/20 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${site.color || '#3b82f6'}25`,
                      border: `1px solid ${site.color || '#3b82f6'}50`,
                    }}
                  >
                    {site.icon || '🌐'}
                  </div>

                  {/* Title & Domain */}
                  <div className="w-full px-1">
                    <p className="text-xs font-semibold truncate text-slate-200 group-hover:text-blue-400 transition-colors">
                      {site.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                      {site.domain}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add New Site Card */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-blue-500/80 bg-slate-900/20 hover:bg-slate-800/50 transition-all hover:scale-105 group cursor-pointer text-slate-400 hover:text-blue-400"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800/80 group-hover:bg-blue-600/20 border border-slate-700 group-hover:border-blue-500/40 transition-colors">
                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                </div>
                <span className="text-xs font-medium">{t('add_shortcut', currentLang, 'Kısayol Ekle')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS SECTION */}
      {hasSearched && (
        <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 relative z-10">
          {/* Rich Entity Knowledge Header & 4-Card Bento Row */}
          {searchType === 'web' && entityData && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {entityData.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
                  {entityData.subtitle}
                </p>
              </div>

              {/* 4-Card Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Card 1: Multi-Image Collage Gallery */}
                <div
                  onClick={() => setSelectedImage({ title: entityData.name, url: entityData.images.hero, domain: 'NovaSearch Gallery', description: entityData.subtitle, source: entityData.images.credit, type: 'images', image: entityData.images.hero, score: 100 })}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden hover:border-blue-500 transition-all cursor-pointer flex flex-col group relative"
                >
                  <div className="grid grid-cols-3 gap-1 h-44 bg-slate-950 p-1">
                    <div className="col-span-2 relative overflow-hidden rounded-l-xl">
                      <img
                        src={entityData.images.hero}
                        alt={entityData.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] text-white font-mono truncate max-w-[130px]">
                        {entityData.images.credit}
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-1 rounded-r-xl overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img
                          src={entityData.images.thumb1}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src={entityData.images.thumb2}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white text-[10px] flex items-center gap-1 font-semibold">
                          <ImageIcon className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Live Dynamic Stats Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-blue-500 transition-all">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">{entityData.stats.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{entityData.stats.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-3 border-t border-slate-800 text-center">
                    {entityData.stats.metrics.map((m, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-lg md:text-xl font-extrabold text-white tracking-tight">{m.value}</span>
                        <span className="text-[10px] text-slate-400 truncate w-full leading-tight mt-0.5">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Top Live News Card */}
                <div
                  onClick={() => onNavigateUrl(entityData.topNews.url)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex gap-3 items-center justify-between hover:border-blue-500 transition-all cursor-pointer group"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{entityData.topNews.sourceIcon}</span>
                      <span className="text-[11px] font-bold text-slate-300">{entityData.topNews.sourceName}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                      {entityData.topNews.title}
                    </p>
                    <span className="text-[10px] text-slate-400 block">{entityData.topNews.timeAgo}</span>
                  </div>
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                    <img
                      src={entityData.topNews.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Card 4: Verified Social Media Feed Card */}
                <div
                  onClick={() => onNavigateUrl(entityData.socialPost.url)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex gap-3 items-center justify-between hover:border-blue-500 transition-all cursor-pointer group"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-[9px] text-white">
                        📷
                      </div>
                      <span className="text-[11px] font-bold text-slate-200">{entityData.socialPost.handle}</span>
                      <span className="text-[10px] text-slate-400">• {entityData.socialPost.platformName}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                      {entityData.socialPost.content}
                    </p>
                    <span className="text-[10px] text-slate-400 block">{entityData.socialPost.timeAgo}</span>
                  </div>
                  {entityData.socialPost.thumbnail && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      <img
                        src={entityData.socialPost.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Smart Overview Answer if generated */}
          {(isAiLoading || aiAnswer) && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>{t('ai_overview_title', currentLang, 'Nova AI Akıllı Özet (Google & Gemini Grounding)')}</span>
                {isAiLoading && <Loader2 className="w-3 h-3 animate-spin ml-1 text-blue-400" />}
              </div>
              {aiAnswer ? (
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  {t('ai_generating', currentLang, 'Akıllı yanıt oluşturuluyor...')}
                </div>
              )}
            </div>
          )}

          {/* Results count & source meta */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>
              "{searchQuery}" {t('for_query', currentLang, 'için')} <strong>{results.length}</strong> {t('results_listed', currentLang, 'canlı arama sonucu listelendi')}
            </span>
            <span className="text-[11px] text-blue-400 font-mono">NovaSearch Multi-Engine v54</span>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs">{t('scanning_data', currentLang, 'Google, DuckDuckGo & Ansiklopedi verileri taranıyor...')}</p>
            </div>
          )}

          {/* Image Results Grid */}
          {!isLoading && searchType === 'images' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(item)}
                  className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer aspect-square"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-semibold truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-300 truncate">{item.domain}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video / YouTube Results Grid */}
          {!isLoading && searchType === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <p className="text-sm">{t('no_videos', currentLang, 'Video bulunamadı. Lütfen farklı anahtar kelimelerle arayın.')}</p>
                </div>
              ) : (
                results.map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col"
                  >
                    <div
                      onClick={() => onNavigateUrl(item.url)}
                      className="relative aspect-video bg-black/60 overflow-hidden cursor-pointer"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                          <Video className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                        YouTube HD
                      </div>
                    </div>

                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1">
                        <h4
                          onClick={() => onNavigateUrl(item.url)}
                          className="text-sm font-bold text-slate-100 hover:text-red-400 cursor-pointer line-clamp-2 leading-snug"
                        >
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                          {item.source}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigateUrl(item.url)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            {t('watch_video', currentLang, 'İzle ▶')}
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigateUrl(item.url, true)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title={t('open_new_tab', currentLang, 'Yeni Sekmede Aç (+)')}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Web & Books List (Google-style Rich Results) */}
          {!isLoading && searchType !== 'images' && searchType !== 'videos' && (
            <div className="space-y-3.5">
              {results.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">{t('no_results', currentLang, 'Sonuç bulunamadı. Lütfen farklı anahtar kelimelerle tekrar deneyin.')}</p>
                </div>
              ) : (
                results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-1.5 group shadow-sm"
                  >
                    {/* Domain & Source badge */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <div className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[10px] text-blue-400 font-bold uppercase">
                        {item.domain.charAt(0)}
                      </div>
                      <span className="truncate font-mono text-slate-300">{item.domain}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-medium">
                        {item.source}
                      </span>
                    </div>

                    {/* Title with link */}
                    <h3
                      onClick={() => onNavigateUrl(item.url)}
                      className="text-base font-bold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1.5 group-hover:underline"
                    >
                      {item.title}
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>

                    {/* Description snippet */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Navigation Buttons */}
                    <div className="pt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateUrl(item.url)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {t('open_site', currentLang, 'Siteyi Aç')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateUrl(item.url, true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                      >
                        {t('open_new_tab', currentLang, 'Yeni Sekmede Aç (+)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addTopSite({
                            title: item.title.slice(0, 20),
                            url: item.url,
                            domain: item.domain,
                            icon: '⭐',
                            color: '#3b82f6',
                          });
                          refreshTopSites();
                          setAddedShortcutMap((prev) => ({ ...prev, [item.url]: true }));
                          setTimeout(() => {
                            setAddedShortcutMap((prev) => ({ ...prev, [item.url]: false }));
                          }, 2500);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ml-auto flex items-center gap-1 cursor-pointer ${
                          addedShortcutMap[item.url]
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-amber-300'
                        }`}
                        title={t('add_to_shortcuts', currentLang, 'Kısayollara ekle')}
                      >
                        {addedShortcutMap[item.url] ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{t('added', currentLang, 'Eklendi')}</span>
                          </>
                        ) : (
                          <span>{t('add_to_shortcuts', currentLang, '+ Kısayol Yap')}</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Modal Preview */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-3 p-4"
          >
            <div className="max-h-[60vh] flex items-center justify-center bg-black/50 rounded-xl overflow-hidden">
              <img
                src={selectedImage.image || selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{selectedImage.title}</h4>
                <p className="text-xs text-slate-400">{selectedImage.domain}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateUrl(selectedImage.url);
                    setSelectedImage(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {t('open_source', currentLang, 'Kaynağı Aç')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                >
                  {t('close', currentLang, 'Kapat')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Shortcut Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                {editingSite ? t('edit_shortcut', currentLang, 'Kısayolu Düzenle') : t('new_shortcut', currentLang, 'Yeni Kısayol Ekle')}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('site_title', currentLang, 'Site Başlığı')}</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('site_title_placeholder', currentLang, 'Örn: YouTube, Sözcü, Ekşi Sözlük...')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('site_url', currentLang, 'Web Sitesi Adresi (URL)')} *</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={t('site_url_placeholder', currentLang, 'Örn: youtube.com veya https://www.google.com')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Emoji Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('select_icon', currentLang, 'Simge / Emoji Seçin')}</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/80 rounded-xl border border-slate-700 max-h-24 overflow-y-auto">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewIcon(emo)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                        newIcon === emo ? 'bg-blue-600 text-white scale-110' : 'hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('accent_color', currentLang, 'Aksan Rengi')}</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        newColor === col ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  {t('cancel', currentLang, 'İptal')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingSite ? t('update', currentLang, 'Güncelle') : t('save_shortcut', currentLang, 'Kısayolu Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
