import type { CandidateProfile, CandidateFact, FactProvenance, PersonalInfo, WorkExperience, ProjectEntry, Skill, EducationEntry, Certification } from '@resume-builder/domain';

export interface ICandidateProfileService {
  createProfile(userId: string, personalInfo: PersonalInfo): Promise<{ profileId: string }>;
  getProfile(profileId: string): Promise<CandidateProfile | null>;
  updateProfile(profileId: string, data: Partial<CandidateProfile>): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  addExperience(profileId: string, data: Omit<WorkExperience, 'id' | 'bulletPoints' | 'profileId'>): Promise<{ experienceId: string }>;
  updateExperience(profileId: string, experienceId: string, data: Partial<WorkExperience>): Promise<void>;
  deleteExperience(profileId: string, experienceId: string): Promise<void>;
  addProject(profileId: string, data: Omit<ProjectEntry, 'id' | 'bulletPoints' | 'profileId'>): Promise<{ projectId: string }>;
  addSkill(profileId: string, data: Omit<Skill, 'id' | 'profileId'>): Promise<{ skillId: string }>;
  addEducation(profileId: string, data: Omit<EducationEntry, 'id' | 'profileId'>): Promise<{ educationId: string }>;
  addCertification(profileId: string, data: Omit<Certification, 'id' | 'profileId'>): Promise<{ certificationId: string }>;
  searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }>;
  updateFactStatus(factId: string, status: string, notes?: string): Promise<void>;
  getFactProvenance(factId: string): Promise<FactProvenance | null>;
}
