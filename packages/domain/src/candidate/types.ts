export interface CandidateFact {
  id: string;
  sourceRef: string;
  sourceLocation?: {
    pageNumber?: number;
    boundingBox?: [number, number, number, number];
    characterRange?: { start: number; end: number };
  };
  claim: string;
  context: string;
  confidence: number;
  status: 'EXTRACTED' | 'USER_PROVIDED' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  category: 'WORK' | 'SKILL' | 'PROJECT' | 'EDUCATION' | 'CERTIFICATION' | 'ACHIEVEMENT';
  timestamp: Date;
  version: number;
  verificationNotes?: string;
}

export interface WorkExperience {
  id: string;
  profileId: string;
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  factIds: string[];
  bulletPoints: ExperienceBullet[];
}

export interface ExperienceBullet {
  id: string;
  experienceId: string;
  text: string;
  factIds: string[];
  sourceReferences: SourceReference[];
}

export interface ProjectEntry {
  id: string;
  profileId: string;
  name: string;
  description: string;
  url?: string;
  githubUrl?: string;
  startDate: Date;
  endDate?: Date;
  factIds: string[];
  bulletPoints: ProjectBullet[];
}

export interface ProjectBullet {
  id: string;
  projectId: string;
  text: string;
  factIds: string[];
  sourceReferences: SourceReference[];
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  category: string;
  yearsOfExperience?: number;
  proficiency?: 'ENTRY' | 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';
  factId?: string;
  verifiedAt?: Date;
}

export interface EducationEntry {
  id: string;
  profileId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date;
  gpa?: number;
  factIds: string[];
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  factIds: string[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  piiFields: PIIField[];
}

export interface PIIField {
  path: string;
  visibility: 'USER_ONLY' | 'HIRING_MANAGER' | 'PUBLIC';
}

export interface CandidateProfile {
  id: string;
  userId: string;
  personalInfo: PersonalInfo;
  summary?: string;
  visibility: 'PRIVATE' | 'PUBLIC_LINK';
  status: 'DRAFT' | 'FINALIZED';
  workExperience: WorkExperience[];
  projects: ProjectEntry[];
  skills: Skill[];
  education: EducationEntry[];
  certifications: Certification[];
  sourceDocuments: SourceDocument[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  latestProcessedAt?: Date;
}

export interface CandidateProfileWithProvenance extends CandidateProfile {
  factProvenance: FactProvenance[];
}

export interface FactProvenance {
  factId: string;
  sourceId: string;
  extractionMethod: 'PDF_PARSER' | 'DOCX_PARSER' | 'OCR' | 'USER_INPUT';
  humanVerified: boolean;
  verificationNotes?: string;
  confidenceAtExtraction: number;
}

export interface SourceDocument {
  id: string;
  profileId: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadDate: Date;
  storagePath?: string;
  status: 'PENDING_PROCESSING' | 'PROCESSED' | 'FAILED';
  processingError?: string;
  extractedAt?: Date;
  checksum?: string;
}

export interface SourceReference {
  sourceId: string;
  pageNumber?: number;
  snippet: string;
  confidence?: number;
}
