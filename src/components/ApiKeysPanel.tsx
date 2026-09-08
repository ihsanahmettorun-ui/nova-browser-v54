import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Video,
  Bot,
  CloudSun,
  Code,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Search,
  Newspaper,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomApiKey } from '../types.ts';
import {
  getCustomApiKeys,
  updateApiKeyEntry,
  addNewCustomApiKey,
  deleteCustomApiKeyEntry,
} from '../utils/storage.ts';
import { t } from '../data/languages.ts';

interface ApiKeysPanelProps {
  onNotify?: (msg: string) => void;
  currentLang?: string;
}

export const ApiKeysPanel: React.FC<ApiKeysPanelProps> = ({ currentLang = 'tr' }) => {
  const [apiKeys, setApiKeys] = useState<CustomApiKey[]>(() => getCustomApiKeys());
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Custom API Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'video' | 'ai' | 'search' | 'news' | 'developer' | 'weather' | 'custom'>('custom');
  const [newDescription, setNewDescription] = useState('');

  // Guide Modal
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CustomApiKey | null>(null);

  // Sync state on change
  const handleKeyInputChange = (id: string, value: string) => {
    setApiKeys((prev) =>
      prev.map((item) => (item.id === id ? { ...item, apiKey: value } : item))
    );
    // Reset validation result on edit
    setValidationResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSaveKey = (item: CustomApiKey) => {
    const updated = updateApiKeyEntry(item.id, { apiKey: item.apiKey });
    setApiKeys(updated);
    setSavedStatus((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setSavedStatus((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

  const handleClearKey = (id: string) => {
    const updated = updateApiKeyEntry(id, { apiKey: '', isActive: false });
    setApiKeys(updated);
    setValidationResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id;
    if (targetId.startsWith('api_custom_')) {
      const updated = deleteCustomApiKeyEntry(targetId);
      setApiKeys(updated);
    } else {
      // For default cards, clear the API key completely
      const updated = updateApiKeyEntry(targetId, { apiKey: '', isActive: false });
      setApiKeys(updated);
    }
    setValidationResults((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setItemToDelete(null);
  };

  const handleToggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleValidateKey = async (item: CustomApiKey) => {
    if (!item.apiKey.trim()) {
      setValidationResults((prev) => ({
        ...prev,
        [item.id]: { success: false, message: 'Lütfen önce geçerli bir API anahtarı girin.' },
      }));
      return;
    }

    setValidatingId(item.id);
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: item.serviceKey,
          apiKey: item.apiKey.trim(),
          endpointUrl: item.endpointUrl,
        }),
      });
      const data = await res.json();
      setValidationResults((prev) => ({
        ...prev,
        [item.id]: {
          success: Boolean(data.success),
          message: data.message || (data.success ? t('api_key_valid', currentLang, 'API anahtarı geçerli!') : t('validation_failed', currentLang, 'Doğrulama başarısız.')),
        },
      }));
      if (data.success) {
        // Automatically save on successful validation
        handleSaveKey(item);
      }
    } catch (err: any) {
      setValidationResults((prev) => ({
        ...prev,
        [item.id]: { success: false, message: err.message || t('connection_error', currentLang, 'Bağlantı hatası.') },
      }));
    } finally {
      setValidatingId(null);
    }
  };

  const handleCreateCustomApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newApiKey.trim()) return;

    const updated = addNewCustomApiKey({
      serviceKey: `custom_${Date.now()}`,
      serviceName: newServiceName.trim(),
      category: newCategory,
      apiKey: newApiKey.trim(),
      endpointUrl: newEndpointUrl.trim() || undefined,
      description: newDescription.trim() || t('custom_api_desc', currentLang, 'Kullanıcı tanımlı özel API entegrasyonu.'),
      isActive: true,
    });

    setApiKeys(updated);
    setNewServiceName('');
    setNewApiKey('');
    setNewEndpointUrl('');
    setNewDescription('');
    setShowAddForm(false);
  };

  const filteredList = apiKeys.filter((k) => {
    if (filterCategory === 'all') return true;
    return k.category === filterCategory;
  });

  const getCategoryIcon = (category: string, serviceKey: string) => {
    if (serviceKey === 'youtube') return <Video className="w-4 h-4 text-red-500" />;
    if (serviceKey === 'gemini') return <Sparkles className="w-4 h-4 text-amber-400" />;
    if (serviceKey === 'openai') return <Bot className="w-4 h-4 text-emerald-400" />;
    if (serviceKey === 'github') return <Code className="w-4 h-4 text-purple-400" />;
    if (serviceKey === 'weather') return <CloudSun className="w-4 h-4 text-sky-400" />;
    if (serviceKey === 'google_search' || serviceKey === 'tavily') return <Search className="w-4 h-4 text-blue-400" />;
    if (serviceKey === 'newsapi') return <Newspaper className="w-4 h-4 text-rose-400" />;
    if (serviceKey === 'unsplash') return <ImageIcon className="w-4 h-4 text-teal-400" />;
    if (category === 'search') return <Search className="w-4 h-4 text-blue-400" />;
    if (category === 'news') return <Newspaper className="w-4 h-4 text-rose-400" />;
    return <KeyRound className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div id="sidebar-view-apikeys" className="space-y-4 text-xs">
      {/* Header Info */}
      <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>{t('api_mgmt_title', currentLang, 'API & Entegrasyon Yönetimi')}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {t('local_secure', currentLang, 'Yerel & Güvenli')}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {t('api_panel_desc', currentLang, 'YouTube Data API v3, Google Gemini, Google Custom Search, OpenAI, Tavily, NewsAPI, Unsplash veya özel API anahtarlarınızı buraya ekleyerek tarayıcı üzerinden doğrudan servis entegrasyonlarını çalıştırabilirsiniz.')}
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        {[
          { id: 'all', label: t('all', currentLang, 'Tümü') },
          { id: 'video', label: '🎬 Video & YouTube' },
          { id: 'ai', label: '✨ Yapay Zeka' },
          { id: 'search', label: '🔍 Arama & Görsel' },
          { id: 'news', label: '📰 Haberler' },
          { id: 'developer', label: '👨‍💻 Geliştirici' },
          { id: 'weather', label: '🌤️ Hava Durumu' },
          { id: 'custom', label: '⚙️ Özel API' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
              filterCategory === cat.id
                ? 'bg-indigo-600 font-semibold text-white'
                : 'bg-black/30 text-slate-400 hover:text-slate-200 hover:bg-black/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* API Key Cards List */}
      <div className="space-y-3">
        {filteredList.map((item) => {
          const isVisible = visibleKeys[item.id] || false;
          const isSaved = savedStatus[item.id] || false;
          const isValidating = validatingId === item.id;
          const validation = validationResults[item.id];
          const hasKey = Boolean(item.apiKey && item.apiKey.trim().length > 0);

          return (
            <div
              key={item.id}
              id={`api-card-${item.serviceKey}`}
              className={`p-3.5 rounded-2xl border transition-all ${
                hasKey
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                  : 'bg-black/25 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0">
                    {getCategoryIcon(item.category, item.serviceKey)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate flex items-center gap-1.5">
                      <span>{item.serviceName}</span>
                      {hasKey ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                          {t('active', currentLang, 'Aktif')}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 font-normal">
                          {t('empty', currentLang, 'Boş')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.docUrl && (
                    <a
                      href={item.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors flex items-center gap-0.5 text-[10px]"
                      title={t('get_key_doc', currentLang, 'API Anahtarı Al / Dokümantasyon')}
                    >
                      <span>{t('get_key', currentLang, 'Anahtar Al')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title={item.id.startsWith('api_custom_') ? t('delete_custom_api', currentLang, "Özel API'yi Kalıcı Olarak Sil") : t('clear_api_key', currentLang, "API Anahtarını Sıfırla / Sil")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 mb-2.5 leading-normal">
                {item.description}
              </p>

              {/* API Key Input Field */}
              <div className="relative mb-2">
                <input
                  type={isVisible ? 'text' : 'password'}
                  placeholder={
                    item.serviceKey === 'youtube'
                      ? 'AIzaSy... (YouTube Data API v3 Key)'
                      : item.serviceKey === 'gemini'
                      ? 'AIzaSy... (Gemini API Key)'
                      : item.serviceKey === 'openai'
                      ? 'sk-... (OpenAI API Key)'
                      : item.serviceKey === 'github'
                      ? 'ghp_... (GitHub Token)'
                      : t('paste_api_key', currentLang, 'API Anahtarınızı veya Tokeninizi buraya yapıştırın')
                  }
                  value={item.apiKey}
                  onChange={(e) => handleKeyInputChange(item.id, e.target.value)}
                  className="w-full pl-3 pr-16 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  {item.apiKey && (
                    <button
                      type="button"
                      onClick={() => handleKeyInputChange(item.id, '')}
                      className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title={t('clear_input', currentLang, 'Girişi Temizle')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(item.id)}
                    className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={isVisible ? t('hide', currentLang, 'Gizle') : t('show', currentLang, 'Göster')}
                  >
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Validation feedback message */}
              {validation && (
                <div
                  className={`p-2 rounded-lg text-[11px] mb-2 flex items-start gap-1.5 leading-tight ${
                    validation.success
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {validation.success ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{validation.message}</span>
                </div>
              )}

              {/* Action Buttons: Save, Test, Clear */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  id={`btn-save-api-${item.serviceKey}`}
                  onClick={() => handleSaveKey(item)}
                  disabled={!item.apiKey.trim()}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : item.apiKey.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('saved', currentLang, 'Kaydedildi')}</span>
                    </>
                  ) : (
                    <span>{t('save', currentLang, 'Kaydet')}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleValidateKey(item)}
                  disabled={isValidating || !item.apiKey.trim()}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                  title={t('test_api_key', currentLang, 'API Anahtarını Canlı Sunucuda Test Et')}
                >
                  {isValidating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                  )}
                  <span>{t('validate', currentLang, 'Doğrula')}</span>
                </button>

                {hasKey && (
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title={t('delete_key', currentLang, 'Bu Anahtarı Sil / Sıfırla')}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('delete', currentLang, 'Sil')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom API Section */}
      {!showAddForm ? (
        <button
          type="button"
          id="btn-show-add-custom-api"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-white/20 hover:border-indigo-500 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors bg-black/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>{t('add_custom_api_btn', currentLang, 'Farklı Bir Site / Özel API Ekle')}</span>
        </button>
      ) : (
        <form
          onSubmit={handleCreateCustomApi}
          className="p-3.5 rounded-2xl bg-black/40 border border-indigo-500/30 space-y-2.5"
        >
          <div className="flex items-center justify-between font-bold text-white text-xs">
            <span>{t('define_new_custom_api', currentLang, 'Yeni Özel API Tanımla')}</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">{t('service_name_label', currentLang, 'Servis / Site Adı')}</label>
            <input
              type="text"
              placeholder="Örn: Spotify API, News API, Özel Sunucu"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">{t('api_key_token_label', currentLang, 'API Anahtarı / Token')}</label>
            <input
              type="password"
              placeholder="API Key veya Bearer Token"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">{t('category_label', currentLang, 'Kategori')}</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="custom">⚙️ Özel API</option>
              <option value="video">🎬 Video & Medya</option>
              <option value="ai">✨ Yapay Zeka</option>
              <option value="search">🔍 Arama & Görsel</option>
              <option value="news">📰 Haberler</option>
              <option value="developer">👨‍💻 Geliştirici & Kod</option>
              <option value="weather">🌤️ Hava Durumu</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">{t('endpoint_url_label', currentLang, 'Uç Nokta / Endpoint URL (İsteğe Bağlı)')}</label>
            <input
              type="url"
              placeholder="https://api.example.com/v1"
              value={newEndpointUrl}
              onChange={(e) => setNewEndpointUrl(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('add_and_save_api', currentLang, "API'yi Ekle ve Kaydet")}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs cursor-pointer"
            >
              {t('cancel', currentLang, 'Vazgeç')}
            </button>
          </div>
        </form>
      )}

      {/* Security & Privacy Notice */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('privacy_security_title', currentLang, 'Gizlilik & Güvenlik Koruması')}</span>
        </div>
        <p>
          {t('privacy_security_desc', currentLang, 'Girdiğiniz API anahtarları sadece sizin tarayıcınızın yerel depolama alanında (localStorage) şifreli biçimde tutulur. Üçüncü şahıslarla veya dış sunucularla paylaşılmaz.')}
        </p>
      </div>

      {/* Custom In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm">
                  {itemToDelete.id.startsWith('api_custom_') ? t('delete_api_record', currentLang, 'API Kaydını Sil') : t('delete_and_reset_key', currentLang, 'Anahtarı Sil ve Sıfırla')}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <span className="font-semibold text-white">"{itemToDelete.serviceName}"</span>{' '}
                  {itemToDelete.id.startsWith('api_custom_')
                    ? t('delete_api_confirm', currentLang, 'kaydı kalıcı olarak silinecektir. Onaylıyor musunuz?')
                    : t('reset_api_confirm', currentLang, 'için girilen API anahtarı temizlenecek ve servis devre dışı bırakılacaktır.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                id="btn-confirm-delete-api"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('yes_delete', currentLang, 'Evet, Sil')}</span>
              </button>
              <button
                type="button"
                id="btn-cancel-delete-api"
                onClick={() => setItemToDelete(null)}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                {t('cancel', currentLang, 'Vazgeç')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
