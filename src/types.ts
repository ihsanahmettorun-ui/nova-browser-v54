export interface TabItem {
  id: string;
  title: string;
  url: string;
  inputUrl: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  historyStack: string[];
  historyIndex: number;
  isPinned?: boolean;
  isMuted?: boolean;
  zoomLevel?: number; // 100 default
  lastAccessed: number;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  year: number;
  month: number; // 1-12
  monthName: string;
  day: number;
  dayName: string;
  timeStr: string;
  favicon?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folder?: string;
  favicon?: string;
  createdAt: number;
}

export interface BrowserAccount {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  passwordHash?: string;
  passwordSalt?: string;
  lastLoginAt: string;
}

export type ThemePreset =
  | 'chrome-dark'
  | 'chrome-light'
  | 'midnight-blue'
  | 'emerald'
  | 'neon-purple'
  | 'amber-gold'
  | 'sunset-rose'
  | 'custom';

export interface BrowserThemeConfig {
  preset: ThemePreset;
  accentColor: string;
  tabBarBg: string;
  headerBg: string;
  contentBg: string;
  textColor: string;
  bgImageUrl?: string;
  customLogoUrl?: string;
}

export interface MandatoryConsentState {
  accepted: boolean;
  version: string;
  acceptedAt: string;
  clauses: Record<string, boolean>;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  status: 'completed' | 'in_progress' | 'cancelled' | 'paused';
  progress: number;
  timestamp: number;
  speed?: string;
  timeLeft?: string;
  fileType?: string;
  disclaimer: string;
  isLegalConsentRecord?: boolean;
}

export type DesktopPlatform = 'windows' | 'macos' | 'linux' | 'pwa';

export interface DesktopSetupConfig {
  producer: string; // 'Orhan Süleyman Torun'
  platform: DesktopPlatform;
  installPath: string;
  userDataPath: string;
  consentAcceptedAt: string;
  liabilityAccepted: boolean;
  installerFilename: string;
}

export interface UserAccountBackupData {
  account: BrowserAccount;
  history: HistoryEntry[];
  bookmarks: Bookmark[];
  downloads: DownloadItem[];
  tabs: TabItem[];
  theme: BrowserThemeConfig;
  setupConfig: DesktopSetupConfig;
  gameStats: {
    apexDriveKm: number;
    apexDriveBestScore: number;
    dinoHighScore: number;
    lastPlayedAt: string;
  };
  exportedAt: string;
}

export interface TopSite {
  id: string;
  title: string;
  url: string;
  domain: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

export type SidebarViewType =
  | 'history'
  | 'theme'
  | 'bookmarks'
  | 'apikeys'
  | 'account'
  | 'downloads'
  | 'languages'
  | 'security';

export interface ApprovedUnsafeSite {
  id?: string;
  domain: string;
  url: string;
  threatType: string;
  threatScore: number;
  approvedAt: string;
  disclaimerAcknowledged: boolean;
}

export interface CustomApiKey {
  id: string;
  serviceKey: 'youtube' | 'gemini' | 'google_search' | 'openai' | 'github' | 'weather' | 'newsapi' | 'tavily' | 'unsplash' | 'custom' | string;
  serviceName: string;
  category: 'video' | 'ai' | 'search' | 'developer' | 'weather' | 'news' | 'custom';
  apiKey: string;
  endpointUrl?: string;
  isActive: boolean;
  docUrl?: string;
  description: string;
  updatedAt: number;
}

