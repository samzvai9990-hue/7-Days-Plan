import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { calculateCashOutFee, formatBDT, takaToPaisa, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { Transaction } from '../types';
import { 
  X, 
  ArrowDownLeft, 
  Store, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Download, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashOutModal: React.FC<CashOutModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, cashOut, getUserBalancePaisa, language } = useWallet();
  const t = translations[language];

  const [step, setStep] = useState<'DETAILS' | 'PIN' | 'SUCCESS'>('DETAILS');
  const [agentPhone, setAgentPhone] = useState('01933445566');
  const [amountStr, setAmountStr] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentBalancePaisa = getUserBalancePaisa(currentUser.id);
  const amountPaisa = takaToPaisa(amountStr);
  const feePaisa = calculateCashOutFee(amountPaisa);
  const totalDeductionPaisa = amountPaisa + feePaisa;
  const remainingBalancePaisa = currentBalancePaisa - totalDeductionPaisa;

  const matchedAgent = allUsers.find(u => u.phone === agentPhone.trim() && u.role === 'AGENT');

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!matchedAgent) {
      setErrorMsg(language === 'bn' ? 'সঠিক অনুমোদিত এজেন্ট নম্বর দিন (যেমন: ০১৯৩৩৪৪৫৫৬৬)' : 'Enter a valid authorized agent number (e.g. 01933445566)');
      return;
    }
    if (amountPaisa < 5000) { // ৳50
      setErrorMsg(language === 'bn' ? 'ন্যূনতম ক্যাশ আউট ৫০ টাকা' : 'Minimum cash out is ৳50');
      return;
    }
    if (totalDeductionPaisa > currentBalancePaisa) {
      setErrorMsg(t.errInsufficientBalance);
      return;
    }

    setStep('PIN');
  };

  const handleExecuteCashOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg(t.errWrongPin);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const idempotencyKey = `idemp_co_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setTimeout(() => {
      const res = cashOut(agentPhone.trim(), amountPaisa, pin, idempotencyKey);
      setIsSubmitting(false);

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);
        setStep('SUCCESS');
      } else {
        setErrorMsg(res.error || 'Cash out failed');
      }
    }, 400);
  };

  const handleResetAndClose = () => {
    setStep('DETAILS');
    setAmountStr('');
    setPin('');
    setErrorMsg('');
    setCompletedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-orange-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {t.cashOutTitle}
              </h3>
              <p className="text-[10px] text-orange-200 leading-none">
                {t.cashOutSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-orange-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPin} className="space-y-4">
              {/* Agent Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.agentNumber}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={agentPhone}
                    onChange={(e) => {
                      setAgentPhone(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={t.agentPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono tracking-wider"
                    required
                  />
                  {matchedAgent && (
                    <div className="absolute right-3 top-2.5 flex items-center gap-1 text-orange-600 text-xs font-semibold">
                      <Store className="w-4 h-4" />
                      <span>{matchedAgent.name.split('-')[0].trim()}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn' ? 'ডেমো এজেন্ট: সোহেল টেলিকম (০১৯৩৩৪৪৫৫৬৬)' : 'Demo Agent: Sohel Telecom (01933445566)'}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.amountLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-base">
                    ৳
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold text-slate-800 font-tabular"
                    min="50"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        playTapSound();
                        setAmountStr(String(amt));
                        setErrorMsg('');
                      }}
                      className="py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-700 transition-colors"
                    >
                      ৳{language === 'bn' ? toBengaliDigits(amt) : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.availableBalance}:</span>
                  <span className="font-semibold text-slate-800 font-tabular">
                    {formatBDT(currentBalancePaisa, language)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'bn' ? 'ক্যাশ আউট ফি (১.৮৫%):' : 'Cash Out Fee (1.85%):'}</span>
                  <span className="font-semibold text-orange-700 font-tabular">
                    {formatBDT(feePaisa, language)}
                  </span>
                </div>
                <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>{t.totalDeduction}:</span>
                  <span className="text-orange-700 font-tabular text-sm">
                    {formatBDT(totalDeductionPaisa, language)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-700/20 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'পিন দিয়ে ক্যাশ আউট করুন' : 'Proceed to PIN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'PIN' && (
            <form onSubmit={handleExecuteCashOut} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {t.enterPin}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' 
                    ? `এজেন্ট পয়েন্ট থেকে ${formatBDT(amountPaisa, language)} উত্তোলন করছেন` 
                    : `Withdrawing ${formatBDT(amountPaisa, language)} at agent point`}
                </p>
                <div className="mt-2 text-[11px] text-orange-700 font-medium bg-orange-50 py-1 px-2.5 rounded-lg inline-block">
                  {language === 'bn' ? 'ডেমো পিন: 1234' : 'Demo PIN: 1234'}
                </div>
              </div>

              <div className="flex justify-center">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-40 text-center tracking-[1em] text-2xl font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('DETAILS');
                    setPin('');
                    setErrorMsg('');
                  }}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  {language === 'bn' ? 'পেছনে' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || pin.length !== 4}
                  className="w-2/3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{t.processing}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.confirmCashOut}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && completedTx && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.cashOutSuccess}
                </h4>
                <p className="text-2xl font-black text-orange-600 font-tabular mt-1">
                  {formatBDT(completedTx.amountPaisa, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? 'কাউন্টার থেকে নগদ টাকা গ্রহণ করুন' : 'Collect cash from agent counter'}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t.trxId}:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{completedTx.id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(completedTx.id);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copied && <span className="text-[10px] text-orange-600 font-medium">{t.copied}</span>}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'এজেন্ট:' : 'Agent:'}</span>
                  <span className="font-semibold text-slate-800">
                    {completedTx.targetName} ({completedTx.targetPhone})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'ফি (১.৮৫%):' : 'Fee (1.85%):'}</span>
                  <span className="font-semibold text-slate-800">
                    {formatBDT(completedTx.feePaisa, language)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{t.timestamp}:</span>
                  <span className="text-slate-700 font-tabular">
                    {new Date(completedTx.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>{t.downloadReceipt}</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
