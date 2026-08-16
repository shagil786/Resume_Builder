import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, JobAnalysis, ResumeContent } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import type { MatchEvaluationSchema } from '../schemas';

export interface MatchEvaluation {
  technical_skills: number;
  responsibilities: number;
  seniority: number;
  domain_knowledge: number;
  keyword_coverage: number;
  education: number;
  overall_match: number;
}

export class MatchEvaluator {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o-mini', temperature: 0.1, ...config };
    this.logger = logger ?? new ConsoleLogger('match-evaluator');
  }

  async evaluate(profile: CandidateProfile, resume: ResumeContent, jobAnalysis: JobAnalysis): Promise<MatchEvaluation> {
    const systemPrompt = getPrompt('match-evaluator-system');
    if (!systemPrompt) throw new Error('match-evaluator-system prompt not registered');

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Job Requirements:\n${JSON.stringify(jobAnalysis, null, 2)}\n\nResume:\n${JSON.stringify(resume, null, 2)}\n\nEvaluate the match between this resume and the job requirements.`,
      },
    ];

    this.logger.info('Evaluating job match', { targetRole: jobAnalysis.role });

    const response = await this.client.complete(messages, this.config);
    const evaluation = JSON.parse(response.content) as MatchEvaluationSchema;

    this.logger.info('Match evaluation complete', { overall: evaluation.overall_match });

    return {
      technical_skills: evaluation.technical_skills,
      responsibilities: evaluation.responsibilities,
      seniority: evaluation.seniority,
      domain_knowledge: evaluation.domain_knowledge,
      keyword_coverage: evaluation.keyword_coverage,
      education: evaluation.education,
      overall_match: evaluation.overall_match,
    };
  }
}
