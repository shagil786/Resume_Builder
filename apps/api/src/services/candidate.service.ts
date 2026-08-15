import type { CandidateProfile, CandidateFact, FactProvenance } from '@resume-builder/domain';

export interface CreateProfileResult {
  profileId: string;
}

export interface AddEntityResult {
  experienceId?: string;
  projectId?: string;
  skillId?: string;
  educationId?: string;
  certificationId?: string;
}

export const CANDIDATE_SERVICE_ERRORS = {
  PROFILE_NOT_FOUND: 'CANDIDATE_PROFILE_NOT_FOUND',
  FACT_NOT_FOUND: 'CANDIDATE_FACT_NOT_FOUND',
  VALIDATION_ERROR: 'CANDIDATE_VALIDATION_ERROR',
} as const;

export class CandidateServiceError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'CandidateServiceError';
    this.code = code;
  }
}

export function createCandidateProfileService() {
  const profiles = new Map<string, CandidateProfile>();
  const facts = new Map<string, CandidateFact>();
  const provenances = new Map<string, FactProvenance>();
  let profileCounter = 0;
  let factCounter = 0;

  return {
    async createProfile(userId: string, personalInfo: Record<string, unknown>): Promise<CreateProfileResult> {
      profileCounter++;
      const id = `profile-${profileCounter}`;
      const now = new Date();
      profiles.set(id, {
        id,
        userId,
        personalInfo: personalInfo as CandidateProfile['personalInfo'],
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
    },

    async getProfile(profileId: string): Promise<CandidateProfile | null> {
      return profiles.get(profileId) ?? null;
    },

    async updateProfile(profileId: string, data: Record<string, unknown>): Promise<void> {
      const profile = profiles.get(profileId);
      if (!profile) throw new CandidateServiceError(CANDIDATE_SERVICE_ERRORS.PROFILE_NOT_FOUND, 'Profile not found');
      profiles.set(profileId, { ...profile, ...data, updatedAt: new Date() });
    },

    async deleteProfile(profileId: string): Promise<void> {
      profiles.delete(profileId);
    },

    async addExperience(profileId: string, data: { company: string; title: string; startDate: string }): Promise<AddEntityResult> {
      const profile = profiles.get(profileId);
      if (!profile) throw new CandidateServiceError(CANDIDATE_SERVICE_ERRORS.PROFILE_NOT_FOUND, 'Profile not found');
      const factCounterLocal = ++factCounter;
      const factId = `fact-${factCounterLocal}`;
      facts.set(factId, {
        id: factId,
        sourceRef: 'user_input',
        claim: `Worked at ${data.company} as ${data.title}`,
        context: '',
        confidence: 1.0,
        status: 'USER_PROVIDED',
        category: 'WORK',
        timestamp: new Date(),
        version: 1,
      });
      return { experienceId: `exp-${factCounterLocal}` };
    },

    async addProject(profileId: string, data: { name: string; description: string }): Promise<AddEntityResult> {
      return { projectId: `proj-${++factCounter}` };
    },

    async addSkill(profileId: string, data: { name: string; category: string }): Promise<AddEntityResult> {
      return { skillId: `skill-${++factCounter}` };
    },

    async addEducation(profileId: string, _data: { institution: string; degree: string; fieldOfStudy: string }): Promise<AddEntityResult> {
      return { educationId: `edu-${++factCounter}` };
    },

    async addCertification(profileId: string, _data: { name: string; issuingOrganization: string }): Promise<AddEntityResult> {
      return { certificationId: `cert-${++factCounter}` };
    },

    async searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }> {
      const allFacts = Array.from(facts.values());
      return { facts: allFacts, total: allFacts.length };
    },

    async updateFactStatus(factId: string, status: string, verificationNotes?: string): Promise<void> {
      const fact = facts.get(factId);
      if (!fact) throw new CandidateServiceError(CANDIDATE_SERVICE_ERRORS.FACT_NOT_FOUND, 'Fact not found');
      facts.set(factId, { ...fact, status: status as CandidateFact['status'], verificationNotes });
    },

    async getFactProvenance(factId: string): Promise<FactProvenance | null> {
      return provenances.get(factId) ?? null;
    },
  };
}
