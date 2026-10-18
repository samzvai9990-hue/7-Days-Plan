import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { OffersView } from './components/OffersView';
import { ProfileView } from './components/ProfileView';
import { AgentPortal } from './components/AgentPortal';
import { AdminPortal } from './components/AdminPortal';
import { SendMoneyModal } from './components/SendMoneyModal';
import { CashOutModal } from './components/CashOutModal';
import { CashInModal } from './components/CashInModal';
import { RechargeModal } from './components/RechargeModal';
import { ReceiveMoneyModal } from './components/ReceiveMoneyModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { AdMobTaskModal } from './components/AdMobTaskModal';
import { ReferEarnModal } from './components/ReferEarnModal';
import { BkashAddMoneyModal } from './components/BkashAddMoneyModal';
import { Transaction } from './types';
import { translations } from './i18n/translations';
import { AlertCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, language } = useWallet();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<NavTab>('HOME');

  // Modals state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isAdTaskOpen, setIsAdTaskOpen] = useState(false);
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [isBkashAddMoneyOpen, setIsBkashAddMoneyOpen] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Automatically switch tab when role changes to Agent or Admin
  React.useEffect(() => {
    if (currentUser.role === 'ADMIN' && activeTab === 'AGENT_PORTAL') {
      setActiveTab('ADMIN_PORTAL');
    } else if (currentUser.role === 'AGENT' && activeTab === 'ADMIN_PORTAL') {
      setActiveTab('AGENT_PORTAL');
    }
  }, [currentUser.role]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header />

      {/* Main Container - Responsive layout with max-w-xl centered for touch ergonomics on mobile & clean desktop */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3 sm:px-4 py-4">
        {/* Suspended user warning banner */}
        {currentUser.status !== 'ACTIVE' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-medium">
              {language === 'bn' 
                ? 'আপনার অ্যাকাউন্টটি বর্তমানে স্থগিত বা ফ্রিজ অবস্থায় রয়েছে। লেনদেন সম্পন্ন করতে অ্যাডমিনের সাথে যোগাযোগ করুন।' 
                : 'Your wallet account is suspended. Contact the supervisor admin to unfreeze.'}
            </p>
          </div>
        )}

        {/* View Switching */}
        {activeTab === 'HOME' && (
          <DashboardView
            onOpenSendModal={() => setIsSendOpen(true)}
            onOpenCashOutModal={() => setIsCashOutOpen(true)}
            onOpenRechargeModal={() => setIsRechargeOpen(true)}
            onOpenCashInModal={() => setIsCashInOpen(true)}
            onOpenReceiveModal={() => setIsReceiveOpen(true)}
            onOpenAdTaskModal={() => setIsAdTaskOpen(true)}
            onOpenReferModal={() => setIsReferOpen(true)}
            onOpenBkashAddMoneyModal={() => setIsBkashAddMoneyOpen(true)}
            onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
            onNavigateToTransactions={() => setActiveTab('TRANSACTIONS')}
          />
        )}

        {activeTab === 'TRANSACTIONS' && (
          <TransactionsView
            onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
          />
        )}

        {activeTab === 'OFFERS' && (
          <OffersView
            onOpenRechargeModal={() => setIsRechargeOpen(true)}
            onOpenSendModal={() => setIsSendOpen(true)}
          />
        )}

        {activeTab === 'PROFILE' && <ProfileView />}

        {activeTab === 'AGENT_PORTAL' && <AgentPortal />}

        {activeTab === 'ADMIN_PORTAL' && <AdminPortal />}
      </main>

      {/* Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
      />

      <CashOutModal
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
      />

      <CashInModal
        isOpen={isCashInOpen}
        onClose={() => setIsCashInOpen(false)}
      />

      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />

      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />

      <AdMobTaskModal
        isOpen={isAdTaskOpen}
        onClose={() => setIsAdTaskOpen(false)}
      />

      <ReferEarnModal
        isOpen={isReferOpen}
        onClose={() => setIsReferOpen(false)}
      />

      <BkashAddMoneyModal
        isOpen={isBkashAddMoneyOpen}
        onClose={() => setIsBkashAddMoneyOpen(false)}
      />

      <TransactionReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}
