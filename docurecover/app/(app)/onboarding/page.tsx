'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import { DisasterType, DocumentType, DocumentStatus } from '@/app/_lib/types';
import { generateId, getDocumentLabel, getDocumentIcon, getAuthorityName } from '@/app/_lib/utils/documentHelpers';
import { t } from '@/app/_lib/i18n/translations';

interface DocSelection {
  selected: boolean;
  status: 'damaged' | 'lost';
}

const AVAILABLE_DOCUMENTS: DocumentType[] = [
  'mykad',
  'birth-certificate',
  'passport',
  'driving-licence',
  'academic-certificate',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setRecoveryCase, addDocument } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [disasterType, setDisasterType] = useState<DisasterType>('flood');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ location?: string; incidentDate?: string; docs?: string }>({});

  const [docSelections, setDocSelections] = useState<Record<DocumentType, DocSelection>>({
    mykad: { selected: true, status: 'damaged' },
    'birth-certificate': { selected: true, status: 'damaged' },
    passport: { selected: false, status: 'lost' },
    'driving-licence': { selected: false, status: 'damaged' },
    'academic-certificate': { selected: false, status: 'lost' },
  });

  const disasterOptions: {
    type: DisasterType;
    titleEn: string;
    titleMs: string;
    descEn: string;
    descMs: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'flood',
      titleEn: 'Flood (Banjir)',
      titleMs: 'Banjir Kilat / Monsun',
      descEn: 'Monsoon or flash flood causing severe water damage to homes.',
      descMs: 'Banjir kilat atau monsun mengakibatkan kerosakan dokumen akibat air.',
      color: 'from-blue-600/30 to-cyan-500/10 border-blue-500/40',
      icon: (
        <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
    },
    {
      type: 'fire',
      titleEn: 'Fire (Kebakaran)',
      titleMs: 'Kebakaran Rumah / Premis',
      descEn: 'Residential or bushfire resulting in scorched or burnt paperwork.',
      descMs: 'Kebakaran premis kediaman yang memusnahkan dokumen pengenalan diri.',
      color: 'from-amber-600/30 to-red-500/10 border-amber-500/40',
      icon: (
        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343a7.975 7.975 0 012.344 5.657 7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
      ),
    },
    {
      type: 'landslide',
      titleEn: 'Landslide (Tanah Runtuh)',
      titleMs: 'Tanah Runtuh / Gelongsoran',
      descEn: 'Slope collapse or soil erosion burying belongings and documents.',
      descMs: 'Runtuhan tebing atau cerun menimbus barangan peribadi dan rekod.',
      color: 'from-emerald-600/30 to-lime-500/10 border-emerald-500/40',
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      type: 'other',
      titleEn: 'Other Emergency',
      titleMs: 'Bencana / Kecemasan Lain',
      descEn: 'Storms, structural collapses, or sudden emergency evacuations.',
      descMs: 'Ribut taufan, runtuhan struktur, atau pemindahan kecemasan mengejut.',
      color: 'from-purple-600/30 to-pink-500/10 border-purple-500/40',
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      ),
    },
  ];

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    const newErrors: { location?: string; incidentDate?: string } = {};
    if (!location.trim()) {
      newErrors.location = language === 'ms' ? 'Sila nyatakan lokasi kejadian' : 'Please provide the incident location';
    }
    if (!incidentDate) {
      newErrors.incidentDate = language === 'ms' ? 'Sila pilih tarikh kejadian' : 'Please select the incident date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(3);
  };

  const toggleDocSelection = (type: DocumentType) => {
    setDocSelections((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        selected: !prev[type].selected,
      },
    }));
  };

  const setDocStatus = (type: DocumentType, status: 'damaged' | 'lost') => {
    setDocSelections((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        status,
        selected: true, // auto select if changing status
      },
    }));
  };

  const handleQuickSelectAll = (status: 'damaged' | 'lost') => {
    const updated: Record<DocumentType, DocSelection> = { ...docSelections };
    AVAILABLE_DOCUMENTS.forEach((type) => {
      updated[type] = { selected: true, status };
    });
    setDocSelections(updated);
  };

  const handleComplete = async () => {
    const selectedTypes = AVAILABLE_DOCUMENTS.filter((t) => docSelections[t].selected);
    if (selectedTypes.length === 0) {
      setErrors({ docs: language === 'ms' ? 'Sila pilih sekurang-kurangnya satu dokumen' : 'Please select at least one document' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Recovery Case
      const newCase = {
        id: generateId(),
        disasterType,
        incidentDate,
        location: location.trim(),
        createdAt: new Date().toISOString(),
      };
      setRecoveryCase(newCase);

      // 2. Add each document (AppContext automatically generates tasks based on Knowledge Base)
      selectedTypes.forEach((docType) => {
        const docName = getDocumentLabel(docType, language);
        const status: DocumentStatus = docSelections[docType].status;
        const authority = getAuthorityName(docType);

        addDocument({
          name: docName,
          type: docType,
          authority,
          status,
          dateLost: incidentDate,
          recoveryProgress: 0,
          notes: `${language === 'ms' ? 'Dilaporkan semasa pendaftaran bencana' : 'Reported during disaster intake'} (${location})`,
        });
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative w-full max-w-3xl bg-[#0F172A]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-10 transition-all duration-300">
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto mb-4 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-500 -z-0"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 Circle */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                1
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                {language === 'ms' ? 'Jenis Bencana' : 'Disaster'}
              </span>
            </div>

            {/* Step 2 Circle */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 2
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                2
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
                {language === 'ms' ? 'Maklumat Kejadian' : 'Incident Details'}
              </span>
            </div>

            {/* Step 3 Circle */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 3
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                3
              </div>
              <span className={`text-xs mt-2 font-medium ${step === 3 ? 'text-blue-400' : 'text-slate-500'}`}>
                {language === 'ms' ? 'Dokumen Terjejas' : 'Documents'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= STEP 1: SELECT DISASTER TYPE ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'ms' ? 'Apakah Bencana Yang Anda Hadapi?' : 'What Disaster Did You Experience?'}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {language === 'ms'
                  ? 'Kami akan menyesuaikan prosedur rasmi dan hak pengecualian bayaran kerajaan mengikut jenis bencana anda.'
                  : 'We will tailor the official Malaysian replacement procedures and fee waiver criteria accordingly.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {disasterOptions.map((opt) => {
                const isSelected = disasterType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setDisasterType(opt.type)}
                    className={`relative p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-white/5 flex-shrink-0">
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white text-base">
                            {language === 'ms' ? opt.titleMs : opt.titleEn}
                          </h3>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {language === 'ms' ? opt.descMs : opt.descEn}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleNextStep1}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200"
              >
                <span>{language === 'ms' ? 'Seterusnya' : 'Next Step'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: INCIDENT DETAILS ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'ms' ? 'Maklumat Kejadian Bencana' : 'Incident Details'}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {language === 'ms'
                  ? 'Maklumat ini diperlukan untuk laporan polis serta permohonan gantian percuma di JPN, JPJ, dan Imigresen.'
                  : 'Required for official police reports and NADMA disaster fee waiver verifications.'}
              </p>
            </div>

            <div className="space-y-5 max-w-xl mx-auto pt-2">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  {language === 'ms' ? 'Lokasi Kejadian (Bandar / Daerah / Negeri)' : 'Incident Location (City / District / State)'}{' '}
                  <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
                    }}
                    placeholder={
                      language === 'ms' ? 'Contoh: Taman Sri Muda, Shah Alam, Selangor' : 'e.g. Shah Alam, Selangor'
                    }
                    className={`w-full pl-11 pr-4 py-3 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.location
                        ? 'border-rose-500 focus:ring-rose-500/40'
                        : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                  />
                </div>
                {errors.location && <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.location}</p>}
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  {language === 'ms' ? 'Tarikh Kejadian' : 'Date of Incident'} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => {
                      setIncidentDate(e.target.value);
                      if (errors.incidentDate) setErrors((prev) => ({ ...prev, incidentDate: undefined }));
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-900/90 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.incidentDate
                        ? 'border-rose-500 focus:ring-rose-500/40'
                        : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                  />
                </div>
                {errors.incidentDate && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.incidentDate}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{language === 'ms' ? 'Kembali' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep2}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200"
              >
                <span>{language === 'ms' ? 'Seterusnya' : 'Next Step'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SELECT AFFECTED DOCUMENTS ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'ms' ? 'Pilih Dokumen Yang Terjejas' : 'Select Affected Documents'}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {language === 'ms'
                  ? 'Pilih dokumen yang musnah, rosak, atau hilang untuk kami bina senarai semak tindakan pemulihan anda.'
                  : 'Choose the documents damaged or lost so we can generate your prioritized step-by-step checklist.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ms' ? 'Pilihan Pantas:' : 'Quick Select:'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelectAll('damaged')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
                >
                  ⚡ {language === 'ms' ? 'Semua Rosak' : 'All Damaged'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectAll('lost')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all"
                >
                  ⚡ {language === 'ms' ? 'Semua Hilang' : 'All Lost'}
                </button>
              </div>
            </div>

            {errors.docs && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                {errors.docs}
              </div>
            )}

            {/* Document Selection List */}
            <div className="space-y-3">
              {AVAILABLE_DOCUMENTS.map((docType) => {
                const item = docSelections[docType];
                const icon = getDocumentIcon(docType);
                const title = getDocumentLabel(docType, language);
                const authority = getAuthorityName(docType);

                return (
                  <div
                    key={docType}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.selected
                        ? 'bg-slate-900/90 border-blue-500/50 shadow-md shadow-blue-500/5'
                        : 'bg-slate-950/40 border-white/5 opacity-60 hover:opacity-90'
                    }`}
                  >
                    {/* Left: Checkbox + Doc details */}
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                      onClick={() => toggleDocSelection(docType)}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleDocSelection(docType)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-2xl p-1 bg-slate-800/60 rounded-lg">{icon}</span>
                      <div>
                        <h4 className="font-semibold text-white text-sm sm:text-base">{title}</h4>
                        <p className="text-xs text-slate-400">{authority}</p>
                      </div>
                    </div>

                    {/* Right: Status selector toggle */}
                    {item.selected && (
                      <div className="flex items-center gap-2 pl-8 sm:pl-0">
                        <span className="text-xs text-slate-400 mr-1">
                          {language === 'ms' ? 'Status:' : 'Status:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDocStatus(docType, 'damaged')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            item.status === 'damaged'
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {language === 'ms' ? 'Rosak' : 'Damaged'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocStatus(docType, 'lost')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            item.status === 'lost'
                              ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {language === 'ms' ? 'Hilang' : 'Lost'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{language === 'ms' ? 'Kembali' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'ms' ? 'Menjana Pelan...' : 'Generating Recovery Plan...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ms' ? 'Jana Pelan Pemulihan' : 'Generate Recovery Plan'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
