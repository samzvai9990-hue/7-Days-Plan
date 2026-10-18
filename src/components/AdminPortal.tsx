import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { 
  ShieldAlert, 
  Users, 
  Settings, 
  Lock, 
  Unlock, 
  AlertTriangle,
  FileText,
  CreditCard,
  Gift,
  Tv,
  Check,
  X
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    toggleUserStatus, 
    verifyUserKyc, 
    getPlatformStats, 
    feeRules, 
    updateFeeRules, 
    auditLogs, 
    addMoneyRequests,
    processAddMoneyRequest,
    getUserBalancePaisa,
    language 
  } = useWallet();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'USERS' | 'BKASH_REQUESTS' | 'SETTINGS' | 'AUDIT'>('USERS');
  
  // Settings form states
  const [flatFeeStr, setFlatFeeStr] = useState(String(feeRules.sendMoneyFlatFeePaisa / 100));
  const [cashOutRateStr, setCashOutRateStr] = useState(String(feeRules.cashOutFeePercent));
  const [adTargetStr, setAdTargetStr] = useState(String(feeRules.adTaskTargetCount || 10));
  const [adRewardStr, setAdRewardStr] = useState(String((feeRules.adTaskRewardPaisa || 50000) / 100));
  const [referralBonusStr, setReferralBonusStr] = useState(String((feeRules.referralRewardPaisa || 5000) / 100));
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const stats = getPlatformStats();
  const pendingAddMoney = addMoneyRequests.filter(r => r.status === 'PENDING');

  const handleSaveFeeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const flatPaisa = Math.round(parseFloat(flatFeeStr) * 100);
    const cashOutPercent = parseFloat(cashOutRateStr);
    const adTarget = parseInt(adTargetStr, 10);
    const adRewardPaisa = Math.round(parseFloat(adRewardStr) * 100);
    const referralPaisa = Math.round(parseFloat(referralBonusStr) * 100);

    updateFeeRules({
      sendMoneyFlatFeePaisa: isNaN(flatPaisa) ? feeRules.sendMoneyFlatFeePaisa : flatPaisa,
      cashOutFeePercent: isNaN(cashOutPercent) ? feeRules.cashOutFeePercent : cashOutPercent,
      adTaskTargetCount: isNaN(adTarget) ? 10 : adTarget,
      adTaskRewardPaisa: isNaN(adRewardPaisa) ? 50000 : adRewardPaisa,
      referralRewardPaisa: isNaN(referralPaisa) ? 5000 : referralPaisa,
    });

    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Admin Header & Platform Stats */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.adminTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.adminSubtitle}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 w-fit">
            {language === 'bn' ? 'সিস্টেম সুপারভাইজার মোড' : 'System Supervisor Active'}
          </span>
        </div>

        {/* 4-KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.totalPlatformVolume}</span>
            <span className="text-lg font-bold font-tabular text-emerald-400">
              {formatBDT(stats.totalVolumePaisa, language)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.totalPlatformFees}</span>
            <span className="text-lg font-bold font-tabular text-amber-400">
              {formatBDT(stats.platformRevenuePaisa, language)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.activeUsersCount}</span>
            <span className="text-lg font-bold font-tabular text-white">
              {stats.activeUsers}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === 'bn' ? 'মোট লেনদেন' : 'Total Trx'}</span>
            <span className="text-lg font-bold font-tabular text-white">
              {stats.totalTransactions}
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{language === 'bn' ? 'আর্থিক নিরাপত্তার কড়া নিয়ম:' : 'Immutable Financial Ledger Policy:'}</strong>{' '}
          {language === 'bn'
            ? 'এডমব টাস্কের ৫০০ টাকা এবং রেফারেল বোনাসের ৫০ টাকা স্বয়ংক্রিয়ভাবে প্রোমোশন এসক্রো লেজার থেকে ডেবিট হয়ে ব্যবহারকারীর অ্যাকাউন্টে জমা হয়। কোনো কৃত্রিম ব্যালেন্স যোগ নিষিদ্ধ।'
            : 'AdMob rewards (৳500) and referral bonuses (৳50) are strictly debited from the promotion escrow ledger into user liabilities.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
        {[
          { id: 'USERS', label: t.userManagement, icon: Users },
          { id: 'BKASH_REQUESTS', label: `${language === 'bn' ? 'বিকাশ এড মানি' : 'bKash Requests'} (${addMoneyRequests.length})`, icon: CreditCard },
          { id: 'SETTINGS', label: t.systemSettings, icon: Settings },
          { id: 'AUDIT', label: language === 'bn' ? 'অডিট লগ' : 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
          <div className="divide-y divide-slate-100">
            {allUsers.map((user) => {
              const bal = getUserBalancePaisa(user.id);
              const isFrozen = user.status === 'FROZEN';

              return (
                <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFrozen ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {user.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {user.phone} · Ref: <span className="text-orange-600 font-semibold">{user.referralCode}</span> (Invited: {user.referralCount || 0}) · Ads: {user.adsWatchedCount || 0}/10
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'হিসাবকৃত ব্যালেন্স' : 'Ledger Balance'}</span>
                      <span className="font-bold font-tabular text-sm text-slate-800">{formatBDT(bal, language)}</span>
                    </div>

                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                          isFrozen
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isFrozen ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>{t.unfreezeAccount}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>{t.freezeAccount}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: bKash Add Money Requests */}
      {activeTab === 'BKASH_REQUESTS' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800">
              {language === 'bn' ? 'বিকাশ, নগদ ও রকেট এড মানি লগ' : 'bKash / Nagad Add Money Audit'}
            </h3>
            <span className="text-[10px] text-slate-500">
              {language === 'bn' ? 'পার্সোনাল নম্বর: ০১৭১২-৩৪৫৬৭৮' : 'bKash No: 01712-345678'}
            </span>
          </div>

          {addMoneyRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>{language === 'bn' ? 'কোনো এড মানি রেকর্ড নেই।' : 'No Add Money requests yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addMoneyRequests.map((req) => (
                <div key={req.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded text-[10px]">
                        {req.gateway}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{req.trxId}</span>
                      <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {req.userName} ({req.senderPhone}) → {req.gatewayNumber}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                    </span>
                  </div>

                  <span className="text-base font-bold text-slate-900 font-tabular shrink-0">
                    +{formatBDT(req.amountPaisa, language)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System, AdMob, and Referral Settings */}
      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSaveFeeSettings} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4 text-xs">
          {settingsSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-medium text-xs">
              {language === 'bn' ? 'সিস্টেম ও রিওয়ার্ড সেটিংস সফলভাবে আপডেট হয়েছে!' : 'Settings updated successfully!'}
            </div>
          )}

          {/* AdMob Settings Section */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Tv className="w-4 h-4 text-amber-700" />
              <span>{language === 'bn' ? 'Google AdMob টাস্ক কনফিগারেশন' : 'AdMob Task Configuration'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'কতটি এড দেখতে হবে?' : 'Target Ads Count:'}
                </label>
                <input
                  type="number"
                  value={adTargetStr}
                  onChange={(e) => setAdTargetStr(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold font-tabular"
                  required
                />
                <span className="text-[10px] text-slate-500">ডিফল্ট: ১০টি এড</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? '১০টি এডে পুরস্কার (টাকা):' : 'Reward for 10 Ads (BDT):'}
                </label>
                <input
                  type="number"
                  value={adRewardStr}
                  onChange={(e) => setAdRewardStr(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold font-tabular text-amber-700"
                  required
                />
                <span className="text-[10px] text-slate-500">ডিফল্ট: ৫০০ টাকা</span>
              </div>
            </div>
          </div>

          {/* Referral Settings Section */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <Gift className="w-4 h-4 text-purple-700" />
              <span>{language === 'bn' ? 'রেফারেল প্রোগ্রাম কনফিগারেশন' : 'Referral Reward Configuration'}</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রতি সফল রেফারে পুরস্কার (টাকা):' : 'Reward per Referral (BDT):'}
              </label>
              <input
                type="number"
                value={referralBonusStr}
                onChange={(e) => setReferralBonusStr(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold font-tabular text-purple-700"
                required
              />
              <span className="text-[10px] text-slate-500">ডিফল্ট: ৫০ টাকা</span>
            </div>
          </div>

          {/* MFS Standard Fee Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'সেন্ড মানি ফ্ল্যাট ফি (টাকা)' : 'Send Money Flat Fee (BDT)'}
              </label>
              <input
                type="number"
                step="any"
                value={flatFeeStr}
                onChange={(e) => setFlatFeeStr(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-tabular font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'ক্যাশ আউট ফি (%)' : 'Cash Out Fee (%)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={cashOutRateStr}
                onChange={(e) => setCashOutRateStr(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-tabular font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save System Settings'}
          </button>
        </form>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-xs">
          {auditLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>{language === 'bn' ? 'কোনো অ্যাডমিন অডিট অ্যাকশন রেকর্ড নেই।' : 'No admin audit records yet.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400">Admin: {log.adminName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
