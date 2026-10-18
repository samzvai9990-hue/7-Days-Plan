import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { translations } from '../i18n/translations';
import { formatBDT } from '../utils/currency';
import { playTapSound } from '../utils/audio';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  FileText, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Layers, 
  Check 
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserPin, submitKyc, language, feeRules, resetDemoData } = useWallet();
  const t = translations[language];

  // PIN change state
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // KYC modal state
  const [showKycForm, setShowKycForm] = useState(false);
  const [nidNumber, setNidNumber] = useState(currentUser.kycDetails?.nidNumber || '');
  const [dob, setDob] = useState(currentUser.kycDetails?.dateOfBirth || '');
  const [father, setFather] = useState(currentUser.kycDetails?.fatherName || '');
  const [mother, setMother] = useState(currentUser.kycDetails?.motherName || '');
  const [address, setAddress] = useState(currentUser.kycDetails?.address || '');
  const [kycSubmittedSuccess, setKycSubmittedSuccess] = useState(false);

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateUserPin(currentUser.id, oldPin, newPin);
    if (res.success) {
      setPinMsg({ text: language === 'bn' ? 'পিন সফলভাবে পরিবর্তন হয়েছে!' : 'PIN updated successfully!', isError: false });
      setOldPin('');
      setNewPin('');
      setTimeout(() => {
        setShowPinModal(false);
        setPinMsg(null);
      }, 1500);
    } else {
      setPinMsg({ text: res.error || 'Failed', isError: true });
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc({
      nidNumber,
      dateOfBirth: dob,
      fatherName: father,
      motherName: mother,
      address,
    });
    setKycSubmittedSuccess(true);
    setTimeout(() => {
      setShowKycForm(false);
      setKycSubmittedSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 overflow-hidden flex items-center justify-center shrink-0">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-emerald-700" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {currentUser.phone} · {currentUser.accountNumber}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {currentUser.role}
                </span>
                {currentUser.kycStatus === 'VERIFIED' ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.kycVerified}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t.kycPending}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'দৈনিক লিমিট' : 'Daily Limit'}</span>
                <span className="font-bold text-slate-800 font-tabular">{formatBDT(currentUser.dailyLimitPaisa, language)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'আজকের ব্যবহার' : 'Today Spent'}</span>
                <span className="font-bold text-emerald-700 font-tabular">{formatBDT(currentUser.dailySpentPaisa, language)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস' : 'Status'}</span>
                <span className={`font-bold ${currentUser.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {currentUser.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Security & KYC Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Security / PIN Update */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t.securitySettings}
              </h3>
            </div>
            <button
              onClick={() => {
                playTapSound();
                setShowPinModal(!showPinModal);
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              {showPinModal ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'পিন পরিবর্তন করুন' : 'Change PIN')}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            {language === 'bn'
              ? 'আপনার ৪-সংখ্যার ওয়ালেট পিন কাউকে শেয়ার করবেন না।'
              : 'Keep your 4-digit secret PIN safe and never share it.'}
          </p>

          {showPinModal && (
            <form onSubmit={handlePinUpdate} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {pinMsg && (
                <div className={`p-2 rounded-lg text-xs font-medium ${pinMsg.isError ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {pinMsg.text}
                </div>
              )}
              <div>
                <label className="block text-slate-600 mb-1">{language === 'bn' ? 'বর্তমান পিন (Current PIN):' : 'Current PIN:'}</label>
                <input
                  type="password"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono tracking-widest text-center text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">{language === 'bn' ? 'নতুন ৪-ডিজিট পিন (New PIN):' : 'New 4-digit PIN:'}</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono tracking-widest text-center text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'পিন আপডেট করুন' : 'Update PIN'}
              </button>
            </form>
          )}
        </div>

        {/* KYC Document Verification */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {language === 'bn' ? 'জাতীয় পরিচয়পত্র ও কেওয়াইসি' : 'NID & KYC Status'}
              </h3>
            </div>
            <button
              onClick={() => {
                playTapSound();
                setShowKycForm(!showKycForm);
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              {showKycForm ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'তথ্য হালনাগাদ' : 'Update Details')}
            </button>
          </div>

          <div className="text-xs text-slate-600 space-y-1 mb-2">
            <p><strong>NID:</strong> <span className="font-mono text-slate-800">{currentUser.kycDetails?.nidNumber || 'Not provided'}</span></p>
            <p><strong>DOB:</strong> <span className="text-slate-800">{currentUser.kycDetails?.dateOfBirth || 'Not provided'}</span></p>
            <p><strong>Address:</strong> <span className="text-slate-800">{currentUser.kycDetails?.address || 'Not provided'}</span></p>
          </div>

          {showKycForm && (
            <form onSubmit={handleKycSubmit} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mt-2">
              {kycSubmittedSuccess && (
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-medium text-xs">
                  {language === 'bn' ? 'কেওয়াইসি সফলভাবে পর্যালোচনার জন্য জমা হয়েছে!' : 'KYC submitted for supervisor review!'}
                </div>
              )}
              <div>
                <label className="block text-slate-600">NID Number:</label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600">Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'কেওয়াইসি জমা দিন' : 'Submit KYC'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Fee & Limits Matrix */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t.limitsAndCharges}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">{t.sendMoney}</span>
            <p className="text-slate-600 text-[11px]">
              {language === 'bn' ? 'প্রথম ৫০০ টাকা পর্যন্ত ফ্রি (০ টাকা)। ৫০০ টাকার বেশি হলে ফ্ল্যাট ৫ টাকা।' : 'Free up to ৳500; flat ৳5 above ৳500.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">{t.cashOut}</span>
            <p className="text-slate-600 text-[11px]">
              {language === 'bn' ? 'অনুমোদিত এজেন্ট পয়েন্টে ১.৮৫% (প্রতি হাজারে ১৮.৫০ টাকা)।' : '1.85% (৳18.50 per thousand) at agent counters.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">{t.cashIn}</span>
            <p className="text-slate-600 text-[11px]">
              {language === 'bn' ? 'ব্যাংক ট্রান্সফার ও এজেন্ট ক্যাশ ইন সম্পূর্ণ ফ্রি।' : 'Bank card and agent cash-in deposits are 100% free.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Beginner Developer Educational Guide (Requested by User) */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-2 text-emerald-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-tight">
            {t.educationalSection}
          </h3>
        </div>
        <h4 className="text-xs font-bold text-amber-300 mb-2">
          {t.ledgerExplanationTitle}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {t.ledgerExplanationText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-emerald-200">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
            <span className="text-amber-400 font-bold block mb-1">১. পয়সা (Integer Minor Units):</span>
            <span>1 Taka = 100 Paisa. Floating point (0.1 + 0.2 = 0.30000000000000004) এরর প্রতিরোধে ডেটাবেজে সর্বদা পূর্ণসংখ্যা পয়সায় হিসাব রাখা হয়।</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
            <span className="text-amber-400 font-bold block mb-1">২. ডাবল-এন্ট্রি ব্যালেন্সিং:</span>
            <span>Debit Account A = Credit Account B. টাকা কখনো শূন্য থেকে তৈরি হয় না, এক অ্যাকাউন্ট থেকে ডেবিট হয়ে অন্য অ্যাকাউন্টে ক্রেডিট হয়।</span>
          </div>
        </div>
      </div>

      {/* Reset Data Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (window.confirm(language === 'bn' ? 'সব ডেমো লেনদেন এবং ব্যালেন্স কি রিসেট করতে চান?' : 'Reset all demo transactions and ledger entries?')) {
              resetDemoData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetDemoData}</span>
        </button>
      </div>
    </div>
  );
};
