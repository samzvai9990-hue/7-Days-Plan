import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { Transaction, TransactionType } from '../types';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  PlusCircle, 
  BookOpen, 
  ChevronRight,
  Filter 
} from 'lucide-react';

interface TransactionsViewProps {
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onSelectTransaction }) => {
  const { currentUser, allTransactions, allLedgerEntries, language } = useWallet();
  const t = translations[language];

  const [activeFilter, setActiveFilter] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLedgerSummary, setShowLedgerSummary] = useState(false);

  // Filter transactions involving current user or all if admin
  const isSupervisor = currentUser.role === 'ADMIN';
  const baseTransactions = isSupervisor
    ? allTransactions
    : allTransactions.filter(
        (tx) => tx.sourceUserId === currentUser.id || tx.targetUserId === currentUser.id
      );

  const filteredTransactions = baseTransactions.filter((tx) => {
    // Type Filter
    if (activeFilter !== 'ALL' && tx.type !== activeFilter) {
      return false;
    }

    // Search Query (phone, name, or TrxID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = tx.id.toLowerCase().includes(q);
      const matchTargetPhone = tx.targetPhone?.includes(q);
      const matchSourcePhone = tx.sourcePhone?.includes(q);
      const matchTargetName = tx.targetName?.toLowerCase().includes(q);
      return matchId || matchTargetPhone || matchSourcePhone || matchTargetName;
    }

    return true;
  });

  // Calculate total debits and credits in the ledger for verification
  const totalDebits = allLedgerEntries
    .filter((e) => e.entryType === 'DEBIT')
    .reduce((sum, e) => sum + e.amountPaisa, 0);

  const totalCredits = allLedgerEntries
    .filter((e) => e.entryType === 'CREDIT')
    .reduce((sum, e) => sum + e.amountPaisa, 0);

  const isLedgerBalanced = totalDebits === totalCredits;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {t.txHistoryTitle}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t.txHistorySubtitle}
            </p>
          </div>

          <button
            onClick={() => {
              playTapSound();
              setShowLedgerSummary(!showLedgerSummary);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors w-fit"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {showLedgerSummary
                ? (language === 'bn' ? 'লেজার সারাংশ লুকান' : 'Hide Ledger Audit')
                : (language === 'bn' ? 'লেজার সমীকরণ নিরীক্ষা' : 'Inspect Ledger Equation')}
            </span>
          </button>
        </div>

        {/* Double-Entry Ledger Mathematical Verification Box */}
        {showLedgerSummary && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-2 animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">
                {language === 'bn' ? 'ডাবল-এন্ট্রি বুককিপিং ব্যালেন্স চেকার' : 'Double-Entry Ledger Integrity Engine'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLedgerBalanced ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'}`}>
                {isLedgerBalanced ? (language === 'bn' ? 'পরিপূর্ণ ভারসাম্যপূর্ণ (Balanced)' : 'Perfect Equilibrium') : 'Discrepancy'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-800">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'মোট ডেবিট (Debit):' : 'Total Debits:'}</span>
                <span className="text-rose-400 font-bold">{formatBDT(totalDebits, language)}</span>
              </div>
              <div className="p-2 rounded bg-slate-800">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'মোট ক্রেডিট (Credit):' : 'Total Credits:'}</span>
                <span className="text-emerald-400 font-bold">{formatBDT(totalCredits, language)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              {language === 'bn'
                ? 'আইনগত আর্থিক নীতি: প্রতি ক্রেডিট এন্ট্রির সমান ডেবিট এন্ট্রি থাকে (Total Debits = Total Credits)। ফলে কোনো টাকা সিস্টেম থেকে হারিয়ে যেতে বা অবৈধভাবে বৃদ্ধি পেতে পারে না।'
                : 'Fundamental accounting law: Every credit must equal an offset debit. No funds can arbitrarily emerge or vanish.'}
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'ALL', label: t.filterAll },
            { id: 'SEND_MONEY', label: t.filterSend },
            { id: 'CASH_IN', label: t.filterCashIn },
            { id: 'CASH_OUT', label: t.filterCashOut },
            { id: 'MOBILE_RECHARGE', label: t.filterRecharge },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playTapSound();
                setActiveFilter(item.id as 'ALL' | TransactionType);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                activeFilter === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            {t.noTransactions}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isOutgoing = tx.sourceUserId === currentUser.id && tx.type !== 'CASH_IN';

              return (
                <button
                  key={tx.id}
                  onClick={() => {
                    playTapSound();
                    onSelectTransaction(tx);
                  }}
                  className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'SEND_MONEY'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : tx.type === 'CASH_IN'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : tx.type === 'CASH_OUT'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      {tx.type === 'SEND_MONEY' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : tx.type === 'CASH_IN' ? (
                        <PlusCircle className="w-5 h-5" />
                      ) : tx.type === 'CASH_OUT' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {tx.type === 'SEND_MONEY'
                          ? (language === 'bn' ? `টাকা পাঠানো: ${tx.targetName}` : `Sent to: ${tx.targetName}`)
                          : tx.type === 'CASH_IN'
                          ? (language === 'bn' ? `ক্যাশ ইন (${tx.targetName})` : `Cash In (${tx.targetName})`)
                          : tx.type === 'CASH_OUT'
                          ? (language === 'bn' ? `ক্যাশ আউট: ${tx.targetName}` : `Cash Out: ${tx.targetName}`)
                          : (language === 'bn' ? `মোবাইল রিচার্জ: ${tx.targetPhone}` : `Recharge: ${tx.targetPhone}`)}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="font-semibold text-slate-600">{tx.id}</span>
                        <span>·</span>
                        <span>{new Date(tx.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span
                        className={`text-sm font-bold font-tabular block ${
                          isOutgoing ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {isOutgoing ? '-' : '+'}
                        {formatBDT(tx.amountPaisa, language)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {tx.feePaisa > 0 ? `+${formatBDT(tx.feePaisa, language)} Fee` : (language === 'bn' ? 'ফি নেই' : 'Free')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
