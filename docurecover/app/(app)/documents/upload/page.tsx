'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import { generateId, getDocumentLabel, getAuthorityName, getDocumentIcon, getDamageBadgeColor, getDamageLabel } from '@/app/_lib/utils/documentHelpers';
import type { DocumentType, DocumentStatus, DamageLevel, AIAssessment } from '@/app/_lib/types';

const DOC_TYPES: DocumentType[] = ['mykad', 'birth-certificate', 'passport', 'driving-licence', 'academic-certificate'];

export default function UploadPage() {
  const router = useRouter();
  const { language, addDocument } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<DocumentStatus>('damaged');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(language === 'ms' ? 'Hanya fail imej (JPG, PNG) atau PDF dibenarkan.' : 'Only image files (JPG, PNG) or PDF are allowed.');
      return;
    }
    setImageFile(file);
    setAssessment(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip data URL header for API
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleIdentify = async () => {
    if (!imageBase64) return;
    setIsIdentifying(true);
    setError(null);
    try {
      const res = await fetch('/api/identify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageFile?.type || 'image/jpeg',
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setAssessment(data);
      if (data.documentType && data.documentType !== 'unknown') {
        setSelectedType(data.documentType as DocumentType);
      }
    } catch {
      setError(language === 'ms'
        ? 'Gagal mengenal pasti dokumen. Sila cuba lagi atau pilih jenis secara manual.'
        : 'Failed to identify document. Please try again or select the type manually.');
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleAddDocument = () => {
    if (!selectedType) {
      setError(language === 'ms' ? 'Sila pilih jenis dokumen.' : 'Please select a document type.');
      return;
    }
    setIsAdding(true);
    addDocument({
      name: getDocumentLabel(selectedType, language),
      type: selectedType,
      authority: getAuthorityName(selectedType),
      status: docStatus,
      dateLost: new Date().toISOString().split('T')[0],
      recoveryProgress: 0,
      notes: notes || undefined,
      uploadedImageBase64: imageBase64 || undefined,
      aiAssessment: assessment || undefined,
    }, true);
    router.push('/documents');
  };

  const damageLevelColors: Record<DamageLevel, string> = {
    none: 'text-emerald-400',
    minor: 'text-yellow-400',
    moderate: 'text-amber-400',
    severe: 'text-orange-400',
    destroyed: 'text-red-400',
  };

  const confidenceColor = (c: number) =>
    c >= 80 ? 'bg-emerald-500' : c >= 60 ? 'bg-amber-500' : 'bg-red-500';

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0A0E1A] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/documents')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'ms' ? 'Kembali ke Dokumen' : 'Back to Documents'}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {language === 'ms' ? 'Muat Naik Dokumen' : 'Upload Document'}
          </h1>
          <p className="text-slate-400 mt-1">
            {language === 'ms'
              ? 'AI kami akan mengenal pasti jenis dokumen dan menilai kerosakan'
              : 'Our AI will identify your document type and assess the damage'}
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer mb-6 ${
            dragOver
              ? 'border-blue-400 bg-blue-500/10'
              : imagePreview
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Document preview"
                className="max-h-64 mx-auto rounded-xl object-contain shadow-2xl"
              />
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {imageFile?.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview(null);
                    setImageBase64(null);
                    setAssessment(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors text-sm underline"
                >
                  {language === 'ms' ? 'Tukar' : 'Change'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg mb-2">
                {language === 'ms' ? 'Seret & Lepas fail di sini' : 'Drag & drop your file here'}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {language === 'ms' ? 'atau' : 'or'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-sm"
              >
                {language === 'ms' ? 'Semak Imbas Fail' : 'Browse Files'}
              </button>
              <p className="text-slate-500 text-xs mt-4">
                {language === 'ms' ? 'Disokong: JPG, PNG, PDF' : 'Supported: JPG, PNG, PDF'}
              </p>
            </>
          )}
        </div>

        {/* Manual Document Type Selection */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <span>📋</span>
            {language === 'ms' ? 'Jenis Dokumen' : 'Document Type'}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {language === 'ms'
              ? 'AI akan cuba mengenal pasti secara automatik, atau pilih secara manual'
              : 'AI will auto-detect, or select manually below'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOC_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? null : type)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left text-sm font-medium ${
                  selectedType === type
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                }`}
              >
                <span className="text-lg">{getDocumentIcon(type)}</span>
                <span className="leading-tight">{getDocumentLabel(type, language)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Identify Button */}
        {imageBase64 && !assessment && (
          <button
            onClick={handleIdentify}
            disabled={isIdentifying}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mb-6 shadow-lg shadow-blue-500/20"
          >
            {isIdentifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === 'ms' ? 'AI sedang menganalisis dokumen anda...' : 'AI is analysing your document...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {language === 'ms' ? 'Kenal Pasti Dokumen dengan AI' : 'Identify Document with AI'}
              </>
            )}
          </button>
        )}

        {/* AI Assessment Results */}
        {assessment && (
          <div className="bg-gradient-to-br from-[#111827] to-[#0F172A] border border-blue-500/30 rounded-2xl p-6 mb-6 shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {language === 'ms' ? '🤖 Penilaian AI' : '🤖 AI Assessment'}
                </h3>
                <p className="text-slate-400 text-xs">
                  {language === 'ms' ? 'Pengenalan awalan sahaja — bukan pengesahan rasmi' : 'Preliminary identification only — not official certification'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Document Type */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  {language === 'ms' ? 'Jenis Dokumen' : 'Document Type'}
                </p>
                <p className="text-white font-semibold text-sm">
                  {assessment.documentType === 'unknown'
                    ? (language === 'ms' ? 'Tidak Dapat Dikenal Pasti' : 'Unknown')
                    : getDocumentLabel(assessment.documentType as DocumentType, language)}
                </p>
              </div>

              {/* Confidence */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  {language === 'ms' ? 'Keyakinan' : 'Confidence'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${confidenceColor(assessment.confidence)}`}
                      style={{ width: `${assessment.confidence}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm w-10 text-right">{assessment.confidence}%</span>
                </div>
              </div>

              {/* Damage Level */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  {language === 'ms' ? 'Tahap Kerosakan' : 'Damage Level'}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getDamageBadgeColor(assessment.damageLevel as DamageLevel)}`} />
                  <span className={`font-semibold text-sm ${damageLevelColors[assessment.damageLevel as DamageLevel] || 'text-slate-300'}`}>
                    {getDamageLabel(assessment.damageLevel as DamageLevel, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment text */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                {language === 'ms' ? 'Penilaian' : 'Assessment'}
              </p>
              <p className="text-slate-200 text-sm leading-relaxed">{assessment.assessment}</p>
            </div>

            {/* Recommended Action */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-base mt-0.5">⚠️</span>
                <div>
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    {language === 'ms' ? 'Tindakan Disyorkan' : 'Recommended Action'}
                  </p>
                  <p className="text-amber-100 text-sm leading-relaxed">{assessment.recommendedAction}</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {language === 'ms'
                  ? 'Pengenalan AI adalah awalan. Ia tidak mengesahkan ketulenan dokumen atau kelayakan rasmi.'
                  : 'AI identification is preliminary. It does not certify document authenticity or determine official eligibility.'}
              </span>
            </div>
          </div>
        )}

        {/* Add to My Documents */}
        {(assessment || selectedType) && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">
              {language === 'ms' ? 'Tambah ke Dokumen Saya' : 'Add to My Documents'}
            </h3>

            {/* Status selector */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">
                {language === 'ms' ? 'Status Dokumen' : 'Document Status'}
              </label>
              <div className="flex gap-3">
                {(['damaged', 'lost'] as DocumentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setDocStatus(s)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      docStatus === s
                        ? s === 'damaged'
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {s === 'damaged'
                      ? (language === 'ms' ? '🟡 Rosak' : '🟡 Damaged')
                      : (language === 'ms' ? '🔴 Hilang' : '🔴 Lost')}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-slate-400 text-sm mb-2">
                {language === 'ms' ? 'Nota (pilihan)' : 'Notes (optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'ms' ? 'cth. Ditemui separuh basah di dalam beg...' : 'e.g. Found partially wet inside bag...'}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
              />
            </div>

            <button
              onClick={handleAddDocument}
              disabled={isAdding || !selectedType}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isAdding ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {language === 'ms' ? 'Tambah ke Dokumen Saya & Jana Pelan' : 'Add to My Documents & Generate Plan'}
                </>
              )}
            </button>
            <p className="text-slate-500 text-xs text-center mt-3">
              {language === 'ms'
                ? 'Pelan pemulihan akan dijana secara automatik'
                : 'A recovery plan will be automatically generated'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
