import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';
import type { CertificationInput, EducationInput, ICandidateProfileService, ProjectInput, WorkExperienceInput } from './candidate.interface';
import type { CandidateProfile, CandidateFact, FactProvenance, PersonalInfo, WorkExperience, Skill } from '@resume-builder/domain';

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

  async addExperience(profileId: string, data: WorkExperienceInput): Promise<{ experienceId: string }> {
    const uow = createUnitOfWork(this.db);
    const exp = await uow.workExperiences.create({
      ...data,
      profileId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      factIds: data.factIds ?? [],
    });
    return { experienceId: exp.id };
  }

  async updateExperience(_profileId: string, experienceId: string, data: Partial<WorkExperience>): Promise<void> {
    await createUnitOfWork(this.db).workExperiences.update(experienceId, data);
  }

  async deleteExperience(_profileId: string, experienceId: string): Promise<void> {
    await createUnitOfWork(this.db).workExperiences.delete(experienceId);
  }

  async addProject(profileId: string, data: ProjectInput): Promise<{ projectId: string }> {
    const uow = createUnitOfWork(this.db);
    const project = await uow.projects.create({
      ...data,
      profileId,
      startDate: new Date(data.startDate ?? Date.now()),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      factIds: data.factIds ?? [],
    });
    return { projectId: project.id };
  }

  async addSkill(profileId: string, data: Omit<Skill, 'id' | 'profileId'>): Promise<{ skillId: string }> {
    const uow = createUnitOfWork(this.db);
    const skill = await uow.skills.create({ ...data, profileId });
    return { skillId: skill.id };
  }

  async addEducation(profileId: string, data: EducationInput): Promise<{ educationId: string }> {
    const uow = createUnitOfWork(this.db);
    const edu = await uow.education.create({ ...data, profileId, startDate: new Date(data.startDate ?? Date.now()), endDate: new Date(data.endDate ?? Date.now()), factIds: data.factIds ?? [] });
    return { educationId: edu.id };
  }

  async addCertification(profileId: string, data: CertificationInput): Promise<{ certificationId: string }> {
    const uow = createUnitOfWork(this.db);
    const cert = await uow.certifications.create({ ...data, profileId, issueDate: new Date(data.issueDate ?? Date.now()), expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined, factIds: data.factIds ?? [] });
    return { certificationId: cert.id };
  }

  async searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }> {
    const result = await createUnitOfWork(this.db).candidateFacts.searchByText(profileId, query);
    return { facts: result.data, total: result.total };
  }

  async updateFactStatus(factId: string, status: string, notes?: string): Promise<void> {
    await createUnitOfWork(this.db).candidateFacts.updateStatus(factId, status, notes);
  }

  async getFactProvenance(factId: string): Promise<FactProvenance | null> {
    return createUnitOfWork(this.db).factProvenance.findByFactId(factId);
  }
}
