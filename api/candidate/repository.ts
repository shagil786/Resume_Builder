// Repository: Candidate Profile Repository
// Purpose: Database abstraction layer for candidate persistence

import {
  CandidateProfile,
  CandidateFact,
  WorkExperience,
  ProjectEntry,
  Skill,
  EducationEntry,
  Certification,
  SourceDocument,
  FactProvenance,
} from '../../packages/domain/src';

/**
 * Base repository interface
 */
export interface IBaseRepository<T, K> {
  findById(id: K): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: K, updates: Partial<T>): Promise<T | null>;
  delete(id: K): Promise<boolean>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Search filters for facts
 */
export interface FactSearchFilters {
  factStatus?: CandidateFact['status'][];
  sourceTypes?: string[];
  dateRange?: { start: Date; end: Date };
  confidenceThreshold?: number;
}

/**
 * Repository for CandidateProfile entities
 */
export interface ICandidateProfileRepository extends IBaseRepository<CandidateProfile, string> {
  // Profile-specific queries
  findByUserId(userId: string): Promise<CandidateProfile[]>;
  findWithProvenance(id: string): Promise<CandidateProfile | null>;
  archive(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  getGenerationContext(profileId: string): Promise<{
    profile: CandidateProfile;
    verifiedFacts: CandidateFact[];
  } | null>;
}

/**
 * Repository for CandidateFact entities
 */
export interface ICandidateFactRepository {
  findById(id: string): Promise<CandidateFact | null>;
  findByProfileId(profileId: string, filters?: FactSearchFilters, pagination?: PaginationParams): Promise<PaginatedResult<CandidateFact>>;
  findBySourceId(sourceId: string): Promise<CandidateFact[]>;
  findByStatus(profileId: string, status: CandidateFact['status']): Promise<CandidateFact[]>;
  searchByText(profileId: string, query: string, filters?: FactSearchFilters): Promise<PaginatedResult<CandidateFact>>;
  create(entity: Omit<CandidateFact, 'id'>): Promise<CandidateFact>;
  createMany(entities: Omit<CandidateFact, 'id'>[]): Promise<CandidateFact[]>;
  update(id: string, updates: Partial<CandidateFact>): Promise<CandidateFact | null>;
  updateStatus(id: string, status: CandidateFact['status'], notes?: string): Promise<CandidateFact | null>;
  delete(id: string): Promise<boolean>;
  deleteByProfileId(profileId: string): Promise<number>;
}

/**
 * Repository for WorkExperience entities
 */
export interface IWorkExperienceRepository extends IBaseRepository<WorkExperience, string> {
  findByProfileId(profileId: string): Promise<WorkExperience[]>;
  findByCompany(profileId: string, company: string): Promise<WorkExperience[]>;
  findByDateRange(profileId: string, start: Date, end: Date): Promise<WorkExperience[]>;
  createMany(experiences: Omit<WorkExperience, 'id'>[]): Promise<WorkExperience[]>;
  updateWithFacts(id: string, updates: Partial<WorkExperience>, factUpdates?: Partial<CandidateFact>[]): Promise<WorkExperience | null>;
}

/**
 * Repository for ProjectEntry entities
 */
export interface IProjectRepository extends IBaseRepository<ProjectEntry, string> {
  findByProfileId(profileId: string): Promise<ProjectEntry[]>;
  findByTechnology(profileId: string, technology: string): Promise<ProjectEntry[]>;
  createMany(projects: Omit<ProjectEntry, 'id'>[]): Promise<ProjectEntry[]>;
}

/**
 * Repository for Skill entities
 */
export interface ISkillRepository extends IBaseRepository<Skill, string> {
  findByProfileId(profileId: string): Promise<Skill[]>;
  findByCategory(profileId: string, category: string): Promise<Skill[]>;
  findByName(profileId: string, name: string): Promise<Skill | null>;
  createMany(skills: Omit<Skill, 'id'>[]): Promise<Skill[]>;
  updateProficiency(id: string, yearsOfExperience: number): Promise<Skill | null>;
}

/**
 * Repository for EducationEntry entities
 */
export interface IEducationRepository extends IBaseRepository<EducationEntry, string> {
  findByProfileId(profileId: string): Promise<EducationEntry[]>;
  findByInstitution(profileId: string, institution: string): Promise<EducationEntry[]>;
  createMany(education: Omit<EducationEntry, 'id'>[]): Promise<EducationEntry[]>;
}

/**
 * Repository for Certification entities
 */
export interface ICertificationRepository extends IBaseRepository<Certification, string> {
  findByProfileId(profileId: string): Promise<Certification[]>;
  findByIssuingOrg(profileId: string, org: string): Promise<Certification[]>;
  findExpiringSoon(profileId: string, days: number): Promise<Certification[]>;
  createMany(certifications: Omit<Certification, 'id'>[]): Promise<Certification[]>;
}

/**
 * Repository for SourceDocument entities
 */
export interface ISourceDocumentRepository extends IBaseRepository<SourceDocument, string> {
  findByProfileId(profileId: string): Promise<SourceDocument[]>;
  findByStatus(status: SourceDocument['status']): Promise<SourceDocument[]>;
  updateStatus(id: string, status: SourceDocument['status']): Promise<SourceDocument | null>;
  updateExtractedAt(id: string, extractedAt: Date): Promise<SourceDocument | null>;
  getStorageUrl(id: string): Promise<string | null>;
}

/**
 * Repository for FactProvenance entities
 */
export interface IFactProvenanceRepository {
  findByFactId(factId: string): Promise<FactProvenance | null>;
  findBySourceId(sourceId: string): Promise<FactProvenance[]>;
  create(entity: Omit<FactProvenance, 'id'>): Promise<FactProvenance>;
  createMany(entities: Omit<FactProvenance, 'id'>[]): Promise<FactProvenance[]>;
  update(factId: string, updates: Partial<FactProvenance>): Promise<FactProvenance | null>;
  deleteByFactId(factId: string): Promise<boolean>;
}

/**
 * Unit of work interface for transaction management
 */
export interface IUnitOfWork {
  // Repositories
  candidateProfiles: ICandidateProfileRepository;
  candidateFacts: ICandidateFactRepository;
  workExperiences: IWorkExperienceRepository;
  projects: IProjectRepository;
  skills: ISkillRepository;
  education: IEducationRepository;
  certifications: ICertificationRepository;
  sourceDocuments: ISourceDocumentRepository;
  factProvenance: IFactProvenanceRepository;

  // Transaction management
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  complete<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}

/**
 * Database context interface
 */
export interface IDatabaseContext {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Unit of work factory
  createUnitOfWork(): IUnitOfWork;

  // Health check
  isHealthy(): Promise<boolean>;

  // Migration support
  runMigrations(): Promise<void>;
  getMigrationStatus(): Promise<{
    pending: number;
    applied: number;
    lastApplied?: Date;
  }>;
}

/**
 * PostgreSQL-specific configuration
 */
export interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
  connectionTimeoutMs?: number;
  idleTimeoutMs?: number;
}

/**
 * Migration interface
 */
export interface Migration {
  id: string;
  name: string;
  up: (db: IDatabaseContext) => Promise<void>;
  down: (db: IDatabaseContext) => Promise<void>;
  appliedAt?: Date;
}

/**
 * Transaction isolation levels
 */
export enum TransactionIsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

/**
 * Repository error codes
 */
export const REPOSITORY_ERRORS = {
  CONNECTION_FAILED: 'REPOSITORY_CONNECTION_FAILED',
  TRANSACTION_FAILED: 'REPOSITORY_TRANSACTION_FAILED',
  ENTITY_NOT_FOUND: 'REPOSITORY_ENTITY_NOT_FOUND',
  DUPLICATE_KEY: 'REPOSITORY_DUPLICATE_KEY',
  VALIDATION_ERROR: 'REPOSITORY_VALIDATION_ERROR',
  FOREIGN_KEY_VIOLATION: 'REPOSITORY_FOREIGN_KEY_VIOLATION',
  QUERY_TIMEOUT: 'REPOSITORY_QUERY_TIMEOUT',
  SERIALIZATION_ERROR: 'REPOSITORY_SERIALIZATION_ERROR',
} as const;

export type RepositoryErrorCode = typeof REPOSITORY_ERRORS[keyof typeof REPOSITORY_ERRORS];

/**
 * Custom error class for repository operations
 */
export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly table?: string;
  public readonly constraint?: string;
  public readonly originalError?: Error;
  public readonly timestamp: Date;

  constructor(
    code: RepositoryErrorCode,
    message: string,
    options?: { table?: string; constraint?: string; originalError?: Error }
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.table = options?.table;
    this.constraint = options?.constraint;
    this.originalError = options?.originalError;
    this.timestamp = new Date();
  }
}