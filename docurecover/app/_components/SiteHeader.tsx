'use client';

import React from 'react';
import Link from 'next/link';
import { useViewMode } from '@/app/_lib/useViewMode';

type Props = {
  isMs: boolean;
  onToggleLanguage: () => void;
  children?: React.ReactNode;
};

export default function SiteHeader({ isMs, onToggleLanguage, children }: Props) {
  const { setMode } = useViewMode();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-milk/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-lime-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold text-stone-900">DocuRecover</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMode('phone')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-colors"
          >
            📱 {isMs ? 'Paparan Telefon' : 'Phone View'}
          </button>
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-colors"
            aria-label={isMs ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
          >
            {isMs ? 'EN' : 'BM'}
          </button>
          {children}
        </div>
      </div>
    </header>
  );
}
