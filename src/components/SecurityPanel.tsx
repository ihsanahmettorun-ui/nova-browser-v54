import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Info,
  Globe,
} from 'lucide-react';
import { ApprovedUnsafeSite } from '../types.ts';
import {
  getApprovedUnsafeSites,
  revokeApprovedUnsafeSite,
  clearAllApprovedUnsafeSites,
  addApprovedUnsafeSite,
} from '../utils/storage.ts';
import { t } from '../data/languages.ts';
import { ConsentModal } from './ConsentModal.tsx';

interface SecurityPanelProps {
  onNavigate?: (url: string) => void;
  currentLang?: string;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ onNavigate, currentLang = 'tr' }) => {
  const [unsafeSites, setUnsafeSites] = useState<ApprovedUnsafeSite[]>([]);
  const [manualDomain, setManualDomain] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsentReviewModal, setShowConsentReviewModal] = useState(false);
  const [addCheckbox1, setAddCheckbox1] = useState(false);
  const [addCheckbox2, setAddCheckbox2] = useState(false);
  const [addConfirmText, setAddConfirmText] = useState('');

  const refreshList = () => {
    setUnsafeSites(getApprovedUnsafeSites());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleRevoke = (domain: string) => {
    const updated = revokeApprovedUnsafeSite(domain);
    setUnsafeSites(updated);
  };

  const handleClearAll = () => {
    if (window.confirm(t('confirm_clear_security', currentLang, 'Tüm güvensiz site onaylarını kaldırmak ve kalkanı tüm sitelerde tekrar tam olarak devreye sokmak istediğinize emin misiniz?'))) {
      clearAllApprovedUnsafeSites();
      setUnsafeSites([]);
    }
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDomain.trim()) return;

    let cleanDomain = manualDomain.trim().toLowerCase();
    try {
      if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
        cleanDomain = new URL(cleanDomain).hostname;
      }
    } catch {}
    cleanDomain = cleanDomain.replace(/^www\./, '');

    const isValid = addCheckbox1 && addCheckbox2 && (addConfirmText.trim().toUpperCase() === 'ONAYLIYORUM' || addConfirmText.trim().toUpperCase() === 'CONFIRM' || addConfirmText.trim().toUpperCase() === 'APPROVE');
    if (!isValid) {
      alert(t('confirm_alert', currentLang, 'Lütfen her iki onay kutusunu işaretleyin ve kutuya ONAYLIYORUM yazınız.'));
      return;
    }

    const newEntry: ApprovedUnsafeSite = {
      id: 'unsafe-' + Date.now(),
      domain: cleanDomain,
      url: `https://${cleanDomain}`,
      threatType: 'manual_override',
      threatScore: 75,
      approvedAt: new Date().toISOString(),
      disclaimerAcknowledged: true,
    };

    const updated = addApprovedUnsafeSite(newEntry);
    setUnsafeSites(updated);
    setManualDomain('');
    setShowAddModal(false);
    setAddCheckbox1(false);
    setAddCheckbox2(false);
    setAddConfirmText('');
  };

  return (
    <div id="sidebar-view-security" className="space-y-4 text-xs">
      {/* Header & Status Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{t('novashield_title', currentLang, 'NovaShield Koruma Motoru')}</h4>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('novashield_active', currentLang, 'Aktif ve Gerçek Zamanlı Koruma')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshList}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={t('refresh', currentLang, 'Listeyi Yenile')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{t('antivirus_phishing', currentLang, 'Antivirüs & Phishing')}</div>
            <div className="font-semibold text-emerald-400 mt-0.5">{t('full_protection', currentLang, 'Tam Koruma (Aktif)')}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{t('exception_sites', currentLang, 'İstisna Tanımlı Siteler')}</div>
            <div className={`font-semibold mt-0.5 ${unsafeSites.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {unsafeSites.length} {t('websites_count', currentLang, 'Web Sitesi')}
            </div>
          </div>
        </div>
      </div>

      {/* User Approved Unsafe Sites Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-slate-200 text-xs">
              {t('approved_unsafe_sites', currentLang, 'Kullanıcı Onaylı Güvensiz Siteler')} ({unsafeSites.length})
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{t('add_exception', currentLang, 'İstisna Ekle')}</span>
            </button>
            {unsafeSites.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[10px] font-medium transition-colors cursor-pointer"
                title="Tüm onayları kaldır ve kalkanı geri aç"
              >
                {t('reset_all', currentLang, 'Tümünü Sıfırla')}
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {t('exception_desc', currentLang, 'Aşağıdaki siteler, katı onay ve feragat formu doldurularak güvenlik kalkanı geçici olarak kapatılmış sitelerdir:')}
        </p>

        {unsafeSites.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto opacity-80" />
            <div className="font-medium text-slate-300">{t('no_unsafe_sites', currentLang, 'Onaylı Güvensiz Site Yok')}</div>
            <div className="text-[10px] text-slate-500 max-w-xs mx-auto">
              {t('full_shield_active', currentLang, 'Güvenlik kalkanınız tüm web sitelerinde %100 oranında tam koruma sağlıyor.')}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {unsafeSites.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-amber-200 truncate flex items-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.domain}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.url}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevoke(item.domain)}
                    className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Bu site için onayı kaldır ve kalkanı geri aç"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-amber-500/20">
                  <span>{t('approval_date', currentLang, 'Onay')}: {new Date(item.approvedAt).toLocaleDateString()}</span>
                  <span className="text-rose-400 font-medium">{t('risk_score', currentLang, 'Risk')}: %{item.threatScore}</span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.url)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <span>{t('open', currentLang, 'Aç')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Info & Legal Terms Card */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('legal_rules_title', currentLang, 'Yasal ve Teknik Kurallar:')}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>{t('legal_rule_1', currentLang, 'Tüm yasal siteler doğrudan veya Nova Proxy üzerinden tam erişilebilir durumdadır.')}</li>
          <li>{t('legal_rule_2', currentLang, 'Kötü amaçlı, virüslü veya sahte kimlikli sitelere erişim katı onay formu doldurulmadan açılamaz.')}</li>
          <li>{t('legal_rule_3', currentLang, 'Kullanıcı onayı yalnızca hedef site özelindedir, diğer tüm siteler korunmaya devam eder.')}</li>
        </ul>

        {/* View Strict Clauses in Any Language Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            id="btn-review-strict-clauses"
            onClick={() => setShowConsentReviewModal(true)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{t('view_strict_clauses_languages', currentLang, 'Katı Maddeleri & Sorumluluk Reddini İncele (145+ Dil)')}</span>
          </button>
        </div>
      </div>

      {/* Manual Add Exception Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('add_custom_exception', currentLang, 'Özel Güvenlik İstisnası Ekle')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/30 border-l-4 border-rose-500 p-2.5 rounded text-[11px] text-rose-200 leading-relaxed">
              <strong>{t('warning_title', currentLang, 'Zorunlu Yasal Uyarı:')}</strong> {t('warning_body', currentLang, 'Güvenlik kalkanını manuel olarak kapatmak cihazınızı ve verilerinizi riske atabilir. Nova Browser geliştiricileri oluşabilecek hiçbir zarardan sorumlu tutulamaz.')}
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                  {t('domain_label', currentLang, 'Web Sitesi Alan Adı (Örnek: example.com)')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="alan-adi.com"
                  value={manualDomain}
                  onChange={(e) => setManualDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addCheckbox1}
                  onChange={(e) => setAddCheckbox1(e.target.checked)}
                  className="mt-0.5 accent-red-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <span>{t('disclaimer_agree_1', currentLang, 'Bu sitenin risk taşıyabileceğini ve kalkanın yalnızca bu site için kapatılacağını anladım.')}</span>
              </label>

              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addCheckbox2}
                  onChange={(e) => setAddCheckbox2(e.target.checked)}
                  className="mt-0.5 accent-red-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <span>{t('disclaimer_agree_2', currentLang, 'Gelişebilecek tüm olay ve zararlardan geliştiricilerin sorumlu olmadığını kabul ediyorum.')}</span>
              </label>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {t('confirm_prompt', currentLang, 'Onaylamak için kutuya büyük harflerle')} <strong>ONAYLIYORUM</strong> {t('write_prompt', currentLang, 'yazınız:')}
                </label>
                <input
                  type="text"
                  placeholder="ONAYLIYORUM"
                  value={addConfirmText}
                  onChange={(e) => setAddConfirmText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
                >
                  {t('cancel', currentLang, 'İptal')}
                </button>
                <button
                  type="submit"
                  disabled={!addCheckbox1 || !addCheckbox2 || (addConfirmText.trim().toUpperCase() !== 'ONAYLIYORUM' && addConfirmText.trim().toUpperCase() !== 'CONFIRM') || !manualDomain.trim()}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
                >
                  {t('confirm_and_add', currentLang, 'İstisnayı Onayla & Ekle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Strict Clauses & Liability Review Modal in 145+ Languages */}
      {showConsentReviewModal && (
        <ConsentModal
          isReviewMode={true}
          currentLang={currentLang}
          onClose={() => setShowConsentReviewModal(false)}
          onAccepted={() => setShowConsentReviewModal(false)}
        />
      )}
    </div>
  );
};
