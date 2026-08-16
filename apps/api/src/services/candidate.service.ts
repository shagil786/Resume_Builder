import type { CandidateProfile, CandidateFact, FactProvenance, PersonalInfo, WorkExperience, Skill } from '@resume-builder/domain';
import { AppError } from '@resume-builder/shared';
import type { CertificationInput, EducationInput, ICandidateProfileService, ProjectInput, WorkExperienceInput } from './candidate.interface.js';

export class CandidateProfileService implements ICandidateProfileService {
  private profiles = new Map<string, CandidateProfile>();
  private facts = new Map<string, CandidateFact>();
  private counter = 0;

  async createProfile(userId: string, personalInfo: PersonalInfo): Promise<{ profileId: string }> {
    this.counter++;
    const id = `profile-${this.counter}`;
    const now = new Date();
    this.profiles.set(id, {
      id,
      userId,
      personalInfo,
      visibility: 'PRIVATE',
      status: 'DRAFT',
      workExperience: [],
      projects: [],
      skills: [],
      education: [],
      certifications: [],
      sourceDocuments: [],
      createdAt: now,
      updatedAt: now,
    });
    return { profileId: id };
  }

  async getProfile(profileId: string): Promise<CandidateProfile | null> {
    return this.profiles.get(profileId) ?? null;
  }

  async updateProfile(profileId: string, data: Partial<CandidateProfile>): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    this.profiles.set(profileId, { ...profile, ...data, updatedAt: new Date() });
  }

  async deleteProfile(profileId: string): Promise<void> {
    this.profiles.delete(profileId);
  }

  async addExperience(profileId: string, data: WorkExperienceInput): Promise<{ experienceId: string }> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    this.counter++;
    const factId = `fact-${this.counter}`;
    this.facts.set(factId, {
      id: factId, sourceRef: 'user_input', claim: `Worked at ${data.company} as ${data.title}`,
      context: '', confidence: 1.0, status: 'USER_PROVIDED', category: 'WORK',
      timestamp: new Date(), version: 1,
    });
    const experienceId = `exp-${this.counter}`;
    profile.workExperience.push({
      id: experienceId,
      profileId,
      company: data.company,
      title: data.title,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      location: data.location,
      factIds: [factId],
      bulletPoints: [],
    });
    profile.updatedAt = new Date();
    return { experienceId };
  }

  async updateExperience(_profileId: string, _experienceId: string, _data: Partial<WorkExperience>): Promise<void> {}

  async deleteExperience(_profileId: string, _experienceId: string): Promise<void> {}

  async addProject(profileId: string, data: ProjectInput): Promise<{ projectId: string }> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    const projectId = `proj-${++this.counter}`;
    profile.projects.push({ ...data, id: projectId, profileId, startDate: new Date(data.startDate ?? Date.now()), endDate: data.endDate ? new Date(data.endDate) : undefined, factIds: data.factIds ?? [], bulletPoints: [] });
    profile.updatedAt = new Date();
    return { projectId };
  }

  async addSkill(profileId: string, data: Omit<Skill, 'id' | 'profileId'>): Promise<{ skillId: string }> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    const skillId = `skill-${++this.counter}`;
    profile.skills.push({ ...data, id: skillId, profileId });
    profile.updatedAt = new Date();
    return { skillId };
  }

  async addEducation(profileId: string, data: EducationInput): Promise<{ educationId: string }> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    const educationId = `edu-${++this.counter}`;
    profile.education.push({ ...data, id: educationId, profileId, startDate: new Date(data.startDate ?? Date.now()), endDate: new Date(data.endDate ?? Date.now()), factIds: data.factIds ?? [] });
    profile.updatedAt = new Date();
    return { educationId };
  }

  async addCertification(profileId: string, data: CertificationInput): Promise<{ certificationId: string }> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new AppError('CANDIDATE_PROFILE_NOT_FOUND', 'Profile not found');
    const certificationId = `cert-${++this.counter}`;
    profile.certifications.push({ ...data, id: certificationId, profileId, issueDate: new Date(data.issueDate ?? Date.now()), expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined, factIds: data.factIds ?? [] });
    profile.updatedAt = new Date();
    return { certificationId };
  }

  async searchFacts(_profileId: string, _query: string): Promise<{ facts: CandidateFact[]; total: number }> {
    const allFacts = Array.from(this.facts.values());
    return { facts: allFacts, total: allFacts.length };
  }

  async updateFactStatus(factId: string, status: string, notes?: string): Promise<void> {
    const fact = this.facts.get(factId);
    if (!fact) throw new AppError('CANDIDATE_FACT_NOT_FOUND', 'Fact not found');
    this.facts.set(factId, { ...fact, status: status as CandidateFact['status'], verificationNotes: notes });
  }

  async getFactProvenance(_factId: string): Promise<FactProvenance | null> {
    return null;
  }
}
