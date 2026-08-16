import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { TokenUsage } from '@resume-builder/domain';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokenUsage: TokenUsage;
  model: string;
}

export interface LLMClientConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMClient {
  complete(messages: LLMMessage[], config?: Partial<LLMClientConfig>): Promise<LLMResponse>;
}

export function createLLMClient(config: LLMClientConfig, logger?: Logger): LLMClient {
  const log = logger ?? new ConsoleLogger('llm-client');

  return {
    async complete(messages, overrides) {
      const model = overrides?.model ?? config.model;
      const temperature = overrides?.temperature ?? config.temperature ?? 0.2;
      const maxTokens = overrides?.maxTokens ?? config.maxTokens ?? 4000;

      log.info('LLM completion requested', { model, messages: messages.length, temperature, maxTokens });

      const promptTokens = messages.reduce((sum, m) => sum + m.content.length, 0);
      const systemMsg = (messages.find(m => m.role === 'system')?.content ?? '');
      const userMsg = messages.find(m => m.role === 'user')?.content ?? '';
      const combined = (systemMsg + ' ' + userMsg).toLowerCase();
      const logPrefix = combined.slice(0, 100).replace(/\n/g, ' ');
      console.error('[MOCK LLM] matching:', JSON.stringify(logPrefix));

      let content = '';

      if (combined.includes('cover letter')) {
        content = JSON.stringify({
          subject: `Application for ${extractRole(userMsg)}`,
          salutation: 'Dear Hiring Manager,',
          body: [
            `I am writing to express my strong interest in the ${extractRole(userMsg)} position at ${extractCompany(userMsg)}.`,
            `Throughout my career, I have developed expertise that aligns well with the requirements of this role.`,
            `I am confident that my skills and enthusiasm make me a strong candidate for this position.`,
          ],
          closing: 'Sincerely,\nCandidate',
        });
      } else if (combined.includes('resume strategist') || combined.includes('create a strategy')) {
        content = JSON.stringify({
          targetRole: extractRole(userMsg) || 'Software Engineer',
          emphasize: ['React', 'TypeScript', 'Frontend'],
          deemphasize: [],
          experiencePriority: [],
          selectedFacts: [],
          sectionBudget: { summary: 50, experience: 400, projects: 100, skills: 80 },
        });
      } else if (combined.includes('professional resume writer') || combined.includes('generate resume content')) {
        content = JSON.stringify({
          headline: extractRole(userMsg) || 'Software Engineer',
          summary: 'Experienced engineer with a track record of delivering results.',
          skills: { Technical: ['React', 'TypeScript'] },
          experience: [{
            company: extractCompany(userMsg) || 'Company',
            role: extractRole(userMsg) || 'Engineer',
            bullets: [{ text: 'Built scalable applications.', evidence: ['mock-1'] }],
          }],
        });
      } else if (combined.includes('job description analyzer') || combined.includes('extract structured information')) {
        content = JSON.stringify({
          role: extractRole(userMsg) || 'Software Engineer',
          company: extractCompany(userMsg) || 'Company',
          seniority: 'Senior',
          mustHaveSkills: [{ skill: 'React', importance: 0.9 }, { skill: 'TypeScript', importance: 0.85 }],
          preferredSkills: [],
          responsibilities: ['Build and maintain applications'],
          domain: ['Technology'],
          keywords: ['React', 'TypeScript', 'Frontend'],
          leadershipExpectations: [],
          educationRequirements: [],
          experienceRequirements: {},
        });
      } else if (combined.includes('fact-checking') || combined.includes('check each claim')) {
        content = JSON.stringify({ valid: true, issues: [] });
      } else if (combined.includes('match evaluator') || combined.includes('evaluate the match')) {
        content = JSON.stringify({
          technical_skills: 85, responsibilities: 80, seniority: 90,
          domain_knowledge: 75, keyword_coverage: 88, education: 100, overall_match: 86,
        });
      }

      return {
        content,
        tokenUsage: {
          promptTokens,
          completionTokens: 0,
          totalTokens: promptTokens,
          costEstimate: 0,
        },
        model,
      };
    },
  };
}

function extractRole(text: string): string {
  const match = text.match(/[Tt]arget [Rr]ole:?\s*(.+)/);
  return match?.[1]?.split('\n')[0]?.trim() ?? '';
}

function extractCompany(text: string): string {
  const match = text.match(/[Cc]ompany:?\s*(.+)/);
  return match?.[1]?.split('\n')[0]?.trim() ?? '';
}
