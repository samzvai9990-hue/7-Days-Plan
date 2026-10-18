import React from 'react';
import { useWallet } from '../context/WalletContext';
import { playTapSound } from '../utils/audio';
import { Sparkles, Tag, Smartphone, ShoppingBag, Utensils, Zap, ExternalLink } from 'lucide-react';

interface OffersViewProps {
  onOpenRechargeModal: () => void;
  onOpenSendModal: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({ onOpenRechargeModal, onOpenSendModal }) => {
  const { language } = useWallet();

  const offers = [
    {
      id: 'off_1',
      title: language === 'bn' ? 'জিপি ও বাংলালিংক রিচার্জে ১% ক্যাশব্যাক' : '1% Cashback on GP & Banglalink Recharge',
      desc: language === 'bn' ? 'যেকোনো ৫০ টাকার বেশি মোবাইল রিচার্জে তাৎক্ষণিক পয়সা ক্যাশব্যাক।' : 'Get instant cashback points on recharges above ৳50.',
      category: 'Telecom',
      code: 'RECHARGE26',
      icon: Smartphone,
      color: 'from-blue-600 to-indigo-700',
      action: onOpenRechargeModal,
      btnText: language === 'bn' ? 'রিচার্জ করুন' : 'Recharge Now',
    },
    {
      id: 'off_2',
      title: language === 'bn' ? 'স্বপ্ন ও মীনা বাজারে ১০% মূল্যছাড়' : '10% Discount at Shwapno & Meena Bazar',
      desc: language === 'bn' ? 'টাকা-পে কিউআর কোড স্ক্যান করে পেমেন্ট করলেই সর্বোচ্চ ২০০ টাকা ছাড়।' : 'Scan TakaPay QR at merchant counters to save up to ৳200.',
      category: 'Grocery',
      code: 'SHWAPNO10',
      icon: ShoppingBag,
      color: 'from-emerald-600 to-teal-700',
      action: onOpenSendModal,
      btnText: language === 'bn' ? 'পেমেন্ট করুন' : 'Pay via QR',
    },
    {
      id: 'off_3',
      title: language === 'bn' ? 'রমজান স্পেশাল ইফতার বান্ডেল' : 'Ramadan & Eid Iftar Food Deals',
      desc: language === 'bn' ? 'নির্বাচিত রেস্তোরাঁ ও ক্যাফেতে টাকা-পে পেমেন্টে অতিরিক্ত ১৫% ক্যাশব্যাক।' : 'Extra 15% cashback at select restaurants across Dhaka & Chittagong.',
      category: 'Dining',
      code: 'RAMADAN26',
      icon: Utensils,
      color: 'from-amber-600 to-orange-700',
      action: onOpenSendModal,
      btnText: language === 'bn' ? 'অফার দেখুন' : 'View Deals',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'টাকা-পে এক্সক্লুসিভ অফার ও রিওয়ার্ডস' : 'TakaPay Exclusive Offers & Rewards'}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {language === 'bn'
            ? 'প্রতিটি লেনদেনে পয়েন্ট অর্জন করুন এবং আকর্ষণীয় ক্যাশব্যাক ও ডিসকাউন্ট উপভোগ করুন।'
            : 'Earn loyalty points and unlock instant cashback rewards across partner outlets.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {offers.map((offer) => {
          const Icon = offer.icon;
          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
            >
              <div className={`bg-gradient-to-r ${offer.color} p-4 text-white flex items-start justify-between`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                      {offer.category}
                    </span>
                    <h3 className="text-sm font-bold mt-1 text-white leading-tight">
                      {offer.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {offer.desc}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => {
                      playTapSound();
                      offer.action();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
                  >
                    {offer.btnText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
