import React from 'react';
import { ShieldAlert, Trash2, AlertOctagon, CheckCircle, X, HardDrive } from 'lucide-react';
import { PRODUCER_FULL_NAME, uninstallAppAndResetAll, OFFICIAL_LEGAL_RECORD_FILENAME } from '../utils/storage.ts';

interface LegalRecordProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordFilename?: string;
}

export const LegalRecordProtectionModal: React.FC<LegalRecordProtectionModalProps> = ({
  isOpen,
  onClose,
  recordFilename = OFFICIAL_LEGAL_RECORD_FILENAME,
}) => {
  if (!isOpen) return null;

  const handleFullUninstall = () => {
    const confirmed = window.confirm(
      `DİKKAT: Nova Browser uygulamasını ve tüm kullanıcı verilerini sisteminizden tamamen kaldırmak istediğinizden emin misiniz?\n\nBu işlem yapımcı ${PRODUCER_FULL_NAME}'a ait yasal onay belgesi de dahil olmak üzere TÜM VERİLERİ SİLECEKTİR ve uygulama sistemden kaldırılacaktır.`
    );
    if (confirmed) {
      uninstallAppAndResetAll();
    }
  };

  return (
    <div
      id="legal-protection-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="legal-protection-modal-container"
        className="w-full max-w-lg rounded-2xl border-2 border-rose-600/60 bg-slate-950 text-slate-100 shadow-2xl shadow-rose-950/40 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-rose-950/40 border-b border-rose-600/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-rose-200">
                Korumalı Hukuki Belge Silinemez!
              </h3>
              <p className="text-[11px] text-rose-300/80">
                Yapımcı Sorumsuzluk Tutanağı Koruması
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Silinmek İstenen Belge:
              </span>
              <span className="font-mono text-xs text-amber-200 font-bold">{recordFilename}</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
            <p>
              Bu belge, yapımcı <strong>{PRODUCER_FULL_NAME}</strong>&apos;un hiçbir olaydan,
              indirilen dosyadan veya kullanımdan sorumlu olmadığını belgeleyen{' '}
              <strong>resmi hukuki onay ve kullanım taahhüt tutanağıdır</strong>.
            </p>
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-1.5">
              <p className="font-bold text-rose-100 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                Hukuki Silme Kuralı:
              </p>
              <p className="text-[11px] leading-normal text-rose-200/90">
                Onayladığınız bu belgenin ve indirmelerdeki onay kağıtlarının silinebilmesi için{' '}
                <strong>
                  Nova Browser uygulamasını ve tüm kullanıcı verilerini bilgisayarınızdan tamamen
                  kaldırmanız (Uninstall)
                </strong>{' '}
                zorunludur. Uygulama kurulu ve kullanımda kaldığı müddetçe onay kağıtları tek başına
                silinemez.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Belgeyi Koru ve Sakla</span>
          </button>

          <button
            type="button"
            onClick={handleFullUninstall}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 hover:border-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Uygulamayı ve Verileri Tamamen Kaldır (Uninstall)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
