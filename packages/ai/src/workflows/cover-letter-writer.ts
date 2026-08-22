import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import { completeJson } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, CandidateFact, JobAnalysis } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import { COVER_LETTER_SCHEMA } from '../schemas/json-schemas';

export interface CoverLetterContent {
  subject: string;
  salutation: string;
  body: string[];
  closing: string;
}

export class CoverLetterWriter {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o', temperature: 0.3, ...config };
    this.logger = logger ?? new ConsoleLogger('cover-letter-writer');
  }

  async write(profile: CandidateProfile, jobAnalysis: JobAnalysis, facts: CandidateFact[], language?: string): Promise<CoverLetterContent> {
    const systemPrompt = getPrompt('cover-letter-writer-system');
    if (!systemPrompt) throw new Error('cover-letter-writer-system prompt not registered');

    const factText = facts.length > 0
      ? facts.map(f => `[${f.id}] (${f.category}) ${f.claim}`).join('\n')
      : '(No extracted facts available — rely on the profile details below and keep claims general.)';

    const keySkills = jobAnalysis.mustHaveSkills.map(s => s.skill).join(', ');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Target Role: ${jobAnalysis.role}
Company: ${jobAnalysis.company}
Language: ${language ?? 'English'}

Key Requirements: ${keySkills}
Responsibilities: ${jobAnalysis.responsibilities.join(', ')}

Candidate Name: ${profile.personalInfo.firstName} ${profile.personalInfo.lastName}
Current Role: ${profile.workExperience[0]?.title ?? 'Not specified'}
Top Skills: ${profile.skills.slice(0, 5).map(s => s.name).join(', ')}

Candidate Facts (every specific claim must cite one of these IDs inline like [fact-id]):
${factText}

Write a cover letter for this candidate applying to this role.`,
      },
    ];

    this.logger.info('Generating cover letter', { targetRole: jobAnalysis.role });

    const { data, tokenUsage } = await completeJson(this.client, messages, {
      ...this.config,
      jsonSchema: COVER_LETTER_SCHEMA,
    });
    const content = data as unknown as CoverLetterContent;

    this.logger.info('Cover letter generated', { subject: content.subject, paragraphs: content.body?.length ?? 0, tokenUsage });

    return {
      subject: content.subject,
      salutation: content.salutation,
      body: content.body ?? [],
      closing: content.closing,
    };
  }
}
