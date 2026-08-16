import type { LLMClient, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, CandidateFact, Job, ResumeContent, GenerationRun, GenerationStageLog, ResumeStrategy, JobAnalysis } from '@resume-builder/domain';
import { JobAnalyzer } from './job-analyzer';
import { ResumeStrategist } from './resume-strategist';
import { ResumeWriter } from './resume-writer';
import { FactChecker } from './fact-checker';
import { MatchEvaluator } from './match-evaluator';
import type { MatchEvaluation } from './match-evaluator';

export interface OrchestratorConfig {
  jobAnalyzer?: Partial<LLMClientConfig>;
  resumeStrategist?: Partial<LLMClientConfig>;
  resumeWriter?: Partial<LLMClientConfig>;
  factChecker?: Partial<LLMClientConfig>;
  matchEvaluator?: Partial<LLMClientConfig>;
}

export interface OrchestrationResult {
  run: GenerationRun;
  resume: ResumeContent;
  factCheck: { valid: boolean; issues: { claim: string; reason: string; severity: string }[] };
  matchEvaluation: MatchEvaluation | null;
}

interface StageResult {
  log: GenerationStageLog;
  output: unknown;
}

export class ResumeOrchestrator {
  private jobAnalyzer: JobAnalyzer;
  private strategist: ResumeStrategist;
  private writer: ResumeWriter;
  private factChecker: FactChecker;
  private matchEvaluator: MatchEvaluator;
  private logger: Logger;

  constructor(client: LLMClient, config: OrchestratorConfig = {}, logger?: Logger) {
    this.logger = logger ?? new ConsoleLogger('orchestrator');
    this.jobAnalyzer = new JobAnalyzer(client, config.jobAnalyzer, logger);
    this.strategist = new ResumeStrategist(client, config.resumeStrategist, logger);
    this.writer = new ResumeWriter(client, config.resumeWriter, logger);
    this.factChecker = new FactChecker(client, config.factChecker, logger);
    this.matchEvaluator = new MatchEvaluator(client, config.matchEvaluator, logger);
  }

  async generateResume(
    profile: CandidateProfile,
    job: Job,
    facts: CandidateFact[],
    templateId: string,
    language?: string
  ): Promise<OrchestrationResult> {
    const startedAt = new Date();
    const runId = crypto.randomUUID();
    const stages: GenerationStageLog[] = [];

    try {
      this.logger.info('Starting resume generation', { runId, profileId: profile.id, jobId: job.id });

      const stage1 = await this.runStage('job_analysis', async () => {
        const analysis = await this.jobAnalyzer.analyze(job);
        return { output: analysis, refs: [job.id] };
      });
      stages.push(stage1.log);
      if (stage1.log.status === 'FAILED') throw new Error(stage1.log.error ?? 'Job analysis failed');
      const jobAnalysis = stage1.output as JobAnalysis;

      const stage2 = await this.runStage('resume_strategy', async () => {
        const strategy = await this.strategist.plan(profile, jobAnalysis, facts);
        return { output: strategy, refs: [profile.id, job.id] };
      });
      stages.push(stage2.log);
      if (stage2.log.status === 'FAILED') throw new Error(stage2.log.error ?? 'Resume strategy failed');
      const strategy = stage2.output as ResumeStrategy;

      const stage3 = await this.runStage('content_generation', async () => {
        const resume = await this.writer.write(profile, strategy, job, jobAnalysis, facts, language);
        return { output: resume, refs: strategy.selectedFacts };
      });
      stages.push(stage3.log);
      if (stage3.log.status === 'FAILED') throw new Error(stage3.log.error ?? 'Content generation failed');
      const resume = stage3.output as ResumeContent;

      const stage4 = await this.runStage('fact_verification', async () => {
        const result = await this.factChecker.validate(resume, facts);
        return { output: result, refs: strategy.selectedFacts };
      });
      stages.push(stage4.log);
      if (stage4.log.status === 'FAILED') throw new Error(stage4.log.error ?? 'Fact verification failed');
      const factCheck = stage4.output as { valid: boolean; issues: { claim: string; reason: string; severity: string }[] };

      let matchEvaluation: MatchEvaluation | null = null;
      if (factCheck.valid) {
        const stage5 = await this.runStage('job_fit_evaluation', async () => {
          const evaluation = await this.matchEvaluator.evaluate(profile, resume, jobAnalysis);
          return { output: evaluation, refs: [job.id] };
        });
        stages.push(stage5.log);
        if (stage5.log.status === 'FAILED') throw new Error(stage5.log.error ?? 'Job fit evaluation failed');
        matchEvaluation = stage5.output as MatchEvaluation;
      }

      const completedAt = new Date();
      const run: GenerationRun = {
        id: runId,
        profileId: profile.id,
        jobId: job.id,
        templateId,
        startedAt,
        completedAt,
        status: 'COMPLETED',
        stages,
      };

      this.logger.info('Resume generation completed', { runId, factCheckValid: factCheck.valid });

      return { run, resume, factCheck, matchEvaluation };
    } catch (error) {
      const completedAt = new Date();
      const run: GenerationRun = {
        id: runId,
        profileId: profile.id,
        jobId: job.id,
        templateId,
        startedAt,
        completedAt,
        status: 'FAILED',
        stages,
        errors: [error instanceof Error ? error.message : String(error)],
      };

      this.logger.error('Resume generation failed', { runId, error });

      return {
        run,
        resume: { sections: [], metadata: { factUsageMap: {} } },
        factCheck: { valid: false, issues: [] },
        matchEvaluation: null,
      };
    }
  }

  private async runStage(
    stageName: string,
    fn: () => Promise<{ output: unknown; refs: string[] }>
  ): Promise<StageResult> {
    const startedAt = new Date();
    try {
      const result = await fn();
      return {
        log: {
          stageName,
          startedAt,
          completedAt: new Date(),
          status: 'COMPLETED',
          outputRefs: result.refs,
        },
        output: result.output,
      };
    } catch (error) {
      return {
        log: {
          stageName,
          startedAt,
          completedAt: new Date(),
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
        output: undefined,
      };
    }
  }
}
