import React, { useState, useEffect, useCallback } from 'react';
import {
  TabItem,
  BrowserAccount,
  BrowserThemeConfig,
  MandatoryConsentState,
  SidebarViewType,
} from './types.ts';
import {
  getConsentState,
  getActiveAccount,
  getBrowserTheme,
  getSavedLanguage,
  saveLanguage,
  saveTargetTranslateLanguage,
  subscribeToBrowserSync,
  addHistoryEntry,
} from './utils/storage.ts';
import { ConsentModal } from './components/ConsentModal.tsx';
import { BrowserTabs } from './components/BrowserTabs.tsx';
import { Omnibar } from './components/Omnibar.tsx';
import { TabContent } from './components/TabContent.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AiAssistantModal } from './components/AiAssistantModal.tsx';
import { GoogleTranslateWidget } from './components/GoogleTranslateWidget.tsx';
import { MANDATORY_CONSENT_VERSION } from '../server/consents.ts';

export default function App() {
  // 1. Mandatory Consent State
  const [consentAccepted, setConsentAccepted] = useState<boolean>(() => {
    const state = getConsentState();
    return !!(state && state.accepted && state.version === MANDATORY_CONSENT_VERSION);
  });

  // 2. Active Account State (Synced globally across all tabs/windows)
  const [account, setAccount] = useState<BrowserAccount>(() => getActiveAccount());

  // 3. Browser Theme
  const [theme, setTheme] = useState<BrowserThemeConfig>(() => getBrowserTheme());

  // 4. Language
  const [currentLang, setCurrentLang] = useState<string>(() => getSavedLanguage());

  // System-wide language change handler (Translates UI and instantly translates active page iframes)
  const handleLanguageChange = useCallback((newLang: string) => {
    setCurrentLang(newLang);
    saveLanguage(newLang);
    saveTargetTranslateLanguage(newLang);

    // Directly broadcast translate event to iframe instances
    setTimeout(() => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            {
              type: 'NOVA_TRANSLATE_PAGE',
              targetLang: newLang,
              fromLang: 'auto',
            },
            '*'
          );
        } catch (err) {
          // ignore
        }
      });
    }, 100);
  }, []);

  // 5. Sidebar & Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<SidebarViewType>('history');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  // 6. Tabs Management
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: 'tab_1',
      title: 'Yeni Sekme',
      url: 'nova://newtab',
      inputUrl: '',
      isLoading: false,
      historyStack: ['nova://newtab'],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      lastAccessed: Date.now(),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_1');

  // Active Tab Selector
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Subscribe to Multi-Tab / Multi-Window Broadcast Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToBrowserSync((type, payload) => {
      if (type === 'ACCOUNT_CHANGED' && payload.account) {
        setAccount(payload.account);
      }
      if (type === 'THEME_CHANGED' && payload.theme) {
        setTheme(payload.theme);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update a specific tab state
  const handleUpdateTab = useCallback((id: string, updates: Partial<TabItem>) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === id) {
          return { ...tab, ...updates };
        }
        return tab;
      })
    );
  }, []);

  // Create a brand new independent tab
  const handleNewTab = useCallback((initialUrl = 'nova://newtab') => {
    const newId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const isHome = initialUrl === 'nova://newtab' || initialUrl === 'nova://search';

    const newTabItem: TabItem = {
      id: newId,
      title: isHome ? 'Yeni Sekme' : initialUrl,
      url: initialUrl,
      inputUrl: isHome ? '' : initialUrl,
      isLoading: !isHome,
      historyStack: [initialUrl],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      lastAccessed: Date.now(),
    };

    setTabs((prev) => [...prev, newTabItem]);
    setActiveTabId(newId);
  }, []);

  // Close tab handler
  const handleCloseTab = useCallback((id: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one tab
      const nextTabs = prev.filter((t) => t.id !== id);
      if (id === activeTabId) {
        // Pick nearest tab
        const closedIdx = prev.findIndex((t) => t.id === id);
        const newActive = nextTabs[Math.max(0, closedIdx - 1)] || nextTabs[0];
        setActiveTabId(newActive.id);
      }
      return nextTabs;
    });
  }, [activeTabId]);

  // Navigate URL in active tab (or new tab)
  const handleNavigate = useCallback(
    (target: string, openInNewTab = false) => {
      const raw = target.trim();
      if (!raw) return;

      let resolvedUrl = raw;
      if (raw.startsWith('nova://')) {
        resolvedUrl = raw;
      } else if (/^https?:\/\//i.test(raw)) {
        resolvedUrl = raw;
      } else if (/^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(raw)) {
        resolvedUrl = `https://${raw}`;
      } else {
        // Search query
        resolvedUrl = `nova://search?q=${encodeURIComponent(raw)}`;
      }

      if (openInNewTab) {
        handleNewTab(resolvedUrl);
        return;
      }

      // Navigate in active tab
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            const nextStack = tab.historyStack.slice(0, tab.historyIndex + 1);
            nextStack.push(resolvedUrl);
            const isHome = resolvedUrl === 'nova://newtab' || resolvedUrl.startsWith('nova://search');

            return {
              ...tab,
              url: resolvedUrl,
              inputUrl: isHome ? '' : resolvedUrl,
              title: isHome ? 'Yeni Sekme' : resolvedUrl,
              isLoading: !isHome,
              historyStack: nextStack,
              historyIndex: nextStack.length - 1,
              canGoBack: nextStack.length > 1,
              canGoForward: false,
              lastAccessed: Date.now(),
            };
          }
          return tab;
        })
      );

      // Log to history if external
      if (!resolvedUrl.startsWith('nova://')) {
        addHistoryEntry(resolvedUrl, resolvedUrl);
      }
    },
    [activeTabId, handleNewTab]
  );

  // Back / Forward / Reload / Home controls
  const handleGoBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIdx = activeTab.historyIndex - 1;
    const prevUrl = activeTab.historyStack[newIdx];
    handleUpdateTab(activeTab.id, {
      url: prevUrl,
      inputUrl: prevUrl.startsWith('nova://') ? '' : prevUrl,
      historyIndex: newIdx,
      canGoBack: newIdx > 0,
      canGoForward: true,
      isLoading: !prevUrl.startsWith('nova://'),
    });
  }, [activeTab, handleUpdateTab]);

  const handleGoForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.historyStack.length - 1) return;
    const newIdx = activeTab.historyIndex + 1;
    const nextUrl = activeTab.historyStack[newIdx];
    handleUpdateTab(activeTab.id, {
      url: nextUrl,
      inputUrl: nextUrl.startsWith('nova://') ? '' : nextUrl,
      historyIndex: newIdx,
      canGoBack: true,
      canGoForward: newIdx < activeTab.historyStack.length - 1,
      isLoading: !nextUrl.startsWith('nova://'),
    });
  }, [activeTab, handleUpdateTab]);

  const handleReload = useCallback(() => {
    if (!activeTab) return;
    const currentUrl = activeTab.url;
    // trigger reload by resetting isLoading
    handleUpdateTab(activeTab.id, { isLoading: true });
    setTimeout(() => {
      handleUpdateTab(activeTab.id, { isLoading: false });
    }, 600);
  }, [activeTab, handleUpdateTab]);

  const handleGoHome = useCallback(() => {
    handleNavigate('nova://newtab');
  }, [handleNavigate]);

  const handleToggleSidebar = (view?: string) => {
    if (view) {
      setSidebarView(view as any);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 't') {
          e.preventDefault();
          handleNewTab();
        } else if (key === 'w') {
          e.preventDefault();
          handleCloseTab(activeTabId);
        } else if (key === 'r') {
          e.preventDefault();
          handleReload();
        } else if (key === 'h') {
          e.preventDefault();
          handleToggleSidebar('history');
        } else if (key === 'l') {
          e.preventDefault();
          document.getElementById('nova-omnibar-input')?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewTab, handleCloseTab, handleReload, activeTabId]);

  return (
    <div
      id="nova-browser-app-root"
      className="w-screen h-screen flex flex-col overflow-hidden font-sans select-none"
      style={{
        backgroundColor: theme.tabBarBg,
        color: theme.textColor,
      }}
    >
      {/* 1. Mandatory Legal & Security Consent Gate */}
      {!consentAccepted && (
        <ConsentModal
          onAccepted={() => setConsentAccepted(true)}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* 2. Chrome-style Tab Strip */}
      <BrowserTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab()}
        theme={theme}
        currentLang={currentLang}
      />

      {/* 3. Omnibar / Address & Action Bar */}
      <Omnibar
        activeTab={activeTab}
        onNavigate={(url) => handleNavigate(url)}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        onToggleSidebar={handleToggleSidebar}
        account={account}
        theme={theme}
        currentLang={currentLang}
        onOpenAiSummary={() => setIsAiModalOpen(true)}
      />

      {/* 4. Main Viewport & Tabs Render Container */}
      <main className="flex-1 relative overflow-hidden bg-[#0F172A]">
        {/* Render ALL tabs simultaneously, hiding inactive tabs with CSS to preserve DOM, scroll, video, and iframe state */}
        {tabs.map((tab) => (
          <TabContent
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onUpdateTab={handleUpdateTab}
            onNavigateUrl={(url, newTab) => handleNavigate(url, newTab)}
            theme={theme}
            currentLang={currentLang}
          />
        ))}
      </main>

      {/* Sleek Interface Footer Status Bar */}
      <footer className="h-6 bg-[#0F172A] border-t border-slate-800 flex items-center px-4 justify-between text-[10px] text-slate-500 shrink-0 select-none z-10">
        <div className="flex items-center gap-4">
          <span className="font-mono">NovaSearch Node: 192.168.1.11</span>
          <span className="hidden sm:inline">Tabs Synced: {tabs.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            API-LESS Connection Established
          </span>
          <span className="hidden md:inline">© 2026 Nova Browser Project</span>
        </div>
      </footer>

      {/* 5. Left Sidebar (History by Year/Month/Day, Color Theme Customizer, Bookmarks, Account Sync, Languages & Full Page Translation) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={sidebarView}
        onSelectView={setSidebarView}
        onNavigate={(url, newTab) => {
          handleNavigate(url, newTab);
          setIsSidebarOpen(false);
        }}
        account={account}
        onAccountChange={setAccount}
        theme={theme}
        onThemeChange={setTheme}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenTranslateModal={() => setIsTranslateModalOpen(true)}
      />

      {/* 6. AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeTab={activeTab}
        currentLang={currentLang}
      />

      {/* 7. Universal 145+ Languages Translation Center Modal */}
      {isTranslateModalOpen && (
        <div
          id="nova-translate-modal-backdrop"
          onClick={() => setIsTranslateModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div
            id="nova-translate-modal-content"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl"
          >
            <GoogleTranslateWidget
              initialFromLang="auto"
              initialToLang={currentLang || 'tr'}
              isDark={true}
              onClose={() => setIsTranslateModalOpen(false)}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
