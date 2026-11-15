'use client';

import { Suspense } from 'react';
import TrackPageClient from './TrackPageClient';

export default function TrackPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-milk flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-lime-500 rounded-full animate-spin" />
        </div>
      }
    >
      <TrackPageClient />
    </Suspense>
  );
}
