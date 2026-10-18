import React, { useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { playRevealSound, playTapSound } from '../utils/audio';
import { Eye, EyeOff, QrCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface BalanceCardProps {
  onOpenReceiveModal: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onOpenReceiveModal }) => {
  const { currentUser, getUserBalancePaisa, isBalanceVisible, setIsBalanceVisible, language } = useWallet();
  const t = translations[language];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const balancePaisa = getUserBalancePaisa(currentUser.id);
  const formattedBalance = formatBDT(balancePaisa, language);

  const handleToggleBalance = () => {
    if (!isBalanceVisible) {
      playRevealSound();
      setIsBalanceVisible(true);
      // Auto-hide after 6 seconds like real bKash/Nagad apps
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsBalanceVisible(false);
      }, 6000);
    } else {
      playTapSound();
      setIsBalanceVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white shadow-xl shadow-emerald-950/20 p-5 border border-emerald-600/30">
      {/* Decorative background geometry */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Top row: User Info & QR Button */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-lg font-bold text-emerald-200">
                {currentUser.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                {currentUser.name}
              </h2>
              {currentUser.kycStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span className="hidden sm:inline">{t.kycVerified}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-200 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-400/30">
                  <AlertCircle className="w-3 h-3 text-amber-300" />
                  <span className="hidden sm:inline">{t.kycPending}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200/80 font-mono tracking-wider mt-0.5">
              {currentUser.phone} · <span className="opacity-75">{currentUser.accountNumber}</span>
            </p>
          </div>
        </div>

        {/* QR Code Action */}
        <button
          onClick={() => {
            playTapSound();
            onOpenReceiveModal();
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all active:scale-95 shadow-sm"
          title={t.receiveMoney}
        >
          <QrCode className="w-5 h-5 text-emerald-200" />
          <span className="text-[10px] font-medium mt-0.5 text-emerald-100">
            {language === 'bn' ? 'মাই কিউআর' : 'My QR'}
          </span>
        </button>
      </div>

      {/* Center: Tap to View Balance Capsule (bKash/Nagad Signature Feature) */}
      <div className="relative z-10 mt-5 pt-3 border-t border-emerald-600/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleToggleBalance}
          className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-white text-slate-900 shadow-md hover:shadow-lg transition-all active:scale-98 min-w-[220px] justify-between cursor-pointer border border-emerald-200"
          aria-label={t.tapForBalance}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ৳
            </div>
            {isBalanceVisible ? (
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-medium leading-none">
                  {t.balanceRevealed}
                </span>
                <span className="text-base font-bold text-emerald-800 font-tabular tracking-tight">
                  {formattedBalance}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-700 tracking-tight">
                {t.tapForBalance}
              </span>
            )}
          </div>

          <div className="text-slate-400 group-hover:text-emerald-700 transition-colors">
            {isBalanceVisible ? (
              <EyeOff className="w-4 h-4 text-emerald-700" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {/* Daily limit reminder & reward indicator */}
        <div className="flex items-center gap-3 text-xs text-emerald-100/90 font-medium">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'bn' ? 'পয়েন্ট: ১২০' : 'Points: 120'}
            </span>
          </div>
          <span className="text-emerald-400/60">·</span>
          <span>
            {language === 'bn' ? 'দৈনিক লিমিট: ৳২৫,০০০' : 'Daily Limit: ৳25,000'}
          </span>
        </div>
      </div>
    </div>
  );
};
