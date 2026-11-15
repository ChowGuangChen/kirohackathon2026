'use client';

import React from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import { useLanguage } from '@/app/_lib/useLanguage';
import { DOCUMENT_CATEGORIES } from '@/app/_lib/documents';

const STEPS = [
  { icon: '📝', titleEn: 'Register Info', titleMs: 'Daftar Maklumat', descEn: 'Name, IC, phone, address, email', descMs: 'Nama, IC, telefon, alamat, emel' },
  { icon: '⚠️', titleEn: 'Report Disaster', titleMs: 'Lapor Bencana', descEn: 'Type of disaster & documents lost', descMs: 'Jenis bencana & dokumen hilang' },
  { icon: '🪪', titleEn: 'Verify Identity', titleMs: 'Sahkan Identiti', descEn: 'Photo document & live face match', descMs: 'Dokumen bergambar & padanan wajah' },
  { icon: '✓', titleEn: 'Confirm', titleMs: 'Sahkan', descEn: 'Review and submit your request', descMs: 'Semak dan hantar permohonan' },
  { icon: '📦', titleEn: 'Track Delivery', titleMs: 'Jejak Penghantaran', descEn: 'Follow progress for up to 14 days', descMs: 'Pantau kemajuan sehingga 14 hari' },
];

export default function HomePage() {
  const { isMs, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-milk text-stone-900">
      <SiteHeader isMs={isMs} onToggleLanguage={toggleLanguage}>
        <Link
          href="/track"
          className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          {isMs ? 'Jejak Status' : 'Track Status'}
        </Link>
      </SiteHeader>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-800 text-xs font-semibold mb-6">
            <span>🇲🇾</span>
            <span>{isMs ? 'Pemulihan Dokumen Bencana Malaysia' : 'Malaysia Disaster Document Recovery'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 leading-tight">
            {isMs ? 'Pulihkan Dokumen Yang Hilang' : 'Recover Lost or Damaged'}
            <br />
            <span className="text-lime-600">
              {isMs ? 'Atau Rosak Selepas Bencana' : 'Documents After Disaster'}
            </span>
          </h1>

          <p className="text-lg text-stone-600 mb-8">
            {isMs
              ? 'Proses 5 langkah mudah untuk memulihkan MyKad, Pasport, Sijil Kelahiran, Lesen Memandu dan dokumen penting lain'
              : 'A simple 5-step process to recover your MyKad, Passport, Birth Certificate, Driving Licence and other important documents'}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500 text-lime-950 text-sm font-bold mb-8">
            <span>✓</span>
            <span>
              {isMs
                ? 'PERCUMA untuk mangsa bencana. Tiada yuran permohonan (RM 0.00)'
                : 'FREE for disaster victims. No application fee (RM 0.00)'}
            </span>
          </div>

          <div>
          <Link
            href="/recover"
            className="inline-flex items-center px-8 py-4 rounded-xl text-base font-semibold text-lime-950 bg-lime-500 hover:bg-lime-400 shadow-md shadow-lime-500/30 transition-colors"
          >
            {isMs ? 'Mula Proses Pemulihan' : 'Start Recovery Process'}
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-milk-dark">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">
            {isMs ? 'Bagaimana Ia Berfungsi' : 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {STEPS.map((item, i) => (
              <div key={item.titleEn} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-lime-700 mb-2">
                  {isMs ? 'Langkah' : 'Step'} {i + 1}
                </div>
                <h3 className="text-base font-semibold text-stone-900 mb-1">{isMs ? item.titleMs : item.titleEn}</h3>
                <p className="text-xs text-stone-600">{isMs ? item.descMs : item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-4">
            {isMs ? 'Dokumen Yang Disokong' : 'Supported Documents'}
          </h2>
          <p className="text-center text-stone-600 text-sm mb-12 max-w-2xl mx-auto">
            {isMs
              ? 'Pemulihan untuk dokumen pengenalan, hartanah, pendidikan dan kewangan yang penting di Malaysia'
              : 'Recovery for essential Malaysian identity, property, education and financial documents'}
          </p>

          {DOCUMENT_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-10 last:mb-0">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {isMs ? category.ms : category.en}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {category.documents.map((doc) => (
                  <div
                    key={doc.value}
                    className="p-5 rounded-xl bg-white border border-stone-200 hover:border-lime-400 transition-colors"
                  >
                    <div className="text-3xl mb-2">{doc.icon}</div>
                    <h4 className="text-sm font-semibold text-stone-900 mb-1">{isMs ? doc.ms : doc.en}</h4>
                    <p className="text-xs text-stone-500">{isMs ? doc.agencyMs : doc.agencyEn}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl bg-lime-100 border border-lime-300">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            {isMs ? 'Sedia Untuk Memulihkan Dokumen Anda?' : 'Ready to Recover Your Documents?'}
          </h2>
          <p className="text-sm text-stone-700 mb-6">
            {isMs
              ? 'Tiada pendaftaran akaun diperlukan. Mulakan proses pemulihan sekarang.'
              : 'No account needed. Start your recovery process right away.'}
          </p>
          <Link
            href="/recover"
            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-lime-950 bg-lime-500 hover:bg-lime-400 transition-colors"
          >
            {isMs ? 'Mula Sekarang' : 'Start Now'}
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-stone-200">
        <div className="max-w-5xl mx-auto text-center text-sm text-stone-500">
          <p>DocuRecover • {isMs ? 'Inisiatif Bantuan Bencana Malaysia' : 'Malaysia Disaster Relief Initiative'}</p>
        </div>
      </footer>
    </div>
  );
}
