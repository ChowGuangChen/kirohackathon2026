'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type DisasterType = 'flood' | 'fire' | 'landslide' | 'other';
type DocumentType = 'mykad' | 'passport' | 'birth-cert' | 'driving-license';

export default function RecoverPage() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Generate tracking ID
    const trackingId = `DR${Date.now().toString(36).toUpperCase()}`;
    setFormData({ ...formData, trackingId, confirmed: true });
    setCurrentStep(5);
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
          <span className="text-sm text-slate-400">Step {currentStep} of 5</span>
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
            <span>Register</span>
            <span>Report</span>
            <span>Upload</span>
            <span>Confirm</span>
            <span>Track</span>
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
                <h2 className="text-2xl font-bold text-white mb-2">Register Your Information</h2>
                <p className="text-sm text-slate-400">We need your details to process your document recovery</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name (as per IC)</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Ahmad bin Abdullah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">IC Number</label>
                  <input
                    type="text"
                    value={formData.icNumber}
                    onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="900101-01-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="+60 12-345 6789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="123, Jalan Merdeka, 50000 Kuala Lumpur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
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
                Continue to Report Disaster
              </button>
            </div>
          )}

          {/* Step 2: Report Disaster & Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Report Disaster & Documents</h2>
                <p className="text-sm text-slate-400">Tell us what happened and which documents you need to recover</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Type of Disaster</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'flood', label: 'Flood', icon: '🌊' },
                    { value: 'fire', label: 'Fire', icon: '🔥' },
                    { value: 'landslide', label: 'Landslide', icon: '⛰️' },
                    { value: 'other', label: 'Other', icon: '⚠️' }
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
                      <div className="text-sm font-medium">{disaster.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Documents Lost or Damaged (Select all that apply)</label>
                <div className="space-y-2">
                  {[
                    { value: 'mykad', label: 'MyKad (Identity Card)', icon: '🪪' },
                    { value: 'passport', label: 'Malaysian Passport', icon: '🛂' },
                    { value: 'birth-cert', label: 'Birth Certificate', icon: '📜' },
                    { value: 'driving-license', label: 'Driving License', icon: '🚗' }
                  ].map((doc) => (
                    <button
                      key={doc.value}
                      onClick={() => toggleDocument(doc.value as DocumentType)}
                      className={`w-full p-4 rounded-lg border text-left transition-all flex items-center space-x-3 ${
                        formData.documentsLost.includes(doc.value as DocumentType)
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-[#111827] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl">{doc.icon}</div>
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

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.disasterType || formData.documentsLost.length === 0}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  Continue to Upload Proof
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Proof & Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Proof & Verification</h2>
                <p className="text-sm text-slate-400">Upload evidence of damaged documents and verify your identity</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Upload Proof of Damaged/Lost Documents</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500/50 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={() => setFormData({ ...formData, proofUploaded: true })}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📸</div>
                    <div className="text-sm font-medium text-white mb-1">Click to upload photos</div>
                    <div className="text-xs text-slate-400">PNG, JPG up to 10MB each</div>
                  </label>
                  {formData.proofUploaded && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                      <span className="mr-1">✓</span> Files uploaded
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Face Verification</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500/50 transition-all">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm font-medium text-white mb-1">Verify Your Identity</div>
                  <div className="text-xs text-slate-400 mb-4">Take a selfie to confirm your identity</div>
                  <button
                    onClick={() => setFormData({ ...formData, faceVerified: true })}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                  >
                    {formData.faceVerified ? '✓ Verified' : 'Start Camera'}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.proofUploaded || !formData.faceVerified}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  Continue to Confirmation
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Review & Confirm</h2>
                <p className="text-sm text-slate-400">Please review your information before submitting</p>
              </div>

              <div className="bg-[#111827] rounded-lg p-6 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Personal Information</div>
                  <div className="text-sm text-white font-medium">{formData.fullName}</div>
                  <div className="text-sm text-slate-300">{formData.icNumber}</div>
                  <div className="text-sm text-slate-300">{formData.phoneNumber}</div>
                  <div className="text-sm text-slate-300">{formData.email}</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-slate-400 mb-1">Disaster Type</div>
                  <div className="text-sm text-white font-medium capitalize">{formData.disasterType}</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-slate-400 mb-2">Documents to Recover</div>
                  <div className="space-y-1">
                    {formData.documentsLost.map((doc) => (
                      <div key={doc} className="text-sm text-white">• {doc.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Proof Uploaded</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-400">Face Verified</span>
                    <span className="text-green-400">✓</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-400 mt-0.5">ℹ️</div>
                  <div className="text-xs text-slate-300">
                    By submitting, you authorize government agencies (JPN, JPJ, Immigration) to retrieve your existing records and process your document recovery request.
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Tracking */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted Successfully!</h2>
                <p className="text-sm text-slate-400">Your document recovery request has been received</p>
              </div>

              <div className="bg-[#111827] rounded-lg p-6">
                <div className="text-xs text-slate-400 mb-2">Your Tracking ID</div>
                <div className="text-2xl font-bold text-blue-400 font-mono mb-4">{formData.trackingId}</div>
                <div className="text-xs text-slate-400">Save this ID to track your request status</div>
              </div>

              <div className="text-left bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 space-y-3">
                <div className="font-semibold text-white mb-3">What happens next?</div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">1.</div>
                  <div className="text-slate-300">Government agencies will verify your existing records (1-2 days)</div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">2.</div>
                  <div className="text-slate-300">Processing and approval of new documents (3-5 days)</div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">3.</div>
                  <div className="text-slate-300">Printing and quality check (2-3 days)</div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-blue-400 font-bold">4.</div>
                  <div className="text-slate-300">Delivery to your address (5-7 days)</div>
                </div>
                <div className="pt-3 border-t border-white/10 text-xs text-slate-400">
                  Total estimated time: 11-17 days (within 14 working days)
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  href={`/track?id=${formData.trackingId}`}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-center"
                >
                  Track Status
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
