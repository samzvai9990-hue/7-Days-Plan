import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT, takaToPaisa, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { MfsGateway, Transaction } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface BkashAddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GatewayOption {
  id: MfsGateway;
  name: string;
  number: string;
  badge: string;
  color: string;
}

const GATEWAYS: GatewayOption[] = [
  { id: 'BKASH', name: 'বিকাশ (bKash)', number: '01712-345678', badge: 'bKash Personal', color: 'from-pink-600 to-rose-700' },
  { id: 'NAGAD', name: 'নগদ (Nagad)', number: '01812-345678', badge: 'Nagad Personal', color: 'from-orange-600 to-amber-700' },
  { id: 'ROCKET', name: 'রকেট (Rocket)', number: '01912-345678-9', badge: 'Rocket Personal', color: 'from-purple-700 to-indigo-800' },
];

export const BkashAddMoneyModal: React.FC<BkashAddMoneyModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitAddMoneyMfs, language } = useWallet();
  const t = translations[language];

  const [selectedGateway, setSelectedGateway] = useState<MfsGateway>('BKASH');
  const [senderPhone, setSenderPhone] = useState(currentUser.phone);
  const [amountStr, setAmountStr] = useState('500');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const currentGw = GATEWAYS.find(g => g.id === selectedGateway) || GATEWAYS[0];
  const amountPaisa = takaToPaisa(amountStr);

  const handleCopyNumber = () => {
    playTapSound();
    navigator.clipboard.writeText(currentGw.number.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amountPaisa < 5000) { // ৳50
      setErrorMsg(language === 'bn' ? 'ন্যূনতম এড মানি ৫০ টাকা' : 'Minimum Add Money is ৳50');
      return;
    }
    if (senderPhone.trim().length < 11) {
      setErrorMsg(t.errPhoneInvalid);
      return;
    }
    if (trxId.trim().length < 6) {
      setErrorMsg(language === 'bn' ? 'সঠিক বিকাশ বা নগদ TrxID দিন' : 'Enter a valid TrxID');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitAddMoneyMfs(selectedGateway, senderPhone.trim(), trxId.trim(), amountPaisa);
      setIsSubmitting(false);

      if (res.success && res.transaction) {
        setCompletedTx(res.transaction);
      } else {
        setErrorMsg(res.error || 'Failed to verify');
      }
    }, 500);
  };

  const handleResetAndClose = () => {
    setCompletedTx(null);
    setTrxId('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentGw.color} text-white p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {t.bkashAddMoneyTitle}
              </h3>
              <p className="text-[10px] text-white/80 leading-none">
                {t.bkashAddMoneySubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs">
          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!completedTx ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Gateway Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {GATEWAYS.map((gw) => (
                  <button
                    type="button"
                    key={gw.id}
                    onClick={() => {
                      playTapSound();
                      setSelectedGateway(gw.id);
                    }}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      selectedGateway === gw.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {gw.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Step 1 & 2 Instructions Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  {language === 'bn' ? 'এড মানি করার নিয়ম:' : 'How to Add Money:'}
                </span>
                <p className="text-slate-600">{t.step1Send}</p>
                
                {/* Number Box with Copy Action */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{currentGw.badge}:</span>
                    <span className="font-mono text-sm font-bold text-slate-900">{currentGw.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t.copied : t.copyNumber}</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Amount, Sender Phone, and TrxID Input */}
              <div className="space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.amountLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-base font-tabular"
                      min="50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {[100, 500, 1000, 2500].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          playTapSound();
                          setAmountStr(String(amt));
                        }}
                        className="py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        ৳{language === 'bn' ? toBengaliDigits(amt) : amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.senderMobileNumber}
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.transactionIdInput}
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. BKL849202"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === 'bn' ? 'টাকা পাঠানোর পর বিকাশ থেকে প্রাপ্ত ৮ সংখ্যার কোড' : 'Enter the TrxID received from your bKash SMS'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitting ? t.processing : (language === 'bn' ? 'যাচাই করুন ও টাকা যোগ করুন' : 'Verify & Add Money')}</span>
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.addMoneySuccessNotice}
                </h4>
                <p className="text-2xl font-black text-emerald-700 font-tabular mt-1">
                  +{formatBDT(completedTx.amountPaisa, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedTx.referenceNote}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.trxId}:</span>
                  <span className="font-mono font-bold text-slate-900">{completedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'প্রেরক নম্বর:' : 'Sender Phone:'}</span>
                  <span className="font-mono text-slate-800">{completedTx.sourcePhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.timestamp}:</span>
                  <span className="text-slate-700 font-tabular">
                    {new Date(completedTx.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                {t.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
