import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { LLMCompleteOptions, LLMMessage, LLMResponse, LLMClientConfig, LLMClient } from './client';

/**
 * Deterministic mock LLM used for local development and tests when no
 * Azure OpenAI configuration is present. Returns schema-plausible JSON
 * keyed off the requested jsonSchema name so every workflow stage works
 * end-to-end without external calls.
 */
export function createLLMClient(config: LLMClientConfig, logger?: Logger): LLMClient {
  const log = logger ?? new ConsoleLogger('llm-mock');

  return {
    async complete(messages: LLMMessage[], overrides?: LLMCompleteOptions): Promise<LLMResponse> {
      const model = overrides?.model ?? config.model;
      const promptTokens = messages.reduce((sum, m) => sum + m.content.length, 0);
      const schemaName = overrides?.jsonSchema?.name ?? '';
      const userMsg = messages.find(m => m.role === 'user')?.content ?? '';

      const role = extractAfter(userMsg, /Target Role:\s*(.+)/) || 'Software Engineer';
      const company = extractAfter(userMsg, /Company:\s*(.+)/) || 'Acme Corp';

      let content = '{}';

      switch (schemaName) {
        case 'job_analysis':
          content = JSON.stringify({
            role,
            company,
            seniority: 'Senior',
            mustHaveSkills: [{ skill: 'React', importance: 0.9 }, { skill: 'TypeScript', importance: 0.85 }],
            preferredSkills: [{ skill: 'GraphQL', importance: 0.6 }],
            responsibilities: ['Build and maintain web applications'],
            domain: ['Technology'],
            keywords: ['React', 'TypeScript', 'Frontend'],
            leadershipExpectations: [],
            educationRequirements: [],
            experienceYearsMin: 5,
            experienceLevel: 'Senior',
          });
          break;
        case 'resume_strategy':
          content = JSON.stringify({
            targetRole: role,
            emphasize: ['React', 'TypeScript'],
            deemphasize: [],
            experiencePriority: [],
            selectedFacts: [],
            sectionBudget: { summary: 60, experience: 400, projects: 120, skills: 80 },
          });
          break;
        case 'resume_content':
          content = JSON.stringify({
            headline: role,
            summary: 'Experienced engineer with a track record of delivering production systems.',
            skills: [
              { category: 'Languages', items: ['TypeScript', 'JavaScript'] },
              { category: 'Frameworks', items: ['React', 'Node.js'] },
            ],
            experience: [{
              company,
              role,
              bullets: [{ text: `Delivered features as ${role} at ${company}.`, evidence: [] }],
            }],
          });
          break;
        case 'fact_check_result':
          content = JSON.stringify({ valid: true, issues: [] });
          break;
        case 'match_evaluation':
          content = JSON.stringify({
            technical_skills: 85, responsibilities: 80, seniority: 90,
            domain_knowledge: 75, keyword_coverage: 88, education: 100, overall_match: 86,
          });
          break;
        case 'cover_letter_content':
          content = JSON.stringify({
            subject: `Application for ${role}`,
            salutation: 'Dear Hiring Manager,',
            body: [
              `I am writing to express my interest in the ${role} position at ${company}.`,
              'My background aligns closely with the requirements of this role.',
              'I would welcome the opportunity to contribute to your team.',
            ],
            closing: 'Sincerely,\nCandidate',
          });
          break;
        default:
          content = JSON.stringify({ note: `No mock mapped for schema "${schemaName}"` });
      }

      log.info('Mock completion', { schemaName, model });

      return {
        content,
        tokenUsage: { promptTokens, completionTokens: 0, totalTokens: promptTokens, costEstimate: 0 },
        model,
      };
    },
  };
}

function extractAfter(text: string, pattern: RegExp): string | undefined {
  return text.match(pattern)?.[1]?.split('\n')[0]?.trim();
}
