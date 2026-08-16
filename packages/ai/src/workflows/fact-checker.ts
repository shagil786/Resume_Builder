import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateFact, ResumeContent, ResumeFitEvaluation } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import type { FactCheckResultSchema } from '../schemas';

export class FactChecker {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o-mini', temperature: 0.1, ...config };
    this.logger = logger ?? new ConsoleLogger('fact-checker');
  }

  async validate(resume: ResumeContent, facts: CandidateFact[]): Promise<ResumeFitEvaluation> {
    const systemPrompt = getPrompt('fact-checker-system');
    if (!systemPrompt) throw new Error('fact-checker-system prompt not registered');

    const resumeClaims = resume.sections.flatMap(s =>
      s.items.flatMap(item => [
        item.content,
        ...(item.bulletPoints?.map(b => b.text) ?? []),
      ])
    );

    const factText = facts.map(f =>
      `[${f.id}] ${f.claim} (confidence: ${f.confidence}, status: ${f.status})`
    ).join('\n');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Source Facts:\n${factText}\n\nResume Claims:\n${resumeClaims.map((c, i) => `Claim ${i + 1}: "${c}"`).join('\n')}\n\nCheck each claim against the source facts.`,
      },
    ];

    this.logger.info('Fact-checking resume', { claims: resumeClaims.length, facts: facts.length });

    const response = await this.client.complete(messages, this.config);
    const result = JSON.parse(response.content) as FactCheckResultSchema;

    const criticalIssues = result.issues.filter(i => i.severity === 'critical');
    this.logger.info('Fact check complete', {
      total: result.issues.length,
      critical: criticalIssues.length,
      valid: result.valid,
    });

    return {
      valid: result.valid,
      issues: result.issues.map(i => ({
        claim: i.claim,
        reason: i.reason,
        severity: i.severity,
      })),
    };
  }
}
