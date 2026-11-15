'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/app/_lib/context/AppContext';
import LanguageToggle from '@/app/_components/LanguageToggle';

export default function LandingPage() {
  const { language, user } = useApp();
  const isMs = language === 'ms';

  const documentsList = [
    {
      id: 'mykad',
      icon: '🪪',
      nameEn: 'MyKad (Identity Card)',
      nameMs: 'MyKad (Kad Pengenalan)',
      authorityEn: 'National Registration Dept (JPN)',
      authorityMs: 'Jabatan Pendaftaran Negara (JPN)',
      waiverEn: '100% fee waiver for flood victims',
      waiverMs: 'Pengecualian fi 100% mangsa bencana',
    },
    {
      id: 'birth-certificate',
      icon: '📜',
      nameEn: 'Birth Certificate',
      nameMs: 'Sijil Kelahiran',
      authorityEn: 'National Registration Dept (JPN)',
      authorityMs: 'Jabatan Pendaftaran Negara (JPN)',
      waiverEn: 'Free replacement with police report',
      waiverMs: 'Penggantian percuma bersurat polis',
    },
    {
      id: 'passport',
      icon: '🛂',
      nameEn: 'Malaysian Passport',
      nameMs: 'Pasport Malaysia',
      authorityEn: 'Immigration Dept of Malaysia (JIM)',
      authorityMs: 'Jabatan Imigresen Malaysia (JIM)',
      waiverEn: 'Damaged passport fee concession available',
      waiverMs: 'Konsesi kerosakan bencana disediakan',
    },
    {
      id: 'driving-licence',
      icon: '🚗',
      nameEn: 'Driving Licence (CDL/LDL)',
      nameMs: 'Lesen Memandu (CDL/LDL)',
      authorityEn: 'Road Transport Department (JPJ)',
      authorityMs: 'Jabatan Pengangkutan Jalan (JPJ)',
      waiverEn: 'Free replacement via JPJ/UTC counters',
      waiverMs: 'Gantian percuma di kaunter JPJ/UTC',
    },
    {
      id: 'academic-certificate',
      icon: '🎓',
      nameEn: 'Academic Certificates (SPM/IPT)',
      nameMs: 'Sijil Akademik (SPM / Universiti)',
      authorityEn: 'Examinations Syndicate / Universities',
      authorityMs: 'Lembaga Peperiksaan / Senat IPT',
      waiverEn: 'Official certified true copy processing',
      waiverMs: 'Proses salinan diakui sah rasmi',
    },
  ];

  const steps = [
    {
      step: '01',
      titleEn: 'Upload or Report Damaged Documents',
      titleMs: '1. Muat Naik atau Lapor Dokumen Rosak',
      descEn:
        'Log your lost IDs or take a photo of mud-stained, water-damaged cards. Our system instantly logs your case details.',
      descMs:
        'Daftar dokumen yang hilang atau ambil foto kad yang ditenggelami banjir mahupun terbakar untuk penilaian segera.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      step: '02',
      titleEn: 'AI Identifies & Assesses Damage',
      titleMs: '2. AI Mengimbas & Menilai Kerosakan',
      descEn:
        'Gemini Vision AI checks legibility, microchip integrity, and determines whether an in-person or express JPN counter visit is required.',
      descMs:
        'Model AI Gemini menganalisis kebolehbacaan teks, cip biometrik, serta mengenal pasti prosedur agensi yang tepat.',
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      step: '03',
      titleEn: 'Follow Personalised Recovery Plan',
      titleMs: '3. Ikuti Pelan Tindakan Pemulihan',
      descEn:
        'Receive step-by-step checklists, NADMA fee waiver templates, certified police report formats, and nearby UTC contact details.',
      descMs:
        'Dapatkan senarai semak berserta surat permohonan pengecualian fi NADMA, templat laporan polis, dan direktori UTC terdekat.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const features = [
    {
      titleEn: 'AI Document Identification & Vision',
      titleMs: 'Pengecaman AI & Pemeriksaan Visual',
      descEn:
        'Upload photos of water-soaked, mud-caked, or partially burned documents. Advanced vision AI evaluates chip viability and extracts remaining legible data.',
      descMs:
        'Muat naik foto dokumen yang terendam lumpur atau separuh terbakar. AI menilai integriti cip dan mengekstrak butiran yang masih boleh dibaca.',
      badge: isMs ? 'Dikuasakan AI' : 'AI Powered',
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      titleEn: 'Official Government Recovery Guidance',
      titleMs: 'Panduan Rasmi Agensi Kerajaan',
      descEn:
        'Step-by-step procedures aligned with verified Malaysian circulars from JPN, JPJ, Immigration, and NADMA disaster relief directives.',
      descMs:
        'Arahan langkah demi langkah yang disahkan mengikut pekeliling JPN, JPJ, Jabatan Imigresen, dan garis panduan bantuan bencana NADMA.',
      badge: isMs ? 'Pekeliling Sah' : 'Official Guidelines',
      icon: (
        <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      titleEn: 'Real-Time Progress & Fee Waiver Tracker',
      titleMs: 'Penjejak Kemajuan & Pengecualian Fi',
      descEn:
        'Never miss a police report requirement or fee exemption deadline. Track your replacements from emergency evacuation to receipt of new cards.',
      descMs:
        'Pantau status setiap permohonan, semak syarat pengecualian bayaran bencana, dan lengkapkan senarai semak sehingga menerima dokumen baharu.',
      badge: isMs ? 'Sifar Bayaran' : 'Fee Waiver Eligible',
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-indigo-600/20 border border-blue-500/40 shadow-lg shadow-blue-500/15">
              <svg
                className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors"
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
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                DocuRecover
              </span>
            </div>
          </Link>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Cara Berfungsi' : 'How It Works'}
            </a>
            <a href="#supported-documents" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Dokumen Disokong' : 'Supported IDs'}
            </a>
            <a href="#features" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Ciri-Ciri Khas' : 'Features'}
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            <LanguageToggle />

            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
              >
                {isMs ? 'Ke Papan Pemuka' : 'Go to Dashboard'}
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  id="landing-signin-btn"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {isMs ? 'Log Masuk' : 'Sign In'}
                </Link>
                <Link
                  href="/signup"
                  id="landing-signup-btn"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  {isMs ? 'Mula Percuma' : 'Get Started'}
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Animated Gradient Background and Glow Orbs */}
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 via-[#0A0E1A] to-[#0A0E1A] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-sky-500/15 blur-[100px] rounded-full pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        {/* Small Ambient Particle Dots */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <div className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
          <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mt-6">
          
          {/* Malaysian Disaster Relief Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-sm shadow-blue-500/10 animate-fade-in">
            <span>🇲🇾</span>
            <span>
              {isMs
                ? 'Inisiatif Pemulihan Dokumen Mangsa Bencana Malaysia'
                : 'Malaysia Disaster Relief Document Recovery Initiative'}
            </span>
          </div>

          {/* Main Large Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            {isMs ? 'Pulihkan Dokumen Anda' : 'Recover Your Documents'}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              {isMs ? 'Selepas Bencana Melanda' : 'After Disaster Strikes'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
            {isMs
              ? 'Platform berkuasa AI yang membantu rakyat Malaysia memulihkan MyKad, Sijil Kelahiran, Pasport, dan Lesen Memandu yang hilang atau rosak akibat banjir, kebakaran, dan tanah runtuh.'
              : 'AI-powered platform helping Malaysians recover lost or damaged documents after floods, fires, and landslides with official fee waiver assistance.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-14">
            <Link
              href="/signup"
              id="hero-get-started-btn"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>{isMs ? 'Mula Pemulihan Percuma' : 'Get Started Free'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <a
              href="#how-it-works"
              id="hero-see-works-btn"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>{isMs ? 'Lihat Cara Berfungsi' : 'See How It Works'}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/[0.08] text-left">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{isMs ? 'Pengecualian Fi JPN/JPJ' : 'JPN / JPJ Fee Waivers'}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{isMs ? 'Pemeriksaan AI Gemini' : 'Gemini AI Vision'}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{isMs ? 'Templat Laporan Polis' : 'Police Report Formats'}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{isMs ? '100% Percuma Mangsa Bencana' : '100% Free for Victims'}</span>
            </div>
          </div>

        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-70">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
            {isMs ? 'Tatal ke bawah' : 'Scroll down'}
          </span>
          <svg className="w-4 h-4 text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

      </section>

      {/* Emergency Notice Ribbon */}
      <section className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-blue-900/60 border-y border-blue-500/20 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-blue-200">
          <span className="font-bold text-amber-400">📢 {isMs ? 'Perhatian Mangsa Banjir:' : 'Flood Relief Notice:'}</span>
          <span>
            {isMs
              ? 'Pastikan anda mendapatkan Surat Pengesahan Mangsa Bencana dari PPS atau Pejabat Daerah bagi melayakkan penggantian percuma kad pengenalan.'
              : 'Obtain your Disaster Verification Slip from your evacuation centre (PPS) or District Office for 100% fee waiver at JPN counters.'}
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 block">
            {isMs ? 'Langkah Mudah' : 'Simple 3-Step Process'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isMs ? 'Bagaimana DocuRecover Berfungsi' : 'How DocuRecover Works'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            {isMs
              ? 'Tiga langkah teratur untuk membantu anda mendapatkan semula dokumen rasmi tanpa kekeliruan birokrasi.'
              : 'Three simple steps to regain your legal documents, entitlements, and peace of mind.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-7 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl group"
            >
              {/* Step Number Top Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-2xl font-black text-slate-600 group-hover:text-blue-400 transition-colors">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2.5">
                {isMs ? item.titleMs : item.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {isMs ? item.descMs : item.descEn}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* Supported Documents Section */}
      <section id="supported-documents" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 block">
            {isMs ? 'Liputan Menyeluruh' : 'Supported Identification'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isMs ? 'Dokumen Rasmi Yang Disokong' : 'Supported Malaysian Documents'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            {isMs
              ? 'Prosedur pemulihan bersepadu untuk semua dokumen pengenalan penting warganegara Malaysia.'
              : 'Accurate and up-to-date replacement protocols for essential Malaysian government IDs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {documentsList.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl bg-[#111827]/70 backdrop-blur-md border border-white/10 p-6 hover:border-blue-500/40 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {isMs ? doc.authorityMs.split(' ')[0] : doc.authorityEn.split(' ')[0]}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {isMs ? doc.nameMs : doc.nameEn}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  {isMs ? doc.authorityMs : doc.authorityEn}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] mt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium truncate mr-2">
                  ✓ {isMs ? doc.waiverMs : doc.waiverEn}
                </span>
                <Link
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 font-semibold shrink-0"
                >
                  {isMs ? 'Pulihkan →' : 'Recover →'}
                </Link>
              </div>
            </div>
          ))}

          {/* Additional Resource Card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/20 border border-blue-500/30 p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🏛️</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NADMA / UTC
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {isMs ? 'Lain-lain Dokumen Kerajaan' : 'Other Official Records'}
              </h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {isMs
                  ? 'Geran kenderaan, pasport ekspatriat, sijil nikah, dan rekod tanah melalui panduan agensi bersatu.'
                  : 'Vehicle grants, land titles, and marriage certificates via unified agency directory.'}
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.08] mt-3">
              <Link
                href="/signup"
                className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                <span>{isMs ? 'Daftar Untuk Panduan' : 'Register for Full Directory'}</span>
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
            {isMs ? 'Ciri-Ciri Khas' : 'Core Capabilities'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isMs ? 'Direka Khas Untuk Situasi Bencana' : 'Engineered for Malaysian Disasters'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            {isMs
              ? 'Menggabungkan teknologi penglihatan AI moden dengan data perundangan tempatan untuk memudahkan urusan rakyat.'
              : 'Combining cutting-edge multimodal vision models with local Malaysian regulatory expertise.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gradient-to-b from-[#111827]/90 to-[#0F172A]/90 border border-white/10 p-7 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {isMs ? feat.titleMs : feat.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {isMs ? feat.descMs : feat.descEn}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <Link
                  href="/signup"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
                >
                  <span>{isMs ? 'Ketahui Lebih Lanjut' : 'Explore Feature'}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-blue-900/60 border border-blue-500/30 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {isMs
                ? 'Mulakan Pemulihan Dokumen Anda Hari Ini'
                : 'Start Your Document Recovery Today'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {isMs
                ? 'Tiada sebarang bayaran dikenakan untuk mangsa banjir. Dapatkan senarai semak rasmi dan panduan pengecualian fi dalam masa 2 minit.'
                : 'Completely free for disaster survivors. Generate your personalized step-by-step recovery plan in less than 2 minutes.'}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>{isMs ? 'Cipta Akaun Sekarang' : 'Create Free Account'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#0A0E1A]/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L4 5.5V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V5.5L12 2Z" />
                </svg>
              </div>
              <span className="font-extrabold text-base bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                DocuRecover
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              {isMs
                ? 'Sistem pemulihan dokumen berkuasa AI untuk mangsa banjir dan bencana alam di Malaysia.'
                : 'AI-powered document recovery platform for Malaysian disaster survivors.'}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link href="/resources" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Direktori Agensi' : 'Agency Directory'}
            </Link>
            <Link href="/login" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Log Masuk' : 'Sign In'}
            </Link>
            <Link href="/signup" className="hover:text-blue-400 transition-colors">
              {isMs ? 'Daftar' : 'Sign Up'}
            </Link>
          </div>

          {/* Badges / Credits */}
          <div className="flex flex-col items-center md:items-end text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>for Malaysia 🇲🇾</span>
            </div>
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
              <span>🏆 Built for Kiro Hackathon 2026</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
