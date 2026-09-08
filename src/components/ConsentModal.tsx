import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Lock,
  EyeOff,
  FileWarning,
  Server,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Globe,
  Search,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  ChevronDown,
  Languages,
  Copy,
  CheckCheck,
  Type,
} from 'lucide-react';
import { ConsentItem, MANDATORY_CONSENTS, MANDATORY_CONSENT_VERSION } from '../../server/consents.ts';
import { MandatoryConsentState } from '../types.ts';
import { saveConsentState, saveLanguage } from '../utils/storage.ts';
import {
  ALL_LANGUAGES,
  getLanguageName,
  searchLanguages,
  t,
} from '../data/languages.ts';
import {
  ConsentTranslationData,
  PRECOMPILED_CONSENT_TRANSLATIONS,
  getCachedConsentTranslation,
  fetchLiveConsentTranslation,
} from '../data/consentTranslations.ts';

interface ConsentModalProps {
  onAccepted: () => void;
  currentLang?: string;
  onLanguageChange?: (lang: string) => void;
  isReviewMode?: boolean;
  onClose?: () => void;
}

const POPULAR_QUICK_LANGS = [
  { code: 'tr', flag: '🇹🇷', label: 'TR', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'FR', name: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'ES', name: 'Español' },
  { code: 'ru', flag: '🇷🇺', label: 'RU', name: 'Русский' },
  { code: 'ar', flag: '🇸🇦', label: 'AR', name: 'العربية' },
  { code: 'zh', flag: '🇨🇳', label: 'ZH', name: '中文' },
  { code: 'ja', flag: '🇯🇵', label: 'JA', name: '日本語' },
  { code: 'az', flag: '🇦🇿', label: 'AZ', name: 'Azərbaycan' },
  { code: 'it', flag: '🇮🇹', label: 'IT', name: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', label: 'PT', name: 'Português' },
];

export const ConsentModal: React.FC<ConsentModalProps> = ({
  onAccepted,
  currentLang = 'tr',
  onLanguageChange,
  isReviewMode = false,
  onClose,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(currentLang || 'tr');
  const [checkedClauses, setCheckedClauses] = useState<Record<string, boolean>>(() => {
    if (isReviewMode) {
      const all: Record<string, boolean> = {};
      MANDATORY_CONSENTS.forEach((c) => {
        all[c.id] = true;
      });
      return all;
    }
    return {};
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Readability / Font size scale
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Copy feedback state
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  // Translation state
  const [translation, setTranslation] = useState<ConsentTranslationData>(() => {
    return (
      getCachedConsentTranslation(currentLang || 'tr') ||
      PRECOMPILED_CONSENT_TRANSLATIONS[currentLang || 'tr'] ||
      PRECOMPILED_CONSENT_TRANSLATIONS.tr
    );
  });
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // 145+ Languages picker modal state
  const [isLangPickerOpen, setIsLangPickerOpen] = useState<boolean>(false);
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');
  const [activeRegion, setActiveRegion] = useState<string>('all');

  // Text to speech state
  const [speakingClauseId, setSpeakingClauseId] = useState<string | null>(null);

  const iconsMap: Record<string, React.ReactNode> = {
    ShieldAlert: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />,
    UserCheck: <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />,
    Lock: <Lock className="w-5 h-5 text-blue-400 shrink-0" />,
    EyeOff: <EyeOff className="w-5 h-5 text-purple-400 shrink-0" />,
    FileWarning: <FileWarning className="w-5 h-5 text-rose-400 shrink-0" />,
    Server: <Server className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  // Change language and load translations
  const handleSelectLanguage = async (code: string) => {
    const target = code.toLowerCase();
    setSelectedLang(target);
    setShowOriginal(false);
    saveLanguage(target);
    if (onLanguageChange) {
      onLanguageChange(target);
    }

    // Check precompiled or cached
    const cached = getCachedConsentTranslation(target);
    if (cached) {
      setTranslation(cached);
      return;
    }

    // Otherwise fetch dynamic live translation
    setIsTranslating(true);
    try {
      const liveData = await fetchLiveConsentTranslation(target);
      setTranslation(liveData);
    } catch (err) {
      console.warn('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle TTS with language code mapping
  const handleSpeakClause = (id: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingClauseId === id) {
      window.speechSynthesis.cancel();
      setSpeakingClauseId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const langVoiceMap: Record<string, string> = {
        tr: 'tr-TR',
        en: 'en-US',
        de: 'de-DE',
        fr: 'fr-FR',
        es: 'es-ES',
        ru: 'ru-RU',
        ar: 'ar-SA',
        zh: 'zh-CN',
        ja: 'ja-JP',
        az: 'az-AZ',
        it: 'it-IT',
        pt: 'pt-BR',
      };
      utterance.lang = langVoiceMap[selectedLang] || selectedLang;
      utterance.onend = () => setSpeakingClauseId(null);
      utterance.onerror = () => setSpeakingClauseId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingClauseId(id);
    } catch {
      setSpeakingClauseId(null);
    }
  };

  // Handle Copy text to clipboard
  const handleCopyClause = (id: string, title: string, text: string) => {
    const fullText = `${title}\n\n${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedClauseId(id);
      setTimeout(() => {
        setCopiedClauseId((prev) => (prev === id ? null : prev));
      }, 2000);
    });
  };

  const handleToggleClause = (id: string) => {
    setCheckedClauses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setErrorMsg(null);
  };

  const handleAcceptAll = () => {
    const all: Record<string, boolean> = {};
    MANDATORY_CONSENTS.forEach((c) => {
      all[c.id] = true;
    });
    setCheckedClauses(all);
    setErrorMsg(null);
  };

  const isAllChecked = MANDATORY_CONSENTS.every((c) => !!checkedClauses[c.id]);

  // Active translation source
  const activeTranslation = showOriginal ? PRECOMPILED_CONSENT_TRANSLATIONS.tr : translation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllChecked) {
      setErrorMsg(activeTranslation.errorMsg);
      return;
    }

    const state: MandatoryConsentState = {
      accepted: true,
      version: MANDATORY_CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
      clauses: checkedClauses,
    };

    saveConsentState(state);
    onAccepted();
  };

  // Filtered languages for 145+ languages picker
  const filteredLanguages = useMemo(() => {
    return searchLanguages(langSearchQuery, activeRegion);
  }, [langSearchQuery, activeRegion]);

  const activeLangOption = useMemo(() => {
    return ALL_LANGUAGES.find((l) => l.code === selectedLang) || {
      code: selectedLang,
      name: selectedLang.toUpperCase(),
      nativeName: selectedLang,
      flag: '🌐',
    };
  }, [selectedLang]);

  // Font size classes
  const fontBodyClass = useMemo(() => {
    switch (fontSizeScale) {
      case 'large':
        return 'text-sm sm:text-base leading-relaxed';
      case 'xlarge':
        return 'text-base sm:text-lg leading-relaxed font-medium';
      case 'normal':
      default:
        return 'text-xs sm:text-sm leading-relaxed';
    }
  }, [fontSizeScale]);

  return (
    <div
      id="mandatory-consent-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      <div
        id="mandatory-consent-card"
        className="relative z-10 bg-[#1E293B] border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
      >
        {/* Header with Title & Integrated 145+ Language Translation System */}
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/80 border-b border-slate-700/80 p-5 sm:p-6 shrink-0 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {activeTranslation.title} <span className="text-blue-400 font-mono text-base">v54</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                  {activeTranslation.subtitle}
                </p>
              </div>
            </div>

            {/* Current Active Language Pill & 145+ World Languages Launcher */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                id="btn-open-all-languages-picker"
                onClick={() => setIsLangPickerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 text-blue-200 border border-blue-400/50 flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                title="Tüm Dünya Dillerinde Çevir (145+ Dil)"
              >
                <Globe className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="text-base">{activeLangOption.flag}</span>
                <span className="truncate max-w-[120px] font-medium">{activeLangOption.nativeName || activeLangOption.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/30 text-[11px] text-blue-100 font-mono font-bold">145+</span>
                <ChevronDown className="w-4 h-4 text-blue-300 shrink-0" />
              </button>

              {selectedLang !== 'tr' && (
                <button
                  type="button"
                  onClick={() => setShowOriginal((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    showOriginal
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                  }`}
                  title={showOriginal ? 'Çevrilmiş haline dön' : 'Orijinal Türkçe maddeleri göster'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{showOriginal ? 'Çeviriyi Göster' : 'Orijinal TR'}</span>
                </button>
              )}

              {isReviewMode && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick-Switch Language Strip for Strict Clauses & Text Size Controls */}
          <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium">
              <Languages className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200">
                {t('translate_clauses_to', selectedLang, 'Dili Değiştir / Çevir:')}
              </span>
            </div>

            {/* Quick Language Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {POPULAR_QUICK_LANGS.map((ql) => {
                const isSelected = selectedLang === ql.code && !showOriginal;
                return (
                  <button
                    key={ql.code}
                    type="button"
                    onClick={() => handleSelectLanguage(ql.code)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-300'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
                    }`}
                    title={ql.name}
                  >
                    <span className="text-xs">{ql.flag}</span>
                    <span className="text-[11px]">{ql.label}</span>
                  </button>
                );
              })}

              {/* All Languages Expand Button */}
              <button
                type="button"
                onClick={() => setIsLangPickerOpen(true)}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                title="Tüm Dünya Dilleri (145+ Dil)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">+130 Dil</span>
              </button>
            </div>

            {/* Font Size Selector for Maximum Readability */}
            <div className="flex items-center gap-1 ml-auto bg-slate-900/80 border border-slate-700/80 rounded-lg p-0.5">
              <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              <button
                type="button"
                onClick={() => setFontSizeScale('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  fontSizeScale === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Normal Yazı Boyutu"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                  fontSizeScale === 'large'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Büyük Yazı Boyutu (Daha Kolay Okuma)"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('xlarge')}
                className={`px-2 py-0.5 rounded text-sm font-bold transition-colors cursor-pointer ${
                  fontSizeScale === 'xlarge'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ekstra Büyük Yazı Boyutu (Maksimum Okunabilirlik)"
              >
                A++
              </button>
            </div>
          </div>

          {/* Live Translation Indicator Bar */}
          {isTranslating && (
            <div className="p-2.5 rounded-xl bg-blue-950/90 border border-blue-400 text-blue-100 text-sm font-medium flex items-center gap-2.5 shadow-md animate-pulse">
              <Sparkles className="w-4 h-4 text-blue-300 animate-spin" />
              <span>{activeTranslation.translatingNotice || '145+ dil sistemiyle katı maddeler çevriliyor...'}</span>
            </div>
          )}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Strict Notice Box */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-bold text-amber-300">
                  {activeTranslation.noticeTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => handleSpeakClause('notice', activeTranslation.noticeBody)}
                  className="p-1.5 rounded text-amber-300 hover:bg-amber-900/50 cursor-pointer transition-colors"
                  title="Sesli Dinle"
                >
                  {speakingClauseId === 'notice' ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className={`text-amber-100/95 leading-relaxed font-normal ${fontBodyClass}`}>
                {activeTranslation.noticeBody}
              </p>
            </div>
          </div>

          {/* 8 Strict Clauses List */}
          <div className="space-y-3 max-h-[44vh] overflow-y-auto pr-1">
            {MANDATORY_CONSENTS.map((clause) => {
              const isChecked = !!checkedClauses[clause.id];
              const clauseTrans = activeTranslation.clauses[clause.id] || {
                title: clause.title,
                text: clause.text,
              };
              const isProducerWaiver = clause.id === 'producer_orhan_suleyman_torun_waiver';

              return (
                <div
                  key={clause.id}
                  id={`consent-clause-${clause.id}`}
                  onClick={() => handleToggleClause(clause.id)}
                  className={`p-4 sm:p-4.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                    isProducerWaiver
                      ? isChecked
                        ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500 text-slate-100 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                        : 'bg-gradient-to-b from-amber-950/30 to-slate-900/90 border-amber-500/70 hover:border-amber-400 text-slate-200'
                      : isChecked
                      ? 'bg-slate-900 border-blue-500 text-slate-100 shadow-md shadow-blue-950/30'
                      : 'bg-slate-900/70 border-slate-700/90 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`checkbox-${clause.id}`}
                    checked={isChecked}
                    onChange={() => {}}
                    className={`w-5 h-5 mt-1 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 shrink-0 cursor-pointer ${
                      isProducerWaiver ? 'border-amber-500' : 'border-slate-600'
                    }`}
                  />
                  <div className="flex-1 space-y-2">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {iconsMap[clause.icon] || <ShieldAlert className="w-4 h-4 text-slate-400" />}
                        <span
                          className={`text-sm sm:text-base font-bold tracking-normal ${
                            isProducerWaiver ? 'text-amber-300' : 'text-blue-300'
                          }`}
                        >
                          {clauseTrans.title}
                        </span>
                        {isProducerWaiver && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            🛡️ Yapımcı Beyanı / Producer Waiver
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Copy, TTS, Language */}
                      <div className="flex items-center gap-1 ml-auto">
                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyClause(clause.id, clauseTrans.title, clauseTrans.text);
                          }}
                          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                            copiedClauseId === clause.id
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                          title="Metni Kopyala"
                        >
                          {copiedClauseId === clause.id ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                              <span className="text-[10px] font-bold">Kopyalandı</span>
                            </>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Text to Speech Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakClause(clause.id, clauseTrans.text);
                          }}
                          className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer transition-colors"
                          title="Bu maddeyi sesli oku"
                        >
                          {speakingClauseId === clause.id ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Clause Body Text */}
                    <p className={`text-slate-100 font-normal leading-relaxed ${fontBodyClass}`}>
                      {clauseTrans.text}
                    </p>

                    {/* Inline Quick Language Bar for Clause 1 to ensure instant multilingual readability */}
                    {isProducerWaiver && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-1.5 text-[11px]"
                      >
                        <span className="text-amber-300/80 font-medium mr-1">
                          🌐 Bu Maddeyi Çevir:
                        </span>
                        {['tr', 'en', 'de', 'fr', 'es', 'ru', 'ar', 'zh', 'ja', 'az'].map((langCode) => (
                          <button
                            key={langCode}
                            type="button"
                            onClick={() => handleSelectLanguage(langCode)}
                            className={`px-2 py-0.5 rounded font-bold uppercase transition-all cursor-pointer text-[10px] ${
                              selectedLang === langCode
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {langCode}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsLangPickerOpen(true)}
                          className="px-2 py-0.5 rounded font-bold bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-[10px] cursor-pointer"
                        >
                          +135 Dil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Select All Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/80 text-sm">
            <button
              type="button"
              id="btn-select-all-consents"
              onClick={handleAcceptAll}
              className="text-blue-300 hover:text-blue-200 font-bold flex items-center gap-2 transition-colors cursor-pointer text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              {activeTranslation.acceptAll} ({Object.values(checkedClauses).filter(Boolean).length}/
              {MANDATORY_CONSENTS.length})
            </button>
            <span className="text-xs text-slate-400 font-mono">
              {activeTranslation.protocolText} v{MANDATORY_CONSENT_VERSION}
            </span>
          </div>

          {errorMsg && (
            <div
              id="consent-error-msg"
              className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            {isReviewMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer transition-colors"
              >
                {t('close', selectedLang, 'Kapat')}
              </button>
            )}
            <button
              type="submit"
              id="btn-confirm-consent-submit"
              disabled={!isAllChecked && !isReviewMode}
              className={`w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isAllChecked || isReviewMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isReviewMode
                ? t('close_viewer', selectedLang, 'Maddeleri İncelemeyi Tamamla')
                : activeTranslation.submitButton}
            </button>
          </div>
        </form>
      </div>

      {/* 145+ World Languages Picker Modal for Strict Clauses */}
      {isLangPickerOpen && (
        <div
          id="modal-consent-languages-picker"
          onClick={() => setIsLangPickerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('choose_language_for_clauses', selectedLang, 'Katı Maddeler İçin Dil Seçin')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('total_languages_count', selectedLang, '145+ Dünya Dili Canlı Çeviri ve Yerelleştirme')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLangPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={langSearchQuery}
                onChange={(e) => setLangSearchQuery(e.target.value)}
                placeholder={activeTranslation.searchLangPlaceholder || 'Dil ara (Türkçe, English, Deutsch, 日本語)...'}
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {langSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLangSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region Filter Chips */}
            <div className="flex flex-wrap gap-1 text-[10.5px]">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'popular', label: 'Popüler ⭐' },
                { id: 'europe', label: 'Avrupa 🇪🇺' },
                { id: 'asia', label: 'Asya 🌏' },
                { id: 'middle_east', label: 'Orta Doğu 🕌' },
                { id: 'americas', label: 'Amerika 🌎' },
                { id: 'africa', label: 'Afrika 🌍' },
              ].map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => setActiveRegion(reg.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeRegion === reg.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Languages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto pr-1 flex-1 max-h-[46vh]">
              {filteredLanguages.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                  Eşleşen dil bulunamadı
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        handleSelectLanguage(lang.code);
                        setIsLangPickerOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left flex items-center gap-2 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white font-semibold shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-base shrink-0">{lang.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate font-medium text-white flex items-center justify-between">
                          <span className="truncate">{lang.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400 shrink-0 ml-1" />}
                        </div>
                        {lang.nativeName && lang.nativeName !== lang.name && (
                          <div className="text-[10px] text-slate-400 truncate">{lang.nativeName}</div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
