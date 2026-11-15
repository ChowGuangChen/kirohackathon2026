export type DocumentType =
  | 'mykad'
  | 'birth-cert'
  | 'marriage-cert'
  | 'passport'
  | 'driving-license'
  | 'vehicle-grant'
  | 'land-title'
  | 'academic-cert'
  | 'oku-card'
  | 'bank-passbook'
  | 'insurance-policy';

export type DisasterType = 'flood' | 'fire' | 'landslide' | 'other';

export type DocumentInfo = {
  value: DocumentType;
  icon: string;
  en: string;
  ms: string;
  agencyEn: string;
  agencyMs: string;
};

export type DocumentCategory = {
  id: string;
  icon: string;
  en: string;
  ms: string;
  documents: DocumentInfo[];
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'identity',
    icon: '🪪',
    en: 'Identity & Citizenship (JPN)',
    ms: 'Identiti & Kewarganegaraan (JPN)',
    documents: [
      { value: 'mykad', icon: '🪪', en: 'MyKad (Identity Card / IC)', ms: 'MyKad (Kad Pengenalan)', agencyEn: 'JPN', agencyMs: 'JPN' },
      { value: 'birth-cert', icon: '📜', en: 'Birth Certificate', ms: 'Sijil Kelahiran', agencyEn: 'JPN', agencyMs: 'JPN' },
      { value: 'marriage-cert', icon: '💍', en: 'Marriage / Divorce Certificate', ms: 'Sijil Perkahwinan / Perceraian', agencyEn: 'JPN', agencyMs: 'JPN' },
    ],
  },
  {
    id: 'travel',
    icon: '🚗',
    en: 'Travel & Transport (Immigration & JPJ)',
    ms: 'Perjalanan & Pengangkutan (Imigresen & JPJ)',
    documents: [
      { value: 'passport', icon: '🛂', en: 'Malaysian International Passport', ms: 'Pasport Antarabangsa Malaysia', agencyEn: 'Immigration', agencyMs: 'Imigresen' },
      { value: 'driving-license', icon: '🚗', en: 'Competent Driving Licence (LMM)', ms: 'Lesen Memandu Malaysia (LMM)', agencyEn: 'JPJ', agencyMs: 'JPJ' },
      { value: 'vehicle-grant', icon: '📄', en: 'Vehicle Ownership Certificate (Geran)', ms: 'Sijil Pemilikan Kenderaan (Geran)', agencyEn: 'JPJ', agencyMs: 'JPJ' },
    ],
  },
  {
    id: 'property',
    icon: '🏠',
    en: 'Property, Education & Finance',
    ms: 'Hartanah, Pendidikan & Kewangan',
    documents: [
      { value: 'land-title', icon: '🏠', en: 'Land Title / House Grant (Geran Tanah)', ms: 'Geran Tanah / Perjanjian Jual Beli', agencyEn: 'Land Office', agencyMs: 'Pejabat Tanah' },
      { value: 'academic-cert', icon: '🎓', en: 'SPM / STPM / University Certificates', ms: 'Sijil SPM / STPM / Universiti', agencyEn: 'Education', agencyMs: 'Pendidikan' },
      { value: 'oku-card', icon: '♿', en: 'OKU Card (Persons with Disabilities)', ms: 'Kad OKU (Orang Kurang Upaya)', agencyEn: 'JKM', agencyMs: 'JKM' },
      { value: 'bank-passbook', icon: '🏦', en: 'Bank Passbook', ms: 'Buku Akaun Bank', agencyEn: 'Bank', agencyMs: 'Bank' },
      { value: 'insurance-policy', icon: '📋', en: 'Insurance Policy Summary', ms: 'Ringkasan Polisi Insurans', agencyEn: 'Insurance', agencyMs: 'Insurans' },
    ],
  },
];

const BY_VALUE = new Map<string, DocumentInfo>(
  DOCUMENT_CATEGORIES.flatMap((c) => c.documents.map((d) => [d.value, d] as const))
);

export function getDocument(value: string): DocumentInfo | undefined {
  return BY_VALUE.get(value);
}

export const DISASTERS: { value: DisasterType; icon: string; en: string; ms: string }[] = [
  { value: 'flood', icon: '🌊', en: 'Flood', ms: 'Banjir' },
  { value: 'fire', icon: '🔥', en: 'Fire', ms: 'Kebakaran' },
  { value: 'landslide', icon: '⛰️', en: 'Landslide', ms: 'Tanah Runtuh' },
  { value: 'other', icon: '⚠️', en: 'Other', ms: 'Lain-lain' },
];

export type StoredRequest = {
  trackingId: string;
  submissionDate: string;
  fullName: string;
  icNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  disasterType: DisasterType;
  documentsLost: DocumentType[];
};

export const requestStorageKey = (trackingId: string) => `request_${trackingId}`;
