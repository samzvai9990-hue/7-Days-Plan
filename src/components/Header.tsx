import React from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { ShieldCheck, UserCheck, Briefcase, ShieldAlert, Globe, RotateCcw } from 'lucide-react';
import { playTapSound } from '../utils/audio';

export const Header: React.FC = () => {
  const { currentUser, allUsers, switchUser, language, setLanguage, resetDemoData } = useWallet();
  const t = translations[language];

  const handleRoleChange = (userId: string) => {
    playTapSound();
    switchUser(userId);
  };

  const toggleLanguage = () => {
    playTapSound();
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <header className="w-full bg-slate-900 text-white shadow-md sticky top-0 z-40">
      {/* Bangladesh Bank Sandbox Compliance Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-3 py-1 text-center text-[11px] text-emerald-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium tracking-wide">
          {language === 'bn' ? 'বাংলাদেশ ব্যাংক স্যান্ডবক্স ডেমো মোড · ডাবল-এন্ট্রি লেজার সক্রিয়' : 'Bangladesh Bank Sandbox Demo · Double-Entry Ledger Active'}
        </span>
      </div>

      {/* Top Navigation Bar - Strict 3-Zone Contract */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-900/40 text-white font-bold text-lg">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {language === 'bn' ? 'ওয়ালেট' : 'Wallet'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-none">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Zone 2: Role Switcher & Controls */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {allUsers.map((user) => {
            const isActive = user.id === currentUser.id;
            const isAgent = user.role === 'AGENT';
            const isAdmin = user.role === 'ADMIN';

            return (
              <button
                key={user.id}
                onClick={() => handleRoleChange(user.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={user.name}
              >
                {isAdmin ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : isAgent ? (
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                )}
                <span>
                  {isAdmin
                    ? t.admin
                    : isAgent
                    ? t.agent
                    : user.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Zone 3: Language & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.language}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(language === 'bn' ? 'সব ডেমো লেনদেন এবং ব্যালেন্স কি রিসেট করতে চান?' : 'Reset all demo transactions and ledger entries?')) {
                resetDemoData();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={language === 'bn' ? 'ডেমো রিসেট' : 'Reset Demo'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
