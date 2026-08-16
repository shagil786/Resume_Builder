import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { Job, JobAnalysis } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import type { JobAnalysisSchema } from '../schemas';

export interface JobAnalyzerConfig extends LLMClientConfig {
  model: string;
}

export class JobAnalyzer {
  private client: LLMClient;
  private config: JobAnalyzerConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<JobAnalyzerConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o-mini', temperature: 0.1, ...config };
    this.logger = logger ?? new ConsoleLogger('job-analyzer');
  }

  async analyze(job: Job): Promise<JobAnalysis> {
    const systemPrompt = getPrompt('analyze-job-system');
    if (!systemPrompt) throw new Error('analyze-job-system prompt not registered');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      { role: 'user', content: `Job Title: ${job.title}\nCompany: ${job.company}\n\nDescription:\n${job.rawText}` },
    ];

    this.logger.info('Analyzing job', { jobId: job.id, title: job.title });

    const response = await this.client.complete(messages, this.config);
    const analysis = JSON.parse(response.content) as JobAnalysisSchema;

    this.logger.info('Job analysis complete', { jobId: job.id, role: analysis.role, tokenUsage: response.tokenUsage });

    return {
      role: analysis.role,
      company: analysis.company,
      seniority: analysis.seniority,
      mustHaveSkills: analysis.mustHaveSkills,
      preferredSkills: analysis.preferredSkills,
      responsibilities: analysis.responsibilities,
      domain: analysis.domain,
      keywords: analysis.keywords,
      leadershipExpectations: analysis.leadershipExpectations,
      educationRequirements: analysis.educationRequirements,
      experienceRequirements: analysis.experienceRequirements,
    };
  }
}
