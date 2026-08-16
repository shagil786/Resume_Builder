import type { CandidateProfile, CandidateFact, Job } from '@resume-builder/domain';
import { createLLMClient, createAzureOpenAIClient, ResumeOrchestrator } from '@resume-builder/ai';
import type { OrchestrationResult, LLMClient } from '@resume-builder/ai';

export class GenerationService {
  private orchestrator: ResumeOrchestrator;

  constructor() {
    let llm: LLMClient;

    if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY) {
      llm = createAzureOpenAIClient({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_KEY,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? 'gpt-4o',
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
    templateId: string
  ): Promise<OrchestrationResult> {
    return this.orchestrator.generateResume(profile, job, facts, templateId);
  }
}
