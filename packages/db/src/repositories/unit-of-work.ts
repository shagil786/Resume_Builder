import type { DB, TX } from './types';
import { createCandidateProfileRepository, type ICandidateProfileRepository } from './candidate-profile.repository';
import { createCandidateFactRepository, type ICandidateFactRepository } from './candidate-fact.repository';
import { createWorkExperienceRepository, type IWorkExperienceRepository } from './work-experience.repository';
import { createProjectRepository, type IProjectRepository } from './project.repository';
import { createSkillRepository, type ISkillRepository } from './skill.repository';
import { createEducationRepository, type IEducationRepository } from './education.repository';
import { createCertificationRepository, type ICertificationRepository } from './certification.repository';
import { createSourceDocumentRepository, type ISourceDocumentRepository } from './source-document.repository';
import { createFactProvenanceRepository, type IFactProvenanceRepository } from './fact-provenance.repository';
import { createGenerationRunRepository, type IGenerationRunRepository } from './generation-run.repository';
import { createResumeVersionRepository, type IResumeVersionRepository } from './resume-version.repository';

export interface IUnitOfWork {
  candidateProfiles: ICandidateProfileRepository;
  candidateFacts: ICandidateFactRepository;
  workExperiences: IWorkExperienceRepository;
  projects: IProjectRepository;
  skills: ISkillRepository;
  education: IEducationRepository;
  certifications: ICertificationRepository;
  sourceDocuments: ISourceDocumentRepository;
  factProvenance: IFactProvenanceRepository;
  generationRuns: IGenerationRunRepository;
  resumeVersions: IResumeVersionRepository;

  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export function createUnitOfWork(db: DB | TX): IUnitOfWork {
  return {
    candidateProfiles: createCandidateProfileRepository(db),
    candidateFacts: createCandidateFactRepository(db),
    workExperiences: createWorkExperienceRepository(db),
    projects: createProjectRepository(db),
    skills: createSkillRepository(db),
    education: createEducationRepository(db),
    certifications: createCertificationRepository(db),
    sourceDocuments: createSourceDocumentRepository(db),
    factProvenance: createFactProvenanceRepository(db),
    generationRuns: createGenerationRunRepository(db),
    resumeVersions: createResumeVersionRepository(db),

    async commit() {},
    async rollback() {},
  };
}
