'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsWide, useViewMode } from '@/app/_lib/useViewMode';
import { useLanguage } from '@/app/_lib/useLanguage';

function PhoneFrame({ isMs, onExit }: { isMs: boolean; onExit: (path: string | null) => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src] = useState(() => window.location.pathname + window.location.search);

  const exit = () => {
    let path: string | null = null;
    try {
      const location = frameRef.current?.contentWindow?.location;
      if (location) path = location.pathname + location.search;
    } catch {
      path = null;
    }
    onExit(path);
  };

  return (
    <div className="min-h-screen bg-stone-200 flex flex-col items-center gap-4 py-4 px-4">
      <button
        onClick={exit}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition-colors"
      >
        🖥️ {isMs ? 'Paparan Laman Web' : 'Website View'}
      </button>

      <div className="w-[414px] max-w-full rounded-[2.75rem] bg-stone-900 p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-milk h-[calc(100dvh-8rem)] min-h-[560px] max-h-[844px]">
          <iframe
            ref={frameRef}
            src={src}
            title="DocuRecover phone view"
            allow="camera"
            className="w-full h-full border-0 bg-milk"
          />
        </div>
      </div>
    </div>
  );
}

export default function ViewModeShell({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useViewMode();
  const isWide = useIsWide();
  const { isMs } = useLanguage();
  const router = useRouter();

  if (mode === 'phone' && isWide) {
    return (
      <PhoneFrame
        isMs={isMs}
        onExit={(path) => {
          if (path && path !== window.location.pathname + window.location.search) router.push(path);
          setMode('desktop');
        }}
      />
    );
  }

  return <>{children}</>;
}
