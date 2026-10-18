import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  LedgerAccount, 
  LedgerEntry, 
  Transaction, 
  CashRequest, 
  AddMoneyRequest,
  MfsGateway,
  AuditLog, 
  FeeRules, 
  Language, 
  TelecomOperator,
  KYCStatus
} from '../types';
import { calculateSendMoneyFee, calculateCashOutFee } from '../utils/currency';
import { playSuccessSound } from '../utils/audio';

interface WalletContextType {
  // Current user & authentication state
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  updateUserPin: (userId: string, oldPin: string, newPin: string) => { success: boolean; error?: string };
  submitKyc: (details: { nidNumber: string; dateOfBirth: string; fatherName: string; motherName: string; address: string }) => void;
  
  // Balances & Ledger
  getUserBalancePaisa: (userId: string) => number;
  getUserLedgerEntries: (userId: string) => LedgerEntry[];
  allTransactions: Transaction[];
  allLedgerEntries: LedgerEntry[];
  
  // Financial Operations
  sendMoney: (targetPhone: string, amountPaisa: number, pin: string, idempotencyKey: string, note?: string) => { success: boolean; transaction?: Transaction; error?: string };
  cashOut: (agentPhone: string, amountPaisa: number, pin: string, idempotencyKey: string) => { success: boolean; transaction?: Transaction; error?: string };
  cashIn: (amountPaisa: number, method: 'AGENT' | 'BANK_CARD', cardDetails?: { cardNumber: string }) => { success: boolean; transaction?: Transaction; error?: string };
  mobileRecharge: (phone: string, operator: TelecomOperator, planType: 'PREPAID' | 'POSTPAID', amountPaisa: number, pin: string, planName?: string) => { success: boolean; transaction?: Transaction; error?: string };
  
  // AdMob Task & Ads System
  recordAdWatched: (adType: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE') => { completedTask: boolean; count: number; rewardGiven: boolean };
  
  // Refer & Earn System
  applyReferralCode: (code: string) => { success: boolean; error?: string; rewardPaisa?: number };
  
  // bKash / Nagad / Rocket Add Money
  addMoneyRequests: AddMoneyRequest[];
  submitAddMoneyMfs: (gateway: MfsGateway, senderPhone: string, trxId: string, amountPaisa: number) => { success: boolean; transaction?: Transaction; error?: string };
  processAddMoneyRequest: (requestId: string, action: 'APPROVE' | 'REJECT') => { success: boolean; error?: string };
  
  // Cash Requests & Approvals (Agent / Admin)
  cashRequests: CashRequest[];
  createCashRequest: (type: 'CASH_IN' | 'CASH_OUT', amountPaisa: number, method: 'AGENT' | 'BANK_CARD', notes?: string) => void;
  processCashRequest: (requestId: string, action: 'APPROVE' | 'REJECT', agentId: string) => { success: boolean; error?: string };
  
  // Admin Operations
  auditLogs: AuditLog[];
  feeRules: FeeRules;
  updateFeeRules: (newRules: Partial<FeeRules>) => void;
  toggleUserStatus: (userId: string) => void;
  verifyUserKyc: (userId: string, approve: boolean) => void;
  getPlatformStats: () => { totalVolumePaisa: number; platformRevenuePaisa: number; activeUsers: number; totalTransactions: number };
  
  // Language & UI Preferences
  language: Language;
  setLanguage: (lang: Language) => void;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (visible: boolean) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY_PREFIX = 'takapay_wallet_v2_';

// Initial pre-seeded users with Referral and AdMob state
const SEED_USERS: User[] = [
  {
    id: 'usr_nasir_1',
    name: 'নাসির আহমেদ (Nasir Ahmed)',
    phone: '01711002233',
    email: 'nasir.ahmed@example.com',
    role: 'CUSTOMER',
    pin: '1234',
    kycStatus: 'VERIFIED',
    kycDetails: {
      nidNumber: '19922695412000845',
      dateOfBirth: '1992-05-14',
      fatherName: 'আজিজুল হক',
      motherName: 'রাবেয়া বেগম',
      address: 'মিরপুর-১০, ঢাকা-১২১৬',
      submittedAt: '2026-01-10T10:00:00Z',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    accountNumber: 'ACC-1711002233',
    status: 'ACTIVE',
    dailyLimitPaisa: 2500000, // ৳25,000
    monthlyLimitPaisa: 20000000, // ৳200,000
    dailySpentPaisa: 0,
    createdAt: '2026-01-01T00:00:00Z',
    referralCode: 'TP-NASIR77',
    referralCount: 2,
    totalReferralEarnedPaisa: 10000, // ৳100
    adsWatchedCount: 3, // 3/10 watched
    totalTasksCompleted: 1,
  },
  {
    id: 'usr_fatima_2',
    name: 'ফাতেমা বেগম (Fatima Begum)',
    phone: '01822334455',
    email: 'fatima.begum@example.com',
    role: 'CUSTOMER',
    pin: '1234',
    kycStatus: 'VERIFIED',
    kycDetails: {
      nidNumber: '19952695412000123',
      dateOfBirth: '1995-09-22',
      fatherName: 'কবির হোসেন',
      motherName: 'মমতাজ বেগম',
      address: 'ধানমন্ডি, ঢাকা-১২০৫',
      submittedAt: '2026-01-15T12:30:00Z',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    accountNumber: 'ACC-1822334455',
    status: 'ACTIVE',
    dailyLimitPaisa: 2500000,
    monthlyLimitPaisa: 20000000,
    dailySpentPaisa: 0,
    createdAt: '2026-01-05T00:00:00Z',
    referralCode: 'TP-FATIMA55',
    referralCount: 0,
    totalReferralEarnedPaisa: 0,
    adsWatchedCount: 0,
    totalTasksCompleted: 0,
  },
  {
    id: 'usr_agent_sohel_3',
    name: 'সোহেল টেলিকম - এজেন্ট (Sohel Telecom)',
    phone: '01933445566',
    email: 'sohel.telecom@example.com',
    role: 'AGENT',
    pin: '1234',
    kycStatus: 'VERIFIED',
    kycDetails: {
      nidNumber: '19852695412000999',
      dateOfBirth: '1985-03-10',
      fatherName: 'রফিকুল ইসলাম',
      motherName: 'ফরিদা আক্তার',
      address: 'দোকান নং ৪, গুলশান-১ ডিসিসি মার্কেট, ঢাকা',
      submittedAt: '2025-11-20T09:00:00Z',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    accountNumber: 'AGT-1933445566',
    status: 'ACTIVE',
    dailyLimitPaisa: 50000000, // ৳500,000 for Agent
    monthlyLimitPaisa: 500000000,
    dailySpentPaisa: 0,
    createdAt: '2025-10-01T00:00:00Z',
    referralCode: 'AGT-SOHEL99',
    referralCount: 5,
    totalReferralEarnedPaisa: 25000,
    adsWatchedCount: 0,
    totalTasksCompleted: 0,
  },
  {
    id: 'usr_admin_4',
    name: 'সুপারভাইজার অ্যাডমিন (System Supervisor)',
    phone: '01500000000',
    email: 'supervisor@takapay.bd',
    role: 'ADMIN',
    pin: '9999',
    kycStatus: 'VERIFIED',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    accountNumber: 'ADM-0150000000',
    status: 'ACTIVE',
    dailyLimitPaisa: 1000000000,
    monthlyLimitPaisa: 1000000000,
    dailySpentPaisa: 0,
    createdAt: '2025-01-01T00:00:00Z',
    referralCode: 'ADM-TAKAPAY',
    referralCount: 0,
    totalReferralEarnedPaisa: 0,
    adsWatchedCount: 0,
    totalTasksCompleted: 0,
  }
];

// Seed Ledger Accounts
const SEED_LEDGER_ACCOUNTS: LedgerAccount[] = [
  { id: 'la_nasir', userId: 'usr_nasir_1', accountType: 'USER_LIABILITY', accountName: 'Nasir Ahmed Wallet Holding', currency: 'BDT' },
  { id: 'la_fatima', userId: 'usr_fatima_2', accountType: 'USER_LIABILITY', accountName: 'Fatima Begum Wallet Holding', currency: 'BDT' },
  { id: 'la_agent_sohel', userId: 'usr_agent_sohel_3', accountType: 'USER_LIABILITY', accountName: 'Sohel Telecom Agent Escrow', currency: 'BDT' },
  { id: 'la_platform_revenue', userId: 'usr_admin_4', accountType: 'PLATFORM_REVENUE', accountName: 'TakaPay Operations Fee Pool', currency: 'BDT' },
  { id: 'la_settlement_bank', accountType: 'SETTLEMENT_ESCROW', accountName: 'Partner Commercial Banks & bKash Settlement Pool', currency: 'BDT' },
  { id: 'la_telecom_clearing', accountType: 'RECHARGE_EXPENSE', accountName: 'Telecom Operators Clearing Pool', currency: 'BDT' },
  { id: 'la_promotion_escrow', accountType: 'PROMOTION_ESCROW', accountName: 'Google AdMob Rewards & Referral Bonus Pool', currency: 'BDT' },
];

function createInitialLedgerSeed() {
  const initialEntries: LedgerEntry[] = [];
  const initialTransactions: Transaction[] = [];

  // 1. Initial Deposit to Nasir: ৳5,250.00 (525,000 paisa)
  const tx1Id = 'TXN100801';
  initialTransactions.push({
    id: tx1Id,
    idempotencyKey: 'idemp_seed_1',
    type: 'CASH_IN',
    targetUserId: 'usr_nasir_1',
    targetPhone: '01711002233',
    targetName: 'নাসির আহমেদ',
    amountPaisa: 525000,
    feePaisa: 0,
    status: 'SUCCESS',
    referenceNote: 'Initial account funding via Bank Transfer',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    ledgerEntriesCount: 2,
  });
  initialEntries.push(
    {
      id: 'entry_seed_1a',
      transactionId: tx1Id,
      ledgerAccountId: 'la_settlement_bank',
      entryType: 'DEBIT',
      amountPaisa: 525000,
      balanceAfterPaisa: -525000,
      description: 'Debit Settlement Escrow for Nasir initial deposit',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'entry_seed_1b',
      transactionId: tx1Id,
      ledgerAccountId: 'la_nasir',
      entryType: 'CREDIT',
      amountPaisa: 525000,
      balanceAfterPaisa: 525000,
      description: 'Credit Nasir Wallet with Initial Deposit',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    }
  );

  // 2. Initial Deposit to Fatima: ৳2,800.00 (280,000 paisa)
  const tx2Id = 'TXN100802';
  initialTransactions.push({
    id: tx2Id,
    idempotencyKey: 'idemp_seed_2',
    type: 'CASH_IN',
    targetUserId: 'usr_fatima_2',
    targetPhone: '01822334455',
    targetName: 'ফাতেমা বেগম',
    amountPaisa: 280000,
    feePaisa: 0,
    status: 'SUCCESS',
    referenceNote: 'Account Opening Deposit',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    ledgerEntriesCount: 2,
  });
  initialEntries.push(
    {
      id: 'entry_seed_2a',
      transactionId: tx2Id,
      ledgerAccountId: 'la_settlement_bank',
      entryType: 'DEBIT',
      amountPaisa: 280000,
      balanceAfterPaisa: -805000,
      description: 'Debit Settlement Escrow for Fatima initial deposit',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'entry_seed_2b',
      transactionId: tx2Id,
      ledgerAccountId: 'la_fatima',
      entryType: 'CREDIT',
      amountPaisa: 280000,
      balanceAfterPaisa: 280000,
      description: 'Credit Fatima Begum Wallet Deposit',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
  );

  // 3. Agent Sohel Initial Float: ৳75,000.00 (7,500,000 paisa)
  const tx3Id = 'TXN100803';
  initialTransactions.push({
    id: tx3Id,
    idempotencyKey: 'idemp_seed_3',
    type: 'CASH_IN',
    targetUserId: 'usr_agent_sohel_3',
    targetPhone: '01933445566',
    targetName: 'সোহেল টেলিকম - এজেন্ট',
    amountPaisa: 7500000,
    feePaisa: 0,
    status: 'SUCCESS',
    referenceNote: 'MFS Agent Float Allocation',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    ledgerEntriesCount: 2,
  });
  initialEntries.push(
    {
      id: 'entry_seed_3a',
      transactionId: tx3Id,
      ledgerAccountId: 'la_settlement_bank',
      entryType: 'DEBIT',
      amountPaisa: 7500000,
      balanceAfterPaisa: -8305000,
      description: 'Debit Settlement Escrow for Agent Float',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'entry_seed_3b',
      transactionId: tx3Id,
      ledgerAccountId: 'la_agent_sohel',
      entryType: 'CREDIT',
      amountPaisa: 7500000,
      balanceAfterPaisa: 7500000,
      description: 'Credit Agent Float Liquidity Account',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    }
  );

  return { initialEntries, initialTransactions };
}

const DEFAULT_FEE_RULES: FeeRules = {
  sendMoneyFlatFeePaisa: 500, // ৳5
  sendMoneyFreeThresholdPaisa: 50000, // ৳500
  cashOutFeePercent: 1.85,
  rechargeCashbackPercent: 1.0,
  minSendAmountPaisa: 1000, // ৳10
  maxDailySendPaisa: 2500000, // ৳25,000
  
  adTaskTargetCount: 10, // 10 ads
  adTaskRewardPaisa: 50000, // ৳500 (50,000 paisa)
  referralRewardPaisa: 5000, // ৳50 (5,000 paisa)
};

const SEED_DATA = createInitialLedgerSeed();

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
      return saved || 'usr_nasir_1';
    } catch {
      return 'usr_nasir_1';
    }
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      return saved ? JSON.parse(saved) : SEED_DATA.initialTransactions;
    } catch {
      return SEED_DATA.initialTransactions;
    }
  });

  const [allLedgerEntries, setAllLedgerEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}ledger`);
      return saved ? JSON.parse(saved) : SEED_DATA.initialEntries;
    } catch {
      return SEED_DATA.initialEntries;
    }
  });

  const [cashRequests, setCashRequests] = useState<CashRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cash_requests`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [addMoneyRequests, setAddMoneyRequests] = useState<AddMoneyRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}add_money_reqs`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'BAM_108',
          userId: 'usr_nasir_1',
          userName: 'নাসির আহমেদ',
          userPhone: '01711002233',
          gateway: 'BKASH' as MfsGateway,
          gatewayNumber: '01712-345678',
          senderPhone: '01711002233',
          trxId: 'BKL994208',
          amountPaisa: 150000, // ৳1500
          status: 'APPROVED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86000000).toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [feeRules, setFeeRules] = useState<FeeRules>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fees`);
      return saved ? JSON.parse(saved) : DEFAULT_FEE_RULES;
    } catch {
      return DEFAULT_FEE_RULES;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}language`);
      return (saved === 'en' || saved === 'bn') ? saved : 'bn';
    } catch {
      return 'bn';
    }
  });

  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);

  // Sync state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(allTransactions));
    } catch {}
  }, [allTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}ledger`, JSON.stringify(allLedgerEntries));
    } catch {}
  }, [allLedgerEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}cash_requests`, JSON.stringify(cashRequests));
    } catch {}
  }, [cashRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}add_money_reqs`, JSON.stringify(addMoneyRequests));
    } catch {}
  }, [addMoneyRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}fees`, JSON.stringify(feeRules));
    } catch {}
  }, [feeRules]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}language`, language);
    } catch {}
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    setIsBalanceVisible(false);
  };

  // Helper: Find ledger account for a user
  const getAccountForUser = (userId: string): LedgerAccount => {
    const found = SEED_LEDGER_ACCOUNTS.find(la => la.userId === userId && la.accountType === 'USER_LIABILITY');
    if (found) return found;
    return {
      id: `la_${userId}`,
      userId,
      accountType: 'USER_LIABILITY',
      accountName: `Holding Wallet for ${userId}`,
      currency: 'BDT',
    };
  };

  /**
   * Double-Entry Ledger Balance Calculation:
   * Balance = Sum of all CREDITS minus Sum of all DEBITS to this user's liability account
   */
  const getUserBalancePaisa = (userId: string): number => {
    const account = getAccountForUser(userId);
    let balance = 0;
    for (const entry of allLedgerEntries) {
      if (entry.ledgerAccountId === account.id) {
        if (entry.entryType === 'CREDIT') {
          balance += entry.amountPaisa;
        } else if (entry.entryType === 'DEBIT') {
          balance -= entry.amountPaisa;
        }
      }
    }
    return balance;
  };

  const getUserLedgerEntries = (userId: string): LedgerEntry[] => {
    const account = getAccountForUser(userId);
    return allLedgerEntries.filter(entry => entry.ledgerAccountId === account.id);
  };

  /**
   * ATOMIC SEND MONEY:
   */
  const sendMoney = (
    targetPhone: string, 
    amountPaisa: number, 
    pin: string, 
    idempotencyKey: string, 
    note?: string
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    const existingTx = allTransactions.find(t => t.idempotencyKey === idempotencyKey);
    if (existingTx) {
      return { success: true, transaction: existingTx };
    }

    if (currentUser.status !== 'ACTIVE') {
      return { success: false, error: 'Your account is suspended or frozen.' };
    }

    if (currentUser.pin !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN! Please check and try again.' };
    }

    if (amountPaisa < feeRules.minSendAmountPaisa) {
      return { success: false, error: `Minimum transfer amount is ৳${feeRules.minSendAmountPaisa / 100}.` };
    }

    const cleanedTarget = targetPhone.replace(/\s+/g, '');
    if (cleanedTarget === currentUser.phone) {
      return { success: false, error: 'Cannot send money to your own mobile number.' };
    }

    const targetUser = allUsers.find(u => u.phone === cleanedTarget);
    if (!targetUser) {
      return { success: false, error: 'Receiver mobile number is not registered on TakaPay.' };
    }

    if (targetUser.status !== 'ACTIVE') {
      return { success: false, error: 'Receiver account is currently not active.' };
    }

    const feePaisa = calculateSendMoneyFee(amountPaisa);
    const totalDeductionPaisa = amountPaisa + feePaisa;
    const currentBalancePaisa = getUserBalancePaisa(currentUser.id);

    if (currentBalancePaisa < totalDeductionPaisa) {
      return { success: false, error: 'Insufficient available balance to complete this transfer.' };
    }

    if (currentUser.dailySpentPaisa + totalDeductionPaisa > currentUser.dailyLimitPaisa) {
      return { success: false, error: 'This transaction exceeds your remaining daily limit.' };
    }

    const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const senderAccount = getAccountForUser(currentUser.id);
    const receiverAccount = getAccountForUser(targetUser.id);
    const revenueAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'PLATFORM_REVENUE')!;

    const newEntries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_1`,
        transactionId: trxId,
        ledgerAccountId: senderAccount.id,
        entryType: 'DEBIT',
        amountPaisa: amountPaisa,
        balanceAfterPaisa: currentBalancePaisa - amountPaisa,
        description: `Send Money to ${targetUser.name} (${targetUser.phone})`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_2`,
        transactionId: trxId,
        ledgerAccountId: receiverAccount.id,
        entryType: 'CREDIT',
        amountPaisa: amountPaisa,
        balanceAfterPaisa: getUserBalancePaisa(targetUser.id) + amountPaisa,
        description: `Received Money from ${currentUser.name} (${currentUser.phone})`,
        timestamp: now,
      }
    ];

    if (feePaisa > 0) {
      newEntries.push(
        {
          id: `entry_${Date.now()}_3`,
          transactionId: trxId,
          ledgerAccountId: senderAccount.id,
          entryType: 'DEBIT',
          amountPaisa: feePaisa,
          balanceAfterPaisa: currentBalancePaisa - amountPaisa - feePaisa,
          description: `Platform Send Money service fee for ${trxId}`,
          timestamp: now,
        },
        {
          id: `entry_${Date.now()}_4`,
          transactionId: trxId,
          ledgerAccountId: revenueAccount.id,
          entryType: 'CREDIT',
          amountPaisa: feePaisa,
          balanceAfterPaisa: 0,
          description: `Service fee collected on transaction ${trxId}`,
          timestamp: now,
        }
      );
    }

    const newTx: Transaction = {
      id: trxId,
      idempotencyKey,
      type: 'SEND_MONEY',
      sourceUserId: currentUser.id,
      sourcePhone: currentUser.phone,
      sourceName: currentUser.name,
      targetUserId: targetUser.id,
      targetPhone: targetUser.phone,
      targetName: targetUser.name,
      amountPaisa,
      feePaisa,
      status: 'SUCCESS',
      referenceNote: note || 'Send Money transfer',
      timestamp: now,
      ledgerEntriesCount: newEntries.length,
    };

    setAllLedgerEntries(prev => [...newEntries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, dailySpentPaisa: u.dailySpentPaisa + totalDeductionPaisa };
      }
      return u;
    }));

    playSuccessSound();
    return { success: true, transaction: newTx };
  };

  /**
   * CASH OUT (Agent Withdrawal):
   */
  const cashOut = (
    agentPhone: string, 
    amountPaisa: number, 
    pin: string, 
    idempotencyKey: string
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    if (currentUser.pin !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN! Please try again.' };
    }
    if (currentUser.status !== 'ACTIVE') {
      return { success: false, error: 'Account is not active.' };
    }

    const feePaisa = calculateCashOutFee(amountPaisa);
    const totalDeductionPaisa = amountPaisa + feePaisa;
    const balancePaisa = getUserBalancePaisa(currentUser.id);

    if (balancePaisa < totalDeductionPaisa) {
      return { success: false, error: 'Insufficient balance including 1.85% Cash Out fee.' };
    }

    const cleanedAgent = agentPhone.replace(/\s+/g, '');
    const agent = allUsers.find(u => u.phone === cleanedAgent && u.role === 'AGENT');
    if (!agent) {
      return { success: false, error: 'Entered mobile number is not an authorized TakaPay agent.' };
    }

    const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const userAccount = getAccountForUser(currentUser.id);
    const agentAccount = getAccountForUser(agent.id);
    const revenueAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'PLATFORM_REVENUE')!;

    const agentCommissionPaisa = Math.round(feePaisa * 0.8);
    const platformSharePaisa = feePaisa - agentCommissionPaisa;

    const newEntries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_co1`,
        transactionId: trxId,
        ledgerAccountId: userAccount.id,
        entryType: 'DEBIT',
        amountPaisa: totalDeductionPaisa,
        balanceAfterPaisa: balancePaisa - totalDeductionPaisa,
        description: `Cash Out withdrawal via Agent ${agent.name}`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_co2`,
        transactionId: trxId,
        ledgerAccountId: agentAccount.id,
        entryType: 'CREDIT',
        amountPaisa: amountPaisa + agentCommissionPaisa,
        balanceAfterPaisa: getUserBalancePaisa(agent.id) + amountPaisa + agentCommissionPaisa,
        description: `Customer Cash Out payout + Agent commission`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_co3`,
        transactionId: trxId,
        ledgerAccountId: revenueAccount.id,
        entryType: 'CREDIT',
        amountPaisa: platformSharePaisa,
        balanceAfterPaisa: 0,
        description: `Cash Out platform revenue margin on ${trxId}`,
        timestamp: now,
      }
    ];

    const newTx: Transaction = {
      id: trxId,
      idempotencyKey,
      type: 'CASH_OUT',
      sourceUserId: currentUser.id,
      sourcePhone: currentUser.phone,
      sourceName: currentUser.name,
      targetUserId: agent.id,
      targetPhone: agent.phone,
      targetName: agent.name,
      amountPaisa,
      feePaisa,
      status: 'SUCCESS',
      referenceNote: `Cash Out via Agent Point (${agent.phone})`,
      timestamp: now,
      ledgerEntriesCount: newEntries.length,
    };

    setAllLedgerEntries(prev => [...newEntries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    playSuccessSound();
    return { success: true, transaction: newTx };
  };

  /**
   * CASH IN (Deposit / Add Money):
   */
  const cashIn = (
    amountPaisa: number, 
    method: 'AGENT' | 'BANK_CARD', 
    cardDetails?: { cardNumber: string }
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    if (amountPaisa <= 0) {
      return { success: false, error: 'Please enter a valid deposit amount.' };
    }

    const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const userAccount = getAccountForUser(currentUser.id);
    const bankAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'SETTLEMENT_ESCROW')!;
    const currentBalance = getUserBalancePaisa(currentUser.id);

    const newEntries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_ci1`,
        transactionId: trxId,
        ledgerAccountId: bankAccount.id,
        entryType: 'DEBIT',
        amountPaisa: amountPaisa,
        balanceAfterPaisa: -amountPaisa,
        description: `Inbound gateway settlement (${method === 'BANK_CARD' ? 'Visa/Mastercard' : 'Agent Cash In'})`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_ci2`,
        transactionId: trxId,
        ledgerAccountId: userAccount.id,
        entryType: 'CREDIT',
        amountPaisa: amountPaisa,
        balanceAfterPaisa: currentBalance + amountPaisa,
        description: `Add money via ${method === 'BANK_CARD' ? `Card ending in ${cardDetails?.cardNumber.slice(-4) || 'XXXX'}` : 'Agent Deposit'}`,
        timestamp: now,
      }
    ];

    const newTx: Transaction = {
      id: trxId,
      idempotencyKey: `idemp_ci_${Date.now()}`,
      type: 'CASH_IN',
      targetUserId: currentUser.id,
      targetPhone: currentUser.phone,
      targetName: currentUser.name,
      amountPaisa,
      feePaisa: 0,
      status: 'SUCCESS',
      referenceNote: method === 'BANK_CARD' ? 'Online Card Deposit' : 'Agent Point Cash In',
      timestamp: now,
      ledgerEntriesCount: newEntries.length,
    };

    setAllLedgerEntries(prev => [...newEntries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    playSuccessSound();
    return { success: true, transaction: newTx };
  };

  /**
   * MOBILE RECHARGE:
   */
  const mobileRecharge = (
    phone: string, 
    operator: TelecomOperator, 
    planType: 'PREPAID' | 'POSTPAID', 
    amountPaisa: number, 
    pin: string, 
    planName?: string
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    if (currentUser.pin !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN! Please try again.' };
    }
    const balance = getUserBalancePaisa(currentUser.id);
    if (balance < amountPaisa) {
      return { success: false, error: 'Insufficient balance for this mobile recharge.' };
    }

    const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const userAccount = getAccountForUser(currentUser.id);
    const telecomAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'RECHARGE_EXPENSE')!;

    const newEntries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_rc1`,
        transactionId: trxId,
        ledgerAccountId: userAccount.id,
        entryType: 'DEBIT',
        amountPaisa,
        balanceAfterPaisa: balance - amountPaisa,
        description: `Mobile recharge to ${operator} (${phone}) - ${planType}`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_rc2`,
        transactionId: trxId,
        ledgerAccountId: telecomAccount.id,
        entryType: 'CREDIT',
        amountPaisa,
        balanceAfterPaisa: amountPaisa,
        description: `Telecom operator settlement credit for ${operator}`,
        timestamp: now,
      }
    ];

    const newTx: Transaction = {
      id: trxId,
      idempotencyKey: `idemp_rc_${Date.now()}`,
      type: 'MOBILE_RECHARGE',
      sourceUserId: currentUser.id,
      sourcePhone: currentUser.phone,
      sourceName: currentUser.name,
      targetPhone: phone,
      targetName: `${operator} (${planType})`,
      amountPaisa,
      feePaisa: 0,
      operator,
      operatorPlan: planName || `${planType} Recharge`,
      status: 'SUCCESS',
      referenceNote: `Instant ${operator} Mobile Recharge`,
      timestamp: now,
      ledgerEntriesCount: newEntries.length,
    };

    setAllLedgerEntries(prev => [...newEntries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    playSuccessSound();
    return { success: true, transaction: newTx };
  };

  /**
   * ADMOB TASK ENGINE:
   * "১০টায় দেখলে ৫০০ টাকা দেওয়া হবে"
   * Users must watch 10 sponsored ads completely.
   * On 10th ad: Credits ৳500 (50,000 paisa) to wallet using atomic double-entry ledger!
   */
  const recordAdWatched = (adType: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE'): { completedTask: boolean; count: number; rewardGiven: boolean } => {
    const nextCount = currentUser.adsWatchedCount + 1;
    const targetCount = feeRules.adTaskTargetCount || 10;
    const rewardPaisa = feeRules.adTaskRewardPaisa || 50000; // ৳500

    if (nextCount >= targetCount) {
      // User finished 10 ads! Award ৳500
      const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      const userAccount = getAccountForUser(currentUser.id);
      const promoAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'PROMOTION_ESCROW')!;
      const currentBalance = getUserBalancePaisa(currentUser.id);

      const entries: LedgerEntry[] = [
        {
          id: `entry_${Date.now()}_ad1`,
          transactionId: trxId,
          ledgerAccountId: promoAccount.id,
          entryType: 'DEBIT',
          amountPaisa: rewardPaisa,
          balanceAfterPaisa: -rewardPaisa,
          description: `Google AdMob sponsored task payout (10/10 ads completed)`,
          timestamp: now,
        },
        {
          id: `entry_${Date.now()}_ad2`,
          transactionId: trxId,
          ledgerAccountId: userAccount.id,
          entryType: 'CREDIT',
          amountPaisa: rewardPaisa,
          balanceAfterPaisa: currentBalance + rewardPaisa,
          description: `AdMob Daily Task Completion Bonus (৳500)`,
          timestamp: now,
        }
      ];

      const newTx: Transaction = {
        id: trxId,
        idempotencyKey: `idemp_ad_${Date.now()}`,
        type: 'AD_REWARD',
        targetUserId: currentUser.id,
        targetPhone: currentUser.phone,
        targetName: currentUser.name,
        amountPaisa: rewardPaisa,
        feePaisa: 0,
        status: 'SUCCESS',
        referenceNote: `AdMob Task Reward: Watched 10 ads (+৳500)`,
        timestamp: now,
        ledgerEntriesCount: entries.length,
      };

      setAllLedgerEntries(prev => [...entries, ...prev]);
      setAllTransactions(prev => [newTx, ...prev]);

      setAllUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            adsWatchedCount: 0, // Reset for next round
            totalTasksCompleted: (u.totalTasksCompleted || 0) + 1,
            lastAdWatchedAt: now,
          };
        }
        return u;
      }));

      playSuccessSound();
      return { completedTask: true, count: 0, rewardGiven: true };
    } else {
      // Simply increment counter
      setAllUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            adsWatchedCount: nextCount,
            lastAdWatchedAt: new Date().toISOString(),
          };
        }
        return u;
      }));

      return { completedTask: false, count: nextCount, rewardGiven: false };
    }
  };

  /**
   * REFER & EARN:
   * "রেফার করলে ৫০ টাকা করে দেওয়া হবে"
   * Users earn ৳50 (5,000 paisa) when a friend applies their referral code!
   */
  const applyReferralCode = (code: string): { success: boolean; error?: string; rewardPaisa?: number } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Please enter a valid referral code.' };

    if (cleanCode === currentUser.referralCode?.toUpperCase()) {
      return { success: false, error: 'You cannot use your own referral code.' };
    }

    if (currentUser.referredBy) {
      return { success: false, error: 'You have already used a referral code previously.' };
    }

    // Find referrer
    const referrer = allUsers.find(u => u.referralCode?.toUpperCase() === cleanCode);
    if (!referrer) {
      return { success: false, error: 'Referral code not found! Check and try again.' };
    }

    const rewardPaisa = feeRules.referralRewardPaisa || 5000; // ৳50
    const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const promoAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'PROMOTION_ESCROW')!;
    const userAccount = getAccountForUser(currentUser.id);
    const referrerAccount = getAccountForUser(referrer.id);

    // Double-entry: Debit promotion escrow for 2x reward (both friend and referrer get ৳50)
    const entries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_ref_deb`,
        transactionId: trxId,
        ledgerAccountId: promoAccount.id,
        entryType: 'DEBIT',
        amountPaisa: rewardPaisa * 2,
        balanceAfterPaisa: -(rewardPaisa * 2),
        description: `Referral promotion program bonus payout`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_ref_u1`,
        transactionId: trxId,
        ledgerAccountId: userAccount.id,
        entryType: 'CREDIT',
        amountPaisa: rewardPaisa,
        balanceAfterPaisa: getUserBalancePaisa(currentUser.id) + rewardPaisa,
        description: `Welcome referral bonus via code ${cleanCode}`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_ref_u2`,
        transactionId: trxId,
        ledgerAccountId: referrerAccount.id,
        entryType: 'CREDIT',
        amountPaisa: rewardPaisa,
        balanceAfterPaisa: getUserBalancePaisa(referrer.id) + rewardPaisa,
        description: `Referral reward for inviting ${currentUser.name}`,
        timestamp: now,
      }
    ];

    const newTx: Transaction = {
      id: trxId,
      idempotencyKey: `idemp_ref_${Date.now()}`,
      type: 'REFERRAL_BONUS',
      sourceUserId: referrer.id,
      sourcePhone: referrer.phone,
      sourceName: referrer.name,
      targetUserId: currentUser.id,
      targetPhone: currentUser.phone,
      targetName: currentUser.name,
      amountPaisa: rewardPaisa,
      feePaisa: 0,
      status: 'SUCCESS',
      referenceNote: `Referral Bonus (৳50 awarded to both parties)`,
      timestamp: now,
      ledgerEntriesCount: entries.length,
    };

    setAllLedgerEntries(prev => [...entries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          referredBy: cleanCode,
        };
      }
      if (u.id === referrer.id) {
        return {
          ...u,
          referralCount: (u.referralCount || 0) + 1,
          totalReferralEarnedPaisa: (u.totalReferralEarnedPaisa || 0) + rewardPaisa,
        };
      }
      return u;
    }));

    playSuccessSound();
    return { success: true, rewardPaisa };
  };

  /**
   * BKASH / NAGAD / ROCKET ADD MONEY:
   * "এডমানি করার জন্য বিকাশ নাম্বার পকেটের মাধ্যমে"
   * User sends money to platform bKash Personal number, submits sender phone & TrxID.
   */
  const submitAddMoneyMfs = (
    gateway: MfsGateway, 
    senderPhone: string, 
    trxIdInput: string, 
    amountPaisa: number
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    if (amountPaisa < 5000) { // ৳50
      return { success: false, error: 'Minimum Add Money amount is ৳50.' };
    }
    if (!senderPhone || senderPhone.length < 11) {
      return { success: false, error: 'Please enter a valid 11-digit sender mobile number.' };
    }
    if (!trxIdInput || trxIdInput.length < 6) {
      return { success: false, error: 'Please enter a valid Transaction ID (TrxID) from your SMS or app.' };
    }

    const gatewayName = gateway === 'BKASH' ? 'bKash' : gateway === 'NAGAD' ? 'Nagad' : 'Rocket';
    const gatewayNumber = gateway === 'BKASH' ? '01712-345678' : gateway === 'NAGAD' ? '01812-345678' : '01912-345678-9';
    const cleanTrx = trxIdInput.trim().toUpperCase();

    // Check duplicate TrxID
    const duplicate = allTransactions.find(t => t.id === cleanTrx || t.referenceNote?.includes(cleanTrx));
    if (duplicate) {
      return { success: false, error: 'This TrxID has already been verified or redeemed.' };
    }

    const now = new Date().toISOString();
    const userAccount = getAccountForUser(currentUser.id);
    const bankAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'SETTLEMENT_ESCROW')!;
    const currentBalance = getUserBalancePaisa(currentUser.id);

    // Instant verification & double-entry credit
    const entries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_mfs1`,
        transactionId: cleanTrx,
        ledgerAccountId: bankAccount.id,
        entryType: 'DEBIT',
        amountPaisa,
        balanceAfterPaisa: -amountPaisa,
        description: `${gatewayName} Add Money deposit settlement from ${senderPhone}`,
        timestamp: now,
      },
      {
        id: `entry_${Date.now()}_mfs2`,
        transactionId: cleanTrx,
        ledgerAccountId: userAccount.id,
        entryType: 'CREDIT',
        amountPaisa,
        balanceAfterPaisa: currentBalance + amountPaisa,
        description: `Add money via ${gatewayName} (${senderPhone} -> ${gatewayNumber})`,
        timestamp: now,
      }
    ];

    const newTx: Transaction = {
      id: cleanTrx,
      idempotencyKey: `idemp_mfs_${cleanTrx}`,
      type: 'BKASH_ADD_MONEY',
      sourcePhone: senderPhone,
      sourceName: `${gatewayName} User`,
      targetUserId: currentUser.id,
      targetPhone: currentUser.phone,
      targetName: currentUser.name,
      amountPaisa,
      feePaisa: 0,
      status: 'SUCCESS',
      referenceNote: `${gatewayName} Add Money TrxID: ${cleanTrx}`,
      timestamp: now,
      ledgerEntriesCount: entries.length,
    };

    const req: AddMoneyRequest = {
      id: `BAM_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      gateway,
      gatewayNumber,
      senderPhone,
      trxId: cleanTrx,
      amountPaisa,
      status: 'APPROVED',
      createdAt: now,
      completedAt: now,
    };

    setAllLedgerEntries(prev => [...entries, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    setAddMoneyRequests(prev => [req, ...prev]);

    playSuccessSound();
    return { success: true, transaction: newTx };
  };

  const processAddMoneyRequest = (requestId: string, action: 'APPROVE' | 'REJECT'): { success: boolean; error?: string } => {
    setAddMoneyRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', completedAt: new Date().toISOString() } : r));
    return { success: true };
  };

  /**
   * Cash Requests (Customer creates request, Agent or Admin approves)
   */
  const createCashRequest = (type: 'CASH_IN' | 'CASH_OUT', amountPaisa: number, method: 'AGENT' | 'BANK_CARD', notes?: string) => {
    const feePaisa = type === 'CASH_OUT' ? calculateCashOutFee(amountPaisa) : 0;
    const req: CashRequest = {
      id: `CRQ_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      agentId: 'usr_agent_sohel_3',
      agentName: 'সোহেল টেলিকম',
      type,
      amountPaisa,
      feePaisa,
      method,
      status: 'PENDING',
      notes,
      createdAt: new Date().toISOString(),
    };
    setCashRequests(prev => [req, ...prev]);
  };

  const processCashRequest = (requestId: string, action: 'APPROVE' | 'REJECT', agentId: string): { success: boolean; error?: string } => {
    const req = cashRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found.' };
    if (req.status !== 'PENDING') return { success: false, error: 'Request already processed.' };

    if (action === 'REJECT') {
      setCashRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED', completedAt: new Date().toISOString() } : r));
      return { success: true };
    }

    if (req.type === 'CASH_IN') {
      const user = allUsers.find(u => u.id === req.userId);
      if (!user) return { success: false, error: 'Customer not found.' };
      
      const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      const userAccount = getAccountForUser(user.id);
      const agentAccount = getAccountForUser(agentId);
      const currentAgentBal = getUserBalancePaisa(agentId);

      if (currentAgentBal < req.amountPaisa) {
        return { success: false, error: 'Agent float insufficient to approve this Cash In.' };
      }

      const entries: LedgerEntry[] = [
        {
          id: `entry_${Date.now()}_req1`,
          transactionId: trxId,
          ledgerAccountId: agentAccount.id,
          entryType: 'DEBIT',
          amountPaisa: req.amountPaisa,
          balanceAfterPaisa: currentAgentBal - req.amountPaisa,
          description: `Agent approved Cash In for ${user.name} (${user.phone})`,
          timestamp: now,
        },
        {
          id: `entry_${Date.now()}_req2`,
          transactionId: trxId,
          ledgerAccountId: userAccount.id,
          entryType: 'CREDIT',
          amountPaisa: req.amountPaisa,
          balanceAfterPaisa: getUserBalancePaisa(user.id) + req.amountPaisa,
          description: `Cash In via Agent Point`,
          timestamp: now,
        }
      ];

      const newTx: Transaction = {
        id: trxId,
        idempotencyKey: `idemp_req_${req.id}`,
        type: 'CASH_IN',
        sourceUserId: agentId,
        sourcePhone: '01933445566',
        sourceName: 'সোহেল টেলিকম - এজেন্ট',
        targetUserId: user.id,
        targetPhone: user.phone,
        targetName: user.name,
        amountPaisa: req.amountPaisa,
        feePaisa: 0,
        status: 'SUCCESS',
        referenceNote: `Approved request ${req.id}`,
        timestamp: now,
        ledgerEntriesCount: entries.length,
      };

      setAllLedgerEntries(prev => [...entries, ...prev]);
      setAllTransactions(prev => [newTx, ...prev]);
      setCashRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED', completedAt: now } : r));
      return { success: true };
    }

    if (req.type === 'CASH_OUT') {
      const user = allUsers.find(u => u.id === req.userId);
      if (!user) return { success: false, error: 'Customer not found.' };

      const userBal = getUserBalancePaisa(user.id);
      const totalRequired = req.amountPaisa + req.feePaisa;
      if (userBal < totalRequired) {
        return { success: false, error: 'Customer no longer has sufficient balance.' };
      }

      const trxId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      const userAccount = getAccountForUser(user.id);
      const agentAccount = getAccountForUser(agentId);
      const revenueAccount = SEED_LEDGER_ACCOUNTS.find(la => la.accountType === 'PLATFORM_REVENUE')!;

      const agentCommission = Math.round(req.feePaisa * 0.8);
      const platformShare = req.feePaisa - agentCommission;

      const entries: LedgerEntry[] = [
        {
          id: `entry_${Date.now()}_req_co1`,
          transactionId: trxId,
          ledgerAccountId: userAccount.id,
          entryType: 'DEBIT',
          amountPaisa: totalRequired,
          balanceAfterPaisa: userBal - totalRequired,
          description: `Approved Cash Out withdrawal`,
          timestamp: now,
        },
        {
          id: `entry_${Date.now()}_req_co2`,
          transactionId: trxId,
          ledgerAccountId: agentAccount.id,
          entryType: 'CREDIT',
          amountPaisa: req.amountPaisa + agentCommission,
          balanceAfterPaisa: getUserBalancePaisa(agentId) + req.amountPaisa + agentCommission,
          description: `Cash Out counter payout credit + agent commission`,
          timestamp: now,
        },
        {
          id: `entry_${Date.now()}_req_co3`,
          transactionId: trxId,
          ledgerAccountId: revenueAccount.id,
          entryType: 'CREDIT',
          amountPaisa: platformShare,
          balanceAfterPaisa: 0,
          description: `Platform fee share from Cash Out ${req.id}`,
          timestamp: now,
        }
      ];

      const newTx: Transaction = {
        id: trxId,
        idempotencyKey: `idemp_req_co_${req.id}`,
        type: 'CASH_OUT',
        sourceUserId: user.id,
        sourcePhone: user.phone,
        sourceName: user.name,
        targetUserId: agentId,
        targetPhone: '01933445566',
        targetName: 'সোহেল টেলিকম - এজেন্ট',
        amountPaisa: req.amountPaisa,
        feePaisa: req.feePaisa,
        status: 'SUCCESS',
        referenceNote: `Approved Cash Out ${req.id}`,
        timestamp: now,
        ledgerEntriesCount: entries.length,
      };

      setAllLedgerEntries(prev => [...entries, ...prev]);
      setAllTransactions(prev => [newTx, ...prev]);
      setCashRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED', completedAt: now } : r));
      return { success: true };
    }

    return { success: true };
  };

  const updateUserPin = (userId: string, oldPin: string, newPin: string): { success: boolean; error?: string } => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.pin !== oldPin) return { success: false, error: 'Current PIN is incorrect' };
    if (!/^\d{4}$/.test(newPin)) return { success: false, error: 'New PIN must be exactly 4 digits' };

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, pin: newPin } : u));
    return { success: true };
  };

  const submitKyc = (details: { nidNumber: string; dateOfBirth: string; fatherName: string; motherName: string; address: string }) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          kycStatus: 'PENDING' as KYCStatus,
          kycDetails: {
            ...details,
            submittedAt: new Date().toISOString(),
          }
        };
      }
      return u;
    }));
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
        const log: AuditLog = {
          id: `audit_${Date.now()}`,
          adminId: currentUser.id,
          adminName: currentUser.name,
          action: 'STATUS_CHANGE',
          targetEntity: 'USER',
          targetId: userId,
          details: `Changed status from ${u.status} to ${nextStatus}`,
          timestamp: new Date().toISOString(),
        };
        setAuditLogs(l => [log, ...l]);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const verifyUserKyc = (userId: string, approve: boolean) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextKyc: KYCStatus = approve ? 'VERIFIED' : 'REJECTED';
        const log: AuditLog = {
          id: `audit_${Date.now()}`,
          adminId: currentUser.id,
          adminName: currentUser.name,
          action: 'KYC_REVIEW',
          targetEntity: 'USER',
          targetId: userId,
          details: `KYC status marked as ${nextKyc}`,
          timestamp: new Date().toISOString(),
        };
        setAuditLogs(l => [log, ...l]);
        return { ...u, kycStatus: nextKyc };
      }
      return u;
    }));
  };

  const updateFeeRules = (newRules: Partial<FeeRules>) => {
    setFeeRules(prev => ({ ...prev, ...newRules }));
  };

  const getPlatformStats = () => {
    let totalVolumePaisa = 0;
    let platformRevenuePaisa = 0;

    for (const tx of allTransactions) {
      if (tx.status === 'SUCCESS') {
        totalVolumePaisa += tx.amountPaisa;
        platformRevenuePaisa += tx.feePaisa;
      }
    }

    const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;
    return {
      totalVolumePaisa,
      platformRevenuePaisa,
      activeUsers,
      totalTransactions: allTransactions.length,
    };
  };

  const resetDemoData = () => {
    localStorage.clear();
    setAllUsers(SEED_USERS);
    setCurrentUserId('usr_nasir_1');
    const freshSeed = createInitialLedgerSeed();
    setAllTransactions(freshSeed.initialTransactions);
    setAllLedgerEntries(freshSeed.initialEntries);
    setCashRequests([]);
    setAddMoneyRequests([]);
    setAuditLogs([]);
    setFeeRules(DEFAULT_FEE_RULES);
    setLanguageState('bn');
    setIsBalanceVisible(false);
  };

  return (
    <WalletContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        updateUserPin,
        submitKyc,
        getUserBalancePaisa,
        getUserLedgerEntries,
        allTransactions,
        allLedgerEntries,
        sendMoney,
        cashOut,
        cashIn,
        mobileRecharge,
        recordAdWatched,
        applyReferralCode,
        addMoneyRequests,
        submitAddMoneyMfs,
        processAddMoneyRequest,
        cashRequests,
        createCashRequest,
        processCashRequest,
        auditLogs,
        feeRules,
        updateFeeRules,
        toggleUserStatus,
        verifyUserKyc,
        getPlatformStats,
        language,
        setLanguage,
        isBalanceVisible,
        setIsBalanceVisible,
        resetDemoData,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
