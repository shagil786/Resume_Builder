export interface Job {
  id: string;
  userId: string;
  source: 'TEXT_INPUT' | 'JOB_URL' | 'API_IMPORT';
  sourceUrl?: string;
  rawText: string;
  title: string;
  company: string;
  location?: string;
  url?: string;
  extractedAt?: Date;
  status: 'ANALYZED' | 'FAILED_ANALYSIS';
}

export interface JobRequirement {
  id: string;
  jobId: string;
  type: 'HARD' | 'SOFT' | 'NICE_TO_HAVE';
  category: 'TECHNICAL' | 'EXPERIENCE' | 'SKILL' | 'EDUCATION' | 'SOFT';
  text: string;
  originalText: string;
  weight: number;
  matchedFactIds?: string[];
  coverageScore?: number;
}

export interface JobAnalysis {
  role: string;
  company: string;
  seniority: string;
  mustHaveSkills: { skill: string; importance: number }[];
  preferredSkills: { skill: string; importance: number }[];
  responsibilities: string[];
  domain: string[];
  keywords: string[];
  leadershipExpectations: string[];
  educationRequirements: string[];
  experienceRequirements: Record<string, unknown>;
}
