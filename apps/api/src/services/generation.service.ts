import type { CandidateProfile, CandidateFact, Job, GenerationRun, ResumeVersion } from '@resume-builder/domain';
import { createLLMClient, createAzureOpenAIClient, ResumeOrchestrator } from '@resume-builder/ai';
import type { OrchestrationResult, LLMClient } from '@resume-builder/ai';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';

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

    this.orchestrator = new ResumeOrchestrator(llm);
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
      await uow.generationRuns.create(result.run);
      if (result.run.status === 'COMPLETED') {
        const previous = await uow.resumeVersions.findByProfileId(profile.id);
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
        await uow.resumeVersions.create(version);
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
