import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  Volume2,
  Copy,
  X,
  Mic,
  MicOff,
  Search,
  Check,
  Globe,
  Sparkles,
  ArrowRightLeft,
  ChevronDown,
  History,
} from 'lucide-react';
import { ALL_LANGUAGES, LanguageOption, getLanguageName, getLanguageFlag, t } from '../data/languages.ts';

interface GoogleTranslateWidgetProps {
  initialSourceText?: string;
  initialFromLang?: string;
  initialToLang?: string;
  isDark?: boolean;
  onClose?: () => void;
  compact?: boolean;
  onShowToast?: (msg: string) => void;
  onLanguageChange?: (lang: string) => void;
  currentLang?: string;
}

interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

export const GoogleTranslateWidget: React.FC<GoogleTranslateWidgetProps> = ({
  initialSourceText = 'Merhaba! Nova Browser ile dünyanın tüm dillerini anında çevirin.',
  initialFromLang = 'auto',
  initialToLang = 'en',
  isDark = true,
  onClose,
  compact = false,
  onShowToast,
  onLanguageChange,
  currentLang = 'tr',
}) => {
  const [sourceText, setSourceText] = useState(initialSourceText);
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState(initialFromLang);
  const [toLang, setToLang] = useState(initialToLang);
  const [detectedLangCode, setDetectedLangCode] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Language selection modal / popover state
  const [pickerType, setPickerType] = useState<'from' | 'to' | null>(null);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');

  // Translation history
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const debounceTimerRef = useRef<any>(null);

  // Styling helpers
  const cardBg = isDark ? 'bg-[#202124]' : 'bg-white';
  const inputBg = isDark ? 'bg-[#303134]' : 'bg-[#f1f3f4]';
  const borderCol = isDark ? 'border-slate-700/60' : 'border-slate-200';
  const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nova_translate_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveToHistory = (src: string, target: string, from: string, to: string) => {
    if (!src.trim() || !target.trim()) return;
    try {
      const newItem: TranslationHistoryItem = {
        id: Date.now().toString(),
        sourceText: src.trim(),
        translatedText: target.trim(),
        fromLang: from,
        toLang: to,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const filtered = prev.filter((p) => p.sourceText !== newItem.sourceText);
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem('nova_translate_history', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  // Perform backend translation
  const translateAction = async (text: string, from: string, to: string) => {
    if (!text || !text.trim()) {
      setTranslatedText('');
      setDetectedLangCode(null);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          from: from,
          to: to,
        }),
      });

      const data = await res.json();
      if (data.success && data.translatedText) {
        setTranslatedText(data.translatedText);
        if (data.detectedSource && data.detectedSource !== 'auto') {
          setDetectedLangCode(data.detectedSource);
        } else {
          setDetectedLangCode(null);
        }
        saveToHistory(text, data.translatedText, from, to);
      } else {
        setTranslatedText(text);
      }
    } catch (err) {
      setTranslatedText(text);
    } finally {
      setIsTranslating(false);
    }
  };

  // Debounced translation trigger
  useEffect(() => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      translateAction(sourceText, fromLang, toLang);
    }, 280);
    return () => clearTimeout(debounceTimerRef.current);
  }, [sourceText, fromLang, toLang]);

  // Swap Languages
  const handleSwap = () => {
    const effectiveFrom = fromLang === 'auto' ? detectedLangCode || 'en' : fromLang;
    const newFrom = toLang;
    const newTo = effectiveFrom;
    setFromLang(newFrom);
    setToLang(newTo);
    setSourceText(translatedText || sourceText);
  };

  // Text to Speech
  const handleSpeak = (text: string, langCode: string) => {
    if (!text.trim()) return;
    if (!('speechSynthesis' in window)) {
      if (onShowToast) onShowToast('Tarayıcınız sesli okumayı desteklemiyor.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const effectiveCode = langCode === 'auto' ? detectedLangCode || 'tr' : langCode;
      utterance.lang = effectiveCode;
      window.speechSynthesis.speak(utterance);
    } catch {
      if (onShowToast) onShowToast('Ses çalınamadı.');
    }
  };

  // Voice Input (Speech Recognition)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onShowToast) onShowToast('Tarayıcınız sesli giriş özelliğini desteklemiyor.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = fromLang === 'auto' ? 'tr-TR' : fromLang;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        if (onShowToast) onShowToast('🎤 Dinleniyor, konuşun...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSourceText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Filtered languages for modal picker
  const filteredLanguages = ALL_LANGUAGES.filter((lang) => {
    const q = languageSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.name.toLowerCase().includes(q) ||
      (lang.nativeName && lang.nativeName.toLowerCase().includes(q)) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  // Popular quick chips
  const popularSource = ['auto', 'tr', 'en', 'de', 'es', 'ru', 'ar'];
  const popularTarget = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'ru'];

  return (
    <div className={`w-full rounded-3xl ${cardBg} border ${borderCol} shadow-2xl relative overflow-hidden flex flex-col space-y-4 p-4 md:p-6`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-2xl shadow-inner">
            🌐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base md:text-lg font-bold ${textMain}`}>{t('google_translate', currentLang, 'Google Çeviri')}</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                {t('supported_languages_badge', currentLang, '100+ Dil Destekli')}
              </span>
            </div>
            <p className={`text-xs ${textMuted}`}>
              {t('translate_instant_desc', currentLang, 'Algılanan dilden veya seçilen herhangi bir dilden hedefe anında çeviri')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                showHistory ? 'bg-blue-600 text-white' : `${inputBg} hover:bg-slate-700/50 ${textMain}`
              }`}
              title={t('translation_history', currentLang, 'Geçmiş Çeviriler')}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t('history', currentLang, 'Geçmiş')}</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Language Selector Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-2 items-center">
        {/* Source Language Selector & Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {popularSource.map((code) => {
            const isSelected = fromLang === code;
            const label = code === 'auto' ? `🌐 ${t('detect_lang', currentLang, 'Algıla')}` : `${getLanguageFlag(code)} ${getLanguageName(code).split(' ')[0]}`;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setFromLang(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : `${inputBg} hover:bg-slate-700/40 ${textMain} border ${borderCol}`
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setLanguageSearchQuery('');
              setPickerType('from');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              !popularSource.includes(fromLang)
                ? 'bg-blue-600 text-white shadow-md'
                : `${inputBg} hover:bg-slate-700/40 ${textMain} border ${borderCol}`
            }`}
          >
            <span>{!popularSource.includes(fromLang) ? `${getLanguageFlag(fromLang)} ${getLanguageName(fromLang)}` : t('all_languages', currentLang, 'Tüm Diller')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-1 md:my-0">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-transform active:rotate-180 duration-300 cursor-pointer shadow-sm"
            title={t('swap_languages', currentLang, 'Dilleri Karşılıklı Değiştir')}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Target Language Selector & Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {popularTarget.map((code) => {
            const isSelected = toLang === code;
            const label = `${getLanguageFlag(code)} ${getLanguageName(code).split(' ')[0]}`;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setToLang(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : `${inputBg} hover:bg-slate-700/40 ${textMain} border ${borderCol}`
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setLanguageSearchQuery('');
              setPickerType('to');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              !popularTarget.includes(toLang)
                ? 'bg-blue-600 text-white shadow-md'
                : `${inputBg} hover:bg-slate-700/40 ${textMain} border ${borderCol}`
            }`}
          >
            <span>{!popularTarget.includes(toLang) ? `${getLanguageFlag(toLang)} ${getLanguageName(toLang)}` : t('all_languages', currentLang, 'Tüm Diller')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-detected Language Notification / Lock Badge */}
      {fromLang === 'auto' && detectedLangCode && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔍</span>
            <span className="text-blue-300 font-medium">
              {t('detected_language', currentLang, 'Algılanan Dil')}: <strong>{getLanguageFlag(detectedLangCode)} {getLanguageName(detectedLangCode)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFromLang(detectedLangCode);
              if (onShowToast) onShowToast(t('source_language_locked', currentLang, `Kaynak dil ${getLanguageName(detectedLangCode)} olarak sabitlendi.`));
            }}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
          >
            {t('lock_this_language', currentLang, 'Bu Dili Sabitle')}
          </button>
        </div>
      )}

      {/* Dual Interactive Translation Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Source Text Box */}
        <div className={`flex flex-col justify-between p-4 rounded-3xl ${inputBg} border ${borderCol} min-h-[190px] focus-within:ring-2 focus-within:ring-blue-500/50 transition-all`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/20 text-xs text-slate-400">
            <span className="font-semibold text-blue-400">
              {fromLang === 'auto' ? `🌐 ${t('auto_detect', currentLang, 'Otomatik Algıla')}` : `${getLanguageFlag(fromLang)} ${getLanguageName(fromLang)}`}
            </span>
            <span>{sourceText.length} {t('characters_count', currentLang, 'karakter')}</span>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={t('translate_placeholder', currentLang, 'Metin yazın, yapıştırın veya mikrofon ile konuşun...')}
            className={`w-full bg-transparent ${textMain} text-sm md:text-base focus:outline-none resize-none flex-1 py-2 leading-relaxed`}
            rows={ compact ? 3 : 5 }
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/20 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSpeak(sourceText, fromLang)}
                className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={t('listen_voice', currentLang, 'Sesli Dinle')}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-700/40 text-slate-300 hover:text-white'
                }`}
                title={isListening ? t('stop_recording', currentLang, 'Kaydı Durdur') : t('voice_input_mic', currentLang, 'Sesli Konuş (Mikrofon)')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {sourceText && (
                <button
                  type="button"
                  onClick={() => setSourceText('')}
                  className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={t('clear', currentLang, 'Temizle')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => translateAction(sourceText, fromLang, toLang)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{t('refresh', currentLang, 'Yenile')}</span>
            </button>
          </div>
        </div>

        {/* Target Translated Text Box */}
        <div className={`flex flex-col justify-between p-4 rounded-3xl ${isDark ? 'bg-[#282a2d]' : 'bg-[#e8eaed]'} border ${borderCol} min-h-[190px] transition-all`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/20 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">
              {getLanguageFlag(toLang)} {getLanguageName(toLang)}
            </span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-blue-400 text-xs animate-pulse">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                {t('translating', currentLang, 'Çevriliyor...')}
              </span>
            )}
          </div>

          <div className="flex-1 py-2">
            {isTranslating ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-blue-500/20 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-blue-500/20 rounded-full w-4/5 animate-pulse" />
              </div>
            ) : (
              <p className={`text-sm md:text-base ${textMain} leading-relaxed whitespace-pre-wrap select-text`}>
                {translatedText || <span className="text-slate-400 italic">{t('translation_placeholder', currentLang, 'Çeviri burada görüntülenecek...')}</span>}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/20 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSpeak(translatedText, toLang)}
                className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={t('listen_voice', currentLang, 'Sesli Dinle')}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!translatedText) return;
                  navigator.clipboard.writeText(translatedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  if (onShowToast) onShowToast(t('translation_copied', currentLang, 'Çeviri panoya kopyalandı!'));
                }}
                className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={t('copy', currentLang, 'Kopyala')}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <span className="text-[11px] text-slate-400">{t('google_translate_engine', currentLang, 'Google Translate Motoru')}</span>
          </div>
        </div>
      </div>

      {/* Direct System & Page Language Switch Action Banner */}
      {onLanguageChange && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <span className="text-xl select-none">{getLanguageFlag(toLang)}</span>
            <div className="text-left">
              <span className={`text-xs font-bold ${textMain} block`}>
                {t('apply_browser_page_lang', currentLang, 'Tüm Tarayıcıyı ve Açık Sayfayı Bu Dile Çevir')}
              </span>
              <span className={`text-[10.5px] ${textMuted}`}>
                {t('apply_browser_page_lang_desc', currentLang, 'Nova arayüzü, menüler ve aktif web sitesi anında hedeflenen dile uyarlanır')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onLanguageChange(toLang);
              if (onShowToast) onShowToast(`🌐 ${t('system_language_updated', currentLang, 'Tarayıcı dili güncellendi')}: ${getLanguageName(toLang)}`);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
          >
            <span>🚀 {t('apply_to_entire_system', currentLang, 'Bu Dili Tüm Sisteme Uygula')}</span>
          </button>
        </div>
      )}

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div className={`p-4 rounded-2xl ${inputBg} border ${borderCol} space-y-3`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold ${textMain} flex items-center gap-1.5`}>
              <History className="w-3.5 h-3.5 text-blue-400" />
              {t('recent_translations', currentLang, 'Son Çeviriler')}
            </h4>
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('nova_translate_history');
              }}
              className="text-[11px] text-red-400 hover:underline cursor-pointer"
            >
              {t('clear_history', currentLang, 'Geçmişi Temizle')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSourceText(item.sourceText);
                  setFromLang(item.fromLang);
                  setToLang(item.toLang);
                }}
                className={`p-2.5 rounded-xl ${cardBg} border ${borderCol} hover:border-blue-500/60 transition-all cursor-pointer space-y-1`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{getLanguageName(item.fromLang)} ➔ {getLanguageName(item.toLang)}</span>
                </div>
                <p className={`text-xs font-medium ${textMain} truncate`}>{item.sourceText}</p>
                <p className={`text-xs ${textMuted} truncate`}>{item.translatedText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Useful Quick Sample Translation Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className={`text-[11px] ${textMuted} mr-1 font-semibold`}>{t('quick_examples', currentLang, 'Hızlı Örnekler:')}</span>
        {[
          'Merhaba, nasılsınız?',
          'Where is the airport?',
          'Vielen Dank für Ihre Hilfe',
          'Buenos días, ¿cómo estás?',
          'Nova Browser çok hızlı ve güvenli',
        ].map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSourceText(phrase)}
            className={`px-3 py-1 rounded-full text-[11px] ${inputBg} border ${borderCol} hover:border-blue-400 ${textMain} transition-all cursor-pointer`}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* FULL SEARCHABLE LANGUAGE PICKER MODAL (100+ LANGUAGES) */}
      {/* ========================================================================= */}
      {pickerType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-3xl max-h-[85vh] p-5 rounded-3xl ${cardBg} border ${borderCol} shadow-2xl flex flex-col space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className={`text-base font-bold ${textMain}`}>
                  {pickerType === 'from' ? t('select_source_language', currentLang, 'Kaynak Dil Seçin') : t('select_target_language', currentLang, 'Hedef Dil Seçin')} (100+ Dil)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className={`flex items-center h-11 px-4 rounded-2xl border ${borderCol} ${inputBg}`}>
              <Search className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
              <input
                type="text"
                value={languageSearchQuery}
                onChange={(e) => setLanguageSearchQuery(e.target.value)}
                placeholder={t('search_language_placeholder', currentLang, 'Dil ara (örn. Türkçe, Almanca, İspanyolca, Japonca, Farsça)...')}
                className={`w-full bg-transparent text-sm ${textMain} focus:outline-none`}
                autoFocus
              />
              {languageSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLanguageSearchQuery('')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Language Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {/* Option: Auto-Detect (only for source picker) */}
              {pickerType === 'from' && (
                <button
                  type="button"
                  onClick={() => {
                    setFromLang('auto');
                    setPickerType(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    fromLang === 'auto'
                      ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                      : `${inputBg} hover:bg-slate-700/40 ${textMain} ${borderCol}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <div>
                      <div className="text-xs font-bold">{t('auto_detect', currentLang, 'Otomatik Algıla')}</div>
                      <div className="text-[10px] opacity-75">{t('auto_detect_desc', currentLang, 'Dili kendisi bulur')}</div>
                    </div>
                  </div>
                  {fromLang === 'auto' && <Check className="w-4 h-4" />}
                </button>
              )}

              {filteredLanguages.map((lang) => {
                const isSelected = pickerType === 'from' ? fromLang === lang.code : toLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      if (pickerType === 'from') {
                        setFromLang(lang.code);
                      } else {
                        setToLang(lang.code);
                      }
                      setPickerType(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                        : `${inputBg} hover:bg-slate-700/40 ${textMain} ${borderCol}`
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{lang.name}</div>
                        {lang.nativeName && (
                          <div className="text-[10px] opacity-70 truncate">{lang.nativeName}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-white ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
