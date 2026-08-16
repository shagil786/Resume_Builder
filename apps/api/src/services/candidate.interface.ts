import type { CandidateProfile, CandidateFact, FactProvenance, PersonalInfo, WorkExperience, ProjectEntry, Skill, EducationEntry, Certification } from '@resume-builder/domain';

export type WorkExperienceInput = Omit<WorkExperience, 'id' | 'profileId' | 'bulletPoints' | 'factIds' | 'startDate' | 'endDate'> & {
  startDate: string | Date;
  endDate?: string | Date;
  factIds?: string[];
};
export type ProjectInput = Omit<ProjectEntry, 'id' | 'profileId' | 'bulletPoints' | 'factIds' | 'startDate' | 'endDate'> & {
  startDate?: string | Date;
  endDate?: string | Date;
  factIds?: string[];
};
export type EducationInput = Omit<EducationEntry, 'id' | 'profileId' | 'factIds' | 'startDate' | 'endDate'> & {
  startDate?: string | Date;
  endDate?: string | Date;
  factIds?: string[];
};
export type CertificationInput = Omit<Certification, 'id' | 'profileId' | 'factIds' | 'issueDate' | 'expiryDate'> & {
  issueDate?: string | Date;
  expiryDate?: string | Date;
  factIds?: string[];
};

export interface ICandidateProfileService {
  createProfile(userId: string, personalInfo: PersonalInfo): Promise<{ profileId: string }>;
  getProfileForUser(userId: string): Promise<CandidateProfile | null>;
  getProfile(profileId: string): Promise<CandidateProfile | null>;
  updateProfile(profileId: string, data: Partial<CandidateProfile>): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  addExperience(profileId: string, data: WorkExperienceInput): Promise<{ experienceId: string }>;
  updateExperience(profileId: string, experienceId: string, data: Partial<WorkExperience>): Promise<void>;
  deleteExperience(profileId: string, experienceId: string): Promise<void>;
  addProject(profileId: string, data: ProjectInput): Promise<{ projectId: string }>;
  addSkill(profileId: string, data: Omit<Skill, 'id' | 'profileId'>): Promise<{ skillId: string }>;
  addEducation(profileId: string, data: EducationInput): Promise<{ educationId: string }>;
  addCertification(profileId: string, data: CertificationInput): Promise<{ certificationId: string }>;
  searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }>;
  getFactForProfile(profileId: string, factId: string): Promise<CandidateFact | null>;
  updateFactStatus(factId: string, status: string, notes?: string): Promise<void>;
  getFactProvenance(factId: string): Promise<FactProvenance | null>;
}
