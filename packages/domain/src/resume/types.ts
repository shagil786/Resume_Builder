import { SourceReference } from '../candidate';

export interface ResumeVersion {
  id: string;
  profileId: string;
  templateId: string;
  jobId?: string;
  versionNumber: number;
  structuredData: ResumeContent;
  status: 'DRAFT' | 'GENERATED' | 'FINALIZED' | 'ARCHIVED';
  generationRunId?: string;
  createdAt: Date;
  updatedAt: Date;
  storagePath?: string;
  pdfChecksum?: string;
}

export interface ResumeContent {
  sections: ResumeSection[];
  header?: ResumeHeader;
  globalStyles?: ResumeStyles;
  metadata: {
    factUsageMap: Record<string, ResumeFactUsage>;
    sourceCoverageMap?: Record<string, unknown>;
  };
}

export interface ResumeHeader {
  name: string;
  headline?: string;
  contact: string[];
}

export interface ResumeSection {
  id: string;
  type: 'SUMMARY' | 'EXPERIENCE' | 'PROJECT' | 'SKILL' | 'EDUCATION' | 'CERTIFICATION' | 'CUSTOM';
  title: string;
  order: number;
  items: ResumeItem[];
}

export interface ResumeItem {
  id: string;
  sourceFactIds?: string[];
  sourceReferences?: SourceReference[];
  content: string;
  subtitle?: string;
  meta?: string;
  bulletPoints?: ResumeBullet[];
}

export interface ResumeBullet {
  id: string;
  text: string;
  evidence: string[];
  sourceReferences?: SourceReference[];
}

export interface ResumeFactUsage {
  factId: string;
  resumeItemId: string;
  resumeItemField: string;
}

export interface ResumeStyles {
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  colors?: Record<string, string>;
}

export interface ResumeStrategy {
  targetRole: string;
  emphasize: string[];
  deemphasize: string[];
  experiencePriority: string[];
  selectedFacts: string[];
  sectionBudget: Record<string, number>;
}

export interface ResumeFitEvaluation {
  valid: boolean;
  issues: ResumeIssue[];
}

export interface ResumeIssue {
  claim: string;
  reason: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface LayoutValidation {
  pages: number;
  overflow?: number;
  overflowSection?: string;
  issues: {
    type: string;
    message: string;
  }[];
}
