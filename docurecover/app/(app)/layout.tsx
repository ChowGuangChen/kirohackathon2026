'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/_components/Sidebar';
import Navbar from '@/app/_components/Navbar';
import { useApp } from '@/app/_lib/context/AppContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push('/login');
    }
  }, [isMounted, user, router]);

  // Loading state while checking authentication or hydrating from localStorage
  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Logo mark */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25 border border-blue-400/30 animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Spinner and text */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
            </div>
            <p className="text-sm font-medium text-slate-400 tracking-wide">
              Loading recovery dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0A0E1A] text-[#F1F5F9] overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A0E1A]">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0E1A] focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
