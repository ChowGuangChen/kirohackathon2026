'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import FaceScan, { type FaceScanResult } from './FaceScan';
import { extractDocumentFace, type DocumentFace } from '@/app/_lib/face';
import { useLanguage } from '@/app/_lib/useLanguage';
import {
  DISASTERS,
  DOCUMENT_CATEGORIES,
  getDocument,
  requestStorageKey,
  type DisasterType,
  type DocumentType,
  type StoredRequest,
} from '@/app/_lib/documents';

type RecoverForm = {
  fullName: string;
  icNumber: string;
  phoneNumber: string;
  address: string;
  email: string;
  disasterType: DisasterType | '';
  documentsLost: DocumentType[];
};

const EMPTY_FORM: RecoverForm = {
  fullName: '',
  icNumber: '',
  phoneNumber: '',
  address: '',
  email: '',
  disasterType: '',
  documentsLost: [],
};

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/30 outline-none transition-colors';
const primaryButton =
  'px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-lime-950 font-semibold transition-colors';
const secondaryButton =
  'px-6 py-3 rounded-lg bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed border border-stone-300 text-stone-800 font-semibold transition-colors';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function RecoverPage() {
  const { isMs, toggleLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RecoverForm>(EMPTY_FORM);
  const [trackingId, setTrackingId] = useState('');
  const [docFace, setDocFace] = useState<DocumentFace | null>(null);
  const [docStatus, setDocStatus] = useState<'idle' | 'processing' | 'found' | 'noFace' | 'error'>('idle');
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [faceResult, setFaceResult] = useState<FaceScanResult | null>(null);

  const docUrlRef = useRef<string | null>(null);
  const submittedRef = useRef(false);

  const t = (en: string, ms: string) => (isMs ? ms : en);

  const resetForm = useCallback(() => {
    if (docUrlRef.current) URL.revokeObjectURL(docUrlRef.current);
    docUrlRef.current = null;
    setFormData(EMPTY_FORM);
    setTrackingId('');
    setDocFace(null);
    setDocStatus('idle');
    setFaceResult(null);
    setShowFaceScan(false);
    setIsSubmitting(false);
    setCurrentStep(1);
  }, []);

  useEffect(() => {
    submittedRef.current = currentStep === 5;
    window.scrollTo({ top: 0 });
  }, [currentStep]);

  // Next.js keeps this page's state when navigating away and back. Effects re-run when the
  // page is shown again, so a finished request is cleared instead of reopening on the success screen.
  useEffect(() => {
    if (submittedRef.current) resetForm();
  }, [resetForm]);

  const update = <K extends keyof RecoverForm>(key: K, value: RecoverForm[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const nameValid = formData.fullName.trim().length > 0;
  const icValid = /^\d{12}$/.test(formData.icNumber);
  const phoneValid = /^\d{10,12}$/.test(formData.phoneNumber);
  const addressValid = formData.address.trim().length > 0;
  const emailValid = isValidEmail(formData.email);
  const step1Valid = nameValid && icValid && phoneValid && addressValid && emailValid;
  const step2Valid = formData.disasterType !== '' && formData.documentsLost.length > 0;
  const faceVerified = faceResult?.matched === true;

  const toggleDocument = (doc: DocumentType) =>
    setFormData((prev) => ({
      ...prev,
      documentsLost: prev.documentsLost.includes(doc)
        ? prev.documentsLost.filter((d) => d !== doc)
        : [...prev.documentsLost, doc],
    }));

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (docUrlRef.current) URL.revokeObjectURL(docUrlRef.current);
    docUrlRef.current = null;
    setDocFace(null);
    setFaceResult(null);
    setDocStatus('processing');

    try {
      const face = await extractDocumentFace(file);
      if (!face) {
        setDocStatus('noFace');
        return;
      }
      docUrlRef.current = face.previewUrl;
      setDocFace(face);
      setDocStatus('found');
    } catch {
      setDocStatus('error');
    }
  };

  const handleFaceScanComplete = (result: FaceScanResult) => {
    setFaceResult(result);
    setShowFaceScan(false);
  };

  const handleSubmit = () => {
    if (formData.disasterType === '') return;
    setIsSubmitting(true);
    const request: StoredRequest = {
      trackingId: `DR${Date.now().toString(36).toUpperCase()}`,
      submissionDate: new Date().toISOString(),
      fullName: formData.fullName.trim(),
      icNumber: formData.icNumber,
      phoneNumber: formData.phoneNumber,
      email: formData.email.trim(),
      address: formData.address.trim(),
      disasterType: formData.disasterType,
      documentsLost: formData.documentsLost,
    };

    setTimeout(() => {
      try {
        localStorage.setItem(requestStorageKey(request.trackingId), JSON.stringify(request));
      } catch {
        // Storage can be unavailable (private mode or full). The tracking ID is still shown.
      }
      setTrackingId(request.trackingId);
      setIsSubmitting(false);
      setCurrentStep(5);
    }, 2000);
  };

  const stepLabels = [
    t('Register', 'Daftar'),
    t('Report', 'Lapor'),
    t('Verify', 'Sahkan ID'),
    t('Confirm', 'Sahkan'),
    t('Track', 'Jejak'),
  ];

  const disaster = DISASTERS.find((d) => d.value === formData.disasterType);

  return (
    <div className="min-h-screen bg-milk text-stone-900">
      <SiteHeader isMs={isMs} onToggleLanguage={toggleLanguage}>
        <span className="text-sm text-stone-500 whitespace-nowrap">
          {t('Step', 'Langkah')} {currentStep} {t('of', 'daripada')} 5
        </span>
      </SiteHeader>

      <div className="fixed top-16 left-0 right-0 z-40 bg-milk/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step < currentStep
                      ? 'bg-lime-500 text-lime-950'
                      : step === currentStep
                      ? 'bg-lime-500 text-lime-950 ring-4 ring-lime-500/30'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded ${step < currentStep ? 'bg-lime-500' : 'bg-stone-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-[11px] sm:text-xs text-stone-500 mt-2">
            {stepLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-40 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  {t('Register Your Information', 'Daftarkan Maklumat Anda')}
                </h2>
                <p className="text-sm text-stone-600">
                  {t('We need your details to process your document recovery', 'Kami perlukan butiran anda untuk memproses pemulihan dokumen')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('Full Name (as per IC)', 'Nama Penuh (seperti dalam IC)')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => update('fullName', e.target.value.replace(/[^\p{L}\s]/gu, ''))}
                    className={inputClass}
                    placeholder="Ahmad bin Abdullah"
                  />
                  <p className="mt-1 text-xs text-red-600">{t('Mandatory. Letters only.', 'Wajib. Huruf sahaja.')}</p>
                </div>

                <div>
                  <label htmlFor="icNumber" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('IC Number', 'Nombor IC')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="icNumber"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={formData.icNumber}
                    onChange={(e) => update('icNumber', e.target.value.replace(/\D/g, ''))}
                    className={inputClass}
                    placeholder="900101011234"
                  />
                  <p className="mt-1 text-xs text-red-600">
                    {t('Mandatory. 12 digits, numbers 0-9 only, no dashes.', 'Wajib. 12 digit, nombor 0-9 sahaja, tanpa sengkang.')}
                  </p>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('Phone Number', 'Nombor Telefon')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={12}
                    value={formData.phoneNumber}
                    onChange={(e) => update('phoneNumber', e.target.value.replace(/\D/g, ''))}
                    className={inputClass}
                    placeholder="0123456789"
                  />
                  <p className="mt-1 text-xs text-red-600">
                    {t('Mandatory. 10-12 digits, numbers 0-9 only.', 'Wajib. 10-12 digit, nombor 0-9 sahaja.')}
                  </p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('Address', 'Alamat')} <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(e) => update('address', e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="123, Jalan Merdeka, 50000 Kuala Lumpur"
                  />
                  <p className="mt-1 text-xs text-red-600">{t('Mandatory.', 'Wajib.')}</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('Email Address', 'Alamat Emel')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                    placeholder="ahmad@example.com"
                  />
                  <p className="mt-1 text-xs text-red-600">
                    {t('Mandatory. Must be a valid email address.', 'Wajib. Mestilah alamat emel yang sah.')}
                  </p>
                </div>
              </div>

              <button onClick={() => setCurrentStep(2)} disabled={!step1Valid} className={`w-full ${primaryButton}`}>
                {t('Continue to Report Disaster', 'Teruskan ke Laporan Bencana')}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  {t('Report Disaster & Documents', 'Lapor Bencana & Dokumen')}
                </h2>
                <p className="text-sm text-stone-600">
                  {t('Tell us what happened and which documents you need to recover', 'Beritahu kami apa yang berlaku dan dokumen yang perlu dipulihkan')}
                </p>
              </div>

              <div>
                <div className="block text-sm font-medium text-stone-700 mb-3">
                  {t('Type of Disaster', 'Jenis Bencana')} <span className="text-red-600">*</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DISASTERS.map((d) => {
                    const selected = formData.disasterType === d.value;
                    return (
                      <button
                        key={d.value}
                        onClick={() => update('disasterType', d.value)}
                        aria-pressed={selected}
                        className={`p-4 rounded-lg border transition-colors ${
                          selected
                            ? 'bg-lime-50 border-lime-500 text-stone-900'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{d.icon}</div>
                        <div className="text-sm font-medium">{isMs ? d.ms : d.en}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-stone-700 mb-3">
                  {t('Documents Lost or Damaged (select all that apply)', 'Dokumen Hilang atau Rosak (pilih semua yang berkenaan)')}{' '}
                  <span className="text-red-600">*</span>
                </div>

                {DOCUMENT_CATEGORIES.map((category) => (
                  <div key={category.id} className="mb-4 last:mb-0">
                    <div className="text-xs font-semibold text-lime-700 mb-2 uppercase tracking-wider">
                      {isMs ? category.ms : category.en}
                    </div>
                    <div className="space-y-2">
                      {category.documents.map((doc) => {
                        const selected = formData.documentsLost.includes(doc.value);
                        return (
                          <button
                            key={doc.value}
                            onClick={() => toggleDocument(doc.value)}
                            aria-pressed={selected}
                            className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                              selected ? 'bg-lime-50 border-lime-500' : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="text-xl">{doc.icon}</div>
                            <div className="flex-1 text-sm font-medium text-stone-900">{isMs ? doc.ms : doc.en}</div>
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                                selected ? 'bg-lime-500 border-lime-500 text-lime-950' : 'border-stone-300'
                              }`}
                            >
                              {selected ? '✓' : ''}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(1)} className={secondaryButton}>
                  {t('Back', 'Kembali')}
                </button>
                <button onClick={() => setCurrentStep(3)} disabled={!step2Valid} className={`flex-1 ${primaryButton}`}>
                  {t('Continue to Verification', 'Teruskan ke Pengesahan Identiti')}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  {t('Upload Proof & Verify Your Face', 'Muat Naik Bukti & Sahkan Wajah')}
                </h2>
                <p className="text-sm text-stone-600">
                  {t(
                    'Upload a document that shows your face photo, then scan your face so we can compare them',
                    'Muat naik dokumen yang mempunyai gambar wajah anda, kemudian imbas wajah anda untuk dibandingkan'
                  )}
                </p>
              </div>

              <div>
                <div className="block text-sm font-medium text-stone-700 mb-1">
                  {t('1. Document With Your Face Photo', '1. Dokumen Dengan Gambar Wajah')} <span className="text-red-600">*</span>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  {t(
                    'For example MyKad, passport, driving licence or OKU card. A damaged copy is fine if the face is still clear.',
                    'Contoh: MyKad, pasport, lesen memandu atau kad OKU. Gambar rosak juga boleh jika wajah masih jelas.'
                  )}
                </p>
                <div className="border-2 border-dashed border-stone-300 bg-white rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDocumentUpload}
                    disabled={docStatus === 'processing'}
                    className="hidden"
                    id="proof-upload"
                  />

                  {docStatus === 'processing' ? (
                    <div className="py-4">
                      <div className="w-8 h-8 mx-auto mb-3 border-4 border-stone-200 border-t-lime-500 rounded-full animate-spin" />
                      <div className="text-sm text-stone-600">
                        {t('Looking for a face on the document...', 'Mencari wajah pada dokumen...')}
                      </div>
                    </div>
                  ) : docFace ? (
                    <div className="flex items-center gap-4 text-left">
                      <img src={docFace.previewUrl} alt="" className="w-28 h-20 object-cover rounded-lg border border-stone-200" />
                      <img src={docFace.faceImage} alt="" className="w-16 h-20 object-cover rounded-lg border-2 border-lime-500" />
                      <div className="flex-1">
                        <div className="text-sm text-lime-700 font-medium">
                          ✓ {t('Face found on document', 'Wajah dikesan pada dokumen')}
                        </div>
                        <label htmlFor="proof-upload" className="text-xs font-medium text-lime-700 hover:text-lime-800 underline cursor-pointer">
                          {t('Change document', 'Tukar dokumen')}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="proof-upload" className="cursor-pointer block">
                      <div className="text-4xl mb-2">🪪</div>
                      <div className="text-sm font-medium text-stone-900 mb-1">
                        {t('Click to upload a photo of the document', 'Klik untuk muat naik gambar dokumen')}
                      </div>
                      <div className="text-xs text-stone-500">PNG, JPG</div>
                      {docStatus === 'noFace' && (
                        <div className="mt-3 text-xs text-red-600">
                          {t(
                            'No face found. Upload a clearer photo where the face picture is visible.',
                            'Tiada wajah dikesan. Muat naik gambar yang lebih jelas di mana gambar wajah kelihatan.'
                          )}
                        </div>
                      )}
                      {docStatus === 'error' && (
                        <div className="mt-3 text-xs text-red-600">
                          {t(
                            'The face scanner failed to load. Check your connection and try again.',
                            'Pengimbas wajah gagal dimuatkan. Semak sambungan anda dan cuba lagi.'
                          )}
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-stone-700 mb-1">
                  {t('2. Face Verification', '2. Pengesahan Wajah')} <span className="text-red-600">*</span>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  {t(
                    'You will be asked to turn your head left and right, then the screen will flash red, green and blue.',
                    'Anda akan diminta memusingkan kepala ke kiri dan kanan, kemudian skrin akan berkelip merah, hijau dan biru.'
                  )}
                </p>
                <div className="border-2 border-dashed border-stone-300 bg-white rounded-lg p-6 text-center">
                  {faceResult && docFace ? (
                    <div className="flex items-center gap-4 text-left">
                      <img src={docFace.faceImage} alt="" className="w-16 h-20 object-cover rounded-lg border border-stone-200" />
                      <span className="text-stone-400">⇄</span>
                      <img src={faceResult.selfie} alt="" className="w-16 h-20 object-cover rounded-lg border border-stone-200" />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${faceResult.matched ? 'text-lime-700' : 'text-red-600'}`}>
                          {faceResult.matched
                            ? `✓ ${t('Face matched', 'Wajah sepadan')} (${faceResult.similarity}%)`
                            : `✗ ${t('No match', 'Tidak sepadan')} (${faceResult.similarity}%)`}
                        </div>
                        {!faceResult.matched && (
                          <button onClick={() => setShowFaceScan(true)} className="text-xs font-medium text-lime-700 hover:text-lime-800 underline">
                            {t('Scan again', 'Imbas semula')}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-xs text-stone-500 mb-4">
                        {docFace
                          ? t('Your browser will ask for camera permission', 'Pelayar akan meminta kebenaran kamera')
                          : t('Upload your document first', 'Muat naik dokumen dahulu')}
                      </div>
                      <button
                        onClick={() => setShowFaceScan(true)}
                        disabled={!docFace}
                        className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-lime-950 text-sm font-semibold transition-colors"
                      >
                        {t('Start Face Scan', 'Mula Imbasan Wajah')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showFaceScan && docFace && (
                <FaceScan
                  isMs={isMs}
                  referenceDescriptor={docFace.descriptor}
                  referenceImage={docFace.faceImage}
                  onComplete={handleFaceScanComplete}
                  onClose={() => setShowFaceScan(false)}
                />
              )}

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(2)} className={secondaryButton}>
                  {t('Back', 'Kembali')}
                </button>
                <button onClick={() => setCurrentStep(4)} disabled={!docFace || !faceVerified} className={`flex-1 ${primaryButton}`}>
                  {t('Continue to Confirmation', 'Teruskan ke Pengesahan')}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">{t('Review & Confirm', 'Semak & Sahkan')}</h2>
                <p className="text-sm text-stone-600">
                  {t('Please review your information before submitting', 'Sila semak maklumat anda sebelum menghantar')}
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
                <div>
                  <div className="text-xs text-stone-500 mb-1">{t('Personal Information', 'Maklumat Peribadi')}</div>
                  <div className="text-sm text-stone-900 font-medium">{formData.fullName}</div>
                  <div className="text-sm text-stone-700">{formData.icNumber}</div>
                  <div className="text-sm text-stone-700">{formData.phoneNumber}</div>
                  <div className="text-sm text-stone-700">{formData.email}</div>
                  <div className="text-sm text-stone-700 whitespace-pre-line">{formData.address}</div>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <div className="text-xs text-stone-500 mb-1">{t('Disaster Type', 'Jenis Bencana')}</div>
                  <div className="text-sm text-stone-900 font-medium">
                    {disaster ? `${disaster.icon} ${isMs ? disaster.ms : disaster.en}` : '-'}
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <div className="text-xs text-stone-500 mb-2">{t('Documents to Recover', 'Dokumen untuk Dipulihkan')}</div>
                  <div className="space-y-1">
                    {formData.documentsLost.map((value) => {
                      const doc = getDocument(value);
                      return (
                        <div key={value} className="text-sm text-stone-900">
                          • {doc ? (isMs ? doc.ms : doc.en) : value}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">{t('Photo Document Uploaded', 'Dokumen Bergambar Dimuat Naik')}</span>
                    <span className="text-lime-700 font-medium">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-stone-600">{t('Face Matches Document', 'Wajah Sepadan Dengan Dokumen')}</span>
                    <span className="text-lime-700 font-medium">✓ {faceResult?.similarity}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 flex items-start gap-2">
                <div className="mt-0.5">ℹ️</div>
                <div className="text-xs text-stone-700">
                  {t(
                    'By submitting, you authorise government agencies (JPN, JPJ, Immigration) to retrieve your existing records and process your document recovery request.',
                    'Dengan menghantar, anda memberi kuasa kepada agensi kerajaan (JPN, JPJ, Imigresen) untuk mendapatkan rekod sedia ada anda dan memproses permohonan pemulihan dokumen anda.'
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(3)} disabled={isSubmitting} className={secondaryButton}>
                  {t('Back', 'Kembali')}
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className={`flex-1 ${primaryButton}`}>
                  {isSubmitting ? t('Processing...', 'Memproses...') : t('Confirm & Submit', 'Sahkan & Hantar')}
                </button>
              </div>

              {isSubmitting && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-stone-200 shadow-xl">
                    <div className="text-center mb-6">
                      <div className="w-10 h-10 mx-auto mb-4 border-4 border-stone-200 border-t-lime-500 rounded-full animate-spin" />
                      <h3 className="text-xl font-bold text-stone-900 mb-2">{t('Submitting Request', 'Menghantar Permohonan')}</h3>
                      <p className="text-sm text-stone-600">{t('Please wait a moment...', 'Sila tunggu sebentar...')}</p>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-lime-500 rounded-full animate-[fill-bar_2s_linear_forwards]" />
                    </div>
                    <div className="mt-4 text-xs text-stone-500 text-center">
                      {t('Connecting to government database...', 'Menyambung ke pangkalan data kerajaan...')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-lime-500 flex items-center justify-center text-3xl text-lime-950">✓</div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  {t('Request Submitted Successfully!', 'Permohonan Berjaya Dihantar!')}
                </h2>
                <p className="text-sm text-stone-600">
                  {t('Your document recovery request has been received', 'Permohonan pemulihan dokumen anda telah diterima')}
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-lg p-6">
                <div className="text-xs text-stone-500 mb-2">{t('Your Tracking ID', 'ID Penjejakan Anda')}</div>
                <div className="text-2xl font-bold text-lime-700 font-mono mb-4 break-all">{trackingId}</div>
                <div className="text-xs text-stone-500">
                  {t('Save this ID to track your request status', 'Simpan ID ini untuk menjejak status permohonan anda')}
                </div>
              </div>

              <div className="text-left bg-lime-50 border border-lime-200 rounded-lg p-6 space-y-3">
                <div className="font-semibold text-stone-900 mb-3">{t('What happens next?', 'Apa yang berlaku seterusnya?')}</div>
                {[
                  t('Government agencies verify your existing records (1-2 days)', 'Agensi kerajaan mengesahkan rekod sedia ada anda (1-2 hari)'),
                  t('Processing and approval of new documents (3-5 days)', 'Pemprosesan dan kelulusan dokumen baharu (3-5 hari)'),
                  t('Printing and quality check (2-3 days)', 'Pencetakan dan pemeriksaan kualiti (2-3 hari)'),
                  t('Delivery to your address (2-4 days)', 'Penghantaran ke alamat anda (2-4 hari)'),
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="text-lime-700 font-bold">{i + 1}.</div>
                    <div className="text-stone-700">{line}</div>
                  </div>
                ))}
                <div className="pt-3 border-t border-lime-200 text-xs text-stone-600">
                  {t('Total estimated time: 8-14 days', 'Jumlah anggaran masa: 8-14 hari')}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href={`/track?id=${trackingId}`} className={`w-full text-center ${primaryButton}`}>
                  {t('Track Status', 'Jejak Status')}
                </Link>
                <button onClick={resetForm} className={`w-full ${secondaryButton}`}>
                  {t('Submit Another Request', 'Hantar Permohonan Lain')}
                </button>
                <Link href="/" className="w-full text-center px-6 py-3 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-semibold transition-colors">
                  {t('Back to Home', 'Kembali ke Laman Utama')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
