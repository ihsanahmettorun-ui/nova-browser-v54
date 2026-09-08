import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  X,
  RotateCw,
  Pause,
  Play,
  ExternalLink,
  Plus,
  Eye,
} from 'lucide-react';
import { DownloadItem } from '../types.ts';
import {
  getDownloads,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  retryDownload,
  addDownload,
  deleteDownload,
  DOWNLOAD_DISCLAIMER_TEXT,
} from '../utils/storage.ts';
import { t } from '../data/languages.ts';

interface ChromeDownloadBubbleProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullDownloads: () => void;
  currentLang?: string;
}

export const ChromeDownloadBubble: React.FC<ChromeDownloadBubbleProps> = ({
  isOpen,
  onClose,
  onOpenFullDownloads,
  currentLang = 'tr',
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => getDownloads());

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      setDownloads(getDownloads());
    };

    window.addEventListener('nova_downloads_change', handleUpdate);
    const interval = setInterval(handleUpdate, 500);

    return () => {
      window.removeEventListener('nova_downloads_change', handleUpdate);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const recentItems = downloads.slice(0, 5);

  const handleStartQuickTest = () => {
    addDownload(
      'https://novabrowser.local/docs/Nova-Security-Manual.pdf',
      'Nova-Security-Manual.pdf',
      '3.2 MB',
      'pdf',
      true
    );
  };

  return (
    <div
      id="chrome-downloads-tray-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
    >
      <div
        id="chrome-downloads-bubble"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-4 top-13 w-96 max-w-[92vw] bg-[#1E293B] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
      >
        {/* Header */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {t('downloads', currentLang, 'İndirilenler')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleStartQuickTest}
              className="p-1 rounded-lg text-blue-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('test_download', currentLang, 'Test İndirmesi Başlat')}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persistent Legal Disclaimer Banner */}
        <div className="p-2.5 bg-amber-950/40 border-b border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200 leading-relaxed">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-300">Sorumluluk Reddi:</strong> İndirilen dosyalardan ve yapılan bütün olaylardan Nova Tarayıcı ve yapımcıları hiçbir şekilde sorumlu değildir.
          </p>
        </div>

        {/* List of Recent Downloads */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
          {recentItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Download className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {t('no_downloads_in_tray', currentLang, 'Henüz aktif veya tamamlanmış indirme yok')}
              </p>
              <button
                type="button"
                onClick={handleStartQuickTest}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + {t('start_test_download', currentLang, 'Örnek İndirme Başlat')}
              </button>
            </div>
          ) : (
            recentItems.map((item) => {
              const isFinished = item.status === 'completed';
              const isInProgress = item.status === 'in_progress';
              const isPaused = item.status === 'paused';
              const isCancelled = item.status === 'cancelled';

              return (
                <div key={item.id} className="p-3 hover:bg-slate-800/40 transition-colors space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-xs font-bold text-white truncate hover:text-blue-400 cursor-pointer"
                        title={item.filename}
                        onClick={() => {
                          onClose();
                          onOpenFullDownloads();
                        }}
                      >
                        {item.filename}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{item.size}</span>
                        <span>•</span>
                        {isFinished && (
                          <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 inline" /> Tamamlandı
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-blue-400 font-medium animate-pulse">
                            %{item.progress} İndiriliyor • {item.speed || '3.2 MB/sn'}
                          </span>
                        )}
                        {isPaused && (
                          <span className="text-amber-400 font-medium">
                            Duraklatıldı (%{item.progress})
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-rose-400 font-medium">
                            İptal Edildi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Item Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isInProgress && (
                        <>
                          <button
                            type="button"
                            onClick={() => pauseDownload(item.id)}
                            className="p-1 rounded text-amber-400 hover:bg-slate-700 cursor-pointer"
                            title="Duraklat"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDownload(item.id)}
                            className="p-1 rounded text-rose-400 hover:bg-slate-700 cursor-pointer"
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
                          className="p-1 rounded text-emerald-400 hover:bg-slate-700 cursor-pointer"
                          title="Devam Et"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isCancelled && (
                        <button
                          type="button"
                          onClick={() => retryDownload(item.id)}
                          className="p-1 rounded text-blue-400 hover:bg-slate-700 cursor-pointer"
                          title="Yeniden İndir"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteDownload(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700 cursor-pointer"
                        title="Listeden Sil"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar if active */}
                  {(isInProgress || isPaused) && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPaused ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Micro Disclaimer on each card */}
                  <div className="text-[9.5px] text-amber-400/90 font-mono flex items-center gap-1">
                    <span>⚠️ Nova sorumluluk reddi kapsamındadır</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link to Full Downloads Page */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullDownloads();
            }}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('show_all_downloads', currentLang, 'Tüm İndirmeleri Göster')} (nova://downloads)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
