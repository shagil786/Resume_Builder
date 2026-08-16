import type { CandidateProfile, CandidateFact, Job, ResumeContent, GenerationRun } from '@resume-builder/domain';
import { createLLMClient, ResumeOrchestrator } from '@resume-builder/ai';
import type { OrchestrationResult } from '@resume-builder/ai';

export class GenerationService {
  private orchestrator: ResumeOrchestrator;

  constructor() {
    const llm = createLLMClient({ model: 'gpt-4o-mini', temperature: 0.2 });
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
