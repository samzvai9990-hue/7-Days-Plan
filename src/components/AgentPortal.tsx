import React from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { 
  Store, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const { currentUser, cashRequests, processCashRequest, getUserBalancePaisa, language } = useWallet();
  const t = translations[language];

  const agentBalancePaisa = getUserBalancePaisa(currentUser.id);
  const pendingRequests = cashRequests.filter(r => r.status === 'PENDING');

  const handleApprove = (requestId: string) => {
    playTapSound();
    const res = processCashRequest(requestId, 'APPROVE', currentUser.id);
    if (res.success) {
      playSuccessSound();
    } else {
      alert(res.error || 'Failed to approve');
    }
  };

  const handleReject = (requestId: string) => {
    playTapSound();
    processCashRequest(requestId, 'REJECT', currentUser.id);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Agent Float Card */}
      <div className="bg-gradient-to-br from-cyan-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-700/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Store className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                {language === 'bn' ? 'অনুমোদিত এজেন্ট পয়েন্ট' : 'Authorized Agent Point'}
              </span>
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <p className="text-xs text-teal-200/80 font-mono">{currentUser.phone} · {currentUser.accountNumber}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {language === 'bn' ? 'এজেন্ট সক্রিয়' : 'Agent Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-teal-800/60">
          <div className="p-3 rounded-xl bg-black/20">
            <span className="text-[11px] text-teal-200 block">{language === 'bn' ? 'এজেন্ট ফ্লোট লিকুইডিটি' : 'Agent Float Balance'}</span>
            <span className="text-xl font-bold font-tabular text-white">{formatBDT(agentBalancePaisa, language)}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/20">
            <span className="text-[11px] text-teal-200 block">{language === 'bn' ? 'অপেক্ষমাণ অনুরোধ' : 'Pending Requests'}</span>
            <span className="text-xl font-bold font-tabular text-amber-300">{pendingRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Customer Pending Cash Requests Queue */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'bn' ? 'গ্রাহকদের ক্যাশ অনুরোধ কিউ' : 'Customer Cash Request Queue'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'bn' ? 'কাউন্টারে গ্রাহকদের ক্যাশ ইন ও ক্যাশ আউট অনুরোধ অনুমোদন করুন।' : 'Review and approve customer deposits or withdrawals at your counter.'}
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>{language === 'bn' ? 'বর্তমানে কোনো অপেক্ষমাণ অনুরোধ নেই।' : 'No pending cash requests right now.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.type === 'CASH_OUT'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {req.type === 'CASH_OUT' ? t.cashOut : t.cashIn}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">{req.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {req.userName} ({req.userPhone})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {new Date(req.createdAt).toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US')}
                    {req.notes && ` · ${req.notes}`}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold text-slate-900 font-tabular block">
                      {formatBDT(req.amountPaisa, language)}
                    </span>
                    {req.feePaisa > 0 && (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        +{formatBDT(Math.round(req.feePaisa * 0.8), language)} {language === 'bn' ? 'কমিশন' : 'commission'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      {t.reject}
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      {t.approve}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
