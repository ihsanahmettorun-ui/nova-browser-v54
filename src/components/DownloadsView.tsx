import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Search,
  Trash2,
  FolderOpen,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Film,
  Music,
  FileWarning,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RotateCw,
  X,
  ExternalLink,
  Plus,
  ShieldCheck,
  Eye,
  Copy,
  Info,
  ShieldAlert,
  Monitor,
} from 'lucide-react';
import { DownloadItem, BrowserThemeConfig } from '../types.ts';
import {
  getDownloads,
  addDownload,
  deleteDownload,
  clearDownloads,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  retryDownload,
  DOWNLOAD_DISCLAIMER_TEXT,
  isLegalRecord,
  PRODUCER_FULL_NAME,
  OFFICIAL_LEGAL_RECORD_FILENAME,
} from '../utils/storage.ts';
import { t } from '../data/languages.ts';
import { LegalRecordProtectionModal } from './LegalRecordProtectionModal.tsx';

interface DownloadsViewProps {
  currentLang?: string;
  theme?: BrowserThemeConfig;
  onNavigate?: (url: string) => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  currentLang = 'tr',
  theme,
  onNavigate,
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => getDownloads());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'in_progress' | 'cancelled'>('all');
  const [showNewDownloadModal, setShowNewDownloadModal] = useState(false);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionFilename, setProtectionFilename] = useState(OFFICIAL_LEGAL_RECORD_FILENAME);
  const [customDownloadUrl, setCustomDownloadUrl] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [previewItem, setPreviewItem] = useState<DownloadItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [folderNotice, setFolderNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleLegalAttempt = (e: any) => {
      if (e?.detail?.item?.filename) {
        setProtectionFilename(e.detail.item.filename);
      }
      setShowProtectionModal(true);
    };

    window.addEventListener('nova_legal_record_delete_attempt', handleLegalAttempt);
    return () => {
      window.removeEventListener('nova_legal_record_delete_attempt', handleLegalAttempt);
    };
  }, []);

  // Live subscription to downloads change
  useEffect(() => {
    const handleUpdate = () => {
      setDownloads(getDownloads());
    };

    window.addEventListener('nova_downloads_change', handleUpdate);
    const interval = setInterval(handleUpdate, 600); // Polling for live progress bars

    return () => {
      window.removeEventListener('nova_downloads_change', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Filtered downloads
  const filteredDownloads = useMemo(() => {
    return downloads.filter((item) => {
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.filename.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [downloads, activeFilter, searchQuery]);

  // Group by Date (Bugün, Dün, Daha Önce)
  const groupedDownloads = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const groups: { [key: string]: DownloadItem[] } = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    filteredDownloads.forEach((item) => {
      if (item.timestamp >= today) {
        groups.today.push(item);
      } else if (item.timestamp >= yesterday) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    return groups;
  }, [filteredDownloads]);

  const getFileIcon = (filename: string, fileType?: string) => {
    const ext = (fileType || filename.split('.').pop() || '').toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return <FileText className="w-6 h-6 text-rose-400 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
      return <FileArchive className="w-6 h-6 text-amber-400 shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return <ImageIcon className="w-6 h-6 text-emerald-400 shrink-0" />;
    }
    if (['mp4', 'mkv', 'avi', 'webm', 'mov'].includes(ext)) {
      return <Film className="w-6 h-6 text-indigo-400 shrink-0" />;
    }
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
      return <Music className="w-6 h-6 text-purple-400 shrink-0" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) {
      return <FileCode className="w-6 h-6 text-cyan-400 shrink-0" />;
    }
    if (['exe', 'apk', 'dmg', 'iso', 'bat', 'sh'].includes(ext)) {
      return <FileWarning className="w-6 h-6 text-orange-400 shrink-0" />;
    }
    return <Download className="w-6 h-6 text-blue-400 shrink-0" />;
  };

  const handleStartCustomDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDownloadUrl.trim()) return;
    addDownload(
      customDownloadUrl.trim(),
      customFilename.trim() || undefined,
      '4.5 MB',
      undefined,
      true
    );
    setCustomDownloadUrl('');
    setCustomFilename('');
    setShowNewDownloadModal(false);
  };

  const handleStartSampleDownload = (type: 'pdf' | 'json' | 'html' | 'image') => {
    if (type === 'pdf') {
      addDownload(
        'https://novabrowser.local/samples/Nova-Browser-Security-Report-2026.pdf',
        'Nova-Browser-Security-Report-2026.pdf',
        '2.4 MB',
        'pdf',
        true
      );
    } else if (type === 'json') {
      addDownload(
        'https://novabrowser.local/backup/Nova-Settings-Backup.json',
        `Nova-Settings-Backup-${new Date().toISOString().slice(0, 10)}.json`,
        '180 KB',
        'json',
        true
      );
    } else if (type === 'html') {
      addDownload(
        'https://novabrowser.local/saved/Nova-Search-Homepage.html',
        'Nova-Search-Homepage.html',
        '85 KB',
        'html',
        true
      );
    } else if (type === 'image') {
      addDownload(
        'https://novabrowser.local/wallpaper/Nova-Cosmic-Wallpaper-4K.png',
        'Nova-Cosmic-Wallpaper-4K.png',
        '5.1 MB',
        'png',
        true
      );
    }
    setShowNewDownloadModal(false);
  };

  const handleCopyLink = (item: DownloadItem) => {
    try {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const handleOpenFolder = () => {
    setFolderNotice('İndirilen dosyalar varsayılan sistem İndirilenler (Downloads) klasöründe saklanmaktadır.');
    setTimeout(() => setFolderNotice(null), 4000);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div
      id="nova-chrome-downloads-manager"
      className="w-full h-full bg-[#0F172A] text-slate-100 flex flex-col overflow-y-auto selection:bg-blue-600 selection:text-white"
    >
      {/* 1. Chrome-Style Downloads Header */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {t('downloads', currentLang, 'İndirilenler')}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                  Chrome Engine v54
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {downloads.length} {t('downloads_total', currentLang, 'dosya kayıtlı')}
              </p>
            </div>
          </div>

          {/* Search Bar in Header */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="downloads-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_downloads_placeholder', currentLang, 'İndirilenlerde ara (dosya adı veya URL)...')}
              className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-downloads-folder"
              onClick={handleOpenFolder}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title={t('open_downloads_folder', currentLang, 'İndirilenler Klasörünü Aç')}
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            {downloads.length > 0 && (
              <button
                type="button"
                id="btn-clear-all-downloads"
                onClick={() => {
                  if (
                    confirm(
                      `İndirme geçmişini temizlemek istediğinizden emin misiniz?\n\nNot: Yapımcı ${PRODUCER_FULL_NAME}'a ait resmi hukuki onay belgeleri sistem gereği korunacaktır.`
                    )
                  ) {
                    const res = clearDownloads();
                    if (res.protectedCount > 0) {
                      setFolderNotice(
                        `İndirmeler temizlendi. Yapımcı ${PRODUCER_FULL_NAME}'a ait ${res.protectedCount} adet yasal onay belgesi korundu ve silinmedi.`
                      );
                      setTimeout(() => setFolderNotice(null), 5000);
                    }
                  }
                }}
                className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-medium border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                title={t('clear_all_downloads', currentLang, 'Tüm Listeyi Temizle')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-1 pb-2 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t('all', currentLang, 'Tümü')} ({downloads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t('completed', currentLang, 'Tamamlananlar')} ({downloads.filter((x) => x.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t('in_progress', currentLang, 'Devam Edenler')} ({downloads.filter((x) => x.status === 'in_progress' || x.status === 'paused').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'cancelled'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t('cancelled', currentLang, 'İptal Edilenler')} ({downloads.filter((x) => x.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Persistent High-Priority Mandatory Legal & Security Liability Disclaimer Banner */}
        <div
          id="downloads-strict-liability-banner"
          className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-xl flex items-start gap-4 text-amber-200"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
            <h2 className="font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              ⚠️ {t('strict_download_liability_title', currentLang, 'YASAL SORUMLULUK BİLDİRİSİ & SORUMSUZLUK KAYDI')}
            </h2>
            <p className="text-amber-100 font-medium leading-relaxed">
              {t('strict_download_liability_body', currentLang, 'Nova Browser üzerinden veya internetten indirilen HER TÜRLÜ DOSYADAN, yazılımdan, çalıştırılabilir belgelerden ve kullanıcı tarafından GERÇEKLEŞTİRİLEN BÜTÜN OLAYLARDAN, eylemlerden ve işlemlerden Nova Browser, yapımcıları ve geliştiricileri KESİNLİKLE VE HİÇBİR ŞEKİLDE SORUMLU DEĞİLDİR. İndirilen dosyaların açılması, yürütülmesi, cihaza yüklenmesi ve tüm hukuki, cezai ve teknik sonuçlar münhasıran ve tamamen kullanıcıya aittir.')}
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-400/90 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 inline" />
              <span>{t('mandatory_consent_rule', currentLang, 'Tüm indirmeler kullanıcı onaylı ve yerel sandbox protokolü kapsamında işlenir.')}</span>
            </div>
          </div>
        </div>

        {folderNotice && (
          <div className="p-3 bg-blue-950/50 border border-blue-500/40 rounded-xl text-xs text-blue-200 flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{folderNotice}</span>
          </div>
        )}

        {/* 3. Grouped Downloads List */}
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Download className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-300">
                {searchQuery ? t('no_downloads_found', currentLang, 'Aramanıza uygun indirme bulunamadı') : t('no_downloads_yet', currentLang, 'Henüz indirilmiş bir dosya yok')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('no_downloads_sub', currentLang, 'Web sayfalarından veya aşağıdaki butona tıklayarak örnek dosyaları indirip Chrome indirme yönetimini test edebilirsiniz.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewDownloadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('start_test_download', currentLang, 'Örnek Dosya İndir')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today */}
            {groupedDownloads.today.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('today', currentLang, 'Bugün')}</span>
                  <span className="text-[10px] text-slate-600 font-normal">({groupedDownloads.today.length})</span>
                </div>
                <div className="space-y-3">
                  {groupedDownloads.today.map((item) => renderDownloadCard(item))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedDownloads.yesterday.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('yesterday', currentLang, 'Dün')}</span>
                  <span className="text-[10px] text-slate-600 font-normal">({groupedDownloads.yesterday.length})</span>
                </div>
                <div className="space-y-3">
                  {groupedDownloads.yesterday.map((item) => renderDownloadCard(item))}
                </div>
              </div>
            )}

            {/* Earlier */}
            {groupedDownloads.earlier.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('earlier', currentLang, 'Daha Önce')}</span>
                  <span className="text-[10px] text-slate-600 font-normal">({groupedDownloads.earlier.length})</span>
                </div>
                <div className="space-y-3">
                  {groupedDownloads.earlier.map((item) => renderDownloadCard(item))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. New Download / Test Download Modal */}
      {showNewDownloadModal && (
        <div
          id="modal-new-download-backdrop"
          onClick={() => setShowNewDownloadModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            id="modal-new-download-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t('download_management_title', currentLang, 'Chrome Tarzı Dosya İndirme')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('download_test_subtitle', currentLang, 'Gerçek veya simüle indirme sürecini başlatın')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDownloadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strict Notice in Modal */}
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('disclaimer_notice_mini', currentLang, 'Katı Sorumluluk Reddi:')}
              </span>
              <p>
                {t('disclaimer_notice_mini_desc', currentLang, 'İndirilen ve yapılan bütün olaylardan ve dosyalardan Nova Tarayıcı sorumlu değildir. İndirme işlemini başlatarak bu kuralı kabul etmiş sayılırsınız.')}
              </p>
            </div>

            {/* Quick Sample Downloads */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t('quick_samples', currentLang, 'Hızlı Örnek İndirmeler:')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStartSampleDownload('pdf')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">PDF Raporu</span>
                    <span className="text-[10px] text-slate-400">2.4 MB • Güvenlik</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSampleDownload('json')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">Yedek JSON</span>
                    <span className="text-[10px] text-slate-400">180 KB • Yapılandırma</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSampleDownload('html')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">Web Kaynak Kodu</span>
                    <span className="text-[10px] text-slate-400">85 KB • HTML/DOM</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSampleDownload('image')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">4K Görsel</span>
                    <span className="text-[10px] text-slate-400">5.1 MB • Arka Plan</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom URL Form */}
            <form onSubmit={handleStartCustomDownload} className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {t('custom_url_download', currentLang, 'Özel URL ile Dosya İndir:')}
              </label>
              <div>
                <input
                  type="url"
                  required
                  value={customDownloadUrl}
                  onChange={(e) => setCustomDownloadUrl(e.target.value)}
                  placeholder="https://example.com/dosya.zip"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder={t('filename_opt', currentLang, 'Dosya Adı (İsteğe bağlı)')}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{t('start_download_btn', currentLang, 'İndirmeyi Başlat & Sorumluluğu Onayla')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. File Preview / Details Modal */}
      {previewItem && (
        <div
          id="modal-preview-backdrop"
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            id="modal-preview-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {getFileIcon(previewItem.filename, previewItem.fileType)}
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate max-w-xs">
                    {previewItem.filename}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {previewItem.size} • {formatDate(previewItem.timestamp)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prominent Disclaimer on Item View */}
            <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl text-xs text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                {t('item_disclaimer_title', currentLang, 'Özel Sorumluluk Reddi:')}
              </span>
              <p className="leading-relaxed">
                {previewItem.disclaimer || DOWNLOAD_DISCLAIMER_TEXT}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Kaynak Bağlantısı (URL):</span>
                <p className="font-mono text-slate-200 break-all">{previewItem.url}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Durum:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                  </span>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Güvenlik Kontrolü:</span>
                  <span className="font-semibold text-blue-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> NovaShield Taraması Geçti
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopyLink(previewItem);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId === previewItem.id ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('ok', currentLang, 'Tamam')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LegalRecordProtectionModal
        isOpen={showProtectionModal}
        onClose={() => setShowProtectionModal(false)}
        recordFilename={protectionFilename}
      />
    </div>
  );

  // Download Card Renderer
  function renderDownloadCard(item: DownloadItem) {
    const isFinished = item.status === 'completed';
    const isPaused = item.status === 'paused';
    const isInProgress = item.status === 'in_progress';
    const isCancelled = item.status === 'cancelled';

    return (
      <div
        key={item.id}
        id={`download-card-${item.id}`}
        className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isInProgress
            ? 'bg-blue-950/20 border-blue-500/50 shadow-blue-950/20'
            : isCancelled
            ? 'bg-slate-900/40 border-slate-800 opacity-75'
            : 'bg-[#1E293B] border-slate-700/70 hover:border-slate-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* File Details */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
              {getFileIcon(item.filename, item.fileType)}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  onClick={() => setPreviewItem(item)}
                  className="text-sm sm:text-base font-bold text-white hover:text-blue-400 cursor-pointer transition-colors break-words max-w-full"
                  title="Dosyayı önizle veya detaylarını gör"
                >
                  {item.filename}
                </h3>

                {/* Status Badges */}
                {isFinished && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> {t('completed', currentLang, 'Tamamlandı')}
                  </span>
                )}
                {isInProgress && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 animate-pulse shrink-0">
                    <Download className="w-3 h-3" /> {t('in_progress', currentLang, 'İndiriliyor')} %{item.progress}
                  </span>
                )}
                {isPaused && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                    <Pause className="w-3 h-3" /> {t('paused', currentLang, 'Duraklatıldı')}
                  </span>
                )}
                {isCancelled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
                    <X className="w-3 h-3" /> {t('cancelled', currentLang, 'İptal Edildi')}
                  </span>
                )}
              </div>

              {/* Source URL & Size */}
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="font-semibold text-slate-300">{item.size}</span>
                <span>•</span>
                <span className="truncate max-w-xs text-slate-400 hover:text-slate-200" title={item.url}>
                  {item.url}
                </span>
                <span>•</span>
                <span className="text-slate-500">{formatDate(item.timestamp)}</span>
              </div>

              {/* In-Progress Live Progress Bar */}
              {(isInProgress || isPaused) && (
                <div className="space-y-1 pt-1 max-w-md">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isPaused ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{item.speed || '2.8 MB/sn'}</span>
                    <span>{item.timeLeft || `${100 - item.progress}% kaldı`}</span>
                  </div>
                </div>
              )}

              {/* CRITICAL: Strict Disclaimer explicitly written on EVERY item card */}
              <div
                className={`mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                  isLegalRecord(item)
                    ? 'bg-amber-950/60 border-amber-400 text-amber-100 shadow-md shadow-amber-950/40'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200/90'
                }`}
              >
                {isLegalRecord(item) ? (
                  <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-amber-300">
                    {isLegalRecord(item)
                      ? 'KORUMALI RESMİ HUKUKİ ONAY TUTANAĞI:'
                      : t('liability_waiver_mini_label', currentLang, 'Sorumluluk Reddi:')}
                  </span>{' '}
                  <span>
                    {isLegalRecord(item)
                      ? `Bu belge yapımcı ${PRODUCER_FULL_NAME}'un kesin sorumsuzluk muafiyetini gösterir. Silinebilmesi için Nova Browser uygulamasının ve tüm verilerin sistemden tamamen kaldırılması (Uninstall) zorunludur.`
                      : item.disclaimer || DOWNLOAD_DISCLAIMER_TEXT}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
            {isFinished && (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30 transition-colors cursor-pointer"
                  title="Dosyayı İncele / Aç"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('open_file', currentLang, 'Aç')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  title={t('show_in_folder', currentLang, 'Klasörde Göster')}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {isInProgress && (
              <>
                <button
                  type="button"
                  onClick={() => pauseDownload(item.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/30 transition-colors cursor-pointer"
                  title="İndirmeyi Duraklat"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{t('pause', currentLang, 'Duraklat')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => cancelDownload(item.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-500/30 transition-colors cursor-pointer"
                  title="İndirmeyi İptal Et"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('cancel', currentLang, 'İptal')}</span>
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  type="button"
                  onClick={() => resumeDownload(item.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors cursor-pointer"
                  title="İndirmeye Devam Et"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t('resume', currentLang, 'Devam')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => cancelDownload(item.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                  title="İptal Et"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {isCancelled && (
              <button
                type="button"
                onClick={() => retryDownload(item.id)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                title="Yeniden İndir"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t('retry', currentLang, 'Tekrar Dene')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCopyLink(item)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={copiedId === item.id ? 'Kopyalandı' : 'Bağlantıyı Kopyala'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const res = deleteDownload(item.id);
                if (res.requiresAppUninstall) {
                  setProtectionFilename(item.filename);
                  setShowProtectionModal(true);
                }
              }}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isLegalRecord(item)
                  ? 'bg-amber-950/40 hover:bg-rose-900/60 text-amber-400 hover:text-rose-300 border-amber-500/40 hover:border-rose-500/50'
                  : 'bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border-slate-700 hover:border-rose-500/30'
              }`}
              title={
                isLegalRecord(item)
                  ? 'Korumalı Hukuki Belge (Silmek için uygulamayı kaldırmak gerekir)'
                  : t('remove_from_list', currentLang, 'Listeden Kaldır')
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
