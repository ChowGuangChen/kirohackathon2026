'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import { t } from '@/app/_lib/i18n/translations';
import { generateId } from '@/app/_lib/utils/documentHelpers';
import LanguageToggle from '@/app/_components/LanguageToggle';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, language, recoveryCase } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(
        language === 'ms'
          ? 'Sila masukkan alamat emel anda.'
          : 'Please enter your email address.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        language === 'ms'
          ? 'Sila masukkan kata laluan anda.'
          : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);

    // Simulate swift authenticated session creation
    setTimeout(() => {
      // Derive readable full name from email or default
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = namePart
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const newUser = {
        id: generateId(),
        name: formattedName || 'Disaster Survivor',
        email: email.trim(),
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      setIsLoading(false);

      if (!recoveryCase) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }, 400);
  };

  // Demo shortcut for hackathon judges & quick testing
  const handleQuickDemo = () => {
    const demoEmail = 'ahmad.razak@malaysia.gov.my';
    const demoPassword = 'Password123!';
    setEmail(demoEmail);
    setPassword(demoPassword);

    const newUser = {
      id: generateId(),
      name: 'Ahmad Razak bin Abdullah',
      email: demoEmail,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    if (!recoveryCase) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0E1A] overflow-hidden select-none">
      
      {/* Top Bar with Language Toggle & Home link */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{language === 'ms' ? 'Laman Utama' : 'Back to Home'}</span>
        </Link>
        <LanguageToggle size="sm" />
      </div>

      {/* Animated Floating Ambient Background Orbs */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: '2s' }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-10 right-1/3 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none animate-pulse-glow"
        aria-hidden="true"
      />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-[#111827]/85 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl animate-slide-up">
        
        {/* Brand Shield & Title */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-indigo-600/20 border border-blue-500/40 shadow-lg shadow-blue-500/20 mb-3.5">
            <svg
              className="w-6 h-6 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L4 5.5V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V5.5L12 2Z"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 9.5"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t('auth_login_title', language)}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {t('auth_login_subtitle', language)}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
            <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              {t('auth_email', language)}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-slate-300"
              >
                {t('auth_password', language)}
              </label>
              <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                {language === 'ms' ? 'Lupa Kata Laluan?' : 'Forgot Password?'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{language === 'ms' ? 'Sedang Memproses...' : 'Signing In...'}</span>
              </span>
            ) : (
              <span>{t('auth_submit_login', language)}</span>
            )}
          </button>
        </form>

        {/* Hackathon Quick Demo Access */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 mb-2">
            {language === 'ms' ? 'Untuk Penilai Hackathon / Ujian Segera:' : 'For Judges & Hackathon Evaluators:'}
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>⚡</span>
            <span>
              {language === 'ms'
                ? 'Log Masuk Segera (Ahmad Razak)'
                : '1-Click Demo Login (Ahmad Razak)'}
            </span>
          </button>
        </div>

        {/* Link to Signup */}
        <div className="mt-5 text-center">
          <Link
            href="/signup"
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            {t('auth_no_account', language)}
          </Link>
        </div>

      </div>
    </div>
  );
}
