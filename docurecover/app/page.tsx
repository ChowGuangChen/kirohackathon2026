'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100">
      
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">DocuRecover</span>
          </div>
          <Link
            href="/track"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Track Status
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6">
            <span>🇲🇾</span>
            <span>Malaysia Disaster Document Recovery</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Recover Lost or Damaged<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Documents After Disaster
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-8">
            Simple 5-step process to recover your MyKad, Passport, Birth Certificate, and Driving License
          </p>

          <Link
            href="/recover"
            className="inline-flex items-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all"
          >
            Start Recovery Process
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '1',
                title: 'Register Info',
                desc: 'Name, IC, phone, address, email',
                icon: '📝'
              },
              {
                step: '2',
                title: 'Report Disaster',
                desc: 'Type of disaster & documents lost',
                icon: '⚠️'
              },
              {
                step: '3',
                title: 'Upload Proof',
                desc: 'Photo evidence & face verification',
                icon: '📸'
              },
              {
                step: '4',
                title: 'Confirmation',
                desc: 'System retrieves & confirms records',
                icon: '✓'
              },
              {
                step: '5',
                title: 'Track Delivery',
                desc: '14-day tracking of new documents',
                icon: '📦'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-blue-400 mb-2">Step {item.step}</div>
                <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Supported Documents</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: '🪪', name: 'MyKad', agency: 'JPN' },
              { icon: '🛂', name: 'Passport', agency: 'Immigration' },
              { icon: '📜', name: 'Birth Certificate', agency: 'JPN' },
              { icon: '🚗', name: 'Driving License', agency: 'JPJ' }
            ].map((doc) => (
              <div key={doc.name} className="p-6 rounded-xl bg-[#111827] border border-white/10 hover:border-blue-500/40 transition-all">
                <div className="text-4xl mb-3">{doc.icon}</div>
                <h3 className="text-base font-semibold text-white mb-1">{doc.name}</h3>
                <p className="text-xs text-slate-400">{doc.agency}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Recover Your Documents?</h2>
          <p className="text-sm text-slate-300 mb-6">No signup required. Start your recovery process immediately.</p>
          <Link
            href="/recover"
            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            Start Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400">
          <p>© 2024 DocuRecover • Malaysia Disaster Relief Initiative</p>
        </div>
      </footer>

    </div>
  );
}
