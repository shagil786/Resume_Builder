/**
 * Strict JSON Schemas for Azure OpenAI structured outputs.
 *
 * Strict mode requires every property in `required`, `additionalProperties:
 * false` on every object, and no bare optional fields (use nullable unions).
 * Dynamic-key objects (e.g. skills grouped by category) are modeled as
 * arrays of {category, items} because strict mode forbids arbitrary keys.
 */

const stringArray = {
  type: 'array',
  items: { type: 'string' },
} as const;

const skillImportance = {
  type: 'object',
  additionalProperties: false,
  required: ['skill', 'importance'],
  properties: {
    skill: { type: 'string' },
    importance: { type: 'number' },
  },
} as const;

export const JOB_ANALYSIS_SCHEMA = {
  name: 'job_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['role', 'company', 'seniority', 'mustHaveSkills', 'preferredSkills', 'responsibilities', 'domain', 'keywords', 'leadershipExpectations', 'educationRequirements', 'experienceYearsMin', 'experienceLevel'],
    properties: {
      role: { type: 'string' },
      company: { type: 'string' },
      seniority: { type: 'string' },
      mustHaveSkills: { type: 'array', items: skillImportance },
      preferredSkills: { type: 'array', items: skillImportance },
      responsibilities: stringArray,
      domain: stringArray,
      keywords: stringArray,
      leadershipExpectations: stringArray,
      educationRequirements: stringArray,
      experienceYearsMin: { type: ['integer', 'null'] },
      experienceLevel: { type: ['string', 'null'] },
    },
  },
} as const;

export const RESUME_STRATEGY_SCHEMA = {
  name: 'resume_strategy',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['targetRole', 'emphasize', 'deemphasize', 'experiencePriority', 'selectedFacts', 'sectionBudget'],
    properties: {
      targetRole: { type: 'string' },
      emphasize: stringArray,
      deemphasize: stringArray,
      experiencePriority: stringArray,
      selectedFacts: stringArray,
      sectionBudget: {
        type: 'object',
        additionalProperties: false,
        required: ['summary', 'experience', 'projects', 'skills'],
        properties: {
          summary: { type: 'number' },
          experience: { type: 'number' },
          projects: { type: 'number' },
          skills: { type: 'number' },
        },
      },
    },
  },
} as const;

export const RESUME_CONTENT_SCHEMA = {
  name: 'resume_content',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['headline', 'summary', 'skills', 'experience'],
    properties: {
      headline: { type: 'string' },
      summary: { type: 'string' },
      skills: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['category', 'items'],
          properties: {
            category: { type: 'string' },
            items: stringArray,
          },
        },
      },
      experience: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['company', 'role', 'bullets'],
          properties: {
            company: { type: 'string' },
            role: { type: 'string' },
            bullets: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['text', 'evidence'],
                properties: {
                  text: { type: 'string' },
                  evidence: stringArray,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const FACT_CHECK_SCHEMA = {
  name: 'fact_check_result',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['valid', 'issues'],
    properties: {
      valid: { type: 'boolean' },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['claim', 'reason', 'severity', 'classification'],
          properties: {
            claim: { type: 'string' },
            reason: { type: 'string' },
            severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
            classification: { type: 'string', enum: ['SUPPORTED', 'PARAPHRASED', 'UNSUPPORTED', 'CONTRADICTORY'] },
          },
        },
      },
    },
  },
} as const;

export const MATCH_EVALUATION_SCHEMA = {
  name: 'match_evaluation',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['technical_skills', 'responsibilities', 'seniority', 'domain_knowledge', 'keyword_coverage', 'education', 'overall_match'],
    properties: {
      technical_skills: { type: 'number' },
      responsibilities: { type: 'number' },
      seniority: { type: 'number' },
      domain_knowledge: { type: 'number' },
      keyword_coverage: { type: 'number' },
      education: { type: 'number' },
      overall_match: { type: 'number' },
    },
  },
} as const;

export const COVER_LETTER_SCHEMA = {
  name: 'cover_letter_content',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['subject', 'salutation', 'body', 'closing'],
    properties: {
      subject: { type: 'string' },
      salutation: { type: 'string' },
      body: stringArray,
      closing: { type: 'string' },
    },
  },
} as const;
