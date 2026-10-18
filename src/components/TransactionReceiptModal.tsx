import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { Transaction } from '../types';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Download, 
  ShieldCheck, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const { language, allLedgerEntries } = useWallet();
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [showLedgerDetails, setShowLedgerDetails] = useState(false);

  if (!transaction) return null;

  const relevantLedgerEntries = allLedgerEntries.filter(
    (e) => e.transactionId === transaction.id
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold tracking-tight">
              {t.transferReceipt}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              {transaction.type.replace('_', ' ')}
            </span>
            <p className="text-3xl font-black text-slate-900 font-tabular mt-1">
              {formatBDT(transaction.amountPaisa, language)}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              {transaction.status === 'SUCCESS' ? (language === 'bn' ? 'সফল লেনদেন' : 'Transaction Successful') : transaction.status}
            </p>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">{t.trxId}:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">{transaction.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] text-emerald-600">{t.copied}</span>}
              </div>
            </div>

            {transaction.sourceName && (
              <div className="flex justify-between">
                <span className="text-slate-500">{t.sender}:</span>
                <span className="font-semibold text-slate-800">
                  {transaction.sourceName} ({transaction.sourcePhone})
                </span>
              </div>
            )}

            {transaction.targetName && (
              <div className="flex justify-between">
                <span className="text-slate-500">{t.recipient}:</span>
                <span className="font-semibold text-slate-800">
                  {transaction.targetName} {transaction.targetPhone ? `(${transaction.targetPhone})` : ''}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">{t.feeLabel}:</span>
              <span className="font-semibold text-slate-800">
                {transaction.feePaisa === 0 ? t.free : formatBDT(transaction.feePaisa, language)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{t.timestamp}:</span>
              <span className="text-slate-700 font-tabular">
                {new Date(transaction.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
              </span>
            </div>

            {transaction.referenceNote && (
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">{language === 'bn' ? 'রেফারেন্স:' : 'Reference:'}</span>
                <span className="text-slate-700 italic">{transaction.referenceNote}</span>
              </div>
            )}
          </div>

          {/* Double-Entry Ledger Educational Toggle */}
          <div className="border border-emerald-200 rounded-2xl p-3 bg-emerald-50/50">
            <button
              onClick={() => setShowLedgerDetails(!showLedgerDetails)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-emerald-900 hover:text-emerald-700"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'ডাবল-এন্ট্রি লেজার অডিট ট্রেইল' : 'Double-Entry Ledger Audit Trail'}</span>
              </div>
              <span className="text-[11px] underline">
                {showLedgerDetails ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'দেখুন' : 'Inspect')}
              </span>
            </button>

            {showLedgerDetails && (
              <div className="mt-3 pt-3 border-t border-emerald-200/70 space-y-2 text-[11px]">
                <p className="text-slate-600 leading-relaxed">
                  {language === 'bn'
                    ? 'এই লেনদেনটি সম্পন্ন করতে ডাটাবেজে নিমোক্ত পারমাণবিক ডেবিট ও ক্রেডিট এন্ট্রিগুলো যুক্ত করা হয়েছে:'
                    : 'The following atomic double-entry debit and credit records were committed for this transaction:'}
                </p>
                {relevantLedgerEntries.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="p-2 rounded-lg bg-white border border-emerald-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            entry.entryType === 'DEBIT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {entry.entryType}
                        </span>
                        <span className="font-mono text-slate-700 font-medium">
                          {entry.ledgerAccountId}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{entry.description}</p>
                    </div>
                    <span className="font-bold font-tabular text-slate-900 shrink-0">
                      {formatBDT(entry.amountPaisa, language)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{t.downloadReceipt}</span>
            </button>
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
