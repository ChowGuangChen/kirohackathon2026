'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FaceScan, { type FaceScanResult } from './FaceScan';
import { extractDocumentFace, type DocumentFace } from '@/app/_lib/face';

type DisasterType = 'flood' | 'fire' | 'landslide' | 'other';
type DocumentType = 
  | 'mykad' 
  | 'birth-cert' 
  | 'marriage-cert' 
  | 'passport' 
  | 'driving-license' 
  | 'vehicle-grant'
  | 'land-title'
  | 'academic-cert'
  | 'oku-card'
  | 'bank-passbook'
  | 'insurance-policy';

export default function RecoverPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'en' | 'ms'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docFace, setDocFace] = useState<DocumentFace | null>(null);
  const [docStatus, setDocStatus] = useState<'idle' | 'processing' | 'found' | 'noFace' | 'error'>('idle');
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [faceResult, setFaceResult] = useState<FaceScanResult | null>(null);
  const isMs = language === 'ms';
  
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    icNumber: '',
    phoneNumber: '',
    address: '',
    email: '',
    // Step 2
    disasterType: '' as DisasterType | '',
    documentsLost: [] as DocumentType[],
    // Step 3
    proofUploaded: false,
    faceVerified: false,
    // Step 4
    confirmed: false,
    // Step 5
    trackingId: ''
  });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Show loading bar
    setIsSubmitting(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Generate tracking ID
      const trackingId = `DR${Date.now().toString(36).toUpperCase()}`;
      const submissionDate = new Date().toISOString();
      
      // Store the request data in localStorage
      const requestData = {
        trackingId,
        submissionDate,
        fullName: formData.fullName,
        icNumber: formData.icNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        disasterType: formData.disasterType,
        documentsLost: formData.documentsLost,
        status: 'processing',
        currentStep: 3 // Step 3: Processing & Approval
      };
      
      // Save to localStorage
      localStorage.setItem(`request_${trackingId}`, JSON.stringify(requestData));
      
      setFormData({ ...formData, trackingId, confirmed: true });
      setIsSubmitting(false);
      setCurrentStep(5);
    }, 2000); // 2 second loading
  };

  const handleNewRequest = () => {
    // Reset form and start over
    setFormData({
      fullName: '',
      icNumber: '',
      phoneNumber: '',
      address: '',
      email: '',
      disasterType: '',
      documentsLost: [],
      proofUploaded: false,
      faceVerified: false,
      confirmed: false,
      trackingId: ''
    });
    if (docFace) URL.revokeObjectURL(docFace.previewUrl);
    setDocFace(null);
    setDocStatus('idle');
    setFaceResult(null);
    setCurrentStep(1);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (docFace) URL.revokeObjectURL(docFace.previewUrl);
    setDocFace(null);
    setFaceResult(null);
    setFormData((prev) => ({ ...prev, proofUploaded: false, faceVerified: false }));
    setDocStatus('processing');

    try {
      const face = await extractDocumentFace(file);
      if (!face) {
        setDocStatus('noFace');
        return;
      }
      setDocFace(face);
      setDocStatus('found');
      setFormData((prev) => ({ ...prev, proofUploaded: true }));
    } catch {
      setDocStatus('error');
    }
  };

  const handleFaceScanComplete = (result: FaceScanResult) => {
    setFaceResult(result);
    setShowFaceScan(false);
    setFormData((prev) => ({ ...prev, faceVerified: result.matched }));
  };

  const toggleDocument = (doc: DocumentType) => {
    if (formData.documentsLost.includes(doc)) {
      setFormData({
        ...formData,
        documentsLost: formData.documentsLost.filter(d => d !== doc)
      });
    } else {
      setFormData({
        ...formData,
        documentsLost: [...formData.documentsLost, doc]
      });
    }
  };

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
            <span className="text-sm text-slate-400">
              {isMs ? 'Langkah' : 'Step'} {currentStep} {isMs ? 'daripada' : 'of'} 5
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step < currentStep ? 'bg-blue-600 text-white' :
                  step === currentStep ? 'bg-blue-600 text-white ring-4 ring-blue-600/30' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-1 mx-1 ${step < currentStep ? 'bg-blue-600' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{isMs ? 'Daftar' : 'Register'}</span>
            <span>{isMs ? 'Lapor' : 'Report'}</span>
            <span>{isMs ? 'Muat Naik' : 'Upload'}</span>
            <span>{isMs ? 'Sahkan' : 'Confirm'}</span>
            <span>{isMs ? 'Jejak' : 'Track'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-40 pb-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Step 1: Register Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Daftarkan Maklumat Anda' : 'Register Your Information'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs ? 'Kami perlukan butiran anda untuk memproses pemulihan dokumen' : 'We need your details to process your document recovery'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'Nama Penuh (seperti dalam IC)' : 'Full Name (as per IC)'}
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Ahmad bin Abdullah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'Nombor IC' : 'IC Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.icNumber}
                    onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="900101-01-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'Nombor Telefon' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="+60 12-345 6789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'Alamat' : 'Address'}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="123, Jalan Merdeka, 50000 Kuala Lumpur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isMs ? 'Alamat Emel' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="ahmad@example.com"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.fullName || !formData.icNumber || !formData.phoneNumber || !formData.address || !formData.email}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
              >
                {isMs ? 'Teruskan ke Laporan Bencana' : 'Continue to Report Disaster'}
              </button>
            </div>
          )}

          {/* Step 2: Report Disaster & Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Lapor Bencana & Dokumen' : 'Report Disaster & Documents'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs ? 'Beritahu kami apa yang berlaku dan dokumen yang perlu dipulihkan' : 'Tell us what happened and which documents you need to recover'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  {isMs ? 'Jenis Bencana' : 'Type of Disaster'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'flood', labelEn: 'Flood', labelMs: 'Banjir', icon: '🌊' },
                    { value: 'fire', labelEn: 'Fire', labelMs: 'Kebakaran', icon: '🔥' },
                    { value: 'landslide', labelEn: 'Landslide', labelMs: 'Tanah Runtuh', icon: '⛰️' },
                    { value: 'other', labelEn: 'Other', labelMs: 'Lain-lain', icon: '⚠️' }
                  ].map((disaster) => (
                    <button
                      key={disaster.value}
                      onClick={() => setFormData({ ...formData, disasterType: disaster.value as DisasterType })}
                      className={`p-4 rounded-lg border transition-all ${
                        formData.disasterType === disaster.value
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-[#111827] border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{disaster.icon}</div>
                      <div className="text-sm font-medium">{isMs ? disaster.labelMs : disaster.labelEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  {isMs ? 'Dokumen Hilang atau Rosak (Pilih semua yang berkenaan)' : 'Documents Lost or Damaged (Select all that apply)'}
                </label>
                
                {/* Identity & Citizenship */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                    {isMs ? 'Identiti & Kewarganegaraan (JPN)' : 'Identity & Citizenship (JPN)'}
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'mykad', label: 'MyKad (Identity Card / IC)', icon: '🪪' },
                      { value: 'birth-cert', label: 'Birth Certificate (Sijil Kelahiran)', icon: '📜' },
                      { value: 'marriage-cert', label: 'Marriage / Divorce Certificate', icon: '💍' }
                    ].map((doc) => (
                      <button
                        key={doc.value}
                        onClick={() => toggleDocument(doc.value as DocumentType)}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center space-x-3 ${
                          formData.documentsLost.includes(doc.value as DocumentType)
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-[#111827] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl">{doc.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{doc.label}</div>
                        </div>
                        {formData.documentsLost.includes(doc.value as DocumentType) && (
                          <div className="text-blue-400">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel & Transport */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wider">
                    {isMs ? 'Perjalanan & Pengangkutan (Imigresen & JPJ)' : 'Travel & Transport (Immigration & JPJ)'}
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'passport', label: 'Malaysian International Passport', icon: '🛂' },
                      { value: 'driving-license', label: 'Competent Driving Licence (LMM)', icon: '🚗' },
                      { value: 'vehicle-grant', label: 'Vehicle Ownership Certificate (Geran)', icon: '📄' }
                    ].map((doc) => (
                      <button
                        key={doc.value}
                        onClick={() => toggleDocument(doc.value as DocumentType)}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center space-x-3 ${
                          formData.documentsLost.includes(doc.value as DocumentType)
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-[#111827] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl">{doc.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{doc.label}</div>
                        </div>
                        {formData.documentsLost.includes(doc.value as DocumentType) && (
                          <div className="text-blue-400">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property, Education & Finance */}
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                    {isMs ? 'Hartanah, Pendidikan & Kewangan' : 'Property, Education & Finance'}
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'land-title', label: 'Land Title / House Grant (Geran Tanah)', icon: '🏠' },
                      { value: 'academic-cert', label: 'SPM / STPM / University Certificates', icon: '🎓' },
                      { value: 'oku-card', label: 'OKU Card (Persons with Disabilities)', icon: '♿' },
                      { value: 'bank-passbook', label: 'Bank Passbook', icon: '🏦' },
                      { value: 'insurance-policy', label: 'Insurance Policy Summary', icon: '📋' }
                    ].map((doc) => (
                      <button
                        key={doc.value}
                        onClick={() => toggleDocument(doc.value as DocumentType)}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center space-x-3 ${
                          formData.documentsLost.includes(doc.value as DocumentType)
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-[#111827] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl">{doc.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{doc.label}</div>
                        </div>
                        {formData.documentsLost.includes(doc.value as DocumentType) && (
                          <div className="text-blue-400">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  {isMs ? 'Kembali' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.disasterType || formData.documentsLost.length === 0}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {isMs ? 'Teruskan ke Muat Naik Bukti' : 'Continue to Upload Proof'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Proof & Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Muat Naik Bukti & Pengesahan' : 'Upload Proof & Verification'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs
                    ? 'Muat naik dokumen yang mempunyai gambar wajah anda, kemudian imbas wajah anda untuk dibandingkan'
                    : 'Upload a document that shows your face photo, then scan your face so we can compare them'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {isMs ? '1. Dokumen Dengan Gambar Wajah' : '1. Document With Your Face Photo'}
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  {isMs
                    ? 'Contoh: MyKad, pasport, lesen memandu atau kad OKU. Gambar rosak juga boleh jika wajah masih jelas.'
                    : 'For example MyKad, passport, driving licence or OKU card. A damaged copy is fine if the face is still clear.'}
                </p>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-500/50 transition-all">
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
                      <div className="w-8 h-8 mx-auto mb-3 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                      <div className="text-sm text-slate-300">
                        {isMs ? 'Mencari wajah pada dokumen...' : 'Looking for a face on the document...'}
                      </div>
                    </div>
                  ) : docFace ? (
                    <div className="flex items-center gap-4 text-left">
                      <img src={docFace.previewUrl} alt="" className="w-28 h-20 object-cover rounded-lg border border-white/10" />
                      <img src={docFace.faceImage} alt="" className="w-16 h-20 object-cover rounded-lg border-2 border-emerald-500" />
                      <div className="flex-1">
                        <div className="text-sm text-emerald-400 font-medium">
                          ✓ {isMs ? 'Wajah dikesan pada dokumen' : 'Face found on document'}
                        </div>
                        <label htmlFor="proof-upload" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                          {isMs ? 'Tukar dokumen' : 'Change document'}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="proof-upload" className="cursor-pointer block">
                      <div className="text-4xl mb-2">🪪</div>
                      <div className="text-sm font-medium text-white mb-1">
                        {isMs ? 'Klik untuk muat naik gambar dokumen' : 'Click to upload a photo of the document'}
                      </div>
                      <div className="text-xs text-slate-400">PNG, JPG</div>
                      {docStatus === 'noFace' && (
                        <div className="mt-3 text-xs text-red-400">
                          {isMs
                            ? 'Tiada wajah dikesan. Muat naik gambar yang lebih jelas di mana gambar wajah kelihatan.'
                            : 'No face found. Upload a clearer photo where the face picture is visible.'}
                        </div>
                      )}
                      {docStatus === 'error' && (
                        <div className="mt-3 text-xs text-red-400">
                          {isMs
                            ? 'Pengimbas wajah gagal dimuatkan. Semak sambungan anda dan cuba lagi.'
                            : 'The face scanner failed to load. Check your connection and try again.'}
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {isMs ? '2. Pengesahan Wajah' : '2. Face Verification'}
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  {isMs
                    ? 'Anda akan diminta memusingkan kepala ke kiri dan kanan, kemudian skrin akan berkelip merah, hijau dan biru.'
                    : 'You will be asked to turn your head left and right, then the screen will flash red, green and blue.'}
                </p>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {faceResult ? (
                    <div className="flex items-center gap-4 text-left">
                      <img src={docFace?.faceImage} alt="" className="w-16 h-20 object-cover rounded-lg border border-white/10" />
                      <span className="text-slate-500">⇄</span>
                      <img src={faceResult.selfie} alt="" className="w-16 h-20 object-cover rounded-lg border border-white/10" />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${faceResult.matched ? 'text-emerald-400' : 'text-red-400'}`}>
                          {faceResult.matched
                            ? `✓ ${isMs ? 'Wajah sepadan' : 'Face matched'} (${faceResult.similarity}%)`
                            : `✗ ${isMs ? 'Tidak sepadan' : 'No match'} (${faceResult.similarity}%)`}
                        </div>
                        {!faceResult.matched && (
                          <button onClick={() => setShowFaceScan(true)} className="text-xs text-blue-400 hover:text-blue-300">
                            {isMs ? 'Imbas semula' : 'Scan again'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-xs text-slate-400 mb-4">
                        {docFace
                          ? isMs ? 'Kamera akan meminta kebenaran anda' : 'Your browser will ask for camera permission'
                          : isMs ? 'Muat naik dokumen dahulu' : 'Upload your document first'}
                      </div>
                      <button
                        onClick={() => setShowFaceScan(true)}
                        disabled={!docFace}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
                      >
                        {isMs ? 'Mula Imbasan Wajah' : 'Start Face Scan'}
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

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  {isMs ? 'Kembali' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.proofUploaded || !formData.faceVerified}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {isMs ? 'Teruskan ke Pengesahan' : 'Continue to Confirmation'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Semak & Sahkan' : 'Review & Confirm'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs ? 'Sila semak maklumat anda sebelum menghantar' : 'Please review your information before submitting'}
                </p>
              </div>

              <div className="bg-[#111827] rounded-lg p-6 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">
                    {isMs ? 'Maklumat Peribadi' : 'Personal Information'}
                  </div>
                  <div className="text-sm text-white font-medium">{formData.fullName}</div>
                  <div className="text-sm text-slate-300">{formData.icNumber}</div>
                  <div className="text-sm text-slate-300">{formData.phoneNumber}</div>
                  <div className="text-sm text-slate-300">{formData.email}</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-slate-400 mb-1">
                    {isMs ? 'Jenis Bencana' : 'Disaster Type'}
                  </div>
                  <div className="text-sm text-white font-medium capitalize">{formData.disasterType}</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-slate-400 mb-2">
                    {isMs ? 'Dokumen untuk Dipulihkan' : 'Documents to Recover'}
                  </div>
                  <div className="space-y-1">
                    {formData.documentsLost.map((doc) => {
                      const docNames: Record<string, string> = {
                        'mykad': 'MyKad (Identity Card)',
                        'birth-cert': 'Birth Certificate',
                        'marriage-cert': 'Marriage / Divorce Certificate',
                        'passport': 'Malaysian Passport',
                        'driving-license': 'Driving License',
                        'vehicle-grant': 'Vehicle Ownership Certificate',
                        'land-title': 'Land Title / House Grant',
                        'academic-cert': 'Academic Certificates',
                        'oku-card': 'OKU Card',
                        'bank-passbook': 'Bank Passbook',
                        'insurance-policy': 'Insurance Policy'
                      };
                      return (
                        <div key={doc} className="text-sm text-white">• {docNames[doc] || doc}</div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{isMs ? 'Dokumen Bergambar Dimuat Naik' : 'Photo Document Uploaded'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-400">{isMs ? 'Wajah Sepadan Dengan Dokumen' : 'Face Matches Document'}</span>
                    <span className="text-green-400">✓ {faceResult?.similarity}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-400 mt-0.5">ℹ️</div>
                  <div className="text-xs text-slate-300">
                    {isMs 
                      ? 'Dengan menghantar, anda memberi kuasa kepada agensi kerajaan (JPN, JPJ, Imigresen) untuk mendapatkan rekod sedia ada anda dan memproses permohonan pemulihan dokumen anda.'
                      : 'By submitting, you authorize government agencies (JPN, JPJ, Immigration) to retrieve your existing records and process your document recovery request.'}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {isMs ? 'Kembali' : 'Back'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isMs ? 'Memproses...' : 'Processing...'}
                    </span>
                  ) : (
                    isMs ? 'Sahkan & Hantar' : 'Confirm & Submit'
                  )}
                </button>
              </div>

              {/* Loading Overlay */}
              {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-[#111827] rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-500/30">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-4">⚙️</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {isMs ? 'Menghantar Permohonan' : 'Submitting Request'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {isMs ? 'Sila tunggu sebentar...' : 'Please wait a moment...'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 animate-[loading_2s_ease-in-out]"
                           style={{
                             animation: 'loading 2s ease-in-out forwards'
                           }}
                      ></div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500 text-center">
                      {isMs ? 'Menyambung ke pangkalan data kerajaan...' : 'Connecting to government database...'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Tracking */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isMs ? 'Permohonan Berjaya Dihantar!' : 'Request Submitted Successfully!'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isMs ? 'Permohonan pemulihan dokumen anda telah diterima' : 'Your document recovery request has been received'}
                </p>
              </div>

              <div className="bg-[#111827] rounded-lg p-6">
                <div className="text-xs text-slate-400 mb-2">
                  {isMs ? 'ID Penjejakan Anda' : 'Your Tracking ID'}
                </div>
                <div className="text-2xl font-bold text-blue-400 font-mono mb-4">{formData.trackingId}</div>
                <div className="text-xs text-slate-400">
                  {isMs ? 'Simpan ID ini untuk menjejak status permohonan anda' : 'Save this ID to track your request status'}
                </div>
              </div>

              <div className="text-left bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 space-y-3">
                <div className="font-semibold text-white mb-3">
                  {isMs ? 'Apa yang berlaku seterusnya?' : 'What happens next?'}
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">1.</div>
                  <div className="text-slate-300">
                    {isMs 
                      ? 'Agensi kerajaan akan mengesahkan rekod sedia ada anda (1-2 hari)'
                      : 'Government agencies will verify your existing records (1-2 days)'}
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">2.</div>
                  <div className="text-slate-300">
                    {isMs 
                      ? 'Pemprosesan dan kelulusan dokumen baharu (3-5 hari)'
                      : 'Processing and approval of new documents (3-5 days)'}
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">3.</div>
                  <div className="text-slate-300">
                    {isMs 
                      ? 'Pencetakan dan pemeriksaan kualiti (2-3 hari)'
                      : 'Printing and quality check (2-3 days)'}
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">4.</div>
                  <div className="text-slate-300">
                    {isMs 
                      ? 'Penghantaran ke alamat anda (5-7 hari)'
                      : 'Delivery to your address (5-7 days)'}
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 text-xs text-slate-400">
                  {isMs 
                    ? 'Jumlah anggaran masa: 11-17 hari (dalam 14 hari bekerja)'
                    : 'Total estimated time: 11-17 days (within 14 working days)'}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  href={`/track?id=${formData.trackingId}`}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-center"
                >
                  {isMs ? 'Jejak Status' : 'Track Status'}
                </Link>
                <button
                  onClick={handleNewRequest}
                  className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
                >
                  {isMs ? 'Hantar Permohonan Lain' : 'Submit Another Request'}
                </button>
                <Link
                  href="/"
                  className="w-full px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all text-center"
                >
                  {isMs ? 'Kembali ke Laman Utama' : 'Back to Home'}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
