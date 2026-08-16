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
      const systemMsg = messages.find(m => m.role === 'system')?.content ?? '';
      const userMsg = messages.find(m => m.role === 'user')?.content ?? '';

      let content = '';
      if (systemMsg.includes('cover letter') || userMsg.includes('cover letter')) {
        content = JSON.stringify({
          subject: `Application for ${extractRole(userMsg)}`,
          salutation: 'Dear Hiring Manager,',
          body: [
            `I am writing to express my strong interest in the ${extractRole(userMsg)} position at ${extractCompany(userMsg)}. With my background and skills, I believe I would be a valuable addition to your team.`,
            `Throughout my career, I have developed expertise that aligns well with the requirements of this role. My experience includes working with modern technologies and delivering impactful results.`,
            `I am particularly excited about the opportunity to contribute to ${extractCompany(userMsg)}'s success. I am confident that my skills and enthusiasm make me a strong candidate for this position.`,
          ],
          closing: 'Sincerely,\nCandidate',
        });
      } else if (systemMsg.includes('job description') || systemMsg.includes('job posting')) {
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
