import type { CandidateProfile, CandidateFact, Job, GenerationRun, ResumeVersion } from '@resume-builder/domain';
import { createLLMClient, createAzureOpenAIClient, ResumeOrchestrator } from '@resume-builder/ai';
import type { OrchestrationResult, LLMClient } from '@resume-builder/ai';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';

/**
 * Per-stage deployment overrides. On Azure OpenAI these are deployment
 * names; each falls back to the primary deployment when unset, so you can
 * route cheap models at analysis stages and stronger models at writing.
 */
function stageOverrides(stage: string): { model: string } | undefined {
  const model = process.env[`AZURE_OPENAI_DEPLOYMENT_${stage}`]?.trim();
  return model ? { model } : undefined;
}

export class GenerationService {
  private orchestrator: ResumeOrchestrator;
  private runs = new Map<string, GenerationRun>();
  private results = new Map<string, OrchestrationResult>();

  constructor(azureOpenAI?: ApplicationConfig['azureOpenAI'], private db?: DB) {
    let llm: LLMClient;

    if (azureOpenAI?.endpoint) {
      llm = createAzureOpenAIClient({
        endpoint: azureOpenAI.endpoint,
        apiKey: azureOpenAI.apiKey,
        deployment: azureOpenAI.deployment ?? 'gpt-4o',
      });
    } else {
      llm = createLLMClient({ model: 'gpt-4o-mini', temperature: 0.2 });
    }

    this.orchestrator = new ResumeOrchestrator(llm, {
      jobAnalyzer: stageOverrides('JOB_ANALYZER'),
      resumeStrategist: stageOverrides('STRATEGIST'),
      resumeWriter: stageOverrides('WRITER'),
      factChecker: stageOverrides('FACT_CHECKER'),
      matchEvaluator: stageOverrides('EVALUATOR'),
    });
  }

  async generate(
    profile: CandidateProfile,
    job: Job,
    facts: CandidateFact[],
    templateId: string,
    language?: string
  ): Promise<OrchestrationResult> {
    const result = await this.orchestrator.generateResume(profile, job, facts, templateId, language);
    this.runs.set(result.run.id, result.run);
    this.results.set(result.run.id, result);
    if (this.db) {
      const uow = createUnitOfWork(this.db);
      try {
        await uow.generationRuns.create(result.run);
      } catch (error) {
        throw new Error(`Resume generation persistence failed at generation run${persistenceErrorCode(error) ? ` (${persistenceErrorCode(error)})` : ''}`);
      }
      if (result.run.status === 'COMPLETED') {
        let previous: ResumeVersion[];
        try {
          previous = await uow.resumeVersions.findByProfileId(profile.id);
        } catch (error) {
          throw new Error(`Resume generation persistence failed at version lookup${persistenceErrorCode(error) ? ` (${persistenceErrorCode(error)})` : ''}`);
        }
        const version: ResumeVersion = {
          id: crypto.randomUUID(),
          profileId: profile.id,
          templateId,
          versionNumber: (previous[0]?.versionNumber ?? 0) + 1,
          structuredData: result.resume,
          status: 'GENERATED',
          generationRunId: result.run.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        try {
          await uow.resumeVersions.create(version);
        } catch (error) {
          throw new Error(`Resume generation persistence failed at version save${persistenceErrorCode(error) ? ` (${persistenceErrorCode(error)})` : ''}`);
        }
      }
    }
    return result;
  }

  async getRun(runId: string): Promise<GenerationRun | null> {
    return this.runs.get(runId) ?? (this.db ? createUnitOfWork(this.db).generationRuns.findById(runId) : null);
  }

  async getResult(runId: string): Promise<OrchestrationResult | null> {
    const cached = this.results.get(runId);
    if (cached) return cached;
    if (!this.db) return null;
    const run = await this.getRun(runId);
    const version = await createUnitOfWork(this.db).resumeVersions.findByGenerationRunId(runId);
    if (!run || !version) return null;
    return {
      run,
      resume: version.structuredData,
      factCheck: { valid: true, issues: [] },
      matchEvaluation: null,
    };
  }

  async listRuns(profileId: string): Promise<GenerationRun[]> {
    const memoryRuns = Array.from(this.runs.values()).filter(run => run.profileId === profileId);
    if (this.db) return createUnitOfWork(this.db).generationRuns.findByProfileId(profileId);
    return memoryRuns.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
}

function persistenceErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  return typeof error.code === 'string' ? error.code : undefined;
}
