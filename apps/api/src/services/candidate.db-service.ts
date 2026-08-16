import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';
import type { ICandidateProfileService } from './candidate.interface';
import type { CandidateProfile, CandidateFact, FactProvenance, PersonalInfo, WorkExperience, ProjectEntry, Skill, EducationEntry, Certification } from '@resume-builder/domain';

export class DbCandidateProfileService implements ICandidateProfileService {
  constructor(private db: DB) {}

  async createProfile(userId: string, personalInfo: PersonalInfo): Promise<{ profileId: string }> {
    const uow = createUnitOfWork(this.db);
    const profile = await uow.candidateProfiles.create({
      userId,
      personalInfo,
      visibility: 'PRIVATE',
      status: 'DRAFT',
    });
    return { profileId: profile.id };
  }

  async getProfile(profileId: string): Promise<CandidateProfile | null> {
    return createUnitOfWork(this.db).candidateProfiles.findById(profileId);
  }

  async updateProfile(profileId: string, data: Partial<CandidateProfile>): Promise<void> {
    await createUnitOfWork(this.db).candidateProfiles.update(profileId, data);
  }

  async deleteProfile(profileId: string): Promise<void> {
    await createUnitOfWork(this.db).candidateProfiles.delete(profileId);
  }

  async addExperience(profileId: string, data: Omit<WorkExperience, 'id' | 'bulletPoints' | 'profileId'>): Promise<{ experienceId: string }> {
    const uow = createUnitOfWork(this.db);
    const exp = await uow.workExperiences.create({
      ...data,
      profileId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      factIds: [],
    });
    return { experienceId: exp.id };
  }

  async updateExperience(profileId: string, experienceId: string, data: Partial<WorkExperience>): Promise<void> {
    await createUnitOfWork(this.db).workExperiences.update(experienceId, data);
  }

  async deleteExperience(_profileId: string, experienceId: string): Promise<void> {
    await createUnitOfWork(this.db).workExperiences.delete(experienceId);
  }

  async addProject(profileId: string, data: Omit<ProjectEntry, 'id' | 'bulletPoints' | 'profileId'>): Promise<{ projectId: string }> {
    const uow = createUnitOfWork(this.db);
    const project = await uow.projects.create({
      ...data,
      profileId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      factIds: [],
    });
    return { projectId: project.id };
  }

  async addSkill(profileId: string, data: Omit<Skill, 'id' | 'profileId'>): Promise<{ skillId: string }> {
    const uow = createUnitOfWork(this.db);
    const skill = await uow.skills.create({ ...data, profileId });
    return { skillId: skill.id };
  }

  async addEducation(profileId: string, data: Omit<EducationEntry, 'id' | 'profileId'>): Promise<{ educationId: string }> {
    const uow = createUnitOfWork(this.db);
    const edu = await uow.education.create({ ...data, profileId, startDate: new Date(data.startDate), endDate: new Date(data.endDate), factIds: [] });
    return { educationId: edu.id };
  }

  async addCertification(profileId: string, data: Omit<Certification, 'id' | 'profileId'>): Promise<{ certificationId: string }> {
    const uow = createUnitOfWork(this.db);
    const cert = await uow.certifications.create({ ...data, profileId, issueDate: new Date(data.issueDate), expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined, factIds: [] });
    return { certificationId: cert.id };
  }

  async searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }> {
    return createUnitOfWork(this.db).candidateFacts.searchByText(profileId, query);
  }

  async updateFactStatus(factId: string, status: string, notes?: string): Promise<void> {
    await createUnitOfWork(this.db).candidateFacts.updateStatus(factId, status, notes);
  }

  async getFactProvenance(factId: string): Promise<FactProvenance | null> {
    return createUnitOfWork(this.db).factProvenance.findByFactId(factId);
  }
}
