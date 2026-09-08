import React, { useState } from 'react';
import { Sparkles, X, Loader2, Send, Bot, FileText, Check } from 'lucide-react';
import { TabItem } from '../types.ts';
import { t } from '../data/languages.ts';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabItem;
  currentLang: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentLang,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: t('ai_welcome_msg', currentLang, `Merhaba! Ben Nova AI Asistanı. Şu anki web sayfası ("${activeTab.title || activeTab.url}") hakkında özet çıkarabilir veya aklınızdaki soruları yanıtlayabilirim.`),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean || isLoading) return;

    const userMsg = { role: 'user' as const, text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${clean} (Mevcut sayfa: ${activeTab.url})`, lang: currentLang }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: t('ai_error_gen', currentLang, 'Üzgünüm, şu anda yanıt oluşturulamadı. Lütfen tekrar deneyin.') },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: t('conn_error', currentLang, 'Bağlantı hatası oluştu.') },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSummarize = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: `${t('summarize_request', currentLang, 'Lütfen bu sayfayı özetle')}: ${activeTab.title}` },
    ]);

    try {
      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activeTab.title, url: activeTab.url }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.summary }]);
      } else {
        // Fallback with ai-answer
        const ansRes = await fetch('/api/ai-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `${activeTab.title} web sitesi ve içeriği hakkında kısa ve net özet bilgi`, lang: currentLang }),
        });
        const ansData = await ansRes.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: ansData.answer || t('summary_failed', currentLang, 'Özet oluşturulamadı.') },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: t('summary_error', currentLang, 'Özet çıkarılırken bir hata oluştu.') },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="nova-ai-assistant-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        id="nova-ai-assistant-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full h-[600px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{t('ai_page_assistant', currentLang, 'Nova AI Sayfa Asistanı')}</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                {activeTab.title || activeTab.url}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickSummarize}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            {t('summarize_page_btn', currentLang, 'Bu Sayfayı Özetle')}
          </button>
        </div>

        {/* Chat message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/40 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0 text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('ai_thinking', currentLang, 'Nova AI düşünüyor ve yanıt hazırlıyor...')}</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t('ai_input_placeholder', currentLang, 'Sayfa hakkında soru sorun veya komut verin...')}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
