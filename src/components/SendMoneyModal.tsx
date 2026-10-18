import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { calculateSendMoneyFee, formatBDT, takaToPaisa, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { Transaction } from '../types';
import { 
  X, 
  Send, 
  UserCheck, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Download, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, sendMoney, getUserBalancePaisa, language } = useWallet();
  const t = translations[language];

  const [step, setStep] = useState<'DETAILS' | 'PIN' | 'SUCCESS'>('DETAILS');
  const [phone, setPhone] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentBalancePaisa = getUserBalancePaisa(currentUser.id);
  const amountPaisa = takaToPaisa(amountStr);
  const feePaisa = calculateSendMoneyFee(amountPaisa);
  const totalDeductionPaisa = amountPaisa + feePaisa;
  const remainingBalancePaisa = currentBalancePaisa - totalDeductionPaisa;

  // Filter possible contacts from allUsers excluding currentUser
  const candidateContacts = allUsers.filter(u => u.id !== currentUser.id && u.role === 'CUSTOMER');
  const matchedUser = allUsers.find(u => u.phone === phone.trim());

  const handleSelectContact = (contactPhone: string) => {
    playTapSound();
    setPhone(contactPhone);
    setErrorMsg('');
  };

  const handleQuickAmount = (val: number) => {
    playTapSound();
    setAmountStr(String(val));
    setErrorMsg('');
  };

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg(t.errPhoneInvalid);
      return;
    }
    if (cleanPhone === currentUser.phone) {
      setErrorMsg(t.errReceiverSame);
      return;
    }
    if (amountPaisa < 1000) { // ৳10
      setErrorMsg(t.errAmountMin);
      return;
    }
    if (totalDeductionPaisa > currentBalancePaisa) {
      setErrorMsg(t.errInsufficientBalance);
      return;
    }

    setStep('PIN');
  };

  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg(t.errWrongPin);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Generate unique idempotency key
    const idempotencyKey = `idemp_sm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Small timeout for realistic banking processing feel
    setTimeout(() => {
      const res = sendMoney(phone.trim(), amountPaisa, pin, idempotencyKey, note);
      setIsSubmitting(false);

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);
        setStep('SUCCESS');
      } else {
        setErrorMsg(res.error || 'Transaction failed');
      }
    }, 400);
  };

  const handleCopyTrxId = () => {
    if (completedTx) {
      navigator.clipboard.writeText(completedTx.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setStep('DETAILS');
    setPhone('');
    setAmountStr('');
    setNote('');
    setPin('');
    setErrorMsg('');
    setCompletedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-base font-bold tracking-tight">
              {t.sendMoneyTitle}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone, Amount & Details */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPin} className="space-y-4">
              {/* Receiver Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.receiverPhone}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={t.phonePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono tracking-wider"
                    maxLength={14}
                    required
                  />
                  {matchedUser && (
                    <div className="absolute right-3 top-2.5 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <UserCheck className="w-4 h-4" />
                      <span>{matchedUser.name.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                {/* Quick Contacts */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">
                    {language === 'bn' ? 'কন্টাক্ট:' : 'Contacts:'}
                  </span>
                  {candidateContacts.map((contact) => (
                    <button
                      type="button"
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.phone)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 shrink-0 transition-colors"
                    >
                      {contact.name.split(' ')[0]} ({contact.phone.slice(-4)})
                    </button>
                  ))}
                </div>
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-bold text-slate-800 font-tabular"
                    min="10"
                    required
                  />
                </div>

                {/* Quick Amount Pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      className="py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors"
                    >
                      ৳{language === 'bn' ? toBengaliDigits(amt) : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'রেফারেন্স / নোট (ঐচ্ছিক)' : 'Reference / Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: বাসা ভাড়া, উপহার...' : 'e.g. Rent, Gift...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  maxLength={50}
                />
              </div>

              {/* Fee & Balance Breakdown Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.availableBalance}:</span>
                  <span className="font-semibold text-slate-800 font-tabular">
                    {formatBDT(currentBalancePaisa, language)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t.feeLabel}:</span>
                  <span className={`font-semibold ${feePaisa === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {feePaisa === 0 ? t.free : formatBDT(feePaisa, language)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>{t.totalDeduction}:</span>
                  <span className="text-emerald-700 font-tabular text-sm">
                    {formatBDT(totalDeductionPaisa, language)}
                  </span>
                </div>
                {amountPaisa > 0 && remainingBalancePaisa >= 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{t.remainingBalance}:</span>
                    <span className="font-medium font-tabular">
                      {formatBDT(remainingBalancePaisa, language)}
                    </span>
                  </div>
                )}
              </div>

              {/* Next Step CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'পিন দিয়ে নিশ্চিত করুন' : 'Proceed to PIN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PIN Confirmation */}
          {step === 'PIN' && (
            <form onSubmit={handleExecuteSend} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {t.enterPin}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' 
                    ? `${matchedUser?.name || phone}-কে ${formatBDT(amountPaisa, language)} পাঠাচ্ছেন` 
                    : `Sending ${formatBDT(amountPaisa, language)} to ${matchedUser?.name || phone}`}
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 font-medium bg-emerald-50 py-1 px-2.5 rounded-lg inline-block">
                  {language === 'bn' ? 'ডেমো পিন: 1234' : 'Demo PIN: 1234'}
                </div>
              </div>

              {/* 4-Digit PIN Input */}
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
                  className="w-40 text-center tracking-[1em] text-2xl font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {language === 'bn' ? 'পেছনে যান' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || pin.length !== 4}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{t.processing}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.confirmSend}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen & Receipt */}
          {step === 'SUCCESS' && completedTx && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.sendSuccess}
                </h4>
                <p className="text-2xl font-black text-emerald-700 font-tabular mt-1">
                  {formatBDT(completedTx.amountPaisa, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? 'সফলভাবে স্থানান্তরিত হয়েছে' : 'Successfully Transferred'}
                </p>
              </div>

              {/* Digital Receipt Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t.trxId}:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{completedTx.id}</span>
                    <button
                      onClick={handleCopyTrxId}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      title={t.copyTrxId}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copied && <span className="text-[10px] text-emerald-600 font-medium">{t.copied}</span>}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{t.recipient}:</span>
                  <span className="font-semibold text-slate-800">
                    {completedTx.targetName} ({completedTx.targetPhone})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{t.feeLabel}:</span>
                  <span className="font-semibold text-slate-800">
                    {completedTx.feePaisa === 0 ? t.free : formatBDT(completedTx.feePaisa, language)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">{t.timestamp}:</span>
                  <span className="text-slate-700 font-tabular">
                    {new Date(completedTx.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>

                {completedTx.referenceNote && (
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">{language === 'bn' ? 'রেফারেন্স:' : 'Reference:'}</span>
                    <span className="text-slate-700 italic">{completedTx.referenceNote}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>{t.downloadReceipt}</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
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
