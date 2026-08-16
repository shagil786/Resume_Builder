import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, ResumeStrategy, ResumeContent, CandidateFact } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import type { ResumeContentSchema } from '../schemas';

export class ResumeWriter {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4-32k', temperature: 0.2, ...config };
    this.logger = logger ?? new ConsoleLogger('resume-writer');
  }

  async write(profile: CandidateProfile, strategy: ResumeStrategy, facts: CandidateFact[]): Promise<ResumeContent> {
    const systemPrompt = getPrompt('resume-writer-system');
    if (!systemPrompt) throw new Error('resume-writer-system prompt not registered');

    const selectedFacts = facts.filter(f => strategy.selectedFacts.includes(f.id));
    const factText = selectedFacts.map(f =>
      `[${f.id}] (${f.category}) ${f.claim} — Source: ${f.sourceRef}`
    ).join('\n');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Target Role: ${strategy.targetRole}

Strategy:
- Emphasize: ${strategy.emphasize.join(', ')}
- De-emphasize: ${strategy.deemphasize.join(', ') || 'none'}
- Experience priority: ${strategy.experiencePriority.join(' > ')}
- Section budget: ${JSON.stringify(strategy.sectionBudget)}

Candidate Facts (use ONLY these):
${factText}

Generate the resume content following the strategy.`,
      },
    ];

    this.logger.info('Generating resume content', { targetRole: strategy.targetRole, selectedFacts: selectedFacts.length });

    const response = await this.client.complete(messages, this.config);
    const content = JSON.parse(response.content) as ResumeContentSchema;

    this.logger.info('Resume generation complete', { tokenUsage: response.tokenUsage });

    return {
      sections: [
        {
          id: 'summary',
          type: 'SUMMARY',
          title: 'Summary',
          order: 1,
          items: [{ id: 'summary-1', content: content.summary }],
        },
        {
          id: 'experience',
          type: 'EXPERIENCE',
          title: 'Experience',
          order: 2,
          items: content.experience.map((exp, i) => ({
            id: `exp-${i}`,
            content: `${exp.role} at ${exp.company}`,
            bulletPoints: exp.bullets.map(b => ({
              id: `bullet-${i}-${b.evidence[0] ?? 'unknown'}`,
              text: b.text,
              evidence: b.evidence,
            })),
          })),
        },
        {
          id: 'skills',
          type: 'SKILL',
          title: 'Skills',
          order: 3,
          items: Object.entries(content.skills).map(([category, skills], i) => ({
            id: `skills-${i}`,
            content: `${category}: ${skills.join(', ')}`,
          })),
        },
      ],
      metadata: {
        factUsageMap: {},
      },
    };
  }
}
