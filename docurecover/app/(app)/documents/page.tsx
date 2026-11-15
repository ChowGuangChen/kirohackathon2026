'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import {
  getStatusBg,
  getDocumentIcon,
  getDamageBadgeColor,
  formatDate,
} from '@/app/_lib/utils/documentHelpers';
import { UserDocument, DocumentStatus, RecoveryTask } from '@/app/_lib/types';

export default function DocumentsPage() {
  const router = useRouter();
  const {
    language,
    documents,
    tasks,
    updateDocument,
    removeDocument,
    updateTask,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<UserDocument | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: documents.length,
      safe: documents.filter((d) => d.status === 'safe').length,
      damaged: documents.filter((d) => d.status === 'damaged').length,
      lost: documents.filter((d) => d.status === 'lost').length,
      recovered: documents.filter((d) => d.status === 'recovered').length,
    };
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Status match
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = doc.name.toLowerCase().includes(q);
        const authorityMatch = doc.authority.toLowerCase().includes(q);
        const typeMatch = doc.type.toLowerCase().includes(q);
        return nameMatch || authorityMatch || typeMatch;
      }
      return true;
    });
  }, [documents, statusFilter, searchQuery]);

  // Associated tasks for modal document
  const modalTasks = useMemo(() => {
    if (!selectedDoc) return [];
    return tasks.filter((t) => t.documentId === selectedDoc.id);
  }, [selectedDoc, tasks]);

  const handleMarkAsRecovered = (doc: UserDocument) => {
    const isCurrentlyRecovered = doc.status === 'recovered';
    const newStatus: DocumentStatus = isCurrentlyRecovered ? 'damaged' : 'recovered';
    const newProgress = isCurrentlyRecovered ? 50 : 100;

    updateDocument(doc.id, {
      status: newStatus,
      recoveryProgress: newProgress,
    });

    // Update all tasks for this doc
    tasks
      .filter((t) => t.documentId === doc.id)
      .forEach((t) => {
        updateTask(t.id, { completed: !isCurrentlyRecovered });
      });

    if (selectedDoc && selectedDoc.id === doc.id) {
      setSelectedDoc((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              recoveryProgress: newProgress,
            }
          : null
      );
    }
  };

  const handleDeleteDocument = (id: string) => {
    removeDocument(id);
    setDeleteConfirmId(null);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">
      {/* ================= 1. HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{language === 'ms' ? 'Dokumen Saya' : 'My Documents'}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {documents.length}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'ms'
              ? 'Pengurusan inventori dokumen pengenalan diri, status kerosakan, dan rekod gantian rasmi.'
              : 'Manage and monitor all replacement applications and damage assessments across government agencies.'}
          </p>
        </div>

        <Link
          href="/documents/upload"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{language === 'ms' ? 'Tambah Dokumen' : 'Add Document'}</span>
        </Link>
      </div>

      {/* ================= 2. FILTER & SEARCH BAR ================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(
            [
              { key: 'all', labelEn: 'All', labelMs: 'Semua', count: counts.all },
              { key: 'safe', labelEn: 'Safe', labelMs: 'Selamat', count: counts.safe },
              { key: 'damaged', labelEn: 'Damaged', labelMs: 'Rosak', count: counts.damaged },
              { key: 'lost', labelEn: 'Lost', labelMs: 'Hilang', count: counts.lost },
              { key: 'recovered', labelEn: 'Recovered', labelMs: 'Digantikan', count: counts.recovered },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-500/40'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span>{language === 'ms' ? tab.labelMs : tab.labelEn}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ms'
                ? 'Cari nama dokumen atau agensi...'
                : 'Search by document name or agency...'
            }
            className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ================= 3. DOCUMENT CARDS GRID ================= */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-white/10 text-center max-w-lg mx-auto backdrop-blur-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/5 mx-auto flex items-center justify-center text-3xl">
            📭
          </div>
          <h3 className="text-lg font-bold text-white">
            {language === 'ms'
              ? 'Tiada Dokumen Ditemui'
              : 'No Documents Found'}
          </h3>
          <p className="text-xs text-slate-400">
            {documents.length === 0
              ? language === 'ms'
                ? 'Anda belum mendaftarkan sebarang dokumen lagi. Tambah dokumen pertama anda untuk memulakan panduan pemulihan.'
                : 'No documents yet. Add your first document to get started.'
              : language === 'ms'
              ? 'Tiada dokumen yang sepadan dengan carian atau penapis yang dipilih.'
              : 'No documents match the active filter or search keywords.'}
          </p>
          {documents.length === 0 && (
            <div className="pt-2">
              <Link
                href="/documents/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <span>{language === 'ms' ? 'Tambah Dokumen Sekarang' : 'Add First Document'}</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const icon = getDocumentIcon(doc.type);
            const statusBg = getStatusBg(doc.status);
            const isRecovered = doc.status === 'recovered';

            return (
              <div
                key={doc.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#0F172A]/90 border border-white/10 hover:border-blue-500/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Top Section: Icon, Name, Authority, Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                      {icon}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBg}`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {doc.authority}
                    </p>
                  </div>

                  {/* AI Assessment mini badge if available */}
                  {doc.aiAssessment && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-blue-300 flex items-center gap-1">
                          <span>🤖</span> {language === 'ms' ? 'Penilaian AI' : 'AI Verified'}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-400">
                          {doc.aiAssessment.confidence}% {language === 'ms' ? 'Keyakinan' : 'conf.'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {doc.aiAssessment.assessment}
                      </p>
                    </div>
                  )}

                  {/* Recovery Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {language === 'ms' ? 'Kemajuan Pemulihan' : 'Recovery Progress'}
                      </span>
                      <span className="font-bold text-blue-400">
                        {doc.recoveryProgress || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${doc.recoveryProgress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Incident Date */}
                  {doc.dateLost && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {language === 'ms' ? 'Tarikh Kes:' : 'Incident Date:'}{' '}
                        {formatDate(doc.dateLost, language)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-5 mt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 transition-all"
                  >
                    {language === 'ms' ? 'Lihat Butiran' : 'View Details'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/documents/upload?type=${doc.type}`}
                      title={language === 'ms' ? 'Muat naik foto dokumen' : 'Upload photo'}
                      className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleMarkAsRecovered(doc)}
                      title={
                        isRecovered
                          ? language === 'ms'
                            ? 'Tanda sebagai belum selesai'
                            : 'Mark as incomplete'
                          : language === 'ms'
                          ? 'Tanda selesai pulih'
                          : 'Mark as recovered'
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isRecovered
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                      }`}
                    >
                      {isRecovered ? (language === 'ms' ? '✓ Pulih' : '✓ Recovered') : (language === 'ms' ? 'Tanda Pulih' : 'Mark Recovered')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 4. DOCUMENT DETAIL MODAL ================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-3xl">
                  {getDocumentIcon(selectedDoc.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDoc.name}</h3>
                  <p className="text-xs text-slate-400">{selectedDoc.authority}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">
                  {language === 'ms' ? 'Status Semasa' : 'Status'}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${getStatusBg(selectedDoc.status)}`}>
                  {selectedDoc.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">
                  {language === 'ms' ? 'Kemajuan Pemulihan' : 'Progress'}
                </span>
                <span className="font-bold text-blue-400 text-sm">
                  {selectedDoc.recoveryProgress}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">
                  {language === 'ms' ? 'Tarikh Kejadian' : 'Date Lost'}
                </span>
                <span className="text-slate-200">
                  {selectedDoc.dateLost ? formatDate(selectedDoc.dateLost, language) : 'N/A'}
                </span>
              </div>
            </div>

            {/* AI Assessment Report (if present) */}
            {selectedDoc.aiAssessment ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'ms' ? 'Laporan Penilaian AI (Vision Model)' : 'AI Vision Assessment'}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getDamageBadgeColor(
                      selectedDoc.aiAssessment.damageLevel
                    )}`}
                  >
                    ● {selectedDoc.aiAssessment.damageLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{language === 'ms' ? 'Ketepatan Pengesanan' : 'Identification Confidence'}</span>
                    <span className="text-cyan-400 font-bold">{selectedDoc.aiAssessment.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${selectedDoc.aiAssessment.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-2 pt-1 border-t border-white/5">
                  <p>
                    <strong className="text-white">
                      {language === 'ms' ? 'Pemerhatian Kerosakan:' : 'Damage Assessment:'}
                    </strong>{' '}
                    {selectedDoc.aiAssessment.assessment}
                  </p>
                  <p className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <strong>⚠️ {language === 'ms' ? 'Tindakan Disyorkan:' : 'Recommended Action:'}</strong>{' '}
                    {selectedDoc.aiAssessment.recommendedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  {language === 'ms'
                    ? 'Belum ada analisis foto AI untuk dokumen ini.'
                    : 'No AI photo assessment has been run on this document yet.'}
                </p>
                <Link
                  href={`/documents/upload?type=${selectedDoc.type}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold border border-blue-500/30 transition-all"
                >
                  <span>📷 {language === 'ms' ? 'Muat Naik Foto Sekarang' : 'Upload Photo for AI Scan'}</span>
                </Link>
              </div>
            )}

            {/* Recovery Checklist Tasks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>{language === 'ms' ? 'Tugasan Pemulihan Agensi' : 'Recovery Tasks Checklist'}</span>
                <span className="text-slate-500 font-normal">
                  {modalTasks.filter((t) => t.completed).length} / {modalTasks.length} {language === 'ms' ? 'selesai' : 'done'}
                </span>
              </h4>

              {modalTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  {language === 'ms' ? 'Tiada senarai semak spesifik' : 'No specific tasks registered for this document'}
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {modalTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-start gap-3 hover:border-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                        className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400">
                            #{task.stepNumber}
                          </span>
                          <h5
                            className={`text-xs font-semibold ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Delete trigger */}
              {deleteConfirmId === selectedDoc.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-semibold">
                    {language === 'ms' ? 'Pasti?' : 'Confirm?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(selectedDoc.id)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-all"
                  >
                    {language === 'ms' ? 'Ya, Padam' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white"
                  >
                    {language === 'ms' ? 'Batal' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedDoc.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  {language === 'ms' ? 'Padam Rekod' : 'Delete Document'}
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAsRecovered(selectedDoc)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDoc.status === 'recovered'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                  }`}
                >
                  {selectedDoc.status === 'recovered'
                    ? language === 'ms'
                      ? 'Tanda Belum Selesai'
                      : 'Mark as Incomplete'
                    : language === 'ms'
                    ? 'Tanda Selesai Digantikan'
                    : 'Mark as Recovered'}
                </button>
                <Link
                  href={`/assistant?doc=${selectedDoc.type}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                >
                  {language === 'ms' ? 'Tanya Pembantu AI' : 'Ask AI Guide'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
