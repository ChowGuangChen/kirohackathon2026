'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ViewMode = 'desktop' | 'phone';

const STORAGE_KEY = 'docurecover_view';
const WIDE_QUERY = '(min-width: 768px)';
const listeners = new Set<() => void>();

function read(): ViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'phone' ? 'phone' : 'desktop';
  } catch {
    return 'desktop';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function useViewMode() {
  const mode = useSyncExternalStore<ViewMode>(subscribe, read, () => 'desktop');

  const setMode = useCallback((next: ViewMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { mode, setMode };
}

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

export function useIsWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => false);
}
