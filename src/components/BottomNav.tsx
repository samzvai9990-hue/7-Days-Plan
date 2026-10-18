import React from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { playTapSound } from '../utils/audio';
import { Home, ReceiptText, Sparkles, User as UserIcon, Store, ShieldAlert } from 'lucide-react';

export type NavTab = 'HOME' | 'TRANSACTIONS' | 'OFFERS' | 'PROFILE' | 'AGENT_PORTAL' | 'ADMIN_PORTAL';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { currentUser, language } = useWallet();
  const t = translations[language];

  const isAgent = currentUser.role === 'AGENT';
  const isAdmin = currentUser.role === 'ADMIN';

  const handleTabClick = (tab: NavTab) => {
    playTapSound();
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 sm:grid-cols-5 items-center h-16 px-2 pb-safe">
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick('HOME')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'HOME'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate">{t.navHome}</span>
        </button>

        {/* Tab 2: Transactions */}
        <button
          onClick={() => handleTabClick('TRANSACTIONS')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'TRANSACTIONS'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate">{t.navTransactions}</span>
        </button>

        {/* Tab 3: Dynamic Special (Agent Portal / Admin Console / Offers) */}
        {isAdmin ? (
          <button
            onClick={() => handleTabClick('ADMIN_PORTAL')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'ADMIN_PORTAL'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">{t.admin}</span>
          </button>
        ) : isAgent ? (
          <button
            onClick={() => handleTabClick('AGENT_PORTAL')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'AGENT_PORTAL'
                ? 'text-cyan-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">{t.agent}</span>
          </button>
        ) : (
          <button
            onClick={() => handleTabClick('OFFERS')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'OFFERS'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">{t.navOffers}</span>
          </button>
        )}

        {/* Tab 4: Profile */}
        <button
          onClick={() => handleTabClick('PROFILE')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'PROFILE'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate">{t.navProfile}</span>
        </button>
      </div>
    </nav>
  );
};
