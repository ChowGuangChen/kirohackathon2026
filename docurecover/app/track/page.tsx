'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type StatusStep = {
  step: number;
  title: string;
  titleMs: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
};

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ms'>('en');
  const [requestData, setRequestData] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const isMs = language === 'ms';

  // Get current date and calculate dates
  const getCurrentDate = () => new Date();
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-MY', options);
  };
  
  const formatDateShort = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    };
    return date.toLocaleDateString('en-MY', options);
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Get dates from stored request or use current date
  const getRequestDate = () => {
    if (requestData?.submissionDate) {
      return new Date(requestData.submissionDate);
    }
    return getCurrentDate();
  };

  const requestDate = getRequestDate();
  const verificationDate = addDays(requestDate, 1);
  const estimatedDeliveryDate = addDays(requestDate, 14);
  
  const calculateDaysRemaining = () => {
    const today = getCurrentDate();
    const delivery = estimatedDeliveryDate;
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingId(id);
      loadRequestData(id);
    }
  }, [searchParams]);

  const loadRequestData = (id: string) => {
    // Try to load from localStorage
    const storedData = localStorage.getItem(`request_${id}`);
    if (storedData) {
      const data = JSON.parse(storedData);
      setRequestData(data);
      setShowResults(true);
      setNotFound(false);
    } else {
      // Tracking ID not found
      setRequestData(null);
      setShowResults(true);
      setNotFound(true);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId) {
      loadRequestData(trackingId);
    }
  };

  // Status data with actual dates
  const statusSteps: StatusStep[] = [
    {
      step: 1,
      title: 'Request Received',
      titleMs: 'Permohonan Diterima',
      date: formatDate(requestDate),
      status: 'completed'
    },
    {
      step: 2,
      title: 'Verifying Records with Government Database',
      titleMs: 'Mengesahkan Rekod dengan Pangkalan Data Kerajaan',
      date: formatDate(verificationDate),
      status: 'completed'
    },
    {
      step: 3,
      title: 'Processing & Approval',
      titleMs: 'Pemprosesan & Kelulusan',
      date: isMs ? 'Sedang Diproses' : 'In Progress',
      status: 'current'
    },
    {
      step: 4,
      title: 'Document Printing',
      titleMs: 'Pencetakan Dokumen',
      date: isMs ? 'Menunggu' : 'Pending',
      status: 'pending'
    },
    {
      step: 5,
      title: 'Out for Delivery',
      titleMs: 'Dalam Penghantaran',
      date: isMs ? 'Menunggu' : 'Pending',
      status: 'pending'
    }
  ];

  // Get documents from stored request
  const getDocumentsRequested = () => {
    if (!requestData?.documentsLost) {
      return [
        { 
          name: 'MyKad (Identity Card)', 
          nameMs: 'MyKad (Kad Pengenalan)',
          agency: 'JPN', 
          status: 'Processing',
          statusMs: 'Memproses'
        }
      ];
    }

    const docNames: Record<string, { name: string; nameMs: string; agency: string }> = {
      'mykad': { name: 'MyKad (Identity Card)', nameMs: 'MyKad (Kad Pengenalan)', agency: 'JPN' },
      'birth-cert': { name: 'Birth Certificate', nameMs: 'Sijil Kelahiran', agency: 'JPN' },
      'marriage-cert': { name: 'Marriage / Divorce Certificate', nameMs: 'Sijil Perkahwinan / Perceraian', agency: 'JPN' },
      'passport': { name: 'Malaysian Passport', nameMs: 'Pasport Malaysia', agency: 'Immigration' },
      'driving-license': { name: 'Driving License', nameMs: 'Lesen Memandu', agency: 'JPJ' },
      'vehicle-grant': { name: 'Vehicle Ownership Certificate', nameMs: 'Geran Kenderaan', agency: 'JPJ' },
      'land-title': { name: 'Land Title / House Grant', nameMs: 'Geran Tanah / Rumah', agency: 'Land Office' },
      'academic-cert': { name: 'Academic Certificates', nameMs: 'Sijil Akademik', agency: 'Education' },
      'oku-card': { name: 'OKU Card', nameMs: 'Kad OKU', agency: 'JKM' },
      'bank-passbook': { name: 'Bank Passbook', nameMs: 'Buku Bank', agency: 'Bank' },
      'insurance-policy': { name: 'Insurance Policy', nameMs: 'Polisi Insurans', agency: 'Insurance' }
    };

    return requestData.documentsLost.map((doc: string) => ({
      name: docNames[doc]?.name || doc,
      nameMs: docNames[doc]?.nameMs || doc,
      agency: docNames[doc]?.agency || 'N/A',
      status: 'Processing',
      statusMs: 'Memproses'
    }));
  };

  const documentsRequested = getDocumentsRequested();

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">DocuRecover</span>
          </Link>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
            >
              {isMs ? 'EN' : 'BM'}
            </button>
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              {isMs ? 'Utama' : 'Home'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">

          {!showResults ? (
            // Tracking Form
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isMs ? 'Jejak Permohonan Anda' : 'Track Your Request'}
                </h1>
                <p className="text-sm text-slate-400">
                  {isMs 
                    ? 'Masukkan ID penjejakan anda untuk menyemak status pemulihan dokumen'
                    : 'Enter your tracking ID to check the status of your document recovery'}
                </p>
              </div>

              <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'ID Penjejakan' : 'Tracking ID'}
                  </label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white font-mono text-center text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="DRXXXXXXXXXX"
                  />
                  <div className="text-xs text-slate-400 mt-2">
                    {isMs ? 'Format: DR diikuti 10-12 aksara' : 'Format: DR followed by 10-12 characters'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!trackingId}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {isMs ? 'Jejak Status' : 'Track Status'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 mb-2">
                  {isMs ? 'Tiada ID penjejakan?' : "Don't have a tracking ID?"}
                </p>
                <Link href="/recover" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                  {isMs ? 'Mula permohonan pemulihan baharu →' : 'Start a new recovery request →'}
                </Link>
              </div>
            </div>
          ) : notFound ? (
            // Tracking ID Not Found
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">❌</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'ID Penjejakan Tidak Dijumpai' : 'Tracking ID Not Found'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs 
                    ? 'ID penjejakan yang anda masukkan tidak wujud dalam sistem kami'
                    : 'The tracking ID you entered does not exist in our system'}
                </p>
              </div>

              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-amber-400 text-3xl mb-3">💡</div>
                <div className="text-sm text-slate-300 mb-3">
                  {isMs ? 'Sila pastikan:' : 'Please ensure:'}
                </div>
                <div className="text-left text-xs text-slate-400 space-y-2">
                  <div>• {isMs ? 'ID penjejakan anda betul' : 'Your tracking ID is correct'}</div>
                  <div>• {isMs ? 'Format: DR diikuti 10-12 aksara' : 'Format: DR followed by 10-12 characters'}</div>
                  <div>• {isMs ? 'ID penjejakan sensitif huruf besar/kecil' : 'Tracking ID is case-sensitive'}</div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 max-w-md mx-auto">
                <button
                  onClick={() => { setShowResults(false); setNotFound(false); }}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                >
                  {isMs ? 'Cuba Lagi' : 'Try Again'}
                </button>
                <Link
                  href="/recover"
                  className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-center"
                >
                  {isMs ? 'Buat Permohonan Baharu' : 'Make New Request'}
                </Link>
              </div>
            </div>
          ) : (
            // Tracking Results
            <div className="space-y-6">
              
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Status Permohonan' : 'Request Status'}
                </h1>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30">
                  <span className="text-xs text-slate-300">
                    {isMs ? 'ID Penjejakan:' : 'Tracking ID:'}
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-400">{trackingId}</span>
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {isMs ? 'Status Semasa' : 'Current Status'}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {isMs ? 'Pemprosesan & Kelulusan' : 'Processing & Approval'}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center animate-pulse">
                    <div className="text-2xl">⚙️</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {isMs ? 'Anggaran Penghantaran' : 'Estimated Delivery'}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {formatDateShort(estimatedDeliveryDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {isMs ? 'Hari Berbaki' : 'Days Remaining'}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {daysRemaining} {isMs ? 'hari' : 'days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-[#111827] rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-6">
                  {isMs ? 'Garis Masa Kemajuan' : 'Progress Timeline'}
                </h3>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step.status === 'completed' ? 'bg-green-600 text-white' :
                          step.status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-600/30' :
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {step.status === 'completed' ? '✓' : step.step}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-12 mt-2 ${
                            step.status === 'completed' ? 'bg-green-600' : 'bg-slate-800'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className={`text-sm font-semibold ${
                          step.status === 'pending' ? 'text-slate-500' : 'text-white'
                        }`}>
                          {isMs ? step.titleMs : step.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          step.status === 'pending' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {step.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Requested */}
              <div className="bg-[#111827] rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-4">
                  {isMs ? 'Dokumen Dipohon' : 'Documents Requested'}
                </h3>
                <div className="space-y-3">
                  {documentsRequested.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E1A] border border-white/10">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {isMs ? doc.nameMs : doc.name}
                        </div>
                        <div className="text-xs text-slate-400">{doc.agency}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold">
                        {isMs ? doc.statusMs : doc.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-amber-400 mt-0.5">💬</div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {isMs ? 'Perlukan Bantuan?' : 'Need Help?'}
                    </div>
                    <div className="text-xs text-slate-300 mb-3">
                      {isMs 
                        ? 'Jika anda mempunyai pertanyaan mengenai permohonan anda, hubungi agensi yang berkaitan:'
                        : 'If you have any questions about your request, contact the relevant agency:'}
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div>• {isMs ? 'Talian Bantuan JPN' : 'JPN Helpline'}: 1-300-88-1300</div>
                      <div>• {isMs ? 'Talian Bantuan JPJ' : 'JPJ Helpline'}: 03-8000 8000</div>
                      <div>• {isMs ? 'Imigresen' : 'Immigration'}: 03-8880 1000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  {isMs ? 'Jejak Permohonan Lain' : 'Track Another Request'}
                </button>
                <Link
                  href="/recover"
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-center"
                >
                  {isMs ? 'Permohonan Baharu' : 'New Request'}
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
