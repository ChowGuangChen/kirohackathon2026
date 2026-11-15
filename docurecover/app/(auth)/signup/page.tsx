'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import { t } from '@/app/_lib/i18n/translations';
import { generateId } from '@/app/_lib/utils/documentHelpers';
import LanguageToggle from '@/app/_components/LanguageToggle';

export default function SignupPage() {
  const router = useRouter();
  const { setUser, language } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // 1. Name required
    if (!name.trim()) {
      newErrors.name =
        language === 'ms'
          ? 'Sila masukkan nama penuh anda.'
          : 'Full name is required.';
    }

    // 2. Email valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email =
        language === 'ms'
          ? 'Sila masukkan alamat emel.'
          : 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email =
        language === 'ms'
          ? 'Format emel tidak sah.'
          : 'Please enter a valid email address.';
    }

    // 3. Password min 8 characters
    if (!password) {
      newErrors.password =
        language === 'ms'
          ? 'Kata laluan diperlukan.'
          : 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password =
        language === 'ms'
          ? 'Kata laluan sekurang-kurangnya 8 aksara.'
          : 'Password must be at least 8 characters.';
    }

    // 4. Passwords match
    if (!confirmPassword) {
      newErrors.confirmPassword =
        language === 'ms'
          ? 'Sila sahkan kata laluan.'
          : 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        language === 'ms'
          ? 'Kata laluan tidak sepadan.'
          : 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      setIsLoading(false);
      router.push('/onboarding');
    }, 450);
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
        className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: '2.5s' }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-10 left-1/3 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none animate-pulse-glow"
        aria-hidden="true"
      />

      {/* Glassmorphic Sign Up Card */}
      <div className="relative z-10 w-full max-w-[460px] rounded-2xl bg-[#111827]/85 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl animate-slide-up my-8">
        
        {/* Brand Shield & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-indigo-600/20 border border-blue-500/40 shadow-lg shadow-blue-500/20 mb-3">
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
            {t('auth_signup_title', language)}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {t('auth_signup_subtitle', language)}
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              {t('auth_name', language)}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={language === 'ms' ? 'Contoh: Ahmad bin Razak' : 'e.g. Ahmad bin Razak'}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                  errors.name
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-medium text-slate-300 mb-1"
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
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                  errors.email
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              {t('auth_password', language)} (Min 8 {language === 'ms' ? 'aksara' : 'characters'})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                  errors.password
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                  errors.confirmPassword
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Fee Waiver & Relief Notice */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300 flex items-start space-x-2">
            <span className="shrink-0 mt-0.5">🇲🇾</span>
            <span className="leading-snug">
              {language === 'ms'
                ? 'Pendaftaran automatik melayakkan anda menerima panduan pengecualian fi gantian bencana JPN & JPJ.'
                : 'Account setup automatically pre-qualifies your profile for JPN & JPJ disaster fee waiver guidance.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="signup-submit-btn"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 mt-4 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{language === 'ms' ? 'Menjana Akaun...' : 'Creating Account...'}</span>
              </span>
            ) : (
              <span>{t('auth_submit_signup', language)}</span>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            {t('auth_have_account', language)}
          </Link>
        </div>

      </div>
    </div>
  );
}
