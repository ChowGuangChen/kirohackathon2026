'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import LanguageToggle from './LanguageToggle';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, setUser, language, recoveryCase, documents } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    setUser(null);
    if (onMobileClose) onMobileClose();
    router.push('/login');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: language === 'ms' ? 'Papan Pemuka' : 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      href: '/documents',
      label: language === 'ms' ? 'Dokumen Saya' : 'My Documents',
      badge: documents?.length ? String(documents.length) : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      href: '/documents/upload',
      label: language === 'ms' ? 'Muat Naik Dokumen' : 'Upload Document',
      highlight: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
    {
      href: '/assistant',
      label: language === 'ms' ? 'Pembantu AI' : 'Recovery Assistant',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      href: '/plan',
      label: language === 'ms' ? 'Pelan Pemulihan' : 'Recovery Plan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/resources',
      label: language === 'ms' ? 'Direktori Agensi' : 'Resources',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: '/settings',
      label: language === 'ms' ? 'Tetapan' : 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/documents') return pathname === '/documents';
    return pathname.startsWith(href);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-white/[0.08] text-slate-100 select-none">
      
      {/* Brand & Logo Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08]">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center space-x-2.5 group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-indigo-600/20 border border-blue-500/40 shadow-md shadow-blue-500/15">
            <svg
              className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors"
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
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              DocuRecover
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Case Details Pill (if disaster case exists) */}
      {recoveryCase && (
        <div className="mx-4 mt-4 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center space-x-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
              {language === 'ms' ? 'Kes Bencana Aktif' : 'Active Disaster Case'}
            </p>
            <p className="text-xs font-semibold text-slate-200 truncate capitalize">
              {recoveryCase.disasterType} • {recoveryCase.location}
            </p>
          </div>
        </div>
      )}

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                active
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500 shadow-sm shadow-blue-500/10 pl-2'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-4 border-transparent pl-2'
              }`}
            >
              <span className={`mr-3 transition-colors ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: User Card + Language Toggle + Sign Out */}
      <div className="p-4 border-t border-white/[0.08] space-y-3 bg-[#0A0E1A]/40">
        
        {/* Language Toggle Row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-400 font-medium">
            {language === 'ms' ? 'Bahasa' : 'Language'}
          </span>
          <LanguageToggle size="sm" />
        </div>

        {/* User Profile Card */}
        {user ? (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-1 ring-blue-400/40 shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              id="sidebar-signout-btn"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title={language === 'ms' ? 'Log Keluar' : 'Sign Out'}
              aria-label="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <Link
              href="/login"
              onClick={onMobileClose}
              className="w-full text-center py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 transition-colors"
            >
              {language === 'ms' ? 'Log Masuk' : 'Sign In'}
            </Link>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed/Static Sidebar: width 256px */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer Content */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
