// Service: Candidate Profile Service
// Purpose: Business logic layer for candidate profile management

import {
  CandidateProfile,
  CandidateFact,
  WorkExperience,
  ProjectEntry,
  Skill,
  EducationEntry,
  Certification,
  SourceDocument,
  PersonalInfo,
  CandidateProfileWithProvenance,
  FactProvenance,
} from '../../packages/domain/src';
import {
  CreateCandidateProfileRequest,
  UpdateCandidateProfileRequest,
  GetCandidateProfileRequest,
  AddWorkExperienceRequest,
  UpdateWorkExperienceRequest,
  AddProjectRequest,
  AddSkillRequest,
  AddEducationRequest,
  AddCertificationRequest,
  UploadSourceDocumentRequest,
  ProcessDocumentsRequest,
  SearchCandidateFactsRequest,
  UpdateFactStatusRequest,
  GetResumeGenerationContextRequest,
} from './endpoints';

/**
 * Service interface for candidate profile operations
 */
export interface ICandidateProfileService {
  // Profile lifecycle
  createProfile(req: CreateCandidateProfileRequest): Promise<{ profileId: string }>;
  getProfile(req: GetCandidateProfileRequest): Promise<CandidateProfile | null>;
  getProfileWithProvenance(req: GetCandidateProfileRequest): Promise<CandidateProfileWithProvenance | null>;
  updateProfile(req: UpdateCandidateProfileRequest): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;

  // Experience management
  addExperience(req: AddWorkExperienceRequest): Promise<{ experienceId: string; factIds: string[] }>;
  updateExperience(req: UpdateWorkExperienceRequest): Promise<void>;
  deleteExperience(profileId: string, experienceId: string): Promise<void>;

  // Project management
  addProject(req: AddProjectRequest): Promise<{ projectId: string; factIds: string[] }>;
  updateProject(profileId: string, projectId: string, updates: Partial<ProjectEntry>): Promise<void>;
  deleteProject(profileId: string, projectId: string): Promise<void>;

  // Skill management
  addSkill(req: AddSkillRequest): Promise<{ skillId: string; factIds: string[] }>;
  updateSkill(profileId: string, skillId: string, updates: Partial<Skill>): Promise<void>;
  deleteSkill(profileId: string, skillId: string): Promise<void>;

  // Education management
  addEducation(req: AddEducationRequest): Promise<{ educationId: string; factIds: string[] }>;
  updateEducation(profileId: string, educationId: string, updates: Partial<EducationEntry>): Promise<void>;
  deleteEducation(profileId: string, educationId: string): Promise<void>;

  // Certification management
  addCertification(req: AddCertificationRequest): Promise<{ certificationId: string; factIds: string[] }>;
  updateCertification(profileId: string, certificationId: string, updates: Partial<Certification>): Promise<void>;
  deleteCertification(profileId: string, certificationId: string): Promise<void>;

  // Document management
  uploadDocument(req: UploadSourceDocumentRequest): Promise<{ documentId: string; status: string }>;
  processDocuments(req: ProcessDocumentsRequest): Promise<{ processedCount: number; failedCount: number }>;
  getDocumentStatus(profileId: string, documentId: string): Promise<SourceDocument | null>;
  deleteDocument(profileId: string, documentId: string): Promise<void>;

  // Fact management
  searchFacts(req: SearchCandidateFactsRequest): Promise<{ facts: CandidateFact[]; total: number }>;
  updateFactStatus(req: UpdateFactStatusRequest): Promise<void>;
  getFactProvenance(profileId: string, factId: string): Promise<FactProvenance | null>;

  // Resume generation context
  getGenerationContext(req: GetResumeGenerationContextRequest): Promise<{
    profileId: string;
    personalInfo: PersonalInfo;
    summary?: string;
    verifiedFacts: CandidateFact[];
    workExperience: WorkExperience[];
    projects: ProjectEntry[];
    skills: Skill[];
    education: EducationEntry[];
    certifications: Certification[];
  }>;

  // Bulk operations
  getProfilesByUserId(userId: string): Promise<CandidateProfile[]>;
  archiveProfile(profileId: string): Promise<void>;
  restoreProfile(profileId: string): Promise<void>;
}

/**
 * Events emitted by the candidate service
 */
export interface CandidateProfileEvents {
  'profile.created': { profileId: string; userId: string; timestamp: Date };
  'profile.updated': { profileId: string; userId: string; timestamp: Date };
  'profile.archived': { profileId: string; userId: string; timestamp: Date };
  'profile.restored': { profileId: string; userId: string; timestamp: Date };
  'experience.added': { profileId: string; experienceId: string; timestamp: Date };
  'project.added': { profileId: string; projectId: string; timestamp: Date };
  'skill.added': { profileId: string; skillId: string; timestamp: Date };
  'education.added': { profileId: string; educationId: string; timestamp: Date };
  'certification.added': { profileId: string; certificationId: string; timestamp: Date };
  'document.uploaded': { profileId: string; documentId: string; filename: string; timestamp: Date };
  'document.processed': { profileId: string; documentId: string; factCount: number; timestamp: Date };
  'document.failed': { profileId: string; documentId: string; error: string; timestamp: Date };
  'fact.statusChanged': { profileId: string; factId: string; oldStatus: string; newStatus: string; timestamp: Date };
}

/**
 * Service configuration
 */
export interface CandidateServiceConfig {
  maxDocumentSizeBytes: number;
  allowedMimeTypes: string[];
  factConfidenceThreshold: number;
  enableAutomaticVerification: boolean;
  provenanceRetentionDays: number;
}

/**
 * Default service configuration
 */
export const DEFAULT_CANDIDATE_SERVICE_CONFIG: CandidateServiceConfig = {
  maxDocumentSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  factConfidenceThreshold: 0.7,
  enableAutomaticVerification: false,
  provenanceRetentionDays: 365,
};

/**
 * Error codes for candidate service
 */
export const CANDIDATE_SERVICE_ERRORS = {
  PROFILE_NOT_FOUND: 'CANDIDATE_PROFILE_NOT_FOUND',
  UNAUTHORIZED_ACCESS: 'CANDIDATE_UNAUTHORIZED_ACCESS',
  INVALID_DOCUMENT_FORMAT: 'CANDIDATE_INVALID_DOCUMENT_FORMAT',
  DOCUMENT_TOO_LARGE: 'CANDIDATE_DOCUMENT_TOO_LARGE',
  FACT_NOT_FOUND: 'CANDIDATE_FACT_NOT_FOUND',
  DOCUMENT_PROCESSING_FAILED: 'CANDIDATE_DOCUMENT_PROCESSING_FAILED',
  DUPLICATE_FACT: 'CANDIDATE_DUPLICATE_FACT',
  INVALID_FACT_STATUS: 'CANDIDATE_INVALID_FACT_STATUS',
  VALIDATION_ERROR: 'CANDIDATE_VALIDATION_ERROR',
} as const;

export type CandidateServiceErrorCode = typeof CANDIDATE_SERVICE_ERRORS[keyof typeof CANDIDATE_SERVICE_ERRORS];

/**
 * Custom error class for candidate service
 */
export class CandidateServiceError extends Error {
  public readonly code: CandidateServiceErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(code: CandidateServiceErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'CandidateServiceError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}