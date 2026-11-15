'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/_lib/context/AppContext';
import {
  getStatusBg,
  getDocumentIcon,
  formatDate,
} from '@/app/_lib/utils/documentHelpers';
import { UserDocument } from '@/app/_lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    language,
    recoveryCase,
    documents,
    tasks,
    updateTask,
    updateDocument,
  } = useApp();

  // Selected document for detail modal
  const [selectedDoc, setSelectedDoc] = useState<UserDocument | null>(null);

  // Animated stat counters
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    recovered: 0,
    inProgress: 0,
    pending: 0,
    progress: 0,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = documents.length;
    const recovered = documents.filter((d) => d.status === 'recovered').length;
    const inProgress = documents.filter(
      (d) => (d.status === 'damaged' || d.status === 'lost') && (d.recoveryProgress > 0 || tasks.some((t) => t.documentId === d.id && t.completed))
    ).length;
    const pending = total - recovered - inProgress;

    const completedTasks = tasks.filter((t) => t.completed).length;
    const overallProgress =
      tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : total > 0
        ? Math.round(
            documents.reduce((acc, d) => acc + (d.recoveryProgress || 0), 0) /
              total
          )
        : 0;

    return {
      total,
      recovered,
      inProgress: Math.max(0, inProgress),
      pending: Math.max(0, pending),
      progress: Math.min(100, Math.max(0, overallProgress)),
    };
  }, [documents, tasks]);

  // Smooth count-up effect on mount or stats change
  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;

    const interval = setInterval(() => {
      frame++;
      const factor = Math.min(1, frame / totalFrames);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - factor, 3);

      setAnimatedStats({
        total: Math.round(stats.total * ease),
        recovered: Math.round(stats.recovered * ease),
        inProgress: Math.round(stats.inProgress * ease),
        pending: Math.round(stats.pending * ease),
        progress: Math.round(stats.progress * ease),
      });

      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [stats]);

  // Top pending tasks (up to 5)
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed).slice(0, 5);
  }, [tasks]);

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    updateTask(taskId, { completed: !currentCompleted });
  };

  const getDisasterLabel = (type?: string) => {
    if (!type) return language === 'ms' ? 'Bencana' : 'Disaster';
    switch (type) {
      case 'flood':
        return language === 'ms' ? '🌊 Mangsa Banjir' : '🌊 Flood Incident';
      case 'fire':
        return language === 'ms' ? '🔥 Kebakaran' : '🔥 Fire Incident';
      case 'landslide':
        return language === 'ms' ? '⛰️ Tanah Runtuh' : '⛰️ Landslide Incident';
      default:
        return language === 'ms' ? '⚠️ Kecemasan Lain' : '⚠️ Emergency Case';
    }
  };

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      {/* ================= 1. HEADER SECTION ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {getDisasterLabel(recoveryCase?.disasterType)}
              </span>
              {recoveryCase?.location && (
                <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-white/5">
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {recoveryCase.location}
                </span>
              )}
              {recoveryCase?.incidentDate && (
                <span className="text-xs text-slate-400">
                  • {formatDate(recoveryCase.incidentDate, language)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ms'
                ? `Selamat Kembali, ${user?.name || 'Pengguna'}!`
                : `Welcome back, ${user?.name || 'Survivor'}!`}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {language === 'ms'
                ? 'Pantau kemajuan gantian dokumen pengenalan anda dan ikuti senarai semak tindakan rasmi kerajaan.'
                : 'Track the status of your damaged or lost legal documents and follow step-by-step agency recovery tasks.'}
            </p>
          </div>

          {/* Quick link to update incident info */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{language === 'ms' ? 'Ubah Kes Bencana' : 'Update Case'}</span>
            </Link>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
            <span className="text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {language === 'ms' ? 'Kemajuan Pemulihan Keseluruhan' : 'Overall Recovery Progress'}
            </span>
            <span className="text-blue-400 font-bold text-base">
              {animatedStats.progress}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700 shadow-md shadow-blue-500/30"
              style={{ width: `${animatedStats.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= 2. STATS ROW (4 CARDS) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Tracked */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/30 border border-blue-500/20 backdrop-blur-md shadow-lg group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language === 'ms' ? 'Jumlah Dokumen' : 'Total Documents'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {animatedStats.total}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span>{language === 'ms' ? 'Dalam rekod kes' : 'In active case'}</span>
          </div>
        </div>

        {/* Card 2: Recovered */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border border-emerald-500/20 backdrop-blur-md shadow-lg group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {language === 'ms' ? 'Selesai / Pulih' : 'Recovered'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {animatedStats.recovered}
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-400/80 flex items-center gap-1">
            <span>{language === 'ms' ? 'Berjaya digantikan' : 'Safely replaced'}</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-amber-950/30 border border-amber-500/20 backdrop-blur-md shadow-lg group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {language === 'ms' ? 'Dalam Proses' : 'In Progress'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {animatedStats.inProgress}
            </span>
          </div>
          <div className="mt-1 text-xs text-amber-400/80 flex items-center gap-1">
            <span>{language === 'ms' ? 'Tindakan aktif' : 'Active recovery'}</span>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-rose-950/30 border border-rose-500/20 backdrop-blur-md shadow-lg group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              {language === 'ms' ? 'Belum Mula' : 'Pending Action'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {animatedStats.pending}
            </span>
          </div>
          <div className="mt-1 text-xs text-rose-400/80 flex items-center gap-1">
            <span>{language === 'ms' ? 'Perlu tindakan awal' : 'Awaiting tasks'}</span>
          </div>
        </div>
      </div>

      {/* ================= 3. EMPTY STATE OR TWO-COLUMN CONTENT ================= */}
      {documents.length === 0 ? (
        /* Empty state when no documents are registered */
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-white/10 text-center max-w-2xl mx-auto backdrop-blur-md space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 text-3xl">
            📋
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {language === 'ms'
                ? 'Belum Ada Dokumen Yang Didaftarkan'
                : 'No Documents Tracked Yet'}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {language === 'ms'
                ? 'Mulakan persediaan pemulihan dengan memilih jenis bencana anda atau muat naik foto MyKad / Pasport yang rosak untuk dinilai oleh AI.'
                : 'Start your recovery process by logging your disaster details or upload a photo of your damaged IDs for instant AI damage analysis.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              {language === 'ms' ? 'Mulakan Pendaftaran (Onboarding)' : 'Start Guided Onboarding'}
            </Link>
            <Link
              href="/documents/upload"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold text-sm transition-all"
            >
              {language === 'ms' ? 'Muat Naik Foto Dokumen' : 'Upload Document Photo'}
            </Link>
          </div>
        </div>
      ) : (
        /* Two-Column Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT COLUMN: 60% (lg:col-span-7) ================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{language === 'ms' ? 'Status Dokumen Anda' : 'Document Overview'}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-white/5">
                    {documents.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'ms'
                    ? 'Senarai dokumen yang terjejas dan tahap kemajuan gantian'
                    : 'List of affected documents and replacement milestones'}
                </p>
              </div>

              <Link
                href="/documents"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>{language === 'ms' ? 'Lihat Semua' : 'View All'}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => {
                const icon = getDocumentIcon(doc.type);
                const statusBg = getStatusBg(doc.status);

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-blue-500/30 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm"
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {doc.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBg}`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {doc.authority}
                        </p>

                        {/* Progress mini bar */}
                        <div className="mt-2 flex items-center gap-2 max-w-xs">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${doc.recoveryProgress || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">
                            {doc.recoveryProgress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors"
                      >
                        {language === 'ms' ? 'Butiran' : 'View'}
                      </button>

                      <Link
                        href={`/documents/upload?type=${doc.type}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{language === 'ms' ? 'Foto AI' : 'Scan'}</span>
                      </Link>

                      <Link
                        href={`/assistant?doc=${doc.type}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                      >
                        {language === 'ms' ? 'Bantuan' : 'Help'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 40% (lg:col-span-5) ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Pending Tasks Checklist */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{language === 'ms' ? 'Tindakan Seterusnya' : 'Pending Tasks'}</span>
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">
                      {pendingTasks.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ms' ? 'Langkah utama untuk diselesaikan' : 'Top prioritized recovery checklist'}
                  </p>
                </div>

                <Link
                  href="/plan"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  {language === 'ms' ? 'Semua Pelan' : 'View Plan'}
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/40 border border-emerald-500/20 text-center space-y-2">
                  <span className="text-3xl">🎉</span>
                  <h4 className="text-sm font-semibold text-emerald-400">
                    {language === 'ms' ? 'Semua Tindakan Selesai!' : 'All Tasks Completed!'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'ms'
                      ? 'Tiada tugasan tertunggak buat masa ini. Dokumen anda dalam pemantauan.'
                      : 'Great job! You have completed all active steps for your documents.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-slate-700 transition-all flex items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id, task.completed)}
                        className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            #{task.stepNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {task.documentName}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Quick Actions Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/20 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ms' ? 'Tindakan Pantas' : 'Quick Actions'}
              </h3>

              <div className="space-y-2.5">
                {/* Action 1: Upload Photo */}
                <Link
                  href="/documents/upload"
                  className="p-3 rounded-xl bg-slate-950/70 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      📸
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {language === 'ms' ? 'Muat Naik Foto Dokumen' : 'Upload Document Photo'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {language === 'ms' ? 'AI nilaikan tahap kerosakan' : 'AI damage analysis'}
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Action 2: Ask Recovery Assistant */}
                <Link
                  href="/assistant"
                  className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      💬
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {language === 'ms' ? 'Tanya Pembantu AI' : 'Ask Recovery Assistant'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {language === 'ms' ? 'Panduan JPN, JPJ, & bantuan NADMA' : '24/7 official procedure chatbot'}
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Action 3: View Full Plan */}
                <Link
                  href="/plan"
                  className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      🗺️
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {language === 'ms' ? 'Lihat Pelan Lengkap' : 'View Full Recovery Plan'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {language === 'ms' ? 'Semua agensi dan pengecualian fi' : 'Agency guides & fee waiver forms'}
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DOCUMENT DETAIL MODAL ================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-800 rounded-xl">
                  {getDocumentIcon(selectedDoc.type)}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDoc.name}</h3>
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

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'ms' ? 'Status Semasa:' : 'Current Status:'}</span>
                <span className={`px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${getStatusBg(selectedDoc.status)}`}>
                  {selectedDoc.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'ms' ? 'Kemajuan Pemulihan:' : 'Recovery Progress:'}</span>
                <span className="font-semibold text-blue-400">{selectedDoc.recoveryProgress}%</span>
              </div>
              {selectedDoc.dateLost && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{language === 'ms' ? 'Tarikh Kejadian:' : 'Date of Incident:'}</span>
                  <span className="text-slate-200">{formatDate(selectedDoc.dateLost, language)}</span>
                </div>
              )}
            </div>

            {/* Document Tasks summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-slate-400">
                {language === 'ms' ? 'Senarai Tindakan Agensi' : 'Agency Procedure Tasks'}
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {tasks
                  .filter((t) => t.documentId === selectedDoc.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-xs flex items-center justify-between"
                    >
                      <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {task.stepNumber}. {task.title}
                      </span>
                      <span className={task.completed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {task.completed ? '✓' : 'Pending'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                {language === 'ms' ? 'Tutup' : 'Close'}
              </button>
              <Link
                href={`/assistant?doc=${selectedDoc.type}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                {language === 'ms' ? 'Tanya AI Untuk Dokumen Ini' : 'Ask AI About This Document'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
