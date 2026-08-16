import type { CandidateProfile, CandidateFact, Job, GenerationRun } from '@resume-builder/domain';
import { createLLMClient, createAzureOpenAIClient, ResumeOrchestrator } from '@resume-builder/ai';
import type { OrchestrationResult, LLMClient } from '@resume-builder/ai';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';

export class GenerationService {
  private orchestrator: ResumeOrchestrator;
  private runs = new Map<string, GenerationRun>();

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
    if (this.db) await createUnitOfWork(this.db).generationRuns.create(result.run);
    return result;
  }

  async getRun(runId: string): Promise<GenerationRun | null> {
    return this.runs.get(runId) ?? (this.db ? createUnitOfWork(this.db).generationRuns.findById(runId) : null);
  }
}
