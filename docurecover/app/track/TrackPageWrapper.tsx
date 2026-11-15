'use client';

import { Suspense } from 'react';
import TrackPageClient from './TrackPageClient';

export default function TrackPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <div className="text-lg text-white font-semibold">Loading...</div>
        </div>
      </div>
    }>
      <TrackPageClient />
    </Suspense>
  );
}
