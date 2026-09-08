import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Car,
  Search,
  Video,
  Globe,
  Download,
  ShieldCheck,
  Gamepad2,
  Sparkles,
  ExternalLink,
  Settings,
  Layers,
  FileText,
  X,
  WifiOff,
  Laptop,
} from 'lucide-react';
import { t } from '../data/languages.ts';

interface GoogleAppsMenuProps {
  onNavigate: (url: string) => void;
  currentLang?: string;
  themeMode?: string;
  onOpenSettings?: () => void;
  onOpenSecurity?: () => void;
  onOpenConsent?: () => void;
}

export const GoogleAppsMenu: React.FC<GoogleAppsMenuProps> = ({
  onNavigate,
  currentLang = 'tr',
  themeMode = 'dark',
  onOpenSettings,
  onOpenSecurity,
  onOpenConsent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLaunchApp = (url: string) => {
    setIsOpen(false);
    onNavigate(url);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* 9-Dot Google-Style Waffle Icon Button */}
      <button
        type="button"
        id="btn-google-apps-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer select-none ${
          isOpen
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-400'
            : 'hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent hover:border-slate-700'
        }`}
        title={t('google_apps_menu', currentLang, 'Google & Nova Uygulamaları')}
      >
        <Grid className="w-5 h-5" />
      </button>

      {/* Popover Apps Drawer */}
      {isOpen && (
        <div
          id="google-apps-popover"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200 divide-y divide-slate-800"
        >
          {/* Header */}
          <div className="pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                ✦
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                {t('google_apps_title', currentLang, 'Google & Nova Uygulamaları')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Apps Grid */}
          <div className="py-3 grid grid-cols-3 gap-2">
            {/* 1. FEATURED: ApexDrive Araba Oyunu */}
            <button
              type="button"
              id="app-item-apexdrive"
              onClick={() => handleLaunchApp('https://apexdrive-global-driving-0000.ai.studio')}
              className="col-span-3 p-3 rounded-xl bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border-2 border-blue-500/60 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/30 transition-all flex items-center gap-3 group text-left cursor-pointer relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                🏎️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {t('car_game_title', currentLang, 'ApexDrive: Araba Oyunu')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40">
                    ⭐ ÖNE ÇIKAN
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                  {t('car_game_desc', currentLang, 'Gömülü (Embed) 3D Sürüş & Çevrimdışı İnternetsiz Motor')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                    145+ Dil
                  </span>
                  <span className="text-[9px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                    ⚡ Offline Destekli
                  </span>
                </div>
              </div>
            </button>

            {/* 2. NovaSearch */}
            <button
              type="button"
              id="app-item-novasearch"
              onClick={() => handleLaunchApp('nova://newtab')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-blue-400 truncate w-full">
                NovaSearch
              </span>
            </button>

            {/* 3. Google Arama */}
            <button
              type="button"
              id="app-item-google"
              onClick={() => handleLaunchApp('https://www.google.com')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform text-sm font-black">
                G
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-400 truncate w-full">
                Google
              </span>
            </button>

            {/* 4. YouTube */}
            <button
              type="button"
              id="app-item-youtube"
              onClick={() => handleLaunchApp('https://www.youtube.com')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-red-400 truncate w-full">
                YouTube
              </span>
            </button>

            {/* 5. Chrome Dinozor Oyunu (Offline Runner) */}
            <button
              type="button"
              id="app-item-dino-game"
              onClick={() => handleLaunchApp('nova://dino')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform text-lg">
                🦖
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-amber-400 truncate w-full">
                {t('dino_runner_name', currentLang, 'Dinozor Oyunu')}
              </span>
            </button>

            {/* 6. İndirilenler */}
            <button
              type="button"
              id="app-item-downloads"
              onClick={() => handleLaunchApp('nova://downloads')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-400 truncate w-full">
                {t('downloads', currentLang, 'İndirilenler')}
              </span>
            </button>

            {/* 7. Siber Güvenlik Kalkanı */}
            <button
              type="button"
              id="app-item-security"
              onClick={() => {
                setIsOpen(false);
                if (onOpenSecurity) onOpenSecurity();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-400 truncate w-full">
                NovaShield
              </span>
            </button>

            {/* 8. İndirilenler */}
            <button
              type="button"
              id="app-item-downloads"
              onClick={() => {
                setIsOpen(false);
                handleLaunchApp('nova://downloads');
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-blue-400 truncate w-full">
                {t('downloads', currentLang, 'İndirilenler')}
              </span>
            </button>
          </div>

          {/* Quick Footer Links */}
          <div className="pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenConsent) onOpenConsent();
              }}
              className="hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('legal_clauses', currentLang, 'Yasal Maddeler (145+ Dil)')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings();
              }}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('settings', currentLang, 'Ayarlar')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
