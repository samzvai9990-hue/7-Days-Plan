import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT, takaToPaisa, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { Transaction } from '../types';
import { 
  X, 
  PlusCircle, 
  CreditCard, 
  Store, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface CashInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashInModal: React.FC<CashInModalProps> = ({ isOpen, onClose }) => {
  const { cashIn, language } = useWallet();
  const t = translations[language];

  const [method, setMethod] = useState<'BANK_CARD' | 'AGENT'>('BANK_CARD');
  const [amountStr, setAmountStr] = useState('1000');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const amountPaisa = takaToPaisa(amountStr);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaisa < 5000) { // ৳50
      setErrorMsg(language === 'bn' ? 'ন্যূনতম জমার পরিমাণ ৫০ টাকা' : 'Minimum deposit is ৳50');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = cashIn(amountPaisa, method, { cardNumber: '4242424242424242' });
      setIsSubmitting(false);

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);
      } else {
        setErrorMsg(res.error || 'Deposit failed');
      }
    }, 400);
  };

  const handleResetAndClose = () => {
    setCompletedTx(null);
    setAmountStr('1000');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {t.cashInTitle}
              </h3>
              <p className="text-[10px] text-teal-200 leading-none">
                {t.cashInSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-teal-100 transition-colors"
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

          {!completedTx ? (
            <form onSubmit={handleDeposit} className="space-y-4">
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.selectMethod}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setMethod('BANK_CARD');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      method === 'BANK_CARD'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1 text-teal-600" />
                    <span className="text-xs font-bold leading-tight">
                      {language === 'bn' ? 'ভিসা / মাস্টারকার্ড' : 'Visa / MasterCard'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'তাত্ক্ষণিক সিমুলেশন' : 'Instant Simulator'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setMethod('AGENT');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      method === 'AGENT'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Store className="w-5 h-5 mb-1 text-teal-600" />
                    <span className="text-xs font-bold leading-tight">
                      {language === 'bn' ? 'এজেন্ট পয়েন্ট ক্যাশ ইন' : 'Agent Cash In'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'কাউন্টার ডিপোজিট' : 'Counter Deposit'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.depositAmount}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-base">
                    ৳
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg font-bold text-slate-800 font-tabular"
                    min="50"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        playTapSound();
                        setAmountStr(String(amt));
                      }}
                      className="py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-teal-100 hover:text-teal-800 text-slate-700 transition-colors"
                    >
                      ৳{language === 'bn' ? toBengaliDigits(amt) : amt}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'BANK_CARD' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{t.cardNumber}:</span>
                    <span className="font-mono font-bold text-slate-800">{cardNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>{language === 'bn' ? 'ডাবল-এন্ট্রি নিরাপত্তা:' : 'Double-Entry Escrow:'}</span>
                    <span className="text-emerald-600 font-medium">{language === 'bn' ? 'জিরো ফি · তাত্ক্ষণিক' : 'Zero Fee · Instant'}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? t.processing : t.confirmDeposit}</span>
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.depositSuccess}
                </h4>
                <p className="text-2xl font-black text-teal-700 font-tabular mt-1">
                  +{formatBDT(completedTx.amountPaisa, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? 'আপনার ওয়ালেটে যুক্ত হয়েছে' : 'Added to your wallet'}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t.trxId}:</span>
                  <span className="font-mono font-bold text-slate-900">{completedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'মাধ্যম:' : 'Method:'}</span>
                  <span className="font-semibold text-slate-800">{completedTx.referenceNote}</span>
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
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md"
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
