import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT, toBengaliDigits } from '../utils/currency';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { 
  X, 
  Tv, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Gift, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdMobTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdFormat = 'REWARDED' | 'INTERSTITIAL' | 'BANNER' | 'NATIVE';

interface MockSponsor {
  brand: string;
  tagline: string;
  badge: string;
  color: string;
  imageUrl: string;
  ctaText: string;
}

const MOCK_SPONSORS: MockSponsor[] = [
  {
    brand: 'ওয়ালটন হাই-টেক (Walton)',
    tagline: 'নতুন স্মার্ট ইনভার্টার রেফ্রিজারেটর এবং ৪কে গুগল টিভি - সেরা কিস্তির অফার!',
    badge: 'Walton BD',
    color: 'from-blue-700 to-indigo-900',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80',
    ctaText: 'অফারটি দেখুন (Visit Store)',
  },
  {
    brand: 'দারাজ বাংলাদেশ (Daraz)',
    tagline: 'দারাজ সুপার ডিলস! ফ্রি ডেলিভারি এবং ভাউচারে ২০% পর্যন্ত অতিরিক্ত ক্যাশব্যাক।',
    badge: 'Daraz Online',
    color: 'from-orange-600 to-rose-700',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=80',
    ctaText: 'শপিং শুরু করুন (Shop Now)',
  },
  {
    brand: 'ফুডপ্যান্ডা (foodpanda)',
    tagline: 'আপনার পছন্দের খাবার এখন মাত্র ২০ মিনিটে ঘরে বসেই অর্ডার করুন পান্ডাপ্রো অফারে।',
    badge: 'foodpanda',
    color: 'from-pink-600 to-rose-800',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    ctaText: 'খাবার অর্ডার দিন (Order Food)',
  },
  {
    brand: 'পাঠাও রাইড ও পার্সেল (Pathao)',
    tagline: 'শহরের জ্যাম পেরিয়ে দ্রুত গন্তব্যে পৌঁছান পাঠাও বাইক ও কারে - ৫০ টাকা প্রোমোকোড।',
    badge: 'Pathao Move',
    color: 'from-red-600 to-rose-900',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80',
    ctaText: 'রাইড বুক করুন (Book Ride)',
  }
];

export const AdMobTaskModal: React.FC<AdMobTaskModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, recordAdWatched, feeRules, language } = useWallet();
  const t = translations[language];

  const [activeAd, setActiveAd] = useState<{ format: AdFormat; sponsor: MockSponsor } | null>(null);
  const [adTimer, setAdTimer] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<boolean>(false);

  const adsWatched = currentUser.adsWatchedCount || 0;
  const targetCount = feeRules.adTaskTargetCount || 10;
  const rewardPaisa = feeRules.adTaskRewardPaisa || 50000; // ৳500

  // Countdown timer for active playing ad
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (activeAd && adTimer === 0) {
      setCanSkip(true);
    }
    return () => clearInterval(interval);
  }, [activeAd, adTimer]);

  if (!isOpen) return null;

  const handleStartAd = (format: AdFormat) => {
    playTapSound();
    const randomSponsor = MOCK_SPONSORS[Math.floor(Math.random() * MOCK_SPONSORS.length)];
    setActiveAd({ format, sponsor: randomSponsor });
    setAdTimer(5); // 5-second viewing time
    setCanSkip(false);
  };

  const handleFinishAd = () => {
    playTapSound();
    if (!activeAd) return;

    const res = recordAdWatched(activeAd.format);
    setActiveAd(null);

    if (res.completedTask) {
      setRewardToast(true);
      setTimeout(() => setRewardToast(false), 4000);
    }
  };

  const progressPercent = Math.min(100, Math.round((adsWatched / targetCount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* 1. Full-Screen Ad Overlay (Simulates Google AdMob Interstitial / Rewarded Video) */}
      {activeAd ? (
        <div className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-scale-in text-white">
          {/* Ad Header with AdMob Tag & Skip Timer */}
          <div className="p-3 bg-black/60 backdrop-blur-md flex items-center justify-between text-xs border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
                Ad
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {activeAd.sponsor.badge} · AdMob Video
              </span>
            </div>

            <div>
              {canSkip ? (
                <button
                  onClick={handleFinishAd}
                  className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                >
                  <span>{language === 'bn' ? 'রিওয়ার্ড সংগ্রহ করুন' : 'Claim Reward & Close'}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>
                    {language === 'bn' 
                      ? `${toBengaliDigits(adTimer)} সেকেন্ড পর রিওয়ার্ড মিলবে` 
                      : `Reward in ${adTimer}s`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Creative Canvas */}
          <div className="p-5 text-center space-y-4">
            <div className="relative rounded-2xl overflow-hidden h-44 shadow-lg border border-white/10">
              <img
                src={activeAd.sponsor.imageUrl}
                alt={activeAd.sponsor.brand}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Sponsored Advertisement
                </span>
                <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                  {activeAd.sponsor.brand}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed px-2">
              {activeAd.sponsor.tagline}
            </p>

            <button
              onClick={() => {
                playTapSound();
                alert(language === 'bn' ? 'স্পনসর ওয়েবসাইটে ভিজিট করা হচ্ছে...' : 'Redirecting to sponsor web store...');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>{activeAd.sponsor.ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-4 py-2 bg-slate-950 text-center text-[10px] text-slate-500 border-t border-white/5">
            {t.sponsorNotice}
          </div>
        </div>
      ) : (
        /* 2. Main Ad Task Center Modal */
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  {t.adTaskTitle}
                </h3>
                <p className="text-[10px] text-emerald-200 leading-none">
                  {t.adTaskSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Reward Notification Banner */}
            {rewardToast && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-bounce shadow-md">
                <Gift className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold">{t.adRewardSuccess}</span>
              </div>
            )}

            {/* Task Progress Tracker Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-4 shadow-md border border-emerald-800/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'bn' ? '১০টি এড দেখলে ৫০০ টাকা' : 'Watch 10 Ads = Earn ৳500'}
                </span>
                <span className="text-sm font-bold font-tabular text-emerald-400">
                  {language === 'bn' 
                    ? `${toBengaliDigits(adsWatched)} / ${toBengaliDigits(targetCount)} সম্পন্ন` 
                    : `${adsWatched} / ${targetCount} Done`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[11px] text-slate-300">
                <span>
                  {language === 'bn'
                    ? `আর মাত্র ${toBengaliDigits(targetCount - adsWatched)}টি এড বাকি`
                    : `${targetCount - adsWatched} ads remaining`}
                </span>
                <span className="font-bold text-amber-300">
                  {language === 'bn' ? 'পুরস্কার: ৳৫০০.০০' : 'Reward: ৳500.00'}
                </span>
              </div>
            </div>

            {/* Ad Formats Launcher Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.adFormats}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStartAd('REWARDED')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center text-center group transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Tv className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {t.rewardedVideoAd}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {language === 'bn' ? 'ভিডিও এড (+১ প্রগ্রেস)' : 'Video (+1 progress)'}
                  </span>
                </button>

                <button
                  onClick={() => handleStartAd('INTERSTITIAL')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex flex-col items-center text-center group transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {t.interstitialAd}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {language === 'bn' ? 'ফুল-স্ক্রিন (+১ প্রগ্রেস)' : 'Full-screen (+1)'}
                  </span>
                </button>
              </div>

              {/* Native Ad Simulation Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                    Ad
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">
                      {language === 'bn' ? 'দারাজ ১১.১১ স্পন্সরড অফার' : 'Daraz 11.11 Sponsored Deal'}
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'ক্লিক করে এড দেখুন ও পয়েন্ট নিন' : 'View native sponsored ad'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartAd('NATIVE')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                >
                  {language === 'bn' ? 'এড দেখুন' : 'Watch Ad'}
                </button>
              </div>
            </div>

            {/* Quick Primary Button */}
            <button
              onClick={() => handleStartAd('REWARDED')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.watchNextAd}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
