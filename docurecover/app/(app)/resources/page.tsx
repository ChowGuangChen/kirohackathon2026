'use client';

import React, { useState } from 'react';
import { useApp } from '@/app/_lib/context/AppContext';

type CategoryType = 'all' | 'identity' | 'travel' | 'education' | 'financial' | 'business';

interface AuthorityResource {
  id: string;
  abbreviation: string;
  nameEn: string;
  nameMs: string;
  category: CategoryType;
  categoryLabelEn: string;
  categoryLabelMs: string;
  documents: { en: string[]; ms: string[] };
  website: string;
  phone: string;
  address: string;
  verifiedDate: string;
  accentColor: string; // for border / icon styling
  badgeColor: string;
}

const AUTHORITIES: AuthorityResource[] = [
  {
    id: 'jpn',
    abbreviation: 'JPN',
    nameEn: 'National Registration Department (JPN)',
    nameMs: 'Jabatan Pendaftaran Negara (JPN)',
    category: 'identity',
    categoryLabelEn: 'Identity',
    categoryLabelMs: 'Identiti',
    documents: {
      en: ['MyKad (IC)', 'Birth Certificate', 'Death Certificate', 'Marriage Certificate'],
      ms: ['MyKad (Kad Pengenalan)', 'Sijil Kelahiran', 'Sijil Kematian', 'Sijil Perkahwinan'],
    },
    website: 'https://www.jpn.gov.my',
    phone: '1-300-80-0100',
    address: 'Kompleks Pejabat Kerajaan, Jalan Duta, 50550 Kuala Lumpur',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-blue-600 to-blue-700',
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    id: 'jpj',
    abbreviation: 'JPJ',
    nameEn: 'Road Transport Department (JPJ)',
    nameMs: 'Jabatan Pengangkutan Jalan (JPJ)',
    category: 'identity',
    categoryLabelEn: 'Identity',
    categoryLabelMs: 'Identiti',
    documents: {
      en: ['Driving Licence (LMM)', 'Vehicle Registration (VOC/Geran)', 'Digital Road Tax'],
      ms: ['Lesen Memandu (LMM)', 'Geran Kenderaan (VOC)', 'Cukai Jalan Digital (e-LKM)'],
    },
    website: 'https://www.jpj.gov.my',
    phone: '1-800-88-8664',
    address: 'Jalan Puchong, 47100 Puchong, Selangor',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-blue-600 to-sky-700',
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    id: 'imi',
    abbreviation: 'JIM',
    nameEn: 'Immigration Department of Malaysia',
    nameMs: 'Jabatan Imigresen Malaysia (JIM)',
    category: 'travel',
    categoryLabelEn: 'Travel',
    categoryLabelMs: 'Perjalanan',
    documents: {
      en: ['Malaysian Passport', 'Emergency Travel Document', 'Border Pass'],
      ms: ['Pasport Malaysia', 'Dokumen Perjalanan Kecemasan', 'Pas Sempadan'],
    },
    website: 'https://www.imi.gov.my',
    phone: '03-8000 8000',
    address: 'Blok 2G4, Presint 2, 62550 Putrajaya',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-purple-600 to-purple-800',
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'ssm',
    abbreviation: 'SSM',
    nameEn: 'Companies Commission of Malaysia (SSM)',
    nameMs: 'Suruhanjaya Syarikat Malaysia (SSM)',
    category: 'business',
    categoryLabelEn: 'Business',
    categoryLabelMs: 'Perniagaan',
    documents: {
      en: ['Business Registration Certificate (Borang D)', 'Company Profile', 'Sole Proprietorship Records'],
      ms: ['Sijil Pendaftaran Perniagaan (Borang D)', 'Profil Syarikat', 'Daftar Milikan Tunggal'],
    },
    website: 'https://www.ssm.com.my',
    phone: '03-7721 4000',
    address: 'Menara SSM@Sentral, No 7 Jalan Stesen Sentral 5, 50470 Kuala Lumpur',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-amber-600 to-amber-700',
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  {
    id: 'um',
    abbreviation: 'UM',
    nameEn: 'Universiti Malaya (Example Higher Institution)',
    nameMs: 'Universiti Malaya (Contoh Institusi Pengajian)',
    category: 'education',
    categoryLabelEn: 'Education',
    categoryLabelMs: 'Pendidikan',
    documents: {
      en: ['Degree Certificates', 'Academic Transcripts', 'Graduation Statements'],
      ms: ['Ijazah Sarjana Muda & Pascasiswazah', 'Transkrip Akademik', 'Surat Tamat Pengajian'],
    },
    website: 'https://www.um.edu.my',
    phone: '03-7967 7022',
    address: 'Jalan Universiti, 50603 Kuala Lumpur',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-emerald-600 to-emerald-800',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  {
    id: 'bnm',
    abbreviation: 'BNM',
    nameEn: 'Bank Negara Malaysia (BNMLINK)',
    nameMs: 'Bank Negara Malaysia (BNMLINK)',
    category: 'financial',
    categoryLabelEn: 'Financial',
    categoryLabelMs: 'Kewangan',
    documents: {
      en: ['CCRIS Credit Report Guidance', 'Disaster Insurance Claims Assistance', 'Banking Records Advice'],
      ms: ['Panduan Laporan Kredit CCRIS', 'Bantuan Tuntutan Insurans Bencana', 'Nasihat Rekod Perbankan'],
    },
    website: 'https://www.bnm.gov.my',
    phone: '1-300-88-5465',
    address: 'Jalan Dato Onn, 50480 Kuala Lumpur',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-teal-600 to-teal-800',
    badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  },
  {
    id: 'lhdn',
    abbreviation: 'LHDN',
    nameEn: 'Inland Revenue Board of Malaysia (LHDN)',
    nameMs: 'Lembaga Hasil Dalam Negeri (LHDN)',
    category: 'financial',
    categoryLabelEn: 'Financial',
    categoryLabelMs: 'Kewangan',
    documents: {
      en: ['Tax Assessment Notice (Notice of Assessment)', 'Income Tax Filing Records', 'Disaster Relief Tax Exemption Records'],
      ms: ['Notis Taksiran Cukai', 'Rekod Fail Cukai Pendapatan', 'Resit Pelepasan Cukai Bencana'],
    },
    website: 'https://www.hasil.gov.my',
    phone: '1-800-88-5436',
    address: 'Menara Hasil, Persiaran Rimba Permai, 63000 Cyberjaya',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-teal-600 to-emerald-700',
    badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  },
  {
    id: 'mohe',
    abbreviation: 'MoHE',
    nameEn: 'Ministry of Higher Education (MoHE)',
    nameMs: 'Kementerian Pendidikan Tinggi (KPT)',
    category: 'education',
    categoryLabelEn: 'Education',
    categoryLabelMs: 'Pendidikan',
    documents: {
      en: ['Academic Qualification Verification (e-Verification)', 'PTPTN Loan Recovery Support', 'Public University Records'],
      ms: ['Pengesahan Kelayakan Akademik', 'Bantuan Rekod Pinjaman PTPTN', 'Penyata Rekod IPTA'],
    },
    website: 'https://www.mohe.gov.my',
    phone: '03-8870 6000',
    address: 'No 2 Menara 2, Jalan P5/6, Presint 5, 62200 Putrajaya',
    verifiedDate: 'Nov 2026',
    accentColor: 'from-emerald-600 to-green-800',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
];

export default function ResourcesPage() {
  const { language } = useApp();
  const isMs = language === 'ms';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Category Configuration
  const categories: Array<{ id: CategoryType; labelEn: string; labelMs: string; colorClass: string }> = [
    { id: 'all', labelEn: 'All Authorities', labelMs: 'Semua Agensi', colorClass: 'border-slate-500/30 text-slate-200' },
    { id: 'identity', labelEn: 'Identity', labelMs: 'Identiti', colorClass: 'border-blue-500 text-blue-400 bg-blue-500/10' },
    { id: 'travel', labelEn: 'Travel', labelMs: 'Perjalanan', colorClass: 'border-purple-500 text-purple-400 bg-purple-500/10' },
    { id: 'education', labelEn: 'Education', labelMs: 'Pendidikan', colorClass: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
    { id: 'financial', labelEn: 'Financial', labelMs: 'Kewangan', colorClass: 'border-teal-500 text-teal-400 bg-teal-500/10' },
    { id: 'business', labelEn: 'Business', labelMs: 'Perniagaan', colorClass: 'border-amber-500 text-amber-400 bg-amber-500/10' },
  ];

  // Filter authorities based on search and category
  const filteredAuthorities = AUTHORITIES.filter((auth) => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && auth.category !== selectedCategory) {
      return false;
    }

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const matchesName =
      auth.abbreviation.toLowerCase().includes(q) ||
      auth.nameEn.toLowerCase().includes(q) ||
      auth.nameMs.toLowerCase().includes(q);

    const matchesDocs =
      auth.documents.en.some((d) => d.toLowerCase().includes(q)) ||
      auth.documents.ms.some((d) => d.toLowerCase().includes(q));

    const matchesAddress = auth.address.toLowerCase().includes(q);
    const matchesPhone = auth.phone.includes(q);

    return matchesName || matchesDocs || matchesAddress || matchesPhone;
  });

  // Copy Address Handler
  const handleCopyAddress = (id: string, address: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A0E1A] border border-white/[0.08] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {isMs ? 'Direktori Rasmi Kerajaan Malaysia' : 'Official Malaysian Agency Directory'}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isMs ? 'Direktori Sumber Pemulihan Rasmi' : 'Recovery Resource Directory'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isMs
              ? 'Saluran rasmi agensi kerajaan Malaysia untuk urusan penggantian dokumen hilang atau musnah akibat banjir, kebakaran, dan tanah runtuh.'
              : 'Official Malaysian authorities for document replacement, emergency counters, and disaster penalty waiver applications.'}
          </p>

          {/* Emergency Hotline Alert Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded">
                SOS
              </span>
              <span>{isMs ? 'PDRM / MERS: 999' : 'Police / MERS: 999'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-medium">
              <span>{isMs ? 'Talian NADMA: 03-8870 4800' : 'NADMA Helpline: 03-8870 4800'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
              <span>{isMs ? 'Pusat JPN: 1-300-80-0100' : 'JPN Careline: 1-300-80-0100'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Tabs */}
      <div className="space-y-4">
        {/* Full-width Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isMs
                ? 'Cari nama agensi (JPN, JPJ, JIM), jenis dokumen (MyKad, Pasport, Lesen), atau alamat...'
                : 'Search by authority name (JPN, JPJ, Immigration), document (MyKad, Passport, Licence), or city...'
            }
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? AUTHORITIES.length
                : AUTHORITIES.filter((a) => a.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? `${cat.colorClass} border shadow-md font-bold`
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10'
                }`}
              >
                <span>{isMs ? cat.labelMs : cat.labelEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Authority Cards Grid (2-3 columns) */}
      {filteredAuthorities.length === 0 ? (
        <div className="rounded-2xl bg-[#0F172A]/70 border border-white/10 p-12 text-center space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-base font-bold text-white">
            {isMs ? 'Tiada agensi dijumpai' : 'No authorities found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isMs
              ? 'Tiada keputusan sepadan dengan carian anda. Cuba kata kunci lain seperti "JPN", "Pasport", atau "Lesen".'
              : 'Try searching with different terms such as "JPN", "Passport", or "Licence".'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {isMs ? 'Kosongkan Carian' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((auth) => {
            const isCopied = copiedId === auth.id;
            const docList = isMs ? auth.documents.ms : auth.documents.en;

            return (
              <div
                key={auth.id}
                className="group relative rounded-2xl bg-[#0F172A]/80 border border-white/[0.08] hover:border-blue-500/40 p-5 sm:p-6 flex flex-col justify-between backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300"
              >
                {/* Top Section: Icon / Logo & Verified Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Large Colored Logo Area with Abbreviation */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${auth.accentColor} flex items-center justify-center text-white font-extrabold text-base tracking-wider shadow-lg shadow-black/30 group-hover:scale-105 transition-transform`}
                    >
                      {auth.abbreviation}
                    </div>

                    {/* Verified & Category Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isMs ? `Disahkan: ${auth.verifiedDate}` : `Verified: ${auth.verifiedDate}`}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${auth.badgeColor}`}
                      >
                        {isMs ? auth.categoryLabelMs : auth.categoryLabelEn}
                      </span>
                    </div>
                  </div>

                  {/* Authority Names */}
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {isMs ? auth.nameMs : auth.nameEn}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isMs ? auth.nameEn : auth.nameMs}
                    </p>
                  </div>

                  {/* Documents Handled Badges */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      {isMs ? 'Dokumen Dikendalikan:' : 'Documents Handled:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {docList.map((doc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 group-hover:border-white/20 transition-colors"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info (Phone & Address) */}
                  <div className="space-y-2 text-xs text-slate-300 border-t border-white/[0.06] pt-3 mb-5">
                    {/* Phone Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {isMs ? 'Telefon:' : 'Phone:'}
                      </span>
                      <a
                        href={`tel:${auth.phone.replace(/[^0-9]/g, '')}`}
                        className="font-mono text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                        title={isMs ? 'Hubungi agensi' : 'Call authority'}
                      >
                        {auth.phone}
                      </a>
                    </div>

                    {/* Address with Copy action */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isMs ? 'Lokasi:' : 'Address:'}
                      </span>
                      <span className="text-right text-[11px] text-slate-300 leading-tight">
                        {auth.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-2 flex items-center gap-2">
                  {/* Visit Website Primary Button */}
                  <a
                    href={auth.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all text-center"
                  >
                    <span>{isMs ? 'Layari Portal' : 'Visit Website'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Copy Address Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(auth.id, auth.address)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title={isMs ? 'Salin alamat ke papan keratan' : 'Copy address to clipboard'}
                  >
                    {isCopied ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
