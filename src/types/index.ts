/**
 * Core Types for TakaPay (বাংলাদেশ ডিজিটাল ওয়ালেট)
 * All monetary amounts are in Integer Minor Units (Paisa: 1 Taka = 100 Paisa)
 * to eliminate floating-point rounding errors.
 */

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export type KYCStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KYCDetails {
  nidNumber?: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  nidFrontPhoto?: string;
  nidBackPhoto?: string;
  submittedAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string; // e.g. 01711002233
  email?: string;
  role: UserRole;
  pin: string; // 4-digit hashed/stored securely
  kycStatus: KYCStatus;
  kycDetails?: KYCDetails;
  avatarUrl?: string;
  accountNumber: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN';
  dailyLimitPaisa: number;
  monthlyLimitPaisa: number;
  dailySpentPaisa: number;
  createdAt: string;
  
  // Referral System
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalReferralEarnedPaisa: number;

  // AdMob Task System
  adsWatchedCount: number;
  totalTasksCompleted: number;
  lastAdWatchedAt?: string;
}

export type LedgerAccountType = 
  | 'USER_LIABILITY'     // Customer & Agent wallet holdings
  | 'AGENT_COMMISSION'   // Agent earnings
  | 'PLATFORM_REVENUE'   // TakaPay operational fee account
  | 'SETTLEMENT_ESCROW'  // External bank / payment partner pool
  | 'RECHARGE_EXPENSE'   // Telecom operators clearing
  | 'PROMOTION_ESCROW';  // Referral and Ad reward clearing pool

export interface LedgerAccount {
  id: string;
  userId?: string;
  accountType: LedgerAccountType;
  accountName: string;
  currency: 'BDT';
}

export type LedgerEntryType = 'DEBIT' | 'CREDIT';

export interface LedgerEntry {
  id: string;
  transactionId: string;
  ledgerAccountId: string;
  entryType: LedgerEntryType;
  amountPaisa: number; // positive integer in paisa
  balanceAfterPaisa: number;
  description: string;
  timestamp: string;
}

export type TransactionType = 
  | 'SEND_MONEY'
  | 'RECEIVE_MONEY'
  | 'CASH_IN'
  | 'CASH_OUT'
  | 'MOBILE_RECHARGE'
  | 'FEE'
  | 'ADMIN_ADJUSTMENT'
  | 'AD_REWARD'
  | 'REFERRAL_BONUS'
  | 'BKASH_ADD_MONEY';

export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REVERSED';

export type TelecomOperator = 'Grameenphone' | 'Banglalink' | 'Robi' | 'Airtel' | 'Teletalk';

export interface Transaction {
  id: string; // TrxID e.g. TXN948201
  idempotencyKey: string;
  type: TransactionType;
  sourceUserId?: string;
  targetUserId?: string;
  sourcePhone?: string;
  targetPhone?: string;
  sourceName?: string;
  targetName?: string;
  amountPaisa: number; // integer minor units
  feePaisa: number;
  status: TransactionStatus;
  referenceNote?: string;
  operator?: TelecomOperator;
  operatorPlan?: string;
  timestamp: string;
  ledgerEntriesCount?: number;
}

export interface CashRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  agentId?: string;
  agentName?: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amountPaisa: number;
  feePaisa: number;
  method: 'AGENT' | 'BANK_CARD' | 'BKASH_DEMO' | 'NAGAD_DEMO';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type MfsGateway = 'BKASH' | 'NAGAD' | 'ROCKET';

export interface AddMoneyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  gateway: MfsGateway;
  gatewayNumber: string; // e.g. 01712-345678 (Bkash Personal)
  senderPhone: string;
  trxId: string;
  amountPaisa: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  completedAt?: string;
}

export interface FeeRules {
  sendMoneyFlatFeePaisa: number; // e.g. 500 paisa = 5 Tk
  sendMoneyFreeThresholdPaisa: number; // first 500 Tk free
  cashOutFeePercent: number; // 1.85% = 1.85
  rechargeCashbackPercent: number; // e.g. 1%
  minSendAmountPaisa: number; // 10 Tk = 1000 paisa
  maxDailySendPaisa: number; // 25,000 Tk = 2,500,000 paisa
  
  // Ad & Referral Config
  adTaskTargetCount: number; // 10 ads
  adTaskRewardPaisa: number; // 500 Tk = 50,000 paisa
  referralRewardPaisa: number; // 50 Tk = 5,000 paisa
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export type Language = 'bn' | 'en';
