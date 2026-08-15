// API: Candidate Profile Endpoints
// Purpose: REST API contracts for candidate profile management

import { CandidateProfile, CandidateFact, WorkExperience, ProjectEntry, Skill, EducationEntry, Certification, PersonalInfo } from '../../packages/domain/src';

// ==================== Types ====================

/**
 * Request to create a new candidate profile
 */
export interface CreateCandidateProfileRequest {
  userId: string;
  personalInfo: PersonalInfo;
}

/**
 * Response for profile creation
 */
export interface CreateCandidateProfileResponse {
  profileId: string;
  status: 'CREATED';
}

/**
 * Request to update candidate profile
 */
export interface UpdateCandidateProfileRequest {
  profileId: string;
  personalInfo?: Partial<PersonalInfo>;
  summary?: string;
}

/**
 * Response for profile update
 */
export interface UpdateCandidateProfileResponse {
  profileId: string;
  updatedAt: Date;
  status: 'UPDATED';
}

/**
 * Request to get a candidate profile
 */
export interface GetCandidateProfileRequest {
  profileId: string;
  includeProvenance?: boolean;
}

/**
 * Response for getting candidate profile
 */
export type GetCandidateProfileResponse = CandidateProfile;

/**
 * Request to add a work experience
 */
export interface AddWorkExperienceRequest {
  profileId: string;
  experience: Omit<WorkExperience, 'id' | 'facts'> & { facts?: Omit<CandidateFact, 'id'>[] };
}

/**
 * Response for adding work experience
 */
export interface AddWorkExperienceResponse {
  experienceId: string;
  factIds: string[];
  status: 'CREATED';
}

/**
 * Request to update a work experience
 */
export interface UpdateWorkExperienceRequest {
  profileId: string;
  experienceId: string;
  updates: Partial<Omit<WorkExperience, 'id' | 'facts'>>;
}

/**
 * Request to add a project
 */
export interface AddProjectRequest {
  profileId: string;
  project: Omit<ProjectEntry, 'id' | 'facts'> & { facts?: Omit<CandidateFact, 'id'>[] };
}

/**
 * Response for adding project
 */
export interface AddProjectResponse {
  projectId: string;
  factIds: string[];
  status: 'CREATED';
}

/**
 * Request to add a skill
 */
export interface AddSkillRequest {
  profileId: string;
  skill: Omit<Skill, 'id' | 'facts'> & { facts?: Omit<CandidateFact, 'id'>[] };
}

/**
 * Response for adding skill
 */
export interface AddSkillResponse {
  skillId: string;
  factIds: string[];
  status: 'CREATED';
}

/**
 * Request to add education
 */
export interface AddEducationRequest {
  profileId: string;
  education: Omit<EducationEntry, 'id' | 'facts'> & { facts?: Omit<CandidateFact, 'id'>[] };
}

/**
 * Request to add certification
 */
export interface AddCertificationRequest {
  profileId: string;
  certification: Omit<Certification, 'id' | 'facts'> & { facts?: Omit<CandidateFact, 'id'>[] };
}

/**
 * Request to upload a source document
 */
export interface UploadSourceDocumentRequest {
  profileId: string;
  file: {
    filename: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

/**
 * Response for uploading source document
 */
export interface UploadSourceDocumentResponse {
  documentId: string;
  status: 'UPLOADED' | 'PROCESSING';
}

/**
 * Request to process uploaded documents
 */
export interface ProcessDocumentsRequest {
  profileId: string;
  documentIds: string[];
}

/**
 * Response for processing documents
 */
export interface ProcessDocumentsResponse {
  processedCount: number;
  failedCount: number;
  status: 'COMPLETED' | 'PARTIAL';
}

/**
 * Request to search candidate facts
 */
export interface SearchCandidateFactsRequest {
  profileId: string;
  query: string;
  filters?: {
    factStatus?: CandidateFact['status'][];
    sourceTypes?: string[];
    dateRange?: { start: Date; end: Date };
  };
  limit?: number;
}

/**
 * Response for searching candidate facts
 */
export interface SearchCandidateFactsResponse {
  facts: CandidateFact[];
  total: number;
}

/**
 * Request to update fact status
 */
export interface UpdateFactStatusRequest {
  profileId: string;
  factId: string;
  status: CandidateFact['status'];
  verificationNotes?: string;
}

/**
 * Request to get resume generation context
 * Used by AI services to retrieve verified facts
 */
export interface GetResumeGenerationContextRequest {
  profileId: string;
  jobId?: string;
  templateId?: string;
}

/**
 * Response with facts optimized for resume generation
 */
export interface GetResumeGenerationContextResponse {
  profileId: string;
  personalInfo: PersonalInfo;
  summary?: string;
  verifiedFacts: CandidateFact[];
  workExperience: WorkExperience[];
  projects: ProjectEntry[];
  skills: Skill[];
  education: EducationEntry[];
  certifications: Certification[];
}

/**
 * API Error response
 */
export interface CandidateApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// ==================== Route Definitions ====================

/**
 * Base path: /api/v1/candidates
 */
export const CANDIDATE_ROUTES = {
  BASE: '/api/v1/candidates',

  // Profile CRUD
  CREATE_PROFILE: 'POST /',
  GET_PROFILE: 'GET /:profileId',
  UPDATE_PROFILE: 'PATCH /:profileId',
  DELETE_PROFILE: 'DELETE /:profileId',

  // Experience
  ADD_EXPERIENCE: 'POST /:profileId/experience',
  UPDATE_EXPERIENCE: 'PATCH /:profileId/experience/:experienceId',
  DELETE_EXPERIENCE: 'DELETE /:profileId/experience/:experienceId',

  // Projects
  ADD_PROJECT: 'POST /:profileId/projects',
  UPDATE_PROJECT: 'PATCH /:profileId/projects/:projectId',
  DELETE_PROJECT: 'DELETE /:profileId/projects/:projectId',

  // Skills
  ADD_SKILL: 'POST /:profileId/skills',
  UPDATE_SKILL: 'PATCH /:profileId/skills/:skillId',
  DELETE_SKILL: 'DELETE /:profileId/skills/:skillId',

  // Education
  ADD_EDUCATION: 'POST /:profileId/education',
  UPDATE_EDUCATION: 'PATCH /:profileId/education/:educationId',
  DELETE_EDUCATION: 'DELETE /:profileId/education/:educationId',

  // Certifications
  ADD_CERTIFICATION: 'POST /:profileId/certifications',
  UPDATE_CERTIFICATION: 'PATCH /:profileId/certifications/:certificationId',
  DELETE_CERTIFICATION: 'DELETE /:profileId/certifications/:certificationId',

  // Documents
  UPLOAD_DOCUMENT: 'POST /:profileId/documents',
  PROCESS_DOCUMENTS: 'POST /:profileId/documents/process',
  GET_DOCUMENT_STATUS: 'GET /:profileId/documents/:documentId',
  DELETE_DOCUMENT: 'DELETE /:profileId/documents/:documentId',

  // Fact Management
  SEARCH_FACTS: 'POST /:profileId/facts/search',
  UPDATE_FACT_STATUS: 'PATCH /:profileId/facts/:factId/status',
  GET_FACT_PROVENANCE: 'GET /:profileId/facts/:factId/provenance',

  // Resume Generation Context
  GET_GENERATION_CONTEXT: 'GET /:profileId/generation-context',
} as const;

// ==================== Validation Schemas ====================

/**
 * Common validation rules for candidate data
 */
export const CANDIDATE_VALIDATION = {
  personalInfo: {
    firstName: { required: true, maxLength: 50 },
    lastName: { required: true, maxLength: 50 },
    email: { format: 'email', maxLength: 254 },
    phone: { pattern: '^\\+?[1-9]\\d{1,14}$' },
    linkedinUrl: { format: 'url' },
    portfolioUrl: { format: 'url' },
  },
  experience: {
    company: { required: true, maxLength: 100 },
    title: { required: true, maxLength: 100 },
    location: { maxLength: 100 },
  },
  skill: {
    name: { required: true, maxLength: 50 },
    category: { required: true, maxLength: 50 },
  },
  project: {
    name: { required: true, maxLength: 100 },
    description: { maxLength: 1000 },
  },
  document: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },
} as const;

export type CandidateRoutes = typeof CANDIDATE_ROUTES;