import { DocumentType, DocumentStatus, DamageLevel, Language } from '../types';

/**
 * Returns Tailwind text color class based on document status
 */
export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'safe':
      return 'text-emerald-400';
    case 'damaged':
      return 'text-amber-400';
    case 'lost':
      return 'text-rose-400';
    case 'recovered':
      return 'text-blue-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Returns Tailwind background and border styling class based on document status
 */
export function getStatusBg(status: DocumentStatus): string {
  switch (status) {
    case 'safe':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'damaged':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'lost':
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    case 'recovered':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
  }
}

/**
 * Returns localized label for document types
 */
export function getDocumentLabel(type: DocumentType, language: Language = 'en'): string {
  const labels: Record<DocumentType, { en: string; ms: string }> = {
    'mykad': {
      en: 'MyKad (Identity Card)',
      ms: 'MyKad (Kad Pengenalan)',
    },
    'birth-certificate': {
      en: 'Birth Certificate',
      ms: 'Sijil Kelahiran',
    },
    'passport': {
      en: 'Malaysian Passport',
      ms: 'Pasport Malaysia',
    },
    'driving-licence': {
      en: 'Driving Licence',
      ms: 'Lesen Memandu',
    },
    'academic-certificate': {
      en: 'Academic Certificate',
      ms: 'Sijil Akademik',
    },
  };

  return labels[type]?.[language] || labels[type]?.en || type;
}

/**
 * Returns standard Malaysian government authority for the document
 */
export function getAuthorityName(type: DocumentType): string {
  switch (type) {
    case 'mykad':
    case 'birth-certificate':
      return 'JPN (Jabatan Pendaftaran Negara)';
    case 'passport':
      return 'Jabatan Imigresen Malaysia (JIM)';
    case 'driving-licence':
      return 'JPJ (Jabatan Pengangkutan Jalan)';
    case 'academic-certificate':
      return 'Lembaga Peperiksaan / IPT';
    default:
      return 'Agensi Berkaitan';
  }
}

/**
 * Returns an emoji icon representing the document type
 */
export function getDocumentIcon(type: DocumentType): string {
  switch (type) {
    case 'mykad':
      return '🪪';
    case 'birth-certificate':
      return '📜';
    case 'passport':
      return '🛂';
    case 'driving-licence':
      return '🚗';
    case 'academic-certificate':
      return '🎓';
    default:
      return '📄';
  }
}

/**
 * Returns localized label for damage levels
 */
export function getDamageLabel(level: DamageLevel, language: Language = 'en'): string {
  const damageLabels: Record<DamageLevel, { en: string; ms: string }> = {
    none: {
      en: 'Intact / No Damage',
      ms: 'Elok / Tiada Kerosakan',
    },
    minor: {
      en: 'Minor Damage (Readable)',
      ms: 'Kerosakan Ringan (Boleh Dibaca)',
    },
    moderate: {
      en: 'Moderate Damage (Partially Legible)',
      ms: 'Kerosakan Sederhana (Sebahagian Boleh Dibaca)',
    },
    severe: {
      en: 'Severe Damage (Barely Legible)',
      ms: 'Kerosakan Teruk (Sukar Dibaca)',
    },
    destroyed: {
      en: 'Completely Destroyed / Unusable',
      ms: 'Musnah Sepenuhnya / Tidak Boleh Digunakan',
    },
  };

  return damageLabels[level]?.[language] || damageLabels[level]?.en || level;
}

/**
 * Returns Tailwind badge styling for damage levels
 */
export function getDamageBadgeColor(level: DamageLevel): string {
  switch (level) {
    case 'none':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'minor':
      return 'bg-teal-500/15 text-teal-300 border border-teal-500/30';
    case 'moderate':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'severe':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'destroyed':
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
  }
}

/**
 * Generates a unique UUID-like identifier
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Formats an ISO or standard date string in a user-friendly locale format
 */
export function formatDate(dateStr: string, language: Language = 'en'): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const locale = language === 'ms' ? 'ms-MY' : 'en-MY';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}
