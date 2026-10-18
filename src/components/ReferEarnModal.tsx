import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { 
  X, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Gift, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ReferEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferEarnModal: React.FC<ReferEarnModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, applyReferralCode, feeRules, language } = useWallet();
  const t = translations[language];

  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const referralBonusPaisa = feeRules.referralRewardPaisa || 5000; // ৳50

  const handleCopyCode = () => {
    playTapSound();
    navigator.clipboard.writeText(currentUser.referralCode || 'TP-TAKAPAY');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    playTapSound();
    const shareText = `TakaPay ডিজিটাল ওয়ালেটে যুক্ত হয়ে নিন ৫০ টাকা ফ্রি ব্যালেন্স! আমার রেফারেল কোড: ${currentUser.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'TakaPay Referral', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert(language === 'bn' ? 'রেফারেল লিঙ্ক কপি করা হয়েছে!' : 'Referral message copied to clipboard!');
    }
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = applyReferralCode(friendCode);
    if (res.success) {
      setSuccessMsg(t.referralSuccess);
      setFriendCode('');
    } else {
      setErrorMsg(res.error || t.errInvalidReferralCode);
    }
  };

  // Find demo available codes to suggest for testing
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.referralCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {t.referTitle}
              </h3>
              <p className="text-[10px] text-amber-100 leading-none">
                {t.referSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Referral Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              {t.yourReferralCode}
            </span>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-sm">
              <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                {currentUser.referralCode || 'TP-TAKAPAY'}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                title={t.copyCode}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyCode}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareReferralLink}</span>
              </button>
            </div>
          </div>

          {/* Earnings Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">{t.totalReferrals}</span>
              <span className="text-base font-bold text-slate-800 font-tabular">
                {language === 'bn' ? toBengaliDigits(currentUser.referralCount || 0) : currentUser.referralCount || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">{t.totalReferralEarnings}</span>
              <span className="text-base font-bold text-emerald-700 font-tabular">
                {formatBDT(currentUser.totalReferralEarnedPaisa || 0, language)}
              </span>
            </div>
          </div>

          {/* Apply Friend's Code Form */}
          {!currentUser.referredBy ? (
            <form onSubmit={handleApplyCode} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">
                {t.enterFriendCode}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TP-FATIMA55"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  {t.claimReferBonus}
                </button>
              </div>

              {/* Quick suggestions for testing */}
              {otherUsers.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-400 shrink-0">{language === 'bn' ? 'টেস্ট কোড:' : 'Test codes:'}</span>
                  {otherUsers.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => setFriendCode(u.referralCode)}
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-amber-100 text-[10px] font-mono text-slate-700 shrink-0"
                    >
                      {u.referralCode}
                    </button>
                  ))}
                </div>
              )}
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-medium">
              {language === 'bn' 
                ? `আপনি কোড ${currentUser.referredBy} ব্যবহার করে ৫০ টাকা বোনাস উপভোগ করেছেন!` 
                : `You received ৳50 bonus using code ${currentUser.referredBy}!`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
