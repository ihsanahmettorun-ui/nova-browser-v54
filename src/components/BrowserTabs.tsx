import React from 'react';
import {
  Plus,
  X,
  Globe,
  Loader2,
  Pin,
} from 'lucide-react';
import { TabItem, BrowserThemeConfig } from '../types.ts';
import { t } from '../data/languages.ts';

interface BrowserTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onTogglePin?: (id: string) => void;
  onToggleMute?: (id: string) => void;
  theme: BrowserThemeConfig;
  currentLang?: string;
}

export const BrowserTabs: React.FC<BrowserTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  theme,
  currentLang = 'tr',
}) => {
  return (
    <div
      id="nova-browser-tab-strip"
      className="flex items-center select-none pt-1.5 px-2 overflow-x-auto no-scrollbar relative border-b border-white/5"
      style={{
        backgroundColor: theme.tabBarBg,
        color: theme.textColor,
      }}
    >
      {/* Left Browser Brand Badge - Saf Vektör HD AI Logo */}
      <div className="flex items-center gap-2 pl-2 pr-3 py-1 mr-1.5 border-r border-slate-700/50 shrink-0 select-none">
        {/* Yuvarlatılmış köşeli pürüzsüz mavi buton */}
        <div className="w-6 h-6 rounded-[7px] flex items-center justify-center bg-[#1a73e8] shadow-[0_0_10px_rgba(26,115,232,0.4)]">
          {/* HD Çözünürlüklü Saf Yapay Zeka Işıltı Sembolü */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-4 h-4 text-white fill-none stroke-white" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Ana Büyük Yıldız/Işıltı Çizimi */}
            <path d="M12 3c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z" className="fill-white" />
            {/* Sağ Üstteki Küçük Artı Işıltısı */}
            <path d="M19 3v4M17 5h4" strokeWidth="2" />
            {/* Sol Alttaki Yuvarlak Işıltı Noktası */}
            <circle cx="6" cy="18" r="1.5" className="fill-white stroke-none" />
          </svg>
        </div>
        <span className="text-xs font-bold tracking-tight text-white antialiased">
          Nova V54
        </span>
      </div>

      {/* Tabs List */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isSearchHome = tab.url === 'nova://newtab' || tab.url === 'nova://search';
          return (
            <div
              key={tab.id}
              id={`browser-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer transition-all duration-150 max-w-[240px] min-w-[130px] flex-1 border-t border-x ${
                isActive
                  ? 'bg-[#0F172A] border-slate-700/50 text-slate-200 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 border-transparent'
              }`}
              style={{
                backgroundColor: isActive ? theme.contentBg : undefined,
                color: isActive ? theme.textColor : undefined,
              }}
              title={tab.title || tab.url}
            >
              {/* Tab Icon / Status Indicator */}
              <div className="shrink-0 flex items-center">
                {tab.isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : isSearchHome ? (
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(26,115,232,0.5)] animate-pulse"
                    style={{ backgroundColor: '#1a73e8' }}
                  />
                ) : tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-3.5 h-3.5 rounded-sm object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              {/* Tab Title */}
              <span className="truncate flex-1 text-left text-xs">
                {tab.title || (isSearchHome ? t('new_tab', currentLang, 'Yeni Sekme') : '...')}
              </span>
              {/* Pin indicator */}
              {tab.isPinned && (
                <Pin className="w-2.5 h-2.5 text-slate-500 rotate-45 shrink-0" />
              )}
              {/* Close Tab Button */}
              {tabs.length > 1 && (
                <button
                  type="button"
                  id={`btn-close-tab-${tab.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shrink-0 ml-auto"
                  title={`${t('close_tab', currentLang, 'Sekmeyi kapat')} (Ctrl+W)`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {/* New Tab Button (+) */}
        <button
          type="button"
          id="btn-add-new-tab"
          onClick={onNewTab}
          className="p-1.5 hover:bg-slate-700/60 rounded-full text-slate-400 hover:text-white transition-colors shrink-0 ml-1"
          title={`${t('new_tab', currentLang, 'Yeni Sekme Aç')} (Ctrl+T)`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
