'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/_lib/context/AppContext';
import { ChatMessage, DocumentType } from '@/app/_lib/types';
import { getStatusColor, getStatusBg, getDocumentIcon, getDocumentLabel } from '@/app/_lib/utils/documentHelpers';
import { t } from '@/app/_lib/i18n/translations';

export default function AssistantPage() {
  const {
    language,
    documents,
    tasks,
    updateTask,
    chatMessages,
    addChatMessage,
    clearChat,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [streamingSources, setStreamingSources] = useState<string[] | undefined>(undefined);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMs = language === 'ms';

  // Quick Prompt Chips
  const quickPrompts = isMs
    ? [
        { label: 'Bagaimana ganti MyKad rosak?', query: 'Bagaimanakah cara saya menggantikan MyKad yang rosak atau hilang akibat banjir?' },
        { label: 'Syarat ganti pasport hilang', query: 'Apakah dokumen yang diperlukan untuk menggantikan pasport yang musnah dalam bencana?' },
        { label: 'Masa siap sijil kelahiran baharu', query: 'Berapa lamakah masa yang diambil untuk mendapatkan salinan cabutan sijil kelahiran baharu di JPN?' },
        { label: 'Bayaran lesen memandu JPJ', query: 'Berapakah bayaran untuk penggantian lesen memandu, dan adakah terdapat pengecualian fi bagi mangsa bencana?' },
        { label: 'Pengecualian fi denda mangsa bencana', query: 'Adakah bayaran denda kehilangan dokumen dikecualikan untuk mangsa bencana alam di bawah NADMA?' },
      ]
    : [
        { label: 'How do I replace my MyKad?', query: 'How do I replace my MyKad lost or water-damaged in the disaster?' },
        { label: 'Required documents for passport', query: 'What documents do I need for Malaysian passport replacement after a disaster?' },
        { label: 'Birth certificate replacement time', query: 'How long does it take to get a new birth certificate extract from JPN?' },
        { label: 'Driving licence replacement fee', query: 'What is the fee for driving licence replacement, and can I use the digital MyJPJ app?' },
        { label: 'Disaster victim fee waivers', query: 'Are replacement fines waived for flood and disaster victims under NADMA directives?' },
      ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingContent, isLoading]);

  // Format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');

    // Add user message to context
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    setIsLoading(true);
    setStreamingContent('');
    setStreamingSources(undefined);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          documentTypes: documents.map((d) => d.type),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await response.json();
      const replyText = data.content || '';
      const replySources = data.sources || ['JPN', 'JPJ', 'NADMA'];

      // Realistic typing streaming effect for smooth readability
      setStreamingSources(replySources);
      let currentIdx = 0;
      const chunkSize = Math.max(2, Math.floor(replyText.length / 35));
      const interval = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= replyText.length) {
          clearInterval(interval);
          setStreamingContent(null);
          addChatMessage({
            id: 'msg-ai-' + Date.now(),
            role: 'assistant',
            content: replyText,
            sources: replySources,
            timestamp: new Date().toISOString(),
          });
          setIsLoading(false);
        } else {
          setStreamingContent(replyText.slice(0, currentIdx));
        }
      }, 25);
    } catch (err) {
      console.error('Failed to get chat response:', err);
      // Graceful fallback response
      const fallbackReply = isMs
        ? `Maaf, talian sedang sibuk. Sila buat laporan polis di balai berdekatan atau kaunter bergerak PPS untuk mendaftarkan dokumen yang hilang. Seterusnya hadir ke cawangan JPN atau UTC terdekat dengan laporan tersebut untuk penggantian MyKad secara percuma di bawah arahan NADMA.`
        : `Network connection issue. Please lodge an official disaster report with the Royal Malaysia Police (PDRM) at the nearest station or PPS shelter. Then present the report at your nearest JPN or UTC counter to receive an expedited replacement under NADMA disaster relief directives.`;
      
      const fallbackSources = ['JPN (Jabatan Pendaftaran Negara)', 'PDRM', 'NADMA'];
      addChatMessage({
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: fallbackReply,
        sources: fallbackSources,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
      setStreamingContent(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Welcome default message when chat history is empty
  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome-message',
    role: 'assistant',
    content: isMs
      ? `Selamat datang ke **DocuRecover AI**. Saya pembantu rasmi pemulihan dokumen bencana alam di Malaysia.\n\nSaya sedia membimbing anda mengenai:\n- **Pengecualian fi denda** di bawah Arahan NADMA (MyKad percuma untuk mangsa banjir/kebakaran)\n- Prosedur **laporan polis PDRM** & surat pengesahan mangsa\n- Kaunter bergerak **MEKAR (JPN)** & cawangan UTC yang dibuka hujung minggu\n- Lesen memandu digital percuma melalui aplikasi **MyJPJ**\n\nBagaimanakah saya boleh membantu urusan pemulihan anda hari ini?`
      : `Welcome to **DocuRecover AI**. I am your dedicated Malaysian disaster document recovery assistant.\n\nI can guide you on:\n- **Government fee waivers** under NADMA directives (free MyKad reissuance for certified disaster victims)\n- **PDRM police report** requirements and relief centre certifications\n- Mobile **JPN MEKAR** relief outreach buses and UTC extended weekend hours\n- Instant free digital driving licences on the **MyJPJ** platform\n\nHow can I help you recover your essential documents today?`,
    sources: ['JPN (Jabatan Pendaftaran Negara)', 'JPJ Malaysia', 'NADMA Arahan No. 1', 'PDRM'],
    timestamp: new Date().toISOString(),
  };

  const activeMessages = chatMessages.length === 0 ? [defaultWelcomeMessage] : chatMessages;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {isMs ? 'Pembantu Maya DocuRecover' : 'DocuRecover AI Concierge'}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                  {isMs ? 'Aktif' : 'Online'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {isMs
                  ? 'Panduan rasmi SOP penggantian dokumen JPN, JPJ, Imigresen & pengecualian fi bencana'
                  : 'Official guidance on JPN, JPJ, and Immigration document replacement & disaster fee waivers'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action: Clear Chat Button */}
        <div className="flex items-center space-x-2">
          {showClearConfirm ? (
            <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-rose-500/40 rounded-lg p-1 animate-fadeIn">
              <span className="text-[11px] text-rose-300 px-1.5">{isMs ? 'Pasti padam?' : 'Clear all?'}</span>
              <button
                type="button"
                onClick={() => {
                  clearChat();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                {isMs ? 'Ya, Padam' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 text-xs font-medium rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                {isMs ? 'Batal' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-300 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-lg transition-all"
              title={isMs ? 'Kosongkan perbualan' : 'Clear chat history'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isMs ? 'Kosongkan Chat' : 'Clear Chat'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT 70% (8 cols on lg): Chat Area */}
        <section className="lg:col-span-8 flex flex-col h-full bg-[#0F172A]/70 border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
            {activeMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shadow-md mt-0.5">
                      DR
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-lg text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-900/30 font-normal'
                        : 'bg-[#111827] text-slate-100 border border-white/10 rounded-tl-xs shadow-black/40'
                    }`}
                  >
                    {/* Render Content with paragraph splits and bolding */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        return (
                          <p key={pIdx} className="leading-relaxed">
                            {paragraph.split('**').map((chunk, cIdx) =>
                              cIdx % 2 === 1 ? (
                                <strong key={cIdx} className={isUser ? 'text-white font-semibold' : 'text-blue-300 font-semibold'}>
                                  {chunk}
                                </strong>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        );
                      })}
                    </div>

                    {/* Sources Badge List (for Assistant) */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300 flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {isMs ? 'Sumber Rasmi:' : 'Sources:'}
                        </span>
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 hover:text-white hover:border-blue-400/30 transition-colors"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`mt-1.5 text-[10px] text-right ${isUser ? 'text-blue-200' : 'text-slate-500'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* User Avatar Placeholder */}
                  {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/80 border border-white/10 flex items-center justify-center text-xs font-semibold text-slate-200 shadow-md mt-0.5">
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Currently Streaming Message */}
            {streamingContent !== null && (
              <div className="flex items-start gap-3 justify-start animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shadow-md mt-0.5">
                  DR
                </div>
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-xs px-4 py-3 bg-[#111827] text-slate-100 border border-white/10 shadow-black/40 text-sm leading-relaxed">
                  <div className="whitespace-pre-line space-y-2">
                    {streamingContent.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {streamingSources && streamingSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{isMs ? 'Sumber Rasmi:' : 'Sources:'}</span>
                      {streamingSources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
                </div>
              </div>
            )}

            {/* Loading / Typing Indicator */}
            {isLoading && streamingContent === null && (
              <div className="flex items-start gap-3 justify-start animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shadow-md mt-0.5">
                  DR
                </div>
                <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-[#111827] border border-white/10 shadow-lg flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2">
                    {isMs ? 'DocuRecover sedang menyemak direktori kerajaan...' : 'DocuRecover is consulting disaster recovery protocols...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Scrollable row above input) */}
          <div className="px-4 py-2 border-t border-white/[0.06] bg-black/20">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-.986-7.877 4.968 4.968 0 011.972-.123A4.996 4.996 0 0113 10a4 4 0 01-1 4z" />
                </svg>
                {isMs ? 'Cadangan Soalan:' : 'Quick Prompts:'}
              </span>
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-white/10 hover:border-blue-500/30 whitespace-nowrap transition-all duration-150 disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sticky Bottom Glassmorphism Input Bar */}
          <div className="p-3 sm:p-4 bg-[#0A0E1A]/90 backdrop-blur-md border-t border-white/[0.08]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isMs
                      ? 'Tanya apa jua soalan mengenai penggantian MyKad, laporan polis, fi bencana...'
                      : 'Ask anything about MyKad replacement, police reports, disaster fee waivers...'
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all shadow-inner"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className={`flex items-center justify-center w-11 h-11 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                  inputText.trim() && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02] cursor-pointer'
                    : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'
                }`}
                title={isMs ? 'Hantar mesej' : 'Send message'}
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT 30% (4 cols on lg): Context Panel */}
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Card 1: Your Documents Mini List */}
          <div className="bg-[#0F172A]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isMs ? 'Dokumen Terjejas Anda' : 'Your Tracked Documents'}
              </h2>
              <Link
                href="/documents"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isMs ? 'Lihat Semua' : 'View All'} &rarr;
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-4 px-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-lg">
                  📋
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {isMs
                    ? 'Belum ada dokumen didaftarkan. Tambah dokumen untuk panduan peribadi.'
                    : 'No documents tracked yet. Add your affected IDs to get tailored advice.'}
                </p>
                <Link
                  href="/documents"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                >
                  {isMs ? '+ Tambah Dokumen' : '+ Add Document'}
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{getDocumentIcon(doc.type)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{doc.authority}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${getStatusBg(
                          doc.status
                        )}`}
                      >
                        {doc.status}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">
                        {doc.recoveryProgress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Related Tasks Section */}
          <div className="bg-[#0F172A]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {isMs ? 'Tugasan Pemulihan' : 'Related Recovery Tasks'}
              </h2>
              <Link
                href="/plan"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isMs ? 'Pelan Penuh' : 'Full Plan'} &rarr;
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-4 px-2">
                <p className="text-xs text-slate-400 mb-2">
                  {isMs
                    ? 'Tiada tugasan aktif. Sila buka pelan pemulihan untuk jana senarai tindakan.'
                    : 'No pending tasks. Head to your checklist to auto-generate recovery steps.'}
                </p>
                <Link
                  href="/plan"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                >
                  {isMs ? 'Jana Pelan AI' : 'Generate AI Plan'}
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                      task.completed
                        ? 'bg-white/[0.02] border-white/5 opacity-60'
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`task-check-${task.id}`}
                      checked={task.completed}
                      onChange={() => updateTask(task.id, { completed: !task.completed })}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-white/20 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <label
                      htmlFor={`task-check-${task.id}`}
                      className={`cursor-pointer flex-1 min-w-0 ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      <p className="font-semibold truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{task.documentName}</p>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Disaster Relief Emergency Hotlines (Bonus contextual helper) */}
          <div className="bg-gradient-to-br from-blue-900/20 via-slate-900/60 to-purple-900/20 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <h3 className="text-xs font-bold text-blue-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {isMs ? 'Talian Kecemasan Bencana' : 'Disaster Relief Helplines'}
            </h3>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">NADMA Hotline:</span>
                <a href="tel:0388704800" className="font-mono text-blue-400 hover:underline">03-8870 4800</a>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">JPN Customer Care:</span>
                <a href="tel:0388807000" className="font-mono text-blue-400 hover:underline">03-8880 7000</a>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">JPJ Hotline:</span>
                <a href="tel:1800888664" className="font-mono text-blue-400 hover:underline">1-800-88-8664</a>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">PDRM Polis / MERS:</span>
                <a href="tel:999" className="font-mono text-rose-400 font-bold hover:underline">999</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
