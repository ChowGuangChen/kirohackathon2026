'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/_lib/context/AppContext';
import { DocumentType, RecoveryTask } from '@/app/_lib/types';
import { getDocumentIcon, getDocumentLabel, generateId } from '@/app/_lib/utils/documentHelpers';

export default function RecoveryPlanPage() {
  const {
    language,
    tasks,
    documents,
    updateTask,
    addTask,
    recoveryCase,
  } = useApp();

  const isMs = language === 'ms';

  // State for collapsible document groups (documentId -> boolean)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // State for Add Task inline form
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedAnimationTaskId, setCompletedAnimationTaskId] = useState<string | null>(null);

  // New task form fields
  const [newDocId, setNewDocId] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');
  const [formError, setFormError] = useState('');

  // Calculate overall progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Circular progress SVG constants
  const circleRadius = 42;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  // Toggle group collapse
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Handle task checkbox click with confetti animation
  const handleToggleTask = (task: RecoveryTask) => {
    const nextCompleted = !task.completed;
    if (nextCompleted) {
      setCompletedAnimationTaskId(task.id);
      setTimeout(() => {
        setCompletedAnimationTaskId(null);
      }, 1200);
    }
    updateTask(task.id, { completed: nextCompleted });
  };

  // Group tasks by document
  const groupedTasks: Record<string, { docName: string; docType: DocumentType; tasks: RecoveryTask[] }> = {};

  tasks.forEach((task) => {
    const groupKey = task.documentId || 'general';
    if (!groupedTasks[groupKey]) {
      groupedTasks[groupKey] = {
        docName: task.documentName || (isMs ? 'Langkah Am Bencana' : 'General Disaster Recovery'),
        docType: task.documentType || 'mykad',
        tasks: [],
      };
    }
    groupedTasks[groupKey].tasks.push(task);
  });

  // Sort tasks by stepNumber inside each group
  Object.keys(groupedTasks).forEach((key) => {
    groupedTasks[key].tasks.sort((a, b) => a.stepNumber - b.stepNumber);
  });

  // Call API to generate recovery checklist
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const docTypes: DocumentType[] =
        documents.length > 0
          ? documents.map((d) => d.type)
          : ['mykad', 'driving-licence', 'birth-certificate', 'passport'];

      const response = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTypes: docTypes,
          disasterType: recoveryCase?.disasterType || 'flood',
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate checklist');
      }

      const data = await response.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks.forEach((t: RecoveryTask) => {
          // Avoid duplicate task titles
          const exists = tasks.some((existing) => existing.title === t.title);
          if (!exists) {
            addTask(t);
          }
        });
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle manual task submission
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError(isMs ? 'Sila masukkan tajuk tugasan.' : 'Please enter a task title.');
      return;
    }

    let targetDocName = isMs ? 'Tugasan Manual' : 'Custom Recovery Task';
    let targetDocType: DocumentType = 'mykad';

    if (newDocId) {
      const selectedDoc = documents.find((d) => d.id === newDocId);
      if (selectedDoc) {
        targetDocName = selectedDoc.name;
        targetDocType = selectedDoc.type;
      }
    }

    const newTask: RecoveryTask = {
      id: generateId(),
      documentId: newDocId || 'custom-task-group',
      documentType: targetDocType,
      documentName: targetDocName,
      title: newTitle.trim(),
      description: newDescription.trim() || (isMs ? 'Langkah tindakan tersuai.' : 'Custom action step.'),
      completed: false,
      link: newLink.trim() || undefined,
      stepNumber: tasks.length + 1,
    };

    addTask(newTask);

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewLink('');
    setNewDocId('');
    setFormError('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fadeIn">
      
      {/* Header Section with Circular Progress Indicator */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B]/80 to-[#0F172A] border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Title & Subtitle */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {isMs ? 'Pelan Pemulihan Pintar AI' : 'Smart Disaster Recovery Plan'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMs ? 'Senarai Tindakan Pemulihan Dokumen' : 'My Document Recovery Plan'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isMs
                ? 'Langkah tersusun menggantikan dokumen rasmi anda berpandukan SOP kerajaan Malaysia dan pengecualian bayaran denda NADMA.'
                : 'Prioritized checklist to regain all your official identity documents under Malaysian government SOPs and disaster fee waiver directives.'}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{isMs ? 'Menjana Pelan AI...' : 'Generating AI Plan...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{isMs ? 'Jana Pelan AI Baharu' : 'Generate AI Plan'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(!showAddModal)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isMs ? 'Tambah Tugasan' : 'Add Manual Task'}</span>
              </button>
            </div>
          </div>

          {/* Circular Progress Widget */}
          <div className="flex items-center gap-5 bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-inner flex-shrink-0">
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle with smooth stroke-dashoffset */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Percentage in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-white">{progressPercent}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  {isMs ? 'Selesai' : 'Done'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                {isMs
                  ? `${completedTasks} daripada ${totalTasks} tugasan`
                  : `${completedTasks} of ${totalTasks} completed`}
              </p>
              <p className="text-xs text-slate-400">
                {totalTasks === 0
                  ? isMs ? 'Tiada tugasan aktif' : 'No tasks scheduled'
                  : progressPercent === 100
                  ? isMs ? '🎉 Semua dokumen dipulihkan!' : '🎉 All documents recovered!'
                  : isMs ? 'Teruskan langkah pemulihan anda' : 'Keep progressing through checklist'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Form to Add Manual Task (Collapsible) */}
      {showAddModal && (
        <div className="rounded-2xl bg-[#0F172A] border border-blue-500/40 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isMs ? 'Tambah Tugasan Pemulihan Baharu' : 'Add New Recovery Task'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Document Selector */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                {isMs ? 'Pilih Dokumen Berkaitan' : 'Select Related Document'}
              </label>
              <select
                value={newDocId}
                onChange={(e) => setNewDocId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="">{isMs ? '-- Langkah Am / Tiada Dokumen Khusus --' : '-- General Action / No Specific ID --'}</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.authority})
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                {isMs ? 'Tajuk Tugasan *' : 'Task Title *'}
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isMs ? 'Cth: Buat Laporan Polis di IPD Shah Alam' : 'e.g. Lodge Police Report at IPD Shah Alam'}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                {isMs ? 'Penerangan Tindakan' : 'Detailed Instructions'}
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={isMs ? 'Maklumat lanjut, borang yang perlu dibawa, waktu kaunter...' : 'Counter requirements, operating hours, documents to bring...'}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Optional Link */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                {isMs ? 'Pautan Portal / Borang (Pilihan)' : 'Official Website or Portal Link (Optional)'}
              </label>
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://www.jpn.gov.my"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-medium"
              >
                {isMs ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition-all"
              >
                {isMs ? 'Simpan Tugasan' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {totalTasks === 0 ? (
        <div className="rounded-3xl bg-[#0F172A]/70 border border-dashed border-white/15 p-12 text-center backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-3xl shadow-lg">
            📑
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">
              {isMs ? 'Tiada Tugasan Pemulihan Lagi' : 'No Recovery Tasks Yet'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isMs
                ? 'Muat naik gambar dokumen anda atau klik butang di bawah untuk menjana pelan tindakan mengikut SOP rasmi agensi kerajaan Malaysia.'
                : 'Upload your damaged document photos or click below to generate a step-by-step recovery plan tailored to Malaysian agency SOPs.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isMs ? 'Jana Pelan AI Sekarang' : 'Generate AI Plan Now'}</span>
            </button>

            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{isMs ? 'Daftar Dokumen Terjejas' : 'Register Affected Documents'}</span>
            </Link>

            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{isMs ? 'Tanya Pembantu AI' : 'Ask AI Assistant'}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Task Groups Section (Grouped by Document) */
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupId, group], groupIdx) => {
            const isCollapsed = !!collapsedGroups[groupId];
            const groupTotal = group.tasks.length;
            const groupCompleted = group.tasks.filter((t) => t.completed).length;
            const groupPercent = groupTotal > 0 ? Math.round((groupCompleted / groupTotal) * 100) : 0;

            return (
              <div
                key={groupId}
                className="rounded-2xl bg-[#0F172A]/85 border border-white/[0.08] overflow-hidden backdrop-blur-xl shadow-lg transition-all"
                style={{ animationDelay: `${groupIdx * 100}ms` }}
              >
                {/* Collapsible Group Header */}
                <div
                  onClick={() => toggleGroupCollapse(groupId)}
                  className="flex items-center justify-between p-4 sm:p-5 bg-slate-900/40 hover:bg-white/[0.03] cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getDocumentIcon(group.docType)}</span>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-white truncate">
                        {group.docName}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {isMs
                            ? `${groupCompleted} daripada ${groupTotal} langkah selesai`
                            : `${groupCompleted} of ${groupTotal} steps completed`}
                        </span>
                        {groupPercent === 100 && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                            ✓ {isMs ? 'Lengkap' : 'All Completed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress bar & Chevron */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${groupPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {groupPercent}%
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-transform"
                      aria-label="Toggle group collapse"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Task Cards Container */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 pt-1 space-y-3 border-t border-white/[0.05]">
                    {group.tasks.map((task) => {
                      const isAnimating = completedAnimationTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`relative group rounded-xl p-4 transition-all duration-200 border flex items-start gap-3.5 ${
                            task.completed
                              ? 'bg-white/[0.015] border-white/5 opacity-70'
                              : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] shadow-sm'
                          }`}
                        >
                          {/* Micro Confetti Animation Burst when checked */}
                          {isAnimating && (
                            <div className="absolute -top-3 left-6 pointer-events-none flex items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-40" />
                              <span className="text-xs font-bold text-emerald-300 animate-bounce bg-slate-900 border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-lg">
                                +1 Selesai! 🎉
                              </span>
                            </div>
                          )}

                          {/* Custom Checkbox */}
                          <div className="pt-0.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer ${
                                task.completed
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                  : 'bg-slate-900 border border-white/20 text-transparent hover:border-blue-400'
                              }`}
                              title={
                                task.completed
                                  ? isMs ? 'Tandakan belum selesai' : 'Mark as incomplete'
                                  : isMs ? 'Tandakan selesai' : 'Mark as complete'
                              }
                            >
                              <svg className="w-3.5 h-3.5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {/* Step Badge */}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                                {isMs ? `Langkah ${task.stepNumber}` : `Step ${task.stepNumber}`}
                              </span>
                              <h3
                                className={`text-sm font-semibold transition-all ${
                                  task.completed
                                    ? 'line-through text-slate-500 font-normal'
                                    : 'text-slate-100 group-hover:text-white'
                                }`}
                              >
                                {task.title}
                              </h3>
                            </div>

                            <p
                              className={`text-xs leading-relaxed transition-colors ${
                                task.completed ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              {task.description}
                            </p>

                            {/* External Link CTA */}
                            {task.link && (
                              <div className="mt-2.5">
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                                >
                                  <span>{isMs ? 'Buka Portal / Panduan Rasmi' : 'Visit Official Portal'}</span>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
