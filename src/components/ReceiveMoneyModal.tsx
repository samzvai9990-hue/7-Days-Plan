import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { playTapSound } from '../utils/audio';
import { X, QrCode, Copy, Check, Share2, ShieldCheck } from 'lucide-react';

interface ReceiveMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveMoneyModal: React.FC<ReceiveMoneyModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, language } = useWallet();
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    playTapSound();
    navigator.clipboard.writeText(currentUser.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden text-center">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-purple-200" />
            </div>
            <h3 className="text-base font-bold tracking-tight">
              {t.receiveMoneyTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6">
          <div className="inline-block p-4 rounded-3xl bg-slate-50 border-2 border-dashed border-purple-200 shadow-inner mb-4">
            {/* High-contrast QR representation */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative">
              {/* Corner position markers */}
              <div className="absolute top-3 left-3 w-8 h-8 border-4 border-slate-900 rounded-md flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-slate-900 rounded-xs" />
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 border-4 border-slate-900 rounded-md flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-slate-900 rounded-xs" />
              </div>
              <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-slate-900 rounded-md flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-slate-900 rounded-xs" />
              </div>

              {/* Decorative data grid */}
              <div className="grid grid-cols-6 gap-1 w-24 h-24 p-2 opacity-80">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i * 7) % 3 === 0 ? 'bg-slate-900' : (i * 5) % 2 === 0 ? 'bg-purple-800' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Center Brand Badge */}
              <div className="absolute w-9 h-9 rounded-xl bg-purple-700 text-white font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-white">
                ৳
              </div>
            </div>
          </div>

          <h4 className="text-base font-bold text-slate-900">{currentUser.name}</h4>
          <p className="text-sm font-mono font-bold text-purple-700 mt-0.5 tracking-wider">
            {currentUser.phone}
          </p>
          <p className="text-[11px] text-slate-500 mt-2 px-3 leading-relaxed">
            {t.myQrNotice}
          </p>

          {/* Copy and Actions */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleCopy}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>{t.copyPhone}</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                playTapSound();
                alert(language === 'bn' ? 'কিউআর লিঙ্ক প্রস্তুত!' : 'QR Code Link ready!');
              }}
              className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share QR'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
