'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type Language = 'en' | 'ms';

const STORAGE_KEY = 'docurecover_language';
const listeners = new Set<() => void>();

function read(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'ms' ? 'ms' : 'en';
  } catch {
    return 'en';
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

export function useLanguage() {
  const language = useSyncExternalStore<Language>(subscribe, read, () => 'en');

  useEffect(() => {
    document.documentElement.lang = language === 'ms' ? 'ms' : 'en';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, read() === 'ms' ? 'en' : 'ms');
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { language, isMs: language === 'ms', toggleLanguage };
}
