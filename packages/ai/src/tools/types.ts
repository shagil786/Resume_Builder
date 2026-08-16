import type { CandidateProfile, CandidateFact, JobAnalysis, ResumeTemplate, ResumeStrategy, ResumeContent } from '@resume-builder/domain';

export interface AITool<TInput, TOutput> {
  name: string;
  description: string;
  execute(input: TInput): Promise<TOutput>;
}

export interface GetCandidateProfileInput {
  profileId: string;
}

export interface SearchEvidenceInput {
  query: string;
  profileId: string;
  skills?: string[];
  employers?: string[];
  categories?: string[];
  limit?: number;
}

export interface SearchEvidenceOutput {
  facts: CandidateFact[];
  total: number;
}

export interface AnalyzeJobInput {
  jobDescription: string;
  jobUrl?: string;
}

export interface GetVerifiedFactInput {
  factId: string;
}

export interface GetTemplateSchemaInput {
  templateId: string;
}

export interface CalculateResumeFitInput {
  profile: CandidateProfile;
  jobRequirements: JobAnalysis;
}

export interface CalculateResumeFitOutput {
  valid: boolean;
  issues: { claim: string; reason: string; severity: 'info' | 'warning' | 'critical' }[];
}

export interface ValidateClaimsInput {
  resume: ResumeContent;
  facts: CandidateFact[];
}

export interface ValidateClaimsOutput {
  valid: boolean;
  issues: { claim: string; reason: string; severity: 'info' | 'warning' | 'critical' }[];
}

export const AI_TOOLS = {
  GET_CANDIDATE_PROFILE: 'get_candidate_profile',
  SEARCH_EVIDENCE: 'search_candidate_evidence',
  GET_VERIFIED_FACT: 'get_verified_fact',
  ANALYZE_JOB: 'analyze_job_description',
  GET_TEMPLATE_SCHEMA: 'get_template_schema',
  CALCULATE_FIT: 'calculate_resume_fit',
  VALIDATE_CLAIMS: 'validate_resume_claims',
} as const;
