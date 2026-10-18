import React from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { playTapSound } from '../utils/audio';
import { 
  Send, 
  ArrowDownLeft, 
  Smartphone, 
  PlusCircle, 
  QrCode, 
  CreditCard, 
  Tv, 
  Gift 
} from 'lucide-react';

interface QuickServicesProps {
  onOpenSendModal: () => void;
  onOpenCashOutModal: () => void;
  onOpenRechargeModal: () => void;
  onOpenCashInModal: () => void;
  onOpenReceiveModal: () => void;
  onOpenAdTaskModal: () => void;
  onOpenReferModal: () => void;
  onOpenBkashAddMoneyModal: () => void;
}

export const QuickServices: React.FC<QuickServicesProps> = ({
  onOpenSendModal,
  onOpenCashOutModal,
  onOpenRechargeModal,
  onOpenCashInModal,
  onOpenReceiveModal,
  onOpenAdTaskModal,
  onOpenReferModal,
  onOpenBkashAddMoneyModal,
}) => {
  const { language } = useWallet();
  const t = translations[language];

  const services = [
    {
      id: 'send_money',
      title: t.sendMoney,
      icon: Send,
      badge: null,
      bgColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      action: onOpenSendModal,
    },
    {
      id: 'cash_out',
      title: t.cashOut,
      icon: ArrowDownLeft,
      badge: null,
      bgColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      action: onOpenCashOutModal,
    },
    {
      id: 'mobile_recharge',
      title: t.mobileRecharge,
      icon: Smartphone,
      badge: null,
      bgColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      action: onOpenRechargeModal,
    },
    {
      id: 'bkash_add_money',
      title: t.bkashAddMoney,
      icon: CreditCard,
      badge: 'বিকাশ',
      bgColor: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
      action: onOpenBkashAddMoneyModal,
    },
    {
      id: 'ad_task',
      title: t.adTask,
      icon: Tv,
      badge: '৳৫০০',
      bgColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      action: onOpenAdTaskModal,
    },
    {
      id: 'refer_earn',
      title: t.referEarn,
      icon: Gift,
      badge: '৳৫০',
      bgColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      action: onOpenReferModal,
    },
    {
      id: 'receive_money',
      title: t.receiveMoney,
      icon: QrCode,
      badge: null,
      bgColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      action: onOpenReceiveModal,
    },
    {
      id: 'cash_in_bank',
      title: t.cashIn,
      icon: PlusCircle,
      badge: null,
      bgColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      action: onOpenCashInModal,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t.servicesTitle}
        </h3>
        <span className="text-[11px] text-emerald-600 font-medium">
          {language === 'bn' ? 'তাত্ক্ষণিক লেনদেন ও রিওয়ার্ড' : 'Instant & Rewards'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                playTapSound();
                item.action();
              }}
              className="relative flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            >
              {item.badge && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold text-[9px] rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${item.bgColor}`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:rotate-3" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-slate-900 mt-2 leading-tight tracking-tight line-clamp-2">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
