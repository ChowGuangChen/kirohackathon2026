'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    setUser,
    language,
    setLanguage,
    documents,
    tasks,
    chatMessages,
    recoveryCase,
    setRecoveryCase,
  } = useApp();

  const isMs = language === 'ms';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [dataClearSuccess, setDataClearSuccess] = useState(false);

  const handleSignOut = () => {
    setUser(null);
    router.push('/login');
  };

  const handleDeleteAllData = () => {
    // Clear localStorage manually
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'docurecover_documents',
        'docurecover_tasks',
        'docurecover_chat',
        'docurecover_recovery_case',
      ];
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    }
    setShowDeleteConfirm(false);
    setDataClearSuccess(true);
    setTimeout(() => setDataClearSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (typeof window !== 'undefined') {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('docurecover_'))
        .forEach((k) => window.localStorage.removeItem(k));
    }
    setUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isMs ? 'Tetapan Akaun' : 'Account Settings'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {isMs
            ? 'Urus akaun, privasi, dan data pemulihan dokumen anda.'
            : 'Manage your account, privacy preferences, and recovery data.'}
        </p>
      </div>

      {/* Success Banner */}
      {dataClearSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            {isMs
              ? 'Data pemulihan berjaya dipadamkan. Anda boleh memulakan semula proses pemulihan.'
              : 'Recovery data cleared successfully. You can start a fresh recovery case.'}
          </span>
        </div>
      )}

      {/* Profile Card */}
      <section className="rounded-2xl bg-[#0F172A] border border-white/10 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {isMs ? 'Profil Pengguna' : 'User Profile'}
        </h2>

        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {isMs ? 'Nama Penuh' : 'Full Name'}
              </span>
              <p className="text-sm font-semibold text-white">{user.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {isMs ? 'Alamat Emel' : 'Email Address'}
              </span>
              <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {isMs ? 'Tarikh Daftar' : 'Member Since'}
              </span>
              <p className="text-sm font-semibold text-white">
                {new Date(user.createdAt).toLocaleDateString(isMs ? 'ms-MY' : 'en-MY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {isMs ? 'ID Pengguna' : 'User ID'}
              </span>
              <p className="text-xs font-mono text-slate-400 truncate">{user.id}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{isMs ? 'Tiada pengguna log masuk.' : 'No user currently signed in.'}</p>
        )}
      </section>

      {/* Language Settings */}
      <section className="rounded-2xl bg-[#0F172A] border border-white/10 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {isMs ? 'Tetapan Bahasa' : 'Language Settings'}
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-800'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage('ms')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
              language === 'ms'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-800'
            }`}
          >
            🇲🇾 Bahasa Malaysia
          </button>
        </div>
      </section>

      {/* Recovery Data Summary */}
      <section className="rounded-2xl bg-[#0F172A] border border-white/10 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8-1.79 8-4" />
          </svg>
          {isMs ? 'Data Pemulihan Tersimpan' : 'Stored Recovery Data'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { labelEn: 'Documents', labelMs: 'Dokumen', count: documents.length, color: 'text-blue-400' },
            { labelEn: 'Tasks', labelMs: 'Tugasan', count: tasks.length, color: 'text-amber-400' },
            { labelEn: 'Chat Messages', labelMs: 'Mesej Chat', count: chatMessages.length, color: 'text-indigo-400' },
            { labelEn: 'Active Case', labelMs: 'Kes Aktif', count: recoveryCase ? 1 : 0, color: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.labelEn} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <p className={`text-2xl font-extrabold ${item.color}`}>{item.count}</p>
              <p className="text-xs text-slate-400">{isMs ? item.labelMs : item.labelEn}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {isMs
            ? 'Data pemulihan anda disimpan secara tempatan di peranti ini menggunakan localStorage. Tiada data dihantar ke pelayan tanpa kebenaran anda.'
            : 'Your recovery data is stored locally on this device using browser localStorage. No data is sent to external servers without your consent.'}
        </p>
      </section>

      {/* Privacy & Danger Zone */}
      <section className="rounded-2xl bg-[#0F172A] border border-rose-500/20 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {isMs ? 'Privasi & Kawasan Berbahaya' : 'Privacy & Danger Zone'}
        </h2>

        <div className="space-y-3">
          {/* Clear Recovery Data */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-300">
                {isMs ? 'Padam Semua Data Pemulihan' : 'Clear All Recovery Data'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMs
                  ? 'Memadamkan semua dokumen, tugasan, dan histori chat. Akaun anda akan kekal.'
                  : 'Removes all documents, tasks, and chat history. Your account will remain.'}
              </p>
            </div>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-amber-400 font-semibold">{isMs ? 'Pasti?' : 'Are you sure?'}</span>
                <button
                  onClick={handleDeleteAllData}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                >
                  {isMs ? 'Ya, Padam' : 'Yes, Clear'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                >
                  {isMs ? 'Batal' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex-shrink-0"
              >
                {isMs ? 'Padam Data' : 'Clear Data'}
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                {isMs ? 'Log Keluar' : 'Sign Out'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMs
                  ? 'Log keluar daripada akaun ini. Data pemulihan anda akan kekal tersimpan.'
                  : 'Sign out from this account. Your recovery data will be preserved.'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all flex-shrink-0"
            >
              {isMs ? 'Log Keluar' : 'Sign Out'}
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-rose-400">
                {isMs ? 'Padam Akaun & Semua Data' : 'Delete Account & All Data'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMs
                  ? 'Ini akan memadamkan semua data secara kekal dan anda akan dikembalikan ke halaman utama.'
                  : 'This permanently removes all your data and returns you to the home page.'}
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all flex-shrink-0"
            >
              {isMs ? 'Padam Akaun' : 'Delete Account'}
            </button>
          </div>
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="rounded-2xl bg-blue-950/30 border border-blue-500/20 p-5 space-y-2">
        <h2 className="text-sm font-bold text-blue-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isMs ? 'Peringatan Penting AI' : 'Important AI Disclaimer'}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isMs
            ? 'DocuRecover menggunakan AI untuk memberikan panduan awal sahaja. Semua maklumat prosedur gantian dokumen perlu disahkan secara rasmi di kaunter agensi yang berkenaan (JPN, JPJ, Imigresen, dll). AI tidak mengesahkan ketulenan dokumen atau kelayakan rasmi.'
            : 'DocuRecover uses AI to provide preliminary guidance only. All document replacement procedures must be officially verified at the relevant agency counter (JPN, JPJ, Immigration, etc.). The AI does not certify document authenticity or determine official eligibility.'}
        </p>
      </section>
    </div>
  );
}
