export { createConnection } from './connection';
export type { DBConfig, DB, TX } from './connection';
export { runMigrations } from './migrate';
export * from './schema';

export { createUnitOfWork } from './repositories/unit-of-work';
export { createUserRepository } from './repositories/user.repository';
export type { IUserRepository, UserRecord } from './repositories/user.repository';
export { createGenerationRunRepository } from './repositories/generation-run.repository';
export type { IGenerationRunRepository } from './repositories/generation-run.repository';
export type { IUnitOfWork } from './repositories/unit-of-work';

export { createCandidateProfileRepository } from './repositories/candidate-profile.repository';
export type { ICandidateProfileRepository } from './repositories/candidate-profile.repository';

export { createCandidateFactRepository } from './repositories/candidate-fact.repository';
export type { ICandidateFactRepository } from './repositories/candidate-fact.repository';

export { createWorkExperienceRepository } from './repositories/work-experience.repository';
export type { IWorkExperienceRepository } from './repositories/work-experience.repository';

export { createProjectRepository } from './repositories/project.repository';
export type { IProjectRepository } from './repositories/project.repository';

export { createSkillRepository } from './repositories/skill.repository';
export type { ISkillRepository } from './repositories/skill.repository';

export { createEducationRepository } from './repositories/education.repository';
export type { IEducationRepository } from './repositories/education.repository';

export { createCertificationRepository } from './repositories/certification.repository';
export type { ICertificationRepository } from './repositories/certification.repository';

export { createSourceDocumentRepository } from './repositories/source-document.repository';
export type { ISourceDocumentRepository } from './repositories/source-document.repository';

export { createFactProvenanceRepository } from './repositories/fact-provenance.repository';
export type { IFactProvenanceRepository } from './repositories/fact-provenance.repository';

export { RepositoryError, REPOSITORY_ERRORS } from './repositories/errors';
export type { RepositoryErrorCode } from './repositories/errors';
