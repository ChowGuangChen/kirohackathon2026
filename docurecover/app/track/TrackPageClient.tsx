'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import { useLanguage } from '@/app/_lib/useLanguage';
import { getDocument, requestStorageKey, type StoredRequest } from '@/app/_lib/documents';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOTAL_DAYS = 14;

const STAGES = [
  { en: 'Request Received', ms: 'Permohonan Diterima', docEn: 'Received', docMs: 'Diterima', start: 0, end: 0 },
  { en: 'Verifying Records with Government Database', ms: 'Mengesahkan Rekod dengan Pangkalan Data Kerajaan', docEn: 'Verifying', docMs: 'Sedang disahkan', start: 0, end: 2 },
  { en: 'Processing & Approval', ms: 'Pemprosesan & Kelulusan', docEn: 'Processing', docMs: 'Diproses', start: 2, end: 7 },
  { en: 'Document Printing', ms: 'Pencetakan Dokumen', docEn: 'Printing', docMs: 'Dicetak', start: 7, end: 10 },
  { en: 'Out for Delivery', ms: 'Dalam Penghantaran', docEn: 'Out for delivery', docMs: 'Dalam penghantaran', start: 10, end: TOTAL_DAYS },
];

type StageStatus = 'completed' | 'current' | 'pending';

function subscribeStorage(listener: () => void) {
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | undefined;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
      clockNow = 0;
    }
  };
}

function getClockNow() {
  if (!clockNow) clockNow = Date.now();
  return clockNow;
}

function parseRequest(raw: string | null): StoredRequest | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<StoredRequest>;
    if (
      typeof data.trackingId !== 'string' ||
      typeof data.submissionDate !== 'string' ||
      Number.isNaN(Date.parse(data.submissionDate)) ||
      !Array.isArray(data.documentsLost)
    ) {
      return null;
    }
    return data as StoredRequest;
  } catch {
    return null;
  }
}

const normaliseId = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export default function TrackPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isMs, toggleLanguage } = useLanguage();
  const urlId = normaliseId(searchParams.get('id') ?? '');
  const [inputId, setInputId] = useState('');

  // undefined = not read yet (server render / hydration), null = no saved request for this ID.
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeStorage,
    () => {
      if (!urlId) return null;
      try {
        return localStorage.getItem(requestStorageKey(urlId));
      } catch {
        return null;
      }
    },
    () => undefined
  );
  const now = useSyncExternalStore(subscribeClock, getClockNow, () => 0);
  const request = useMemo(() => parseRequest(raw ?? null), [raw]);
  const lookupState: 'idle' | 'loading' | 'found' | 'notFound' = !urlId
    ? 'idle'
    : raw === undefined
    ? 'loading'
    : request
    ? 'found'
    : 'notFound';

  const t = (en: string, ms: string) => (isMs ? ms : en);
  const locale = isMs ? 'ms-MY' : 'en-MY';

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId) router.replace(`/track?id=${encodeURIComponent(inputId)}`);
  };

  const backToSearch = () => router.replace('/track');

  const formatDate = (date: Date) => date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateTime = (date: Date) =>
    date.toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const renderResults = (req: StoredRequest) => {
    const submitted = new Date(req.submissionDate);
    const elapsedDays = Math.max(0, (now - submitted.getTime()) / DAY_MS);
    const delivered = elapsedDays >= TOTAL_DAYS;
    const dayAfter = (days: number) => new Date(submitted.getTime() + days * DAY_MS);

    const stages = STAGES.map((stage, index) => {
      const status: StageStatus =
        elapsedDays >= stage.end ? 'completed' : elapsedDays >= stage.start ? 'current' : 'pending';
      let date: string;
      if (index === 0) date = formatDateTime(submitted);
      else if (status === 'completed') date = `${t('Completed', 'Selesai')} ${formatDate(dayAfter(stage.end))}`;
      else if (status === 'current') date = t('In progress', 'Sedang berjalan');
      else date = `${t('Expected', 'Dijangka')} ${formatDate(dayAfter(stage.start))}`;
      return { ...stage, status, date };
    });

    const currentStage = stages.find((s) => s.status === 'current');
    const statusTitle = delivered ? t('Delivered', 'Telah Dihantar') : currentStage ? (isMs ? currentStage.ms : currentStage.en) : '';
    const docStatus = delivered ? t('Delivered', 'Telah dihantar') : currentStage ? (isMs ? currentStage.docMs : currentStage.docEn) : '';
    const daysRemaining = Math.max(0, Math.ceil(TOTAL_DAYS - elapsedDays));

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{t('Request Status', 'Status Permohonan')}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300">
            <span className="text-xs text-stone-600">{t('Tracking ID:', 'ID Penjejakan:')}</span>
            <span className="text-sm font-mono font-bold text-lime-800">{req.trackingId}</span>
          </div>
        </div>

        <div className="bg-lime-100 border border-lime-300 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-stone-600 mb-1">{t('Current Status', 'Status Semasa')}</div>
              <div className="text-xl font-bold text-stone-900">{statusTitle}</div>
            </div>
            <div className="w-14 h-14 shrink-0 rounded-full bg-lime-500 flex items-center justify-center text-2xl text-lime-950">
              {delivered ? '✓' : '⚙️'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lime-300">
            <div>
              <div className="text-xs text-stone-600 mb-1">{t('Estimated Delivery', 'Anggaran Penghantaran')}</div>
              <div className="text-sm font-semibold text-stone-900">{formatDate(dayAfter(TOTAL_DAYS))}</div>
            </div>
            <div>
              <div className="text-xs text-stone-600 mb-1">{t('Days Remaining', 'Hari Berbaki')}</div>
              <div className="text-sm font-semibold text-stone-900">
                {daysRemaining} {t(daysRemaining === 1 ? 'day' : 'days', 'hari')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-stone-900 mb-6">{t('Progress Timeline', 'Garis Masa Kemajuan')}</h3>
          <div>
            {stages.map((stage, index) => (
              <div key={stage.en} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stage.status === 'completed'
                        ? 'bg-lime-500 text-lime-950'
                        : stage.status === 'current'
                        ? 'bg-white border-2 border-lime-500 text-lime-700 ring-4 ring-lime-500/20'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {stage.status === 'completed' ? '✓' : index + 1}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`w-0.5 h-10 my-1 ${stage.status === 'completed' ? 'bg-lime-500' : 'bg-stone-200'}`} />
                  )}
                </div>
                <div className="flex-1 pt-2 pb-6">
                  <div className={`text-sm font-semibold ${stage.status === 'pending' ? 'text-stone-400' : 'text-stone-900'}`}>
                    {isMs ? stage.ms : stage.en}
                  </div>
                  <div className={`text-xs mt-1 ${stage.status === 'pending' ? 'text-stone-400' : 'text-stone-600'}`}>
                    {stage.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-stone-900 mb-4">{t('Documents Requested', 'Dokumen Dipohon')}</h3>
          <div className="space-y-3">
            {req.documentsLost.map((value) => {
              const doc = getDocument(value);
              return (
                <div key={value} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-milk border border-stone-200">
                  <div>
                    <div className="text-sm font-medium text-stone-900">{doc ? (isMs ? doc.ms : doc.en) : value}</div>
                    <div className="text-xs text-stone-500">{doc ? (isMs ? doc.agencyMs : doc.agencyEn) : '-'}</div>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 rounded-full bg-lime-100 text-lime-800 text-xs font-semibold">{docStatus}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="mt-0.5">💬</div>
          <div>
            <div className="text-sm font-semibold text-stone-900 mb-1">{t('Need Help?', 'Perlukan Bantuan?')}</div>
            <div className="text-xs text-stone-700 mb-3">
              {t(
                'If you have any questions about your request, contact the relevant agency:',
                'Jika anda mempunyai pertanyaan mengenai permohonan anda, hubungi agensi yang berkaitan:'
              )}
            </div>
            <div className="space-y-1 text-xs text-stone-600">
              <div>• {t('JPN Helpline', 'Talian Bantuan JPN')}: 1-300-88-1300</div>
              <div>• {t('JPJ Helpline', 'Talian Bantuan JPJ')}: 03-8000 8000</div>
              <div>• {t('Immigration', 'Imigresen')}: 03-8880 1000</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={backToSearch}
            className="flex-1 px-6 py-3 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-semibold transition-colors"
          >
            {t('Track Another Request', 'Jejak Permohonan Lain')}
          </button>
          <Link
            href="/recover"
            className="flex-1 px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-400 text-lime-950 font-semibold transition-colors text-center"
          >
            {t('New Request', 'Permohonan Baharu')}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-milk text-stone-900">
      <SiteHeader isMs={isMs} onToggleLanguage={toggleLanguage}>
        <Link href="/" className="px-3 py-2 rounded-lg text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors">
          {t('Home', 'Utama')}
        </Link>
      </SiteHeader>

      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {lookupState === 'loading' ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-lime-500 rounded-full animate-spin" />
            </div>
          ) : lookupState === 'found' && request ? (
            renderResults(request)
          ) : lookupState === 'notFound' ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">✗</div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">{t('Tracking ID Not Found', 'ID Penjejakan Tidak Dijumpai')}</h2>
                <p className="text-sm text-stone-600">
                  <span className="font-mono font-semibold">{urlId}</span>{' '}
                  {t('does not exist in our system', 'tidak wujud dalam sistem kami')}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-md mx-auto text-left">
                <div className="text-sm font-semibold text-stone-900 mb-3">{t('Please check:', 'Sila semak:')}</div>
                <div className="text-xs text-stone-700 space-y-2">
                  <div>• {t('Your tracking ID is typed correctly', 'ID penjejakan anda ditaip dengan betul')}</div>
                  <div>• {t('Format: DR followed by 8 letters or numbers', 'Format: DR diikuti 8 huruf atau nombor')}</div>
                  <div>
                    • {t(
                      'You are using the same browser you submitted the request from',
                      'Anda menggunakan pelayar yang sama semasa menghantar permohonan'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <button
                  onClick={backToSearch}
                  className="w-full px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-400 text-lime-950 font-semibold transition-colors"
                >
                  {t('Try Again', 'Cuba Lagi')}
                </button>
                <Link
                  href="/recover"
                  className="w-full px-6 py-3 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-semibold transition-colors text-center"
                >
                  {t('Make New Request', 'Buat Permohonan Baharu')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">{t('Track Your Request', 'Jejak Permohonan Anda')}</h1>
                <p className="text-sm text-stone-600">
                  {t(
                    'Enter your tracking ID to check the status of your document recovery',
                    'Masukkan ID penjejakan anda untuk menyemak status pemulihan dokumen'
                  )}
                </p>
              </div>

              <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
                <div>
                  <label htmlFor="trackingId" className="block text-sm font-medium text-stone-700 mb-2">
                    {t('Tracking ID', 'ID Penjejakan')}
                  </label>
                  <input
                    id="trackingId"
                    type="text"
                    autoComplete="off"
                    value={inputId}
                    onChange={(e) => setInputId(normaliseId(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 font-mono text-center text-lg focus:border-lime-500 focus:ring-2 focus:ring-lime-500/30 outline-none transition-colors"
                    placeholder="DRXXXXXXXX"
                  />
                  <div className="text-xs text-stone-500 mt-2">
                    {t('Format: DR followed by 8 letters or numbers', 'Format: DR diikuti 8 huruf atau nombor')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputId}
                  className="w-full px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-lime-950 font-semibold transition-colors"
                >
                  {t('Track Status', 'Jejak Status')}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-stone-500 mb-2">{t("Don't have a tracking ID?", 'Tiada ID penjejakan?')}</p>
                <Link href="/recover" className="text-sm font-semibold text-lime-700 hover:text-lime-800 underline">
                  {t('Start a new recovery request →', 'Mula permohonan pemulihan baharu →')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
