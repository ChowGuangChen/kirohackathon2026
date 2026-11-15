export type Language = 'en' | 'ms';

export type DocumentType =
  | 'mykad'
  | 'birth-certificate'
  | 'passport'
  | 'driving-licence'
  | 'academic-certificate';

export type DisasterType = 'flood' | 'fire' | 'landslide' | 'other';

export type DocumentStatus = 'safe' | 'damaged' | 'lost' | 'recovered';

export type DamageLevel = 'none' | 'minor' | 'moderate' | 'severe' | 'destroyed';

export interface AIAssessment {
  documentType: string;
  confidence: number;
  damageLevel: DamageLevel;
  assessment: string;
  recommendedAction: string;
}

export interface UserDocument {
  id: string;
  name: string;
  type: DocumentType;
  authority: string;
  status: DocumentStatus;
  dateLost?: string;
  recoveryProgress: number; // 0-100
  notes?: string;
  uploadedImageBase64?: string;
  aiAssessment?: AIAssessment;
  createdAt: string;
}

export interface RecoveryTask {
  id: string;
  documentId: string;
  documentType: DocumentType;
  documentName: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
  stepNumber: number;
}

export interface RecoveryCase {
  id: string;
  disasterType: DisasterType;
  incidentDate: string;
  location: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

export interface DocumentInfo {
  type: DocumentType;
  nameEn: string;
  nameMs: string;
  authority: string;
  authorityMs: string;
  website: string;
  phone: string;
  address: string;
  requiredDocuments: { en: string[]; ms: string[] };
  procedure: { en: string[]; ms: string[] };
  fee: { en: string; ms: string };
  processingTime: { en: string; ms: string };
  applicationLink?: string;
  notes: { en: string; ms: string };
  aiPromptHints: string[];
}
