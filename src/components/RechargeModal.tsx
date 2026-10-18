import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT, takaToPaisa, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { TelecomOperator, Transaction } from '../types';
import { 
  X, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Zap 
} from 'lucide-react';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OperatorItem {
  name: TelecomOperator;
  color: string;
  badge: string;
  prefix: string;
}

const OPERATORS: OperatorItem[] = [
  { name: 'Grameenphone', color: 'bg-sky-500 text-white', badge: 'GP', prefix: '017, 013' },
  { name: 'Banglalink', color: 'bg-amber-500 text-white', badge: 'BL', prefix: '019, 014' },
  { name: 'Robi', color: 'bg-rose-600 text-white', badge: 'Robi', prefix: '018' },
  { name: 'Airtel', color: 'bg-red-500 text-white', badge: 'Air', prefix: '016' },
  { name: 'Teletalk', color: 'bg-emerald-600 text-white', badge: 'TT', prefix: '015' },
];

const POPULAR_PACKS = [
  { id: 'p1', amount: 29, title: '1 GB + 20 Min', validity: '3 Days' },
  { id: 'p2', amount: 109, title: '5 GB Internet', validity: '7 Days' },
  { id: 'p3', amount: 249, title: '12 GB + 200 Min', validity: '30 Days' },
  { id: 'p4', amount: 398, title: '25 GB + 400 Min', validity: '30 Days' },
];

export const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, mobileRecharge, getUserBalancePaisa, language } = useWallet();
  const t = translations[language];

  const [step, setStep] = useState<'DETAILS' | 'PIN' | 'SUCCESS'>('DETAILS');
  const [operator, setOperator] = useState<TelecomOperator>('Grameenphone');
  const [planType, setPlanType] = useState<'PREPAID' | 'POSTPAID'>('PREPAID');
  const [phone, setPhone] = useState(currentUser.phone);
  const [amountStr, setAmountStr] = useState('109');
  const [selectedPackTitle, setSelectedPackTitle] = useState('5 GB Internet (7 Days)');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const currentBalancePaisa = getUserBalancePaisa(currentUser.id);
  const amountPaisa = takaToPaisa(amountStr);

  const handleSelectPack = (pack: typeof POPULAR_PACKS[0]) => {
    playTapSound();
    setAmountStr(String(pack.amount));
    setSelectedPackTitle(`${pack.title} (${pack.validity})`);
  };

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phone.trim().length < 11) {
      setErrorMsg(t.errPhoneInvalid);
      return;
    }
    if (amountPaisa < 1000) { // ৳10
      setErrorMsg(t.errAmountMin);
      return;
    }
    if (amountPaisa > currentBalancePaisa) {
      setErrorMsg(t.errInsufficientBalance);
      return;
    }

    setStep('PIN');
  };

  const handleExecuteRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg(t.errWrongPin);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = mobileRecharge(phone.trim(), operator, planType, amountPaisa, pin, selectedPackTitle);
      setIsSubmitting(false);

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);
        setStep('SUCCESS');
      } else {
        setErrorMsg(res.error || 'Recharge failed');
      }
    }, 400);
  };

  const handleResetAndClose = () => {
    setStep('DETAILS');
    setPin('');
    setErrorMsg('');
    setCompletedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-blue-200" />
            </div>
            <h3 className="text-base font-bold tracking-tight">
              {t.rechargeTitle}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-blue-100 transition-colors"
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
              {/* Operator Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.selectOperator}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {OPERATORS.map((op) => (
                    <button
                      type="button"
                      key={op.name}
                      onClick={() => {
                        playTapSound();
                        setOperator(op.name);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                        operator === op.name
                          ? 'ring-2 ring-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${op.color}`}>
                        {op.badge}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 mt-1 truncate w-full">
                        {op.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number & Plan Type */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-wider"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'টাইপ' : 'Type'}
                  </label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as 'PREPAID' | 'POSTPAID')}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  >
                    <option value="PREPAID">{t.prepaid}</option>
                    <option value="POSTPAID">{t.postpaid}</option>
                  </select>
                </div>
              </div>

              {/* Popular Bundles */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t.popularPacks}
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5">
                    <Zap className="w-3 h-3" />
                    {language === 'bn' ? 'স্পেশাল অফার' : 'Special Offer'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_PACKS.map((pack) => (
                    <button
                      type="button"
                      key={pack.id}
                      onClick={() => handleSelectPack(pack)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        amountStr === String(pack.amount)
                          ? 'border-blue-500 bg-blue-50/80 ring-1 ring-blue-500/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-slate-900 font-tabular">
                          ৳{language === 'bn' ? toBengaliDigits(pack.amount) : pack.amount}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {pack.validity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                        {pack.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'রিচার্জের পরিমাণ (BDT)' : 'Recharge Amount (BDT)'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-base">
                    ৳
                  </div>
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      setSelectedPackTitle('Regular Balance Recharge');
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-slate-800 font-tabular"
                    min="10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'পিন দিয়ে রিচার্জ করুন' : 'Proceed to PIN'}</span>
              </button>
            </form>
          )}

          {step === 'PIN' && (
            <form onSubmit={handleExecuteRecharge} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {t.enterPin}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {operator} ({phone}) - {formatBDT(amountPaisa, language)}
                </p>
                <div className="mt-2 text-[11px] text-blue-700 font-medium bg-blue-50 py-1 px-2.5 rounded-lg inline-block">
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
                  className="w-40 text-center tracking-[1em] text-2xl font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{t.processing}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.confirmRecharge}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && completedTx && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.rechargeSuccess}
                </h4>
                <p className="text-2xl font-black text-blue-600 font-tabular mt-1">
                  {formatBDT(completedTx.amountPaisa, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedTx.operator} · {completedTx.targetPhone}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t.trxId}:</span>
                  <span className="font-mono font-bold text-slate-900">{completedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'প্যাকেজ:' : 'Package:'}</span>
                  <span className="font-semibold text-slate-800">{completedTx.operatorPlan}</span>
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
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
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
