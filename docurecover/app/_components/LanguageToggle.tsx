'use client';

import React from 'react';
import { useApp } from '@/app/_lib/context/AppContext';
import { Language } from '@/app/_lib/types';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function LanguageToggle({ className = '', size = 'sm' }: LanguageToggleProps) {
  const { language, setLanguage } = useApp();

  const isEnglish = language === 'en';

  const toggleLanguage = (newLang: Language) => {
    if (newLang !== language) {
      setLanguage(newLang);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`relative inline-flex items-center rounded-full bg-slate-900/90 border border-white/10 p-0.5 shadow-inner backdrop-blur-md select-none ${className}`}
    >
      {/* Sliding Active Indicator Pill */}
      <div
        className={`absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/25 transition-all duration-300 ease-out ${
          isSmall ? 'w-[32px] h-[24px]' : 'w-[40px] h-[30px]'
        } ${isEnglish ? 'left-0.5' : isSmall ? 'left-[33px]' : 'left-[41px]'}`}
        aria-hidden="true"
      />

      {/* English Option */}
      <button
        type="button"
        id="lang-toggle-en"
        onClick={() => toggleLanguage('en')}
        className={`relative z-10 font-bold transition-colors duration-200 flex items-center justify-center rounded-full ${
          isSmall ? 'w-[32px] h-[24px] text-[11px]' : 'w-[40px] h-[30px] text-xs'
        } ${
          isEnglish
            ? 'text-white font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={isEnglish}
        title="Switch to English"
      >
        EN
      </button>

      {/* Bahasa Melayu Option */}
      <button
        type="button"
        id="lang-toggle-ms"
        onClick={() => toggleLanguage('ms')}
        className={`relative z-10 font-bold transition-colors duration-200 flex items-center justify-center rounded-full ${
          isSmall ? 'w-[32px] h-[24px] text-[11px]' : 'w-[40px] h-[30px] text-xs'
        } ${
          !isEnglish
            ? 'text-white font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={!isEnglish}
        title="Tukar ke Bahasa Melayu"
      >
        BM
      </button>
    </div>
  );
}
