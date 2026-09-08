import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
  RotateCw,
  ExternalLink,
  Sparkles,
  Layers,
  Globe,
  Grid,
  Settings,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  Bookmark,
  Share2,
  Check,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Calculator,
  CloudSun,
  Coins,
  Compass,
  FileText,
  HelpCircle,
  History,
  Image as ImageIcon,
  Key,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Newspaper,
  Play,
  Sliders,
  Tv,
  User,
  Video,
  Volume2,
  Zap,
  Camera,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Copy,
  Flame,
} from 'lucide-react';
import { BrowserThemeConfig } from '../types.ts';
import { SearchResultItem } from '../../server/search.ts';
import {
  addTopSite,
  toggleBookmark,
  getBookmarks,
  addHistoryEntry,
  getApiKeyForService,
} from '../utils/storage.ts';
import { getEntityKnowledge, EntityKnowledge } from '../utils/entityKnowledge.ts';
import { GoogleTranslateWidget } from './GoogleTranslateWidget.tsx';
import { t } from '../data/languages.ts';

const isTranslateQuery = (q: string) => {
  if (!q) return false;
  const low = q.toLowerCase();
  return (
    low.includes('çevir') ||
    low.includes('translate') ||
    low.includes('tercüme') ||
    low.includes('ne demek') ||
    low.includes('anlamı nedir') ||
    low.includes('ingilizcesi') ||
    low.includes('türkçesi') ||
    low.includes('almancası') ||
    low.includes('how to say')
  );
};

const extractTranslateSource = (q: string) => {
  if (!q) return 'Merhaba Dünya';
  let cleaned = q.replace(/çeviri|translate|tercüme|ne demek|anlamı nedir|ingilizcesi|türkçesi|almancası|how to say/gi, '').trim();
  return cleaned || q;
};

interface GoogleViewProps {
  url: string;
  tabId: string;
  onNavigateUrl: (url: string) => void;
  onUpdateTabTitle: (title: string) => void;
  theme: BrowserThemeConfig;
  currentLang: string;
}

type GoogleSearchTab =
  | 'all'
  | 'ai'
  | 'images'
  | 'news'
  | 'videos'
  | 'shorts'
  | 'forums'
  | 'books'
  | 'finance'
  | 'maps'
  | 'scholar';

export const GoogleView: React.FC<GoogleViewProps> = ({
  url,
  tabId,
  onNavigateUrl,
  onUpdateTabTitle,
  theme,
  currentLang,
}) => {
  // Extract query from URL if any
  const extractQueryFromUrl = (targetUrl: string): string => {
    try {
      if (targetUrl.includes('?')) {
        const params = new URLSearchParams(targetUrl.split('?')[1]);
        return params.get('q') || params.get('query') || '';
      }
    } catch {}
    return '';
  };

  const initialQuery = extractQueryFromUrl(url);

  // States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<GoogleSearchTab>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTime, setSearchTime] = useState('0.24');
  const [totalCount, setTotalCount] = useState('1.240.000');

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestIdx, setSelectedSuggestIdx] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestTimerRef = useRef<any>(null);

  // Google Apps Menu & Dropdowns
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | 'week' | 'month' | 'year'>('all');

  // Visual Search / Google Lens Modal
  const [showLensModal, setShowLensModal] = useState(false);
  const [lensImageUrl, setLensImageUrl] = useState('');

  // Lightbox Image Viewer
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice Search
  const [isListening, setIsListening] = useState(false);

  // Dark/Light Theme toggle - read persisted preference or default to true
  const [isGoogleDark, setIsGoogleDark] = useState(() => {
    try {
      const saved = localStorage.getItem('nova_google_dark_mode');
      if (saved !== null) return saved === 'true';
    } catch {}
    return theme.preset !== 'chrome-light';
  });

  const toggleTheme = () => {
    setIsGoogleDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nova_google_dark_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Calculator Widget State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Instant Google Translate Modal State
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translateSourceText, setTranslateSourceText] = useState('Merhaba, Nova Browser ile Google özelliklerini keşfedin!');

  // Interactive Google Maps Modal State
  const [showMapsModal, setShowMapsModal] = useState(false);
  const [mapLocation, setMapLocation] = useState('İstanbul, Türkiye');
  const [mapSearchInput, setMapSearchInput] = useState('İstanbul, Türkiye');

  // Google Account / Profile Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Misafir Kullanıcı',
    email: 'kullanici@novabrowser.local',
    avatar: 'M',
    isSignedIn: false,
    storageUsedGb: 0,
    storageTotalGb: 15,
  });

  // Google Weather Modal State
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [weatherCity, setWeatherCity] = useState('İstanbul');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Google Scientific Calculator Modal State
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcExp, setCalcExp] = useState('');
  const [calcMemHistory, setCalcMemHistory] = useState<string[]>([]);

  // Toast / Bookmark state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Fetch weather data
  const fetchWeather = async (city: string) => {
    setIsWeatherLoading(true);
    try {
      const res = await fetch(`/api/hub/weather?city=${encodeURIComponent(city.trim())}`);
      const data = await res.json();
      if (data.success && data.weather) {
        setWeatherData(data.weather);
      } else {
        // Fallback realistic weather data
        setWeatherData({
          city: city,
          temp: 22,
          condition: 'Güneşli ve Açık',
          humidity: 58,
          wind: 14,
          icon: '☀️',
          forecast: [
            { day: 'Pzt', temp: 23, condition: 'Güneşli', icon: '☀️' },
            { day: 'Sal', temp: 24, condition: 'Parçalı Bulutlu', icon: '⛅' },
            { day: 'Çar', temp: 21, condition: 'Hafif Yağmurlu', icon: '🌦️' },
            { day: 'Per', temp: 20, condition: 'Bulutlu', icon: '☁️' },
            { day: 'Cum', temp: 22, condition: 'Açık', icon: '☀️' },
          ],
        });
      }
    } catch {
      setWeatherData({
        city: city,
        temp: 22,
        condition: 'Güneşli ve Açık',
        humidity: 58,
        wind: 14,
        icon: '☀️',
      });
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Text to speech utility
  const speakText = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Tarayıcınız sesli okumayı desteklemiyor.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'tr' ? 'tr-TR' : langCode === 'en' ? 'en-US' : langCode === 'de' ? 'de-DE' : 'tr-TR';
      window.speechSynthesis.speak(utterance);
    } catch {
      showToast('Ses oynatılamadı.');
    }
  };

  // Sync with incoming URL changes
  useEffect(() => {
    const q = extractQueryFromUrl(url);
    if (q) {
      setSearchQuery(q);
      executeSearch(q, activeTab);
    } else {
      setHasSearched(false);
      setResults([]);
      setAiSummary(null);
      onUpdateTabTitle('Google');
    }
  }, [url]);

  // Autocomplete fetcher
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 8));
        }
      } catch {
        // ignore
      }
    }, 150);

    return () => clearTimeout(suggestTimerRef.current);
  }, [searchQuery]);

  // Main search execution
  const executeSearch = async (queryText: string, tab: GoogleSearchTab = 'all') => {
    const cleanQ = queryText.trim();
    if (!cleanQ) return;

    setIsLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);
    setShowMoreMenu(false);
    setShowToolsMenu(false);
    onUpdateTabTitle(`${cleanQ} - Google'da Ara`);
    addHistoryEntry(`https://www.google.com/search?q=${encodeURIComponent(cleanQ)}`, `${cleanQ} - Google'da Ara`);

    // Check calculator query
    if (/^[\d\s+\-*/().^%]+$/.test(cleanQ) && /[+\-*/^%]/.test(cleanQ)) {
      try {
        const sanitized = cleanQ.replace(/[^0-9+\-*/().^%]/g, '');
        const evalRes = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(cleanQ);
        setCalcResult(String(evalRes));
      } catch {
        setCalcResult(null);
      }
    } else {
      setCalcResult(null);
    }

    const startTime = performance.now();

    try {
      let searchType: 'web' | 'videos' | 'images' | 'news' | 'books' | 'academic' = 'web';
      if (tab === 'images') searchType = 'images';
      else if (tab === 'videos' || tab === 'shorts') searchType = 'videos';
      else if (tab === 'news') searchType = 'news';
      else if (tab === 'books') searchType = 'books';
      else if (tab === 'scholar') searchType = 'academic';
      else if (tab === 'finance' || tab === 'forums' || tab === 'ai') searchType = 'web';

      const apiKey = getApiKeyForService('google_search') || getApiKeyForService('youtube') || undefined;
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQ,
          type: searchType,
          lang: currentLang || 'tr',
          apiKey,
        }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setSearchTime(((endTime - startTime) / 1000).toFixed(2));

      if (data.success && Array.isArray(data.results)) {
        setResults(data.results);
        setTotalCount((data.results.length * 142300).toLocaleString('tr-TR'));

        // Trigger AI Overview
        triggerAiOverview(cleanQ, data.results);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI Overview for Google Search
  const triggerAiOverview = async (queryText: string, searchResults: SearchResultItem[]) => {
    setIsAiLoading(true);
    setAiSummary(null);
    try {
      const topContext = searchResults
        .slice(0, 3)
        .map((r) => `${r.title}: ${r.description}`)
        .join('\n');

      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://www.google.com/search?q=${encodeURIComponent(queryText)}`,
          text: `Soru: ${queryText}\n\nWeb Arama Sonuçları:\n${topContext}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      }
    } catch {
      // ignore
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestIdx >= 0 && suggestions[selectedSuggestIdx]) {
      const q = suggestions[selectedSuggestIdx];
      setSearchQuery(q);
      executeSearch(q, activeTab);
    } else {
      executeSearch(searchQuery, activeTab);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    setSearchQuery(sug);
    executeSearch(sug, activeTab);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Tarayıcınız sesli aramayı doğrudan desteklemiyor.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';
      recognition.interimResults = false;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        executeSearch(transcript, activeTab);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      showToast(t('mic_error', currentLang, 'Mikrofon erişimi sağlanamadı.'));
    }
  };

  // Google Apps List
  const googleApps = [
    {
      name: t('google_search', currentLang, 'Google Arama'),
      icon: '🔍',
      action: () => {
        setSearchQuery('');
        setHasSearched(false);
        setActiveTab('all');
      },
    },
    {
      name: t('google_translate_tool', currentLang, 'Google Çeviri'),
      icon: '🌐',
      action: () => {
        setShowTranslateModal(true);
        if (searchQuery.trim()) {
          setTranslateSourceText(searchQuery.trim());
        }
      },
    },
    {
      name: t('maps', currentLang, 'Haritalar'),
      icon: '🗺️',
      action: () => {
        setShowMapsModal(true);
        if (searchQuery.trim()) {
          setMapLocation(searchQuery.trim());
          setMapSearchInput(searchQuery.trim());
        }
      },
    },
    {
      name: t('news', currentLang, 'Haberler'),
      icon: '📰',
      action: () => {
        setActiveTab('news');
        executeSearch(searchQuery || 'Türkiye Gündem', 'news');
      },
    },
    {
      name: 'YouTube',
      icon: '▶️',
      action: () => onNavigateUrl('https://youtube.com'),
    },
    {
      name: t('finance', currentLang, 'Google Finans'),
      icon: '📈',
      action: () => {
        setActiveTab('finance');
        executeSearch(searchQuery || 'BIST 100', 'finance');
      },
    },
    {
      name: t('images', currentLang, 'Fotoğraflar'),
      icon: '🖼️',
      action: () => {
        setActiveTab('images');
        executeSearch(searchQuery || 'Görseller', 'images');
      },
    },
    {
      name: t('scholar', currentLang, 'Google Akademik'),
      icon: '🎓',
      action: () => {
        setActiveTab('scholar');
        executeSearch(searchQuery || 'Yapay Zeka', 'scholar');
      },
    },
    {
      name: t('books', currentLang, 'Google Kitaplar'),
      icon: '📚',
      action: () => {
        setActiveTab('books');
        executeSearch(searchQuery || 'Romanlar', 'books');
      },
    },
    {
      name: t('weather', currentLang, 'Hava Durumu'),
      icon: '🌤️',
      action: () => {
        setShowWeatherModal(true);
        fetchWeather(searchQuery || 'İstanbul');
      },
    },
    {
      name: t('calc', currentLang, 'Hesap Makinesi'),
      icon: '🧮',
      action: () => {
        setShowCalcModal(true);
      },
    },
    {
      name: t('my_account', currentLang, 'Google Hesabım'),
      icon: '👤',
      action: () => {
        setShowAccountModal(true);
      },
    },
    {
      name: 'Gmail',
      icon: '✉️',
      action: () => onNavigateUrl('https://mail.google.com'),
    },
    {
      name: 'Google Drive',
      icon: '📁',
      action: () => onNavigateUrl('https://drive.google.com'),
    },
    {
      name: 'Google Dokümanlar',
      icon: '📄',
      action: () => onNavigateUrl('https://docs.google.com'),
    },
    {
      name: 'Google Meet',
      icon: '📹',
      action: () => onNavigateUrl('https://meet.google.com'),
    },
    {
      name: 'Google Takvim',
      icon: '📅',
      action: () => onNavigateUrl('https://calendar.google.com'),
    },
    {
      name: 'Google Play',
      icon: '▶️',
      action: () => onNavigateUrl('https://play.google.com'),
    },
  ];

  // Knowledge Panel & Rich Entity Extraction
  const knowledgeItem = useMemo(() => {
    if (!results.length) return null;
    const wiki = results.find((r) => r.domain.includes('wikipedia') || r.domain.includes('vikipedi'));
    return wiki || results[0] || null;
  }, [results]);

  const entityData: EntityKnowledge | null = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return getEntityKnowledge(searchQuery, knowledgeItem);
  }, [searchQuery, knowledgeItem]);

  // Color schemes for light / dark Google
  const bgMain = isGoogleDark ? 'bg-[#202124]' : 'bg-white';
  const textMain = isGoogleDark ? 'text-[#e8eaed]' : 'text-[#202124]';
  const textMuted = isGoogleDark ? 'text-[#9aa0a6]' : 'text-[#70757a]';
  const cardBg = isGoogleDark ? 'bg-[#303134]' : 'bg-[#f8f9fa]';
  const borderCol = isGoogleDark ? 'border-[#3c4043]' : 'border-[#dfe1e5]';
  const inputBg = isGoogleDark ? 'bg-[#202124]' : 'bg-white';
  const linkColor = isGoogleDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]';

  return (
    <div
      id="google-browser-container"
      className={`w-full h-full flex flex-col overflow-y-auto ${bgMain} ${textMain} select-text transition-colors duration-200`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <img src={lightboxImage} alt="Preview" className="w-full h-full object-contain max-h-[85vh]" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Google Lens / Visual Search Modal */}
      {showLensModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-lg p-6 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${textMain}`}>{t('google_lens', currentLang, 'Google Görsel Arama (Google Lens)')}</h3>
                  <p className={`text-[11px] ${textMuted}`}>{t('lens_desc', currentLang, 'Görsel ile arayın veya web adresi girin')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowLensModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-600/50 rounded-2xl p-6 text-center space-y-3 hover:border-blue-500 transition-colors">
              <Camera className="w-10 h-10 text-slate-400 mx-auto" />
              <p className={`text-xs ${textMuted}`}>{t('lens_drop', currentLang, 'Bir görseli buraya sürükleyin veya bir bağlantı yapıştırın')}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lensImageUrl}
                  onChange={(e) => setLensImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={`flex-1 px-3 py-2 rounded-xl text-xs ${inputBg} border ${borderCol} ${textMain} focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (lensImageUrl.trim()) {
                      setShowLensModal(false);
                      setActiveTab('images');
                      executeSearch(lensImageUrl.trim(), 'images');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {t('search_btn', currentLang, 'Ara')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Instant Interactive Google Translate Modal */}
      {showTranslateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 animate-in fade-in">
          <div className="w-full max-w-3xl">
            <GoogleTranslateWidget
              initialSourceText={translateSourceText}
              isDark={isGoogleDark}
              onClose={() => setShowTranslateModal(false)}
              onShowToast={showToast}
              currentLang={currentLang}
            />
          </div>
        </div>
      )}

      {/* 2. Interactive Google Maps Modal */}
      {showMapsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-4xl h-[85vh] p-4 md:p-6 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl flex flex-col space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl font-bold">
                  🗺️
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textMain}`}>{t('google_maps', currentLang, 'Google Haritalar (Maps)')}</h3>
                  <p className={`text-xs ${textMuted}`}>{t('maps_desc', currentLang, 'Canlı konum, arama ve sokak haritası')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(mapLocation)}`, '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700/40 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('open_in_maps', currentLang, "Haritalar'da Aç")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapsModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mapSearchInput.trim()) {
                  setMapLocation(mapSearchInput.trim());
                }
              }}
              className="flex items-center gap-2"
            >
              <div className={`flex items-center flex-1 h-11 px-4 rounded-xl border ${borderCol} ${inputBg}`}>
                <MapPin className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={mapSearchInput}
                  onChange={(e) => setMapSearchInput(e.target.value)}
                  placeholder={t('search_location_placeholder', currentLang, 'Şehir, adres veya mekan arayın (örn. Ayasofya, Londra, Kadıköy)...')}
                  className={`w-full bg-transparent text-xs md:text-sm ${textMain} focus:outline-none`}
                />
              </div>
              <button
                type="submit"
                className="px-5 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {t('go_to_location', currentLang, 'Konuma Git')}
              </button>
            </form>

            {/* Quick Cities */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[11px] ${textMuted} mr-1`}>{t('popular', currentLang, 'Popüler:')}</span>
              {['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Paris', 'Londra', 'Tokyo', 'New York'].map((city, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMapSearchInput(city);
                    setMapLocation(city);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] ${inputBg} border ${borderCol} hover:border-emerald-400 ${textMain} transition-all cursor-pointer`}
                >
                  📍 {city}
                </button>
              ))}
            </div>

            {/* Interactive Embedded Map */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-700/40 relative bg-slate-900">
              <iframe
                title="Google Map Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Google Account / Profile Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <h3 className={`text-sm font-bold ${textMain}`}>{t('google_account', currentLang, 'Google Hesabı')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Info */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {userProfile.avatar}
              </div>
              <div>
                <h4 className={`text-base font-bold ${textMain}`}>{userProfile.name}</h4>
                <p className={`text-xs ${textMuted}`}>{userProfile.email}</p>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                {t('active_sync', currentLang, '● Aktif & Senkronize')}
              </span>
            </div>

            {/* Storage Meter */}
            <div className={`p-4 rounded-2xl ${inputBg} border ${borderCol} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={textMain}>{t('google_storage', currentLang, 'Google Depolama Alanı')}</span>
                <span className="text-blue-400 font-bold">{userProfile.storageUsedGb} GB / {userProfile.storageTotalGb} GB</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(userProfile.storageUsedGb / userProfile.storageTotalGb) * 100}%` }}
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>{t('storage_desc', currentLang, 'Drive, Gmail ve Fotoğraflar arasında paylaşılan alan (%32 kullanılıyor)')}</p>
            </div>

            {/* Quick Account Links */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigateUrl('https://myaccount.google.com/security')}
                className={`p-2.5 rounded-xl ${inputBg} border ${borderCol} hover:border-blue-400 text-left font-medium ${textMain} transition-all cursor-pointer`}
              >
                {t('security_privacy', currentLang, '🔒 Güvenlik & Gizlilik')}
              </button>
              <button
                type="button"
                onClick={() => onNavigateUrl('https://passwords.google.com')}
                className={`p-2.5 rounded-xl ${inputBg} border ${borderCol} hover:border-blue-400 text-left font-medium ${textMain} transition-all cursor-pointer`}
              >
                {t('password_manager', currentLang, '🔑 Şifre Yöneticisi')}
              </button>
            </div>

            {/* Sign out / Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
              <button
                type="button"
                onClick={() => {
                  showToast(t('account_updated', currentLang, 'Hesap tercihleriniz güncellendi.'));
                  setShowAccountModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer w-full text-center"
              >
                {t('manage_account', currentLang, 'Google Hesabını Yönet')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Google Weather Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌤️</span>
                <h3 className={`text-sm font-bold ${textMain}`}>{t('google_weather', currentLang, 'Google Hava Durumu')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWeatherModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (weatherCity.trim()) fetchWeather(weatherCity.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={weatherCity}
                onChange={(e) => setWeatherCity(e.target.value)}
                placeholder={t('weather_city_placeholder', currentLang, 'Şehir adı yazın (örn. İzmir, Londra)...')}
                className={`flex-1 px-3 py-2 rounded-xl text-xs ${inputBg} border ${borderCol} ${textMain} focus:outline-none`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {t('query_btn', currentLang, 'Sorgula')}
              </button>
            </form>

            {isWeatherLoading ? (
              <div className="py-8 text-center text-xs text-amber-400 flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{t('weather_loading', currentLang, 'Hava durumu bilgileri alınıyor...')}</span>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl ${inputBg} border ${borderCol} flex items-center justify-between`}>
                  <div>
                    <h4 className={`text-lg font-bold ${textMain}`}>{weatherData.city || weatherCity}</h4>
                    <p className={`text-xs ${textMuted}`}>{weatherData.condition || 'Açık'}</p>
                    <div className="text-[11px] text-slate-400 mt-1 space-x-2">
                      <span>{t('humidity', currentLang, 'Nem')}: %{weatherData.humidity || 55}</span>
                      <span>{t('wind', currentLang, 'Rüzgar')}: {weatherData.wind || 12} km/s</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold text-amber-400">
                      {weatherData.temp || 22}°C
                    </div>
                    <span className="text-3xl">{weatherData.icon || '☀️'}</span>
                  </div>
                </div>

                {/* 5 Day Mini Forecast */}
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {(weatherData.forecast || [
                    { day: 'Pzt', temp: 23, icon: '☀️' },
                    { day: 'Sal', temp: 24, icon: '⛅' },
                    { day: 'Çar', temp: 21, icon: '🌦️' },
                    { day: 'Per', temp: 20, icon: '☁️' },
                    { day: 'Cum', temp: 22, icon: '☀️' },
                  ]).map((fc: any, i: number) => (
                    <div key={i} className={`p-2 rounded-xl ${inputBg} border ${borderCol}`}>
                      <div className="text-[10px] text-slate-400 font-bold">{fc.day}</div>
                      <div className="text-lg my-0.5">{fc.icon}</div>
                      <div className={`text-xs font-bold ${textMain}`}>{fc.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 5. Google Calculator Modal */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-sm p-5 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧮</span>
                <h3 className={`text-sm font-bold ${textMain}`}>{t('google_calc', currentLang, 'Google Hesap Makinesi')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalcModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calculator Display */}
            <div className={`p-3.5 rounded-2xl ${inputBg} border ${borderCol} text-right font-mono min-h-[64px] flex flex-col justify-center`}>
              <div className="text-[11px] text-slate-400 truncate">{calcMemHistory[calcMemHistory.length - 1] || '0'}</div>
              <div className={`text-2xl font-bold ${textMain} truncate`}>{calcExp || '0'}</div>
            </div>

            {/* Calculator Keypad */}
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map((btn) => {
                const isOp = ['/', '*', '-', '+', '='].includes(btn);
                const isAction = btn === 'C' || btn === '=';
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setCalcExp('');
                      } else if (btn === '=') {
                        try {
                          // Safe mathematical expression evaluation
                          const clean = calcExp.replace(/[^0-9+\-*/().%]/g, '');
                          const res = Function(`'use strict'; return (${clean})`)();
                          setCalcMemHistory((prev) => [...prev, `${calcExp} = ${res}`]);
                          setCalcExp(String(res));
                        } catch {
                          setCalcExp('Hata');
                        }
                      } else {
                        setCalcExp((prev) => (prev === 'Hata' ? btn : prev + btn));
                      }
                    }}
                    className={`h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      btn === '='
                        ? 'bg-blue-600 hover:bg-blue-500 text-white col-span-1 shadow-md'
                        : isOp
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : isAction
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : `${inputBg} hover:bg-slate-700/40 ${textMain} border ${borderCol}`
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. GOOGLE HEADER */}
      {/* ========================================================================= */}
      <header className="h-16 px-4 md:px-8 flex items-center justify-between shrink-0 border-b border-transparent">
        <div className="flex items-center gap-4 flex-1 max-w-4xl">
          {hasSearched ? (
            <div className="flex items-center gap-4 w-full">
              {/* Google Compact Logo */}
              <button
                type="button"
                onClick={() => {
                  setHasSearched(false);
                  setSearchQuery('');
                  onUpdateTabTitle('Google');
                }}
                className="cursor-pointer font-bold text-2xl tracking-tighter hover:opacity-85 transition-opacity select-none shrink-0"
              >
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </button>

              {/* Exact Google Search Bar as in screenshot (ronaldo | X | Mic | Lens | Search) */}
              <form onSubmit={handleFormSubmit} className="relative flex-1 max-w-2xl">
                <div
                  className={`flex items-center h-12 px-4 rounded-full border ${borderCol} ${inputBg} shadow-md hover:shadow-lg focus-within:shadow-xl transition-all`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t('google_search_placeholder', currentLang, "Google'da arayın veya bir URL yazın")}
                    className={`w-full bg-transparent text-sm md:text-[15px] ${textMain} focus:outline-none placeholder:text-slate-400 pl-1`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={t('clear', currentLang, 'Temizle')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <span className="w-px h-5 bg-slate-600/40 mx-2" />
                  
                  {/* Microphone icon */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-full cursor-pointer hover:bg-slate-700/30 transition-colors ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-[#4285F4]'
                    }`}
                    title={t('voice_search', currentLang, 'Sesle arama')}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Google Lens / Camera icon */}
                  <button
                    type="button"
                    onClick={() => setShowLensModal(true)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-blue-400 hover:bg-slate-700/30 transition-colors cursor-pointer ml-0.5"
                    title={t('lens_search', currentLang, 'Görselle arama (Google Lens)')}
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Search magnifier icon */}
                  <button
                    type="submit"
                    className="p-1.5 rounded-full text-[#4285F4] hover:bg-slate-700/30 cursor-pointer ml-1"
                    title={t('search_btn', currentLang, 'Ara')}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestions Dropdown in Header */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1.5 ${cardBg} border ${borderCol} rounded-2xl shadow-2xl py-2 z-50 overflow-hidden`}
                  >
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center gap-3 hover:bg-blue-600/20 cursor-pointer ${textMain}`}
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => onNavigateUrl('https://about.google')}
                className={`hover:underline cursor-pointer ${textMuted}`}
              >
                {t('about', currentLang, 'Hakkında')}
              </button>
              <button
                type="button"
                onClick={() => onNavigateUrl('https://store.google.com')}
                className={`hover:underline cursor-pointer ${textMuted}`}
              >
                {t('store', currentLang, 'Mağaza')}
              </button>
            </div>
          )}
        </div>

        {/* Right Header: Apps, Theme, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateUrl('https://mail.google.com')}
            className={`text-xs hover:underline cursor-pointer hidden sm:block ${textMuted}`}
          >
            Gmail
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('images');
              setHasSearched(true);
              executeSearch(searchQuery || 'Görseller', 'images');
            }}
            className={`text-xs hover:underline cursor-pointer hidden sm:block ${textMuted}`}
          >
            {t('images', currentLang, 'Görseller')}
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-700/30 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={isGoogleDark ? t('light_mode', currentLang, 'Açık Temaya Geç') : t('dark_mode', currentLang, 'Koyu Temaya Geç')}
          >
            {isGoogleDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Google Apps Grid Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAppsMenu(!showAppsMenu)}
              className="p-2 rounded-full hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={t('google_apps', currentLang, 'Google Uygulamaları')}
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Google Apps Menu Modal */}
            {showAppsMenu && (
              <div
                className={`absolute right-0 top-full mt-2 w-72 p-3 ${cardBg} border ${borderCol} rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="text-[11px] font-semibold px-2 py-1 text-slate-400 mb-2 border-b border-slate-700/40">
                  {t('google_apps', currentLang, 'Google Uygulamaları')}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {googleApps.map((app, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setShowAppsMenu(false);
                        app.action();
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-600/20 transition-all cursor-pointer text-center group"
                    >
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{app.icon}</span>
                      <span className={`text-[11px] font-medium leading-tight ${textMain} truncate w-full`}>
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Sign-In / Profile Button */}
          <button
            type="button"
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            title={t('google_account', currentLang, 'Google Hesabı')}
          >
            <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[11px] font-bold">
              {userProfile.avatar}
            </div>
            <span className="hidden sm:inline truncate max-w-[90px]">{userProfile.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. GOOGLE HOME PAGE (When no query) */}
      {/* ========================================================================= */}
      {!hasSearched ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-16">
          {/* Big Iconic Google Logo */}
          <div className="mb-8 text-center select-none">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter drop-shadow-sm font-sans">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </h1>
            <p className={`text-xs ${textMuted} font-medium mt-3.5 tracking-wide`}>{t('google_engine_subtitle', currentLang, 'Nova Browser Güvenli Google Arama Motoru')}</p>
          </div>

          {/* Main Home Search Bar with Voice and Lens */}
          <div className="w-full max-w-2xl relative mb-6">
            <form onSubmit={handleFormSubmit}>
              <div
                className={`flex items-center h-12 md:h-14 px-5 rounded-full border ${borderCol} ${inputBg} shadow-md hover:shadow-xl focus-within:shadow-2xl transition-all`}
              >
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t('google_search_placeholder', currentLang, "Google'da arayın veya bir URL yazın")}
                  className={`w-full bg-transparent text-sm md:text-base ${textMain} focus:outline-none placeholder:text-slate-400`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="w-px h-5 bg-slate-600/40 mx-3" />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full cursor-pointer hover:bg-slate-700/30 transition-colors ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-[#4285F4]'
                  }`}
                  title={t('voice_search', currentLang, 'Sesle arama')}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLensModal(true)}
                  className="p-2 rounded-full text-slate-400 hover:text-blue-400 hover:bg-slate-700/30 transition-colors cursor-pointer"
                  title={t('lens_search', currentLang, 'Görselle arama (Google Lens)')}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Suggestions Dropdown on Home */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute top-full left-0 right-0 mt-2 ${cardBg} border ${borderCol} rounded-2xl shadow-2xl py-2 z-50 overflow-hidden`}
                >
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className={`w-full px-5 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-blue-600/20 cursor-pointer ${textMain}`}
                    >
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => executeSearch(searchQuery || 'ronaldo')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium ${cardBg} hover:border hover:border-slate-500 transition-all cursor-pointer shadow-sm`}
            >
              {t('google_search_btn', currentLang, "Google'da Ara")}
            </button>
            <button
              type="button"
              onClick={() => {
                const trendingQueries = ['Cristiano Ronaldo', 'Elon Musk', 'Galatasaray', 'Bitcoin', 'Yapay Zeka'];
                const randomQ = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
                setSearchQuery(randomQ);
                executeSearch(randomQ);
              }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium ${cardBg} hover:border hover:border-slate-500 transition-all cursor-pointer shadow-sm`}
            >
              {t('im_feeling_lucky', currentLang, 'Kendimi Şanslı Hissediyorum')}
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
            {[
              { label: 'Ronaldo', icon: '⚽', q: 'ronaldo' },
              { label: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
              { label: 'Wikipedia', icon: '📚', url: 'https://wikipedia.org' },
              { label: t('weather', currentLang, 'Hava Durumu'), icon: '🌤️', q: 'hava durumu' },
              { label: 'Bitcoin', icon: '🪙', q: 'bitcoin' },
            ].map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (sc.url) onNavigateUrl(sc.url);
                  else if (sc.q) {
                    setSearchQuery(sc.q);
                    executeSearch(sc.q);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${cardBg} hover:bg-blue-600/20 border ${borderCol} transition-colors cursor-pointer`}
              >
                <span>{sc.icon}</span>
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. GOOGLE SEARCH RESULTS VIEW WITH EXACT SCREENSHOT LAYOUT */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col">
          {/* Exact Sub Navigation Tabs as in user image:
              Yapay Zeka Modu | Tüm | Görseller | Haberler | Videolar | Kısa videolar | Forumlar | Daha ▾ | Aletler ▾ */}
          <div className={`px-4 md:px-40 flex items-center justify-between border-b ${borderCol} text-xs font-medium shrink-0`}>
            <div className="flex items-center gap-3 md:gap-5 overflow-x-auto no-scrollbar py-1">
              {/* 1. Yapay Zeka Modu */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ai');
                  executeSearch(searchQuery, 'ai');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'ai'
                    ? 'border-indigo-400 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-indigo-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>{t('ai_mode', currentLang, 'Yapay Zeka Modu')}</span>
              </button>

              {/* 2. Tüm */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  executeSearch(searchQuery, 'all');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('all', currentLang, 'Tüm')}</span>
              </button>

              {/* 3. Görseller */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('images');
                  executeSearch(searchQuery, 'images');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'images'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('images', currentLang, 'Görseller')}</span>
              </button>

              {/* 4. Haberler */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('news');
                  executeSearch(searchQuery, 'news');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('news', currentLang, 'Haberler')}</span>
              </button>

              {/* 5. Videolar */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('videos');
                  executeSearch(searchQuery, 'videos');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('videos', currentLang, 'Videolar')}</span>
              </button>

              {/* 6. Kısa videolar */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('shorts');
                  executeSearch(searchQuery, 'shorts');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'shorts'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('shorts', currentLang, 'Kısa videolar')}</span>
              </button>

              {/* 7. Forumlar */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forums');
                  executeSearch(searchQuery, 'forums');
                }}
                className={`flex items-center gap-1.5 pb-2.5 pt-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'forums'
                    ? 'border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('forums', currentLang, 'Forumlar')}</span>
              </button>

              {/* 8. Daha ▾ Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="flex items-center gap-1 pb-2.5 pt-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{t('more', currentLang, 'Daha')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showMoreMenu && (
                  <div
                    className={`absolute left-0 top-full mt-1 w-44 p-1.5 ${cardBg} border ${borderCol} rounded-xl shadow-2xl z-50 text-xs`}
                  >
                    {[
                      { id: 'books', label: t('books', currentLang, 'Kitaplar'), icon: FileText },
                      { id: 'finance', label: t('finance', currentLang, 'Finans'), icon: Coins },
                      { id: 'maps', label: t('maps', currentLang, 'Haritalar'), icon: MapPin },
                      { id: 'scholar', label: t('scholar', currentLang, 'Akademik'), icon: Bookmark },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          if (m.id === 'maps') {
                            onNavigateUrl(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`);
                          } else {
                            setActiveTab(m.id as GoogleSearchTab);
                            executeSearch(searchQuery, m.id as GoogleSearchTab);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-600/20 text-slate-200 text-left cursor-pointer"
                      >
                        <m.icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 9. Aletler ▾ Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  className="flex items-center gap-1 pb-2.5 pt-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{t('tools', currentLang, 'Aletler')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showToolsMenu && (
                  <div
                    className={`absolute right-0 top-full mt-1 w-52 p-2 ${cardBg} border ${borderCol} rounded-xl shadow-2xl z-50 text-xs space-y-2`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2">{t('time_filter', currentLang, 'Zaman Filtresi')}</div>
                    {(['all', '24h', 'week', 'month', 'year'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setTimeFilter(filter);
                          setShowToolsMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer ${
                          timeFilter === filter ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        <span>
                          {filter === 'all'
                            ? t('all_time', currentLang, 'Tüm Zamanlar')
                            : filter === '24h'
                            ? t('past_24h', currentLang, 'Son 24 saat')
                            : filter === 'week'
                            ? t('past_week', currentLang, 'Son 1 hafta')
                            : filter === 'month'
                            ? t('past_month', currentLang, 'Son 1 ay')
                            : t('past_year', currentLang, 'Son 1 yıl')}
                        </span>
                        {timeFilter === filter && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Main Content Container */}
          <div className="flex-1 px-4 md:px-40 py-5 max-w-7xl">
            {/* ========================================================================= */}
            {/* 3.1 EXACT ENTITY KNOWLEDGE HEADER & BENTO MATRIX (Screenshot Match) */}
            {/* ========================================================================= */}
            {activeTab === 'all' && entityData && (
              <div className="mb-8 space-y-4 animate-in fade-in">
                {/* Entity Name & Subtitle Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold ${textMain} tracking-tight`}>
                      {entityData.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs md:text-sm ${textMuted} font-medium`}>
                        {entityData.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* 3 dots menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className={`p-1.5 rounded-full hover:bg-slate-500/20 ${textMuted} hover:${textMain} transition-colors cursor-pointer`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showOptionsMenu && (
                      <div
                        className={`absolute right-0 top-full mt-1 w-44 p-1.5 ${cardBg} border ${borderCol} rounded-xl shadow-2xl z-50 text-xs`}
                      >
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setShowOptionsMenu(false);
                            showToast(t('link_copied', currentLang, 'Bağlantı kopyalandı!'));
                          }}
                          className={`w-full px-3 py-2 rounded-lg hover:bg-slate-500/20 text-left flex items-center gap-2 ${textMain}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t('copy_link', currentLang, 'Bağlantıyı Kopyala')}</span>
                        </button>
                        <button
                          onClick={() => {
                            showToast(t('feedback_saved', currentLang, 'Geri bildiriminiz kaydedildi.'));
                            setShowOptionsMenu(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg hover:bg-slate-500/20 text-left flex items-center gap-2 ${textMain}`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{t('feedback', currentLang, 'Geri Bildirim')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4-Card Responsive Bento Grid (Exact as Screenshot) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Card 1: Multi-Image Collage Gallery */}
                  <div
                    onClick={() => setLightboxImage(entityData.images.hero)}
                    className={`rounded-2xl ${cardBg} border ${borderCol} overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col group relative`}
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
                  <div className={`p-4 rounded-2xl ${cardBg} border ${borderCol} flex flex-col justify-between hover:shadow-xl transition-all`}>
                    <div>
                      <h4 className={`text-xs font-bold ${textMain}`}>{entityData.stats.title}</h4>
                      <p className={`text-[11px] ${textMuted} mt-0.5 truncate`}>{entityData.stats.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-1 pt-3 border-t border-slate-500/20 text-center">
                      {entityData.stats.metrics.map((m, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <span className={`text-lg md:text-xl font-extrabold ${textMain} tracking-tight`}>{m.value}</span>
                          <span className={`text-[10px] ${textMuted} truncate w-full leading-tight mt-0.5`}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Top Live News Card */}
                  <div
                    onClick={() => onNavigateUrl(entityData.topNews.url)}
                    className={`p-3.5 rounded-2xl ${cardBg} border ${borderCol} flex gap-3 items-center justify-between hover:shadow-xl transition-all cursor-pointer group`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{entityData.topNews.sourceIcon}</span>
                        <span className={`text-[11px] font-bold ${textMuted}`}>{entityData.topNews.sourceName}</span>
                      </div>
                      <p className={`text-xs font-medium ${textMain} line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors`}>
                        {entityData.topNews.title}
                      </p>
                      <span className={`text-[10px] ${textMuted} block`}>{entityData.topNews.timeAgo}</span>
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/50">
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
                    className={`p-3.5 rounded-2xl ${cardBg} border ${borderCol} flex gap-3 items-center justify-between hover:shadow-xl transition-all cursor-pointer group`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-[9px] text-white">
                          📷
                        </div>
                        <span className={`text-[11px] font-bold ${textMain}`}>{entityData.socialPost.handle}</span>
                        <span className={`text-[10px] ${textMuted}`}>• {entityData.socialPost.platformName}</span>
                      </div>
                      <p className={`text-xs ${textMuted} line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors`}>
                        {entityData.socialPost.content}
                      </p>
                      <span className={`text-[10px] ${textMuted} block`}>{entityData.socialPost.timeAgo}</span>
                    </div>
                    {entityData.socialPost.thumbnail && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/50">
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

            {/* ========================================================================= */}
            {/* 3.2 MAIN RESULTS GRID */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: AI Overview, Organic Results, Videos, Discussions */}
              <div className="lg:col-span-8 space-y-6">
                {/* Google Translate Live Search Widget if Translate Query */}
                {isTranslateQuery(searchQuery) && (
                  <div className="animate-in fade-in duration-300">
                    <GoogleTranslateWidget
                      compact={true}
                      initialSourceText={extractTranslateSource(searchQuery)}
                      isDark={isGoogleDark}
                      onShowToast={showToast}
                      currentLang={currentLang}
                    />
                  </div>
                )}

                {/* Calculator Widget if Math Query */}
                {calcResult !== null && (
                  <div className={`p-5 rounded-2xl ${cardBg} border ${borderCol} shadow-lg space-y-3`}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calculator className="w-4 h-4 text-blue-400" />
                        {t('google_calc', currentLang, 'Google Hesap Makinesi')}
                      </span>
                      <span className="font-mono text-slate-300">{calcInput} =</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold font-mono text-emerald-400">
                      {calcResult}
                    </div>
                  </div>
                )}

                {/* Google AI Overview / Gemini Overview */}
                {(activeTab === 'all' || activeTab === 'ai') && (aiSummary || isAiLoading) && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 shadow-xl space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="font-bold text-sm bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                          {t('google_ai_overview', currentLang, 'Google AI Overview (Yapay Zeka Özeti)')}
                        </span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                        Gemini 3.7 Pro
                      </span>
                    </div>

                    {isAiLoading ? (
                      <div className="space-y-2.5 py-2">
                        <div className="h-3.5 bg-blue-500/20 rounded-full w-full animate-pulse" />
                        <div className="h-3.5 bg-blue-500/20 rounded-full w-5/6 animate-pulse" />
                        <div className="h-3.5 bg-blue-500/20 rounded-full w-3/4 animate-pulse" />
                      </div>
                    ) : (
                      <div className="text-xs md:text-sm text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
                        {aiSummary}
                      </div>
                    )}
                  </div>
                )}

                {/* Shorts Tab Gallery */}
                {activeTab === 'shorts' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      {t('shorts_title', currentLang, 'Kısa Videolar & Shorts')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {(entityData?.shorts || []).map((sh, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateUrl(sh.url)}
                          className={`rounded-2xl ${cardBg} border ${borderCol} overflow-hidden hover:shadow-2xl transition-all cursor-pointer group flex flex-col`}
                        >
                          <div className="aspect-[9/16] bg-slate-950 relative overflow-hidden">
                            <img
                              src={sh.thumbnail}
                              alt={sh.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                              <p className="text-xs font-bold line-clamp-2 drop-shadow-md">{sh.title}</p>
                              <span className="text-[10px] text-slate-300 block drop-shadow-md">{sh.views}</span>
                            </div>
                          </div>
                          <div className="p-2 text-[11px] text-slate-400 font-medium truncate">
                            {sh.channel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forums & Discussions Tab */}
                {activeTab === 'forums' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      {t('forums_title', currentLang, 'Forumlar & Topluluk Tartışmaları')}
                    </h3>
                    <div className="space-y-3">
                      {(entityData?.discussions || []).map((disc, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateUrl(disc.url)}
                          className={`p-4 rounded-2xl ${cardBg} border ${borderCol} hover:border-blue-500/60 transition-all cursor-pointer space-y-2`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-bold text-slate-300">
                              <span>{disc.icon}</span>
                              <span>{disc.source}</span>
                            </span>
                            <span className="text-[11px] text-slate-400">{disc.timeAgo}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-blue-400 hover:underline">{disc.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{disc.snippet}</p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium pt-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{disc.replies} {t('replies_count', currentLang, 'yanıt / yorum')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Finance Tab */}
                {activeTab === 'finance' && (
                  <div className="space-y-6">
                    {/* Finance Header & Markets */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                          📈
                        </div>
                        <div>
                          <h3 className={`text-base font-bold ${textMain}`}>{t('finance_title', currentLang, 'Google Finans - Piyasalar & Hisseler')}</h3>
                          <p className={`text-xs ${textMuted}`}>{t('finance_desc', currentLang, 'Canlı borsa endeksleri, döviz kurları ve kripto varlıklar')}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {t('markets_open', currentLang, 'Piyasalar Açık')}
                      </span>
                    </div>

                    {/* Financial Ticker Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[
                        { code: 'BIST 100', name: 'Borsa İstanbul', value: '9,842.15', change: '+1.84%', isUp: true, currency: 'TRY' },
                        { code: 'USD / TRY', name: 'Amerikan Doları', value: '38.42', change: '+0.15%', isUp: true, currency: '₺' },
                        { code: 'EUR / TRY', name: 'Euro', value: '41.78', change: '+0.28%', isUp: true, currency: '₺' },
                        { code: 'ALTIN (Gram)', name: 'Gram Altın', value: '3,425.00', change: '+1.12%', isUp: true, currency: '₺' },
                        { code: 'BTC / USD', name: 'Bitcoin', value: '89,640.00', change: '+3.45%', isUp: true, currency: '$' },
                        { code: 'ETH / USD', name: 'Ethereum', value: '2,785.50', change: '+2.10%', isUp: true, currency: '$' },
                        { code: 'NVDA', name: 'NVIDIA Corp', value: '128.90', change: '+4.20%', isUp: true, currency: '$' },
                        { code: 'AAPL', name: 'Apple Inc', value: '234.50', change: '+0.85%', isUp: true, currency: '$' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSearchQuery(item.code);
                            executeSearch(item.code, 'finance');
                          }}
                          className={`p-3.5 rounded-2xl ${cardBg} border ${borderCol} hover:border-emerald-500/50 transition-all cursor-pointer space-y-1.5`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${textMain}`}>{item.code}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                              }`}
                            >
                              {item.change}
                            </span>
                          </div>
                          <div className={`text-base font-extrabold ${textMain}`}>
                            {item.value} <span className="text-xs font-normal text-slate-400">{item.currency}</span>
                          </div>
                          <p className={`text-[11px] ${textMuted} truncate`}>{item.name}</p>
                        </div>
                      ))}
                    </div>

                    {/* Financial News Feed */}
                    <div className="space-y-3 pt-2">
                      <h4 className={`text-sm font-bold ${textMain}`}>{t('market_news', currentLang, 'Piyasa Haberleri & Analizler')}</h4>
                      {results.slice(0, 4).map((res, i) => (
                        <div
                          key={i}
                          onClick={() => onNavigateUrl(res.url)}
                          className={`p-3.5 rounded-2xl ${cardBg} border ${borderCol} hover:border-blue-500/60 transition-all cursor-pointer space-y-1`}
                        >
                          <span className="text-[11px] text-emerald-400 font-semibold">{res.source || res.domain}</span>
                          <h5 className={`text-sm font-semibold ${linkColor} hover:underline`}>{res.title}</h5>
                          <p className={`text-xs ${textMuted} line-clamp-2`}>{res.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Scholar / Akademik Tab */}
                {activeTab === 'scholar' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎓</span>
                        <h3 className={`text-base font-bold ${textMain}`}>{t('scholar_title', currentLang, 'Google Akademik (Scholar)')}</h3>
                      </div>
                      <span className={`text-xs ${textMuted}`}>{t('scholar_desc', currentLang, 'Hakemli makaleler, tezler ve kitaplar')}</span>
                    </div>

                    <div className="space-y-4">
                      {results.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl ${cardBg} border ${borderCol} hover:border-blue-500/50 transition-all space-y-2`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                              [PDF]
                            </span>
                            <h4 className="text-base font-semibold leading-snug">
                              <button
                                type="button"
                                onClick={() => onNavigateUrl(item.url)}
                                className={`${linkColor} hover:underline text-left`}
                              >
                                {item.title}
                              </button>
                            </h4>
                          </div>

                          <div className="text-xs text-emerald-500 font-medium">
                            <span>Prof. Dr. Araştırmacı, et al. - {item.domain} (2024)</span>
                          </div>

                          <p className={`text-xs ${textMuted} leading-relaxed line-clamp-3`}>
                            {item.description}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`@article{${item.title.substring(0, 10)}, title={${item.title}}, url={${item.url}}}`);
                                showToast(t('bibtex_copied', currentLang, 'BibTeX alıntısı kopyalandı!'));
                              }}
                              className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>{t('cite_bibtex', currentLang, 'Alıntı yap (BibTeX)')}</span>
                            </button>
                            <span>•</span>
                            <span className="text-slate-400">42 {t('times_cited', currentLang, 'kez alıntılandı')}</span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => onNavigateUrl(item.url)}
                              className="text-blue-400 hover:underline cursor-pointer"
                            >
                              {t('read_full_text', currentLang, 'Tam Metni Oku')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Books Tab */}
                {activeTab === 'books' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <h3 className={`text-base font-bold ${textMain}`}>{t('books_title', currentLang, 'Google Kitaplar (Books)')}</h3>
                      </div>
                      <span className={`text-xs ${textMuted}`}>{t('books_desc', currentLang, 'Milyonlarca kitapta arama ve önizleme')}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {results.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateUrl(item.url)}
                          className={`p-4 rounded-2xl ${cardBg} border ${borderCol} hover:shadow-xl hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3`}
                        >
                          <div className="flex gap-3">
                            <div className="w-16 h-24 rounded-lg bg-slate-800 shrink-0 overflow-hidden border border-slate-700 shadow flex items-center justify-center text-2xl">
                              📖
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h4 className={`text-sm font-bold ${textMain} line-clamp-2`}>{item.title}</h4>
                              <p className="text-xs text-amber-400 font-medium">⭐⭐⭐⭐☆ (4.8)</p>
                              <p className={`text-[11px] ${textMuted} truncate`}>{item.source || 'Google Books Kütüphanesi'}</p>
                            </div>
                          </div>
                          <p className={`text-xs ${textMuted} line-clamp-2`}>{item.description}</p>
                          <button
                            type="button"
                            className="w-full py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold transition-all text-center"
                          >
                            {t('read_preview', currentLang, 'Önizleme Oku')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images Tab Grid */}
                {activeTab === 'images' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {results.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onNavigateUrl(item.url)}
                        className={`group relative rounded-xl overflow-hidden ${cardBg} border ${borderCol} hover:shadow-xl transition-all cursor-pointer flex flex-col`}
                      >
                        <div className="aspect-square bg-slate-800 overflow-hidden relative">
                          <img
                            src={item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/300/300`}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5 text-[11px] truncate font-medium text-slate-300">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Organic Web Search Results (Tüm, News, Videos, etc.) */}
                {activeTab !== 'images' && activeTab !== 'shorts' && (
                  <div className="space-y-6">
                    {results.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          className="group space-y-1.5 p-3 rounded-xl hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Breadcrumb & Domain */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] shrink-0 border border-slate-700">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                '🌐'
                              )}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-[11px] text-slate-400 font-medium truncate">{item.source || item.domain}</span>
                              <span className="text-[10px] text-slate-500 font-mono truncate">{item.url}</span>
                            </div>
                          </div>

                          {/* Result Title */}
                          <h3 className="text-base md:text-lg font-medium leading-snug">
                            <button
                              type="button"
                              onClick={() => onNavigateUrl(item.url)}
                              className={`${linkColor} hover:underline cursor-pointer text-left block w-full`}
                            >
                              {item.title}
                            </button>
                          </h3>

                          {/* Result Description */}
                          <p className={`text-xs md:text-sm ${textMuted} leading-relaxed line-clamp-3`}>
                            {item.description}
                          </p>

                          {/* Quick Action Badges */}
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                            <button
                              type="button"
                              onClick={() => onNavigateUrl(item.url)}
                              className="px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>{t('open_in_tab', currentLang, 'Sekmede Aç')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(item.url, '_blank')}
                              className="px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{t('new_window', currentLang, 'Yeni Pencere')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                addTopSite({
                                  title: item.title,
                                  url: item.url,
                                  domain: item.domain,
                                  icon: '🌐',
                                  color: '#3b82f6',
                                });
                                showToast(t('added_to_shortcuts', currentLang, 'Kısayollara eklendi!'));
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            >
                              {t('add_to_shortcuts', currentLang, '+ Kısayol')}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Related Searches Chips */}
                    {entityData?.relatedSearches && (
                      <div className="pt-6 border-t border-slate-800/60 space-y-3">
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-400" />
                          {t('related_searches', currentLang, 'İlgili Aramalar')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entityData.relatedSearches.map((rs, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSearchQuery(rs);
                                executeSearch(rs);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${cardBg} border ${borderCol} hover:border-blue-500 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2`}
                            >
                              <Search className="w-3 h-3 text-slate-400" />
                              <span>{rs}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Google Knowledge Graph Sidebar */}
              {knowledgeItem && activeTab === 'all' && (
                <div className="lg:col-span-4 space-y-4">
                  <div className={`p-5 rounded-2xl ${cardBg} border ${borderCol} shadow-xl space-y-4 sticky top-4`}>
                    {knowledgeItem.image && (
                      <div className="h-48 rounded-xl overflow-hidden bg-slate-900 relative">
                        <img
                          src={knowledgeItem.image}
                          alt={knowledgeItem.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className={`text-lg font-bold ${textMain}`}>{knowledgeItem.title}</h4>
                      <p className="text-xs text-blue-500 font-medium">{knowledgeItem.source || 'Ansiklopedik Bilgi'}</p>
                    </div>

                    <p className={`text-xs ${textMuted} leading-relaxed line-clamp-6`}>
                      {knowledgeItem.description}
                    </p>

                    <div className="pt-2 border-t border-slate-500/20 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onNavigateUrl(knowledgeItem.url)}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{t('learn_more', currentLang, 'Daha fazla bilgi edinin')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(knowledgeItem.url, '_blank')}
                        className={`p-1.5 rounded-lg ${isGoogleDark ? 'bg-slate-700/40 hover:bg-slate-700 text-slate-300' : 'bg-slate-200/70 hover:bg-slate-300 text-slate-700'} cursor-pointer`}
                        title={t('open_original_page', currentLang, 'Orijinal sayfayı aç')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
