import React from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { BalanceCard } from './BalanceCard';
import { QuickServices } from './QuickServices';
import { formatBDT, toBengaliDigits } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { Transaction } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  PlusCircle, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Tv,
  Gift,
  CreditCard
} from 'lucide-react';

interface DashboardViewProps {
  onOpenSendModal: () => void;
  onOpenCashOutModal: () => void;
  onOpenRechargeModal: () => void;
  onOpenCashInModal: () => void;
  onOpenReceiveModal: () => void;
  onOpenAdTaskModal: () => void;
  onOpenReferModal: () => void;
  onOpenBkashAddMoneyModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenSendModal,
  onOpenCashOutModal,
  onOpenRechargeModal,
  onOpenCashInModal,
  onOpenReceiveModal,
  onOpenAdTaskModal,
  onOpenReferModal,
  onOpenBkashAddMoneyModal,
  onSelectTransaction,
  onNavigateToTransactions,
}) => {
  const { currentUser, allTransactions, feeRules, language } = useWallet();
  const t = translations[language];

  // Filter transactions involving currentUser
  const userTransactions = allTransactions.filter(
    (tx) => tx.sourceUserId === currentUser.id || tx.targetUserId === currentUser.id
  ).slice(0, 5);

  const adsRemaining = (feeRules.adTaskTargetCount || 10) - (currentUser.adsWatchedCount || 0);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Main Balance Card */}
      <BalanceCard onOpenReceiveModal={onOpenReceiveModal} />

      {/* 2. Interactive Quick Services Grid */}
      <QuickServices
        onOpenSendModal={onOpenSendModal}
        onOpenCashOutModal={onOpenCashOutModal}
        onOpenRechargeModal={onOpenRechargeModal}
        onOpenCashInModal={onOpenCashInModal}
        onOpenReceiveModal={onOpenReceiveModal}
        onOpenAdTaskModal={onOpenAdTaskModal}
        onOpenReferModal={onOpenReferModal}
        onOpenBkashAddMoneyModal={onOpenBkashAddMoneyModal}
      />

      {/* 3. Hero Task & Earning Banners (AdMob ৳500 Task & Refer ৳50) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* AdMob ৳500 Task Feature Card */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3 border border-amber-400/30">
          <div>
            <div className="flex items-center gap-1.5 text-amber-200 text-xs font-bold mb-1">
              <Tv className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'Google AdMob দৈনিক টাস্ক' : 'AdMob Daily Task'}</span>
            </div>
            <h4 className="text-sm font-black leading-tight">
              {language === 'bn' ? '১০টি এড দেখুন = ৫০০ টাকা জিতে নিন!' : 'Watch 10 Ads = Earn ৳500 Bonus!'}
            </h4>
            <p className="text-[11px] text-amber-100/90 mt-1">
              {language === 'bn' 
                ? `বর্তমান অগ্রগতি: ${toBengaliDigits(currentUser.adsWatchedCount || 0)}/১০টি সম্পন্ন` 
                : `Progress: ${currentUser.adsWatchedCount || 0}/10 completed`}
            </p>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onOpenAdTaskModal();
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold shrink-0 shadow-sm transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'টাস্ক শুরু' : 'Start Task'}
          </button>
        </div>

        {/* Refer & Earn ৳50 Card */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3 border border-purple-500/30">
          <div>
            <div className="flex items-center gap-1.5 text-purple-200 text-xs font-bold mb-1">
              <Gift className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রেফারেল প্রোগ্রাম' : 'Referral Program'}</span>
            </div>
            <h4 className="text-sm font-black leading-tight">
              {language === 'bn' ? 'বন্ধু রেফার করলেই পাবেন ৫০ টাকা!' : 'Refer a Friend & Earn ৳50 Instant!'}
            </h4>
            <p className="text-[11px] text-purple-200/80 mt-1">
              {language === 'bn' ? `আপনার কোড: ${currentUser.referralCode}` : `Your code: ${currentUser.referralCode}`}
            </p>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onOpenReferModal();
            }}
            className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shrink-0 shadow-sm transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'রেফার করুন' : 'Refer Now'}
          </button>
        </div>
      </div>

      {/* 4. bKash / Rocket Add Money Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold text-sm shrink-0 border border-pink-100">
            বিকাশ
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'বিকাশ, নগদ বা রকেট থেকে ব্যালেন্স এড করুন' : 'Add Money via bKash, Nagad or Rocket'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? '০১৭১২-৩৪৫৬৭৮ নম্বরে সেন্ড মানি করে TrxID দিন' : 'Send money to 01712-345678 and enter TrxID'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playTapSound();
            onOpenBkashAddMoneyModal();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
        >
          {language === 'bn' ? 'এড মানি' : 'Add Funds'}
        </button>
      </div>

      {/* 5. Recent Transactions Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
          </h3>
          <button
            onClick={() => {
              playTapSound();
              onNavigateToTransactions();
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {t.noTransactions}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userTransactions.map((tx) => {
              const isOutgoing = tx.sourceUserId === currentUser.id && tx.type !== 'CASH_IN' && tx.type !== 'BKASH_ADD_MONEY';
              
              return (
                <button
                  key={tx.id}
                  onClick={() => {
                    playTapSound();
                    onSelectTransaction(tx);
                  }}
                  className="w-full flex items-center justify-between py-3 px-1 hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'AD_REWARD'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : tx.type === 'REFERRAL_BONUS'
                          ? 'bg-purple-50 text-purple-600 border border-purple-100'
                          : tx.type === 'BKASH_ADD_MONEY'
                          ? 'bg-pink-50 text-pink-600 border border-pink-100'
                          : tx.type === 'SEND_MONEY'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : tx.type === 'CASH_IN'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : tx.type === 'CASH_OUT'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      {tx.type === 'AD_REWARD' ? (
                        <Tv className="w-5 h-5" />
                      ) : tx.type === 'REFERRAL_BONUS' ? (
                        <Gift className="w-5 h-5" />
                      ) : tx.type === 'BKASH_ADD_MONEY' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : tx.type === 'SEND_MONEY' ? (
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
                        {tx.type === 'AD_REWARD'
                          ? (language === 'bn' ? 'এডমব টাস্ক রিওয়ার্ড (+৳৫০০)' : 'AdMob Task Reward (+৳500)')
                          : tx.type === 'REFERRAL_BONUS'
                          ? (language === 'bn' ? 'রেফারেল বোনাস (+৳৫০)' : 'Referral Bonus (+৳50)')
                          : tx.type === 'BKASH_ADD_MONEY'
                          ? (language === 'bn' ? 'বিকাশ এড মানি' : 'bKash Add Money')
                          : tx.type === 'SEND_MONEY'
                          ? (language === 'bn' ? `পাঠানো হয়েছে: ${tx.targetName}` : `Sent to: ${tx.targetName}`)
                          : tx.type === 'CASH_IN'
                          ? (language === 'bn' ? 'ক্যাশ ইন ডিপোজিট' : 'Cash In Deposit')
                          : tx.type === 'CASH_OUT'
                          ? (language === 'bn' ? `ক্যাশ আউট: ${tx.targetName}` : `Cash Out: ${tx.targetName}`)
                          : (language === 'bn' ? `মোবাইল রিচার্জ (${tx.operator})` : `Recharge (${tx.operator})`)}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {tx.id} · {new Date(tx.timestamp).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-tabular ${
                        isOutgoing ? 'text-slate-900' : 'text-emerald-600'
                      }`}
                    >
                      {isOutgoing ? '-' : '+'}
                      {formatBDT(tx.amountPaisa, language)}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {tx.status === 'SUCCESS' ? (language === 'bn' ? 'সফল' : 'Success') : tx.status}
                    </span>
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
