import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  Pause,
  Share2,
  Bookmark,
  ExternalLink,
  RotateCw,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Sliders,
  Menu,
  Home,
  Zap,
  History,
  Clock3,
  PlaySquare,
  Settings,
  X,
  UserCheck,
  Sun,
  Moon,
  PictureInPicture,
  PictureInPicture2,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Check,
  Subtitles,
  Activity,
  Repeat,
  Compass,
  Radio,
  Music,
  Gamepad2,
  Film,
  Cpu,
  Trophy,
  Newspaper,
  ChevronRight,
  Info,
  Shuffle,
  ChevronUp,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  UserPlus,
  MessageSquare,
  Flame,
  ShieldCheck,
  Lock,
  Mail,
  Palette
} from 'lucide-react';
import { BrowserThemeConfig } from '../types.ts';

interface YouTubeViewProps {
  url: string;
  tabId: string;
  onNavigateUrl: (url: string) => void;
  onUpdateTabTitle: (title: string) => void;
  theme: BrowserThemeConfig;
  currentLang: string;
}

export interface VideoData {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnail: string;
  channel: string;
  channelAvatar: string;
  channelVerified?: boolean;
  duration?: string;
  views?: string;
  publishedTime?: string;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// 🌐 YEDEK ZENGİN VİDEO HAVUZU (SAYFAYI TIKLIM TIKLIM DOLDURUR)
const BACKUP_VIDEOS: VideoData[] = [
  { id: 'kXYiU_JCYtU', title: 'Linkin Park - Numb (Official Music Video) [4K]', url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU', embedUrl: '/api/proxy/player?id=kXYiU_JCYtU', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg', channel: 'Linkin Park', channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_mbU56tS1E9QeZ3B0NfH9cK=s176-c-k-c0x00ffffff-no-rj', duration: '3:07' },
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Relax/Study to [24/7]', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', embedUrl: '/api/proxy/player?id=jfKfPfyJRdk', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg', channel: 'Lofi Girl', channelAvatar: 'https://yt3.googleusercontent.com/u7r-e-gX3nN_RzJ_o4f0gC1N7jX8L7pG=s176-c-k-c0x00ffffff-no-rj', duration: 'CANLI' },
  { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You (Official Music Video)', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', embedUrl: '/api/proxy/player?id=JGwWNGJdvx8', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg', channel: 'Ed Sheeran', channelAvatar: 'https://yt3.googleusercontent.com/CsmqWd7rU1N-M1_v6q1Hj9X_X4k=s176-c-k-c0x00ffffff-no-rj', duration: '4:23' },
  { id: 'fJ9rUzIMcZQ', title: 'Queen – Bohemian Rhapsody (Official Video Remastered)', url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', embedUrl: '/api/proxy/player?id=fJ9rUzIMcZQ', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg', channel: 'Queen Official', channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_m9T_YQ_E8E4kX_pG1K=s176-c-k-c0x00ffffff-no-rj', duration: '5:59' },
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Video)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', embedUrl: '/api/proxy/player?id=dQw4w9WgXcQ', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', channel: 'Rick Astley', channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_k6L6c9Z4G8_H=s176-c-k-c0x00ffffff-no-rj', duration: '3:33' },
  { id: 'L_LUpnjgPso', title: 'Google I/O: Yeni Nesil Yapay Zeka Sistemleri', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso', embedUrl: '/api/proxy/player?id=L_LUpnjgPso', thumbnail: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg', channel: 'Google Developers', channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_k6L6c9Z4G8_H=s176-c-k-c0x00ffffff-no-rj', duration: '14:20' },
  { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', embedUrl: '/api/proxy/player?id=kJQP7kiw5Fk', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg', channel: 'Luis Fonsi', channelAvatar: 'https://yt3.googleusercontent.com/CsmqWd7rU1N-M1_v6q1Hj9X_X4k=s176-c-k-c0x00ffffff-no-rj', duration: '4:41' },
  { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars', url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', embedUrl: '/api/proxy/player?id=OPf0YbXqDm0', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg', channel: 'Mark Ronson', channelAvatar: 'https://yt3.googleusercontent.com/u7r-e-gX3nN_RzJ_o4f0gC1N7jX8L7pG=s176-c-k-c0x00ffffff-no-rj', duration: '4:30' }
];

export const YouTubeView: React.FC<YouTubeViewProps> = ({
  url,
  onNavigateUrl,
  onUpdateTabTitle,
}) => {
  const extractVideoId = (urlStr: string): string | null => {
    try {
      const match = urlStr.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      if (match && match[1]) return match[1];
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.searchParams.get('v') || null;
    } catch { return null; }
  };

  const extractSearchQuery = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.searchParams.get('search_query') || parsed.searchParams.get('q') || '';
    } catch { return ''; }
  };

  const currentVideoId = extractVideoId(url);
  const initialQ = extractSearchQuery(url);

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQ);

  // Akış ve Shorts Listeleri
  const [feedVideos, setFeedVideos] = useState<VideoData[]>([]);
  const [shortsList, setShortsList] = useState<VideoData[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);

  // Shorts ve PiP Durumları
  const [isShortsMode, setIsShortsMode] = useState(false);
  const [currentShortIndex, setCurrentShortIndex] = useState(0);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shortsContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==============================================================================
  // 🔍 1. SHORTS ARAMA VE VERİ ÇEKME MOTORU
  // ==============================================================================
  const fetchShorts = async (query = '') => {
    try {
      const res = await fetch(`/api/youtube/shorts?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.shorts) && data.shorts.length > 0) {
        setShortsList(data.shorts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==============================================================================
  // 🔍 2. NORMAL VİDEO ARAMA VE SAYFAYI DOLDURMA
  // ==============================================================================
  const fetchVideos = async (query = '') => {
    setIsLoading(true);
    try {
      let incoming: VideoData[] = [];
      if (query && query.trim()) {
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          incoming = data.videos;
        }
      }

      // Sayfa asla 1 video kalmaz: Zengin havuzdan rastgele tamamla
      const shuffledBackups = [...BACKUP_VIDEOS].sort(() => 0.5 - Math.random());
      const merged = [...incoming, ...shuffledBackups].slice(0, 24);
      setFeedVideos(merged);
    } catch {
      setFeedVideos(BACKUP_VIDEOS);
    } finally {
      setIsLoading(false);
    }
  };

  // Tüm Akışı Baştan Kar (YouTube Logosuna Basınca)
  const refreshEverything = () => {
    setIsRefreshing(true);
    setActiveVideo(null);
    setSearchQuery('');

    fetchShorts('');
    fetchVideos('trend videolar');

    setTimeout(() => {
      setIsRefreshing(false);
      onNavigateUrl('https://www.youtube.com');
      onUpdateTabTitle('YouTube - Yenilenen Akış');
      showToast('YouTube videoları ve Shorts baştan karıldı! ✨');
    }, 300);
  };

  useEffect(() => {
    fetchShorts('');
    fetchVideos(initialQ || 'trend videolar');
  }, []);

  // URL Değişimi Dinleyicisi
  useEffect(() => {
    const q = extractSearchQuery(url);
    if (currentVideoId) {
      if (url.includes('/shorts/')) {
        // Shorts Modunda Aç
        const foundShort = shortsList.find(s => s.id === currentVideoId) || {
          id: currentVideoId,
          title: 'YouTube Shorts',
          url: `https://www.youtube.com/shorts/${currentVideoId}`,
          embedUrl: `/api/proxy/player?id=${currentVideoId}`,
          thumbnail: `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`,
          channel: 'YouTube Shorts',
          channelAvatar: 'https://yt3.googleusercontent.com/u7r-e-gX3nN_RzJ_o4f0gC1N7jX8L7pG=s176-c-k-c0x00ffffff-no-rj'
        };

        const idx = shortsList.findIndex(s => s.id === currentVideoId);
        if (idx !== -1) {
          setCurrentShortIndex(idx);
        } else {
          setShortsList([foundShort, ...shortsList]);
          setCurrentShortIndex(0);
        }
        setIsShortsMode(true);
        setActiveVideo(null);
        onUpdateTabTitle(`${foundShort.title} - YouTube Shorts`);
      } else {
        // Normal Video Modunda Aç
        const found = feedVideos.find(v => v.id === currentVideoId) || BACKUP_VIDEOS.find(v => v.id === currentVideoId) || {
          id: currentVideoId,
          title: 'YouTube HD Video',
          url: `https://www.youtube.com/watch?v=${currentVideoId}`,
          embedUrl: `/api/proxy/player?id=${currentVideoId}`,
          thumbnail: `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`,
          channel: 'YouTube Kanalı',
          channelAvatar: 'https://yt3.googleusercontent.com/u7r-e-gX3nN_RzJ_o4f0gC1N7jX8L7pG=s176-c-k-c0x00ffffff-no-rj',
          duration: 'HD'
        };
        setActiveVideo(found);
        setIsShortsMode(false);
        onUpdateTabTitle(`${found.title} - YouTube`);
      }
    } else if (q) {
      setActiveVideo(null);
      setSearchQuery(q);
      if (isShortsMode) {
        fetchShorts(q);
      } else {
        fetchVideos(q);
      }
      onUpdateTabTitle(`"${q}" - YouTube`);
    } else {
      setActiveVideo(null);
      onUpdateTabTitle('YouTube - Ana Sayfa');
    }
  }, [url, currentVideoId]);

  // ==============================================================================
  // 🎯 3. TIKLANAN DOĞRU SHORTS'U ANINDA AÇ (SHORTSI ARAMA DESTEKLİ)
  // ==============================================================================
  const handleOpenShort = (short: VideoData, index: number) => {
    setActiveVideo(null);
    setIsShortsMode(true);
    setCurrentShortIndex(index);
    onNavigateUrl(`https://www.youtube.com/shorts/${short.id}`);
    onUpdateTabTitle(`${short.title} - YouTube Shorts`);
    showToast(`Shorts Açıldı: ${short.title}`);
  };

  // Shorts Sıradaki / Önceki Geçiş
  const handleNextShort = () => {
    if (shortsList.length === 0) return;
    const nextIdx = (currentShortIndex + 1) % shortsList.length;
    setCurrentShortIndex(nextIdx);
    const nextShort = shortsList[nextIdx];
    onNavigateUrl(`https://www.youtube.com/shorts/${nextShort.id}`);
    onUpdateTabTitle(`${nextShort.title} - YouTube Shorts`);
  };

  const handlePrevShort = () => {
    if (shortsList.length === 0) return;
    const prevIdx = (currentShortIndex - 1 + shortsList.length) % shortsList.length;
    setCurrentShortIndex(prevIdx);
    const prevShort = shortsList[prevIdx];
    onNavigateUrl(`https://www.youtube.com/shorts/${prevShort.id}`);
    onUpdateTabTitle(`${prevShort.title} - YouTube Shorts`);
  };

  // 🖱️ Fare Tekerleği veya Klavye ile Shorts Kaydırma (TikTok / Shorts Deneyimi)
  const handleShortsWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 50) {
      handleNextShort();
    } else if (e.deltaY < -50) {
      handlePrevShort();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isShortsMode) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevShort();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortsMode, currentShortIndex, shortsList]);

  // Arama Formu Gönderimi
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isShortsMode) {
      fetchShorts(searchQuery.trim());
      showToast(`"${searchQuery}" için Shorts aranıyor... 🔍`);
    } else {
      onNavigateUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery.trim())}`);
      fetchVideos(searchQuery.trim());
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div className={`w-full h-full flex flex-col font-sans select-text overflow-hidden ${isDark ? 'bg-[#0f0f0f] text-[#f1f1f1]' : 'bg-white text-[#0f0f0f]'}`}>
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#212121] text-white px-5 py-2.5 rounded-full border border-neutral-700 shadow-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          1. TEPE ÇUBUĞU (LOGO İLE AKIŞ YENİLEME & SHORTS ARAMA)
      ======================================================== */}
      <header className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-40 ${isDark ? 'bg-[#0f0f0f] border-[#272727]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-2 rounded-full hover:bg-neutral-800 cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={refreshEverything}
            className="flex items-center gap-1 cursor-pointer group select-none"
            title="Tüm Akışı ve Shorts'ları Yeniden Karıştır"
          >
            <div className={`w-8 h-6 bg-[#ff0000] rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}>
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            </div>
            <span className="font-bold text-lg tracking-tighter text-white">YouTube</span>
            <span className="text-[10px] text-slate-400 font-bold ml-1">TR</span>
            <RotateCw className="w-3.5 h-3.5 text-slate-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Canlı Arama Çubuğu */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <div className="flex-1 flex items-center border border-neutral-700 rounded-l-full px-4 py-2 bg-[#121212] focus-within:border-blue-500">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isShortsMode ? "Shorts Ara (Örn: minecraft, komik, futbol)..." : "YouTube'da Ara veya Minecraft Videoları..."}
                className="w-full bg-transparent text-sm outline-none text-white placeholder:text-slate-500"
              />
            </div>
            <button type="submit" className="px-6 py-2 border border-l-0 border-neutral-700 rounded-r-full bg-neutral-800 hover:bg-neutral-700 cursor-pointer">
              <Search className="w-4 h-4 text-slate-400" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchShorts('');
              fetchVideos('trend');
              showToast('Tüm havuz rastgele karıldı! 🎲');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 cursor-pointer border border-neutral-700"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span>Rastgele Kar</span>
          </button>

          <button onClick={() => setThemeMode(isDark ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-neutral-800 cursor-pointer text-amber-400">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shadow">
            N
          </div>
        </div>
      </header>

      {/* ========================================================
          2. ANA GÖVDE: KILAVUZ & İÇERİK
      ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sol Kılavuz */}
        <aside className={`${sidebarExpanded ? 'w-60' : 'w-18'} border-r border-[#272727] shrink-0 overflow-y-auto hidden md:flex flex-col justify-between py-2 bg-[#0f0f0f]`}>
          <div className="px-2 space-y-1 text-xs">
            <button
              onClick={() => {
                setIsShortsMode(false);
                setActiveVideo(null);
                onNavigateUrl('https://www.youtube.com');
              }}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer ${!isShortsMode && !activeVideo ? 'bg-[#272727] text-white font-bold' : 'hover:bg-neutral-900'}`}
            >
              <Home className="w-5 h-5 text-red-600 shrink-0" />
              <span>Ana Sayfa</span>
            </button>

            {/* Shorts Butonu */}
            <button
              onClick={() => {
                setIsShortsMode(true);
                setActiveVideo(null);
                if (shortsList.length > 0) {
                  handleOpenShort(shortsList[0], 0);
                }
              }}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer ${isShortsMode ? 'bg-[#272727] text-white font-bold' : 'hover:bg-neutral-900'}`}
            >
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Shorts</span>
            </button>
          </div>

          <div className="p-3 text-[10px] text-slate-500 border-t border-neutral-800">
            <p className="font-semibold text-slate-400">Nova HD Engine V54</p>
            <p className="mt-0.5">Canlı Shorts & Video Motoru</p>
          </div>
        </aside>

        {/* Ana İçerik */}
        <main className="flex-1 overflow-y-auto relative">
          
          {/* ========================================================
              MOD A: SEÇİLEN VİDEO OYNATMA (ENGELSİZ TÜNEL)
          ======================================================== */}
          {activeVideo && !isPiPActive && !isShortsMode ? (
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-neutral-800">
                <iframe
                  key={activeVideo.id}
                  src={`/api/proxy/player?id=${activeVideo.id}`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full border-0"
                />
              </div>

              <h1 className="text-xl font-bold">{decodeHtmlEntities(activeVideo.title)}</h1>

              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <img
                    src={activeVideo.channelAvatar}
                    alt={activeVideo.channel}
                    className="w-12 h-12 rounded-full object-cover shadow border border-neutral-700 shrink-0"
                  />
                  <div>
                    <div className="font-bold text-base flex items-center gap-1.5">
                      <span>{activeVideo.channel}</span>
                      <CheckCircle2 className="w-4 h-4 text-neutral-400 fill-neutral-400" />
                    </div>
                    <div className="text-xs text-slate-400">{activeVideo.views || 'Trend Video'}</div>
                  </div>
                  <button onClick={() => showToast(`${activeVideo.channel} kanalına abone olundu! 🔔`)} className="ml-3 px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 cursor-pointer">
                    Abone Ol
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsPiPActive(true)} className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer" title="Küçük Ekrana Al (PiP)">
                    <PictureInPicture className="w-4 h-4" />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(activeVideo.url); showToast('Bağlantı kopyalandı! 📋'); }} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Paylaş</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isShortsMode && shortsList.length > 0 ? (
            /* ========================================================
                MOD B: DİKEY VE KAYDIRILABİLİR SHORTS OYNATICI (ARANABİLİR)
            ======================================================== */
            <div
              ref={shortsContainerRef}
              onWheel={handleShortsWheel}
              className="w-full h-full flex items-center justify-center p-4 bg-black relative select-none"
            >
              <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950">
                <iframe
                  key={shortsList[currentShortIndex].id} // Tıklanan doğru Shorts'un ID'sine kilitli
                  src={`/api/proxy/player?id=${shortsList[currentShortIndex].id}`}
                  title={shortsList[currentShortIndex].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full border-0"
                />

                {/* Sağ Taraf Aksiyon Butonları */}
                <div className="absolute right-3 bottom-12 flex flex-col items-center gap-4 z-20">
                  <button onClick={() => showToast('Shorts beğenildi! ❤️')} className="w-11 h-11 rounded-full bg-black/60 backdrop-blur text-white flex flex-col items-center justify-center hover:scale-110 cursor-pointer">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-[9px] font-bold">280 B</span>
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(shortsList[currentShortIndex].url); showToast('Bağlantı kopyalandı! 📋'); }} className="w-11 h-11 rounded-full bg-black/60 backdrop-blur text-white flex flex-col items-center justify-center hover:scale-110 cursor-pointer">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Yukarı / Aşağı Butonları */}
              <div className="absolute right-8 flex flex-col gap-3">
                <button onClick={handlePrevShort} className="w-12 h-12 rounded-full bg-neutral-900/80 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur shadow-xl cursor-pointer" title="Önceki Shorts (↑)">
                  <ChevronUp className="w-6 h-6" />
                </button>
                <button onClick={handleNextShort} className="w-12 h-12 rounded-full bg-neutral-900/80 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur shadow-xl cursor-pointer" title="Sonraki Shorts (↓)">
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
                MOD C: DOLU DOLU VE RASTGELE YENİLENEN ANA SAYFA
            ======================================================== */
            <div className="p-4 md:p-6 space-y-8">
              
              {/* 🌟 1. VİDEO IZGARASI (DOLU DOLU VE CANLI) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {feedVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setIsShortsMode(false);
                      setActiveVideo(v);
                      onNavigateUrl(`https://www.youtube.com/watch?v=${v.id}`);
                      onUpdateTabTitle(`${v.title} - YouTube`);
                    }}
                    className="flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {v.duration || '16:9 HD'}
                      </span>
                    </div>

                    <div className="flex gap-3 items-start">
                      <img
                        src={v.channelAvatar}
                        alt={v.channel}
                        className="w-9 h-9 rounded-full object-cover shadow mt-0.5 shrink-0 border border-neutral-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-red-500 transition-colors">
                          {decodeHtmlEntities(v.title)}
                        </h3>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <span className="truncate">{v.channel}</span>
                          <CheckCircle2 className="w-3 h-3 text-neutral-400 fill-neutral-400 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span>{v.views}</span>
                          <span> • </span>
                          <span>{v.publishedTime || 'Trend'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🌟 2. HER YENİLEMEDE RASTGELE DEĞİŞEN 4 SHORTS (ARANABİLİR & TIKLANABİLİR) */}
              <div className="space-y-4 pt-6 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <Zap className="w-5 h-5 text-red-500 fill-current" />
                    <span>Shorts (Rastgele Canlı Akış)</span>
                  </div>
                  <button
                    onClick={() => {
                      fetchShorts('');
                      showToast('Shorts rastgele yeniden karıldı! 🎲');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Shorts'ları Yeniden Kar</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {shortsList.slice(0, 4).map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenShort(s, idx)} // TIKLANAN DOĞRU SHORTS AÇILIR
                      className="flex flex-col gap-2 cursor-pointer group"
                    >
                      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-lg">
                        <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {s.views}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs line-clamp-2 group-hover:text-red-500">{s.title}</h4>
                      <span className="text-[11px] text-slate-400">{s.channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PiP Modu */}
          {isPiPActive && activeVideo && (
            <div className="fixed bottom-6 right-6 w-80 aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-red-500 z-50">
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <button onClick={() => setIsPiPActive(false)} className="p-1 rounded-full bg-black/80 text-white hover:bg-neutral-800">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setIsPiPActive(false); setActiveVideo(null); }} className="p-1 rounded-full bg-black/80 text-white hover:bg-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <iframe
                src={`/api/proxy/player?id=${activeVideo.id}`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};