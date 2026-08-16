export interface JobAnalysisSchema {
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

export interface ResumeStrategySchema {
  targetRole: string;
  emphasize: string[];
  deemphasize: string[];
  experiencePriority: string[];
  selectedFacts: string[];
  sectionBudget: Record<string, number>;
}

export interface ResumeContentSchema {
  headline: string;
  summary: string;
  skills: Record<string, string[]>;
  experience: {
    company: string;
    role: string;
    bullets: { text: string; evidence: string[] }[];
  }[];
}

export interface FactCheckResultSchema {
  valid: boolean;
  issues: {
    claim: string;
    reason: string;
    severity: 'info' | 'warning' | 'critical';
    classification: 'SUPPORTED' | 'PARAPHRASED' | 'UNSUPPORTED' | 'CONTRADICTORY';
  }[];
}

export interface MatchEvaluationSchema {
  technical_skills: number;
  responsibilities: number;
  seniority: number;
  domain_knowledge: number;
  keyword_coverage: number;
  education: number;
  overall_match: number;
}
