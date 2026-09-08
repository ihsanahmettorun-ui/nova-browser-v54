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
  FileWarning,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCw,
  X,
  ExternalLink,
  Plus,
  Eye,
} from 'lucide-react';
import { DownloadItem } from '../types.ts';
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
} from '../utils/storage.ts';
import { t } from '../data/languages.ts';

interface DownloadsPanelProps {
  currentLang?: string;
  onNavigate?: (url: string, newTab?: boolean) => void;
  onCloseSidebar?: () => void;
}

export const DownloadsPanel: React.FC<DownloadsPanelProps> = ({
  currentLang = 'tr',
  onNavigate,
  onCloseSidebar,
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => getDownloads());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedItem, setSelectedItem] = useState<DownloadItem | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setDownloads(getDownloads());
    };
    window.addEventListener('nova_downloads_change', handleUpdate);
    const interval = setInterval(handleUpdate, 600);
    return () => {
      window.removeEventListener('nova_downloads_change', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return downloads.filter((item) => {
      if (filter === 'in_progress' && item.status !== 'in_progress' && item.status !== 'paused') {
        return false;
      }
      if (filter === 'completed' && item.status !== 'completed') {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return item.filename.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
      }
      return true;
    });
  }, [downloads, filter, search]);

  const handleStartSample = (type: 'pdf' | 'json' | 'doc') => {
    if (type === 'pdf') {
      addDownload(
        'https://novabrowser.local/docs/Nova-User-Guide.pdf',
        'Nova-User-Guide.pdf',
        '1.9 MB',
        'pdf',
        true
      );
    } else if (type === 'json') {
      addDownload(
        'https://novabrowser.local/config/Nova-Settings.json',
        'Nova-Settings.json',
        '120 KB',
        'json',
        true
      );
    } else {
      addDownload(
        'https://novabrowser.local/docs/Security-Checklist.txt',
        'Security-Checklist.txt',
        '45 KB',
        'txt',
        true
      );
    }
  };

  const handleOpenFolder = () => {
    setInfoNotice('İndirilen dosyalar varsayılan sistem İndirilenler klasörüne kaydedilmektedir.');
    setTimeout(() => setInfoNotice(null), 3500);
  };

  const getIcon = (filename: string, fileType?: string) => {
    const ext = (fileType || filename.split('.').pop() || '').toLowerCase();
    if (['pdf', 'doc', 'txt'].includes(ext)) return <FileText className="w-4 h-4 text-rose-400 shrink-0" />;
    if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="w-4 h-4 text-amber-400 shrink-0" />;
    if (['png', 'jpg', 'webp'].includes(ext)) return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (['json', 'js', 'html'].includes(ext)) return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    if (['exe', 'apk', 'dmg'].includes(ext)) return <FileWarning className="w-4 h-4 text-orange-400 shrink-0" />;
    return <Download className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  return (
    <div id="sidebar-downloads-panel" className="space-y-3.5 text-xs text-slate-200">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              {t('downloads', currentLang, 'İndirme Yöneticisi')}
            </h3>
            <span className="text-[10px] text-slate-400">
              {downloads.length} {t('files', currentLang, 'dosya')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleStartSample('pdf')}
            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Örnek Dosya İndir"
          >
            <Plus className="w-3 h-3" />
            <span>Test İndir</span>
          </button>

          <button
            type="button"
            onClick={handleOpenFolder}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            title="İndirilenler Klasörünü Aç"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          {downloads.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Tüm indirmeleri temizlemek istiyor musunuz?')) {
                  clearDownloads();
                }
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors cursor-pointer"
              title="Tümünü Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer in Sidebar */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[11px] text-amber-200/90 leading-relaxed space-y-1">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t('disclaimer_notice_mini', currentLang, 'Katı Sorumluluk Reddi:')}</span>
        </div>
        <p>
          {t('disclaimer_downloads_sidebar', currentLang, 'İndirilen ve yapılan bütün olaylardan ve dosyalardan Nova Tarayıcı ve yapımcıları hiçbir şekilde sorumlu değildir.')}
        </p>
      </div>

      {infoNotice && (
        <div className="p-2 bg-blue-950/60 border border-blue-500/40 rounded-lg text-[10px] text-blue-200 animate-in fade-in">
          {infoNotice}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İndirilenlerde ara..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10.5px]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü ({downloads.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            İndiriliyor ({downloads.filter((x) => x.status === 'in_progress' || x.status === 'paused').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tamamlandı ({downloads.filter((x) => x.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Downloads List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5 space-y-2">
            <Download className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Kayıtlı indirme bulunamadı</p>
            <button
              type="button"
              onClick={() => handleStartSample('pdf')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              + Örnek PDF İndir
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isDone = item.status === 'completed';
            const isProgress = item.status === 'in_progress';
            const isPaused = item.status === 'paused';
            const isCancelled = item.status === 'cancelled';

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-white/5 hover:border-white/15 bg-black/20 hover:bg-black/30 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(item.filename, item.fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-xs font-bold text-white truncate hover:text-blue-400 cursor-pointer"
                        title={item.filename}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.filename}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">{item.size}</span>
                        <span>•</span>
                        {isDone && (
                          <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 inline" /> Tamamlandı
                          </span>
                        )}
                        {isProgress && (
                          <span className="text-blue-400 font-medium animate-pulse">
                            %{item.progress} • {item.speed || '2.8 MB/sn'}
                          </span>
                        )}
                        {isPaused && (
                          <span className="text-amber-400 font-medium">Duraklatıldı</span>
                        )}
                        {isCancelled && (
                          <span className="text-rose-400 font-medium">İptal Edildi</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isDone && (
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="p-1 rounded-md text-blue-400 hover:bg-white/10 cursor-pointer"
                        title="Önizle / Detaylar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isProgress && (
                      <>
                        <button
                          type="button"
                          onClick={() => pauseDownload(item.id)}
                          className="p-1 rounded-md text-amber-400 hover:bg-white/10 cursor-pointer"
                          title="Duraklat"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelDownload(item.id)}
                          className="p-1 rounded-md text-rose-400 hover:bg-white/10 cursor-pointer"
                          title="İptal Et"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isPaused && (
                      <button
                        type="button"
                        onClick={() => resumeDownload(item.id)}
                        className="p-1 rounded-md text-emerald-400 hover:bg-white/10 cursor-pointer"
                        title="Devam Et"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isCancelled && (
                      <button
                        type="button"
                        onClick={() => retryDownload(item.id)}
                        className="p-1 rounded-md text-blue-400 hover:bg-white/10 cursor-pointer"
                        title="Tekrar Dene"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteDownload(item.id)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Progress Bar */}
                {(isProgress || isPaused) && (
                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isPaused ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Micro Disclaimer on each card */}
                <div className="text-[9px] text-amber-400/90 flex items-center gap-1 font-mono">
                  <span>⚠️ Sorumsuzluk reddi kapsamındadır</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Button to Open Full Chrome Downloads Page */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('nova://downloads');
            }
            if (onCloseSidebar) {
              onCloseSidebar();
            }
          }}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{t('open_full_downloads_page', currentLang, 'Tam Sayfada Aç')} (nova://downloads)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Item Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-4 space-y-3 text-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white truncate max-w-[240px]">
                {selectedItem.filename}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[11px] text-amber-200 leading-relaxed">
              <span className="font-bold text-amber-300 block">Sorumluluk Reddi:</span>
              <span>{selectedItem.disclaimer || DOWNLOAD_DISCLAIMER_TEXT}</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <span className="text-slate-400 block font-semibold">Kaynak URL:</span>
              <p className="font-mono text-slate-300 break-all p-1.5 bg-black/30 rounded-lg border border-white/5">
                {selectedItem.url}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
