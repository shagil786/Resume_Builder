import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import { completeJson } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, CandidateFact, JobAnalysis, ResumeStrategy } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import { RESUME_STRATEGY_SCHEMA } from '../schemas/json-schemas';

export class ResumeStrategist {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o', temperature: 0.2, ...config };
    this.logger = logger ?? new ConsoleLogger('resume-strategist');
  }

  async plan(profile: CandidateProfile, jobAnalysis: JobAnalysis, facts: CandidateFact[] = []): Promise<ResumeStrategy> {
    const systemPrompt = getPrompt('plan-strategy-system');
    if (!systemPrompt) throw new Error('plan-strategy-system prompt not registered');

    const profileSummary = {
      currentRole: profile.workExperience[0]?.title ?? 'Not specified',
      totalExperience: profile.workExperience.length,
      totalProjects: profile.projects.length,
      totalSkills: profile.skills.length,
      topSkills: profile.skills.slice(0, 10).map(s => s.name),
    };

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Target Role: ${jobAnalysis.role} at ${jobAnalysis.company}
Seniority: ${jobAnalysis.seniority}

Job Requirements:
- Must-have skills: ${jobAnalysis.mustHaveSkills.map(s => `${s.skill} (importance: ${s.importance})`).join(', ')}
- Preferred skills: ${jobAnalysis.preferredSkills.map(s => s.skill).join(', ')}

Candidate Profile:
- Current role: ${profileSummary.currentRole}
- Experience count: ${profileSummary.totalExperience}
- Projects: ${profileSummary.totalProjects}
- Top skills: ${profileSummary.topSkills.join(', ')}

Candidate Evidence (select only from these IDs):
${facts.map(f => `[${f.id}] (${f.category}) ${f.claim} — Source: ${f.sourceRef}`).join('\n') || '(No extracted facts available)'}

Create a resume strategy for this candidate targeting this job.`,
      },
    ];

    this.logger.info('Planning resume strategy', { targetRole: jobAnalysis.role });

    const { data, tokenUsage } = await completeJson(this.client, messages, {
      ...this.config,
      jsonSchema: RESUME_STRATEGY_SCHEMA,
    });
    const strategy = data as unknown as ResumeStrategy;

    // Only keep fact IDs that actually exist in evidence — hallucinated IDs are dropped.
    const validIds = new Set(facts.map(f => f.id));
    const selectedFacts = strategy.selectedFacts.filter(id => validIds.has(id));

    this.logger.info('Strategy complete', { targetRole: strategy.targetRole, selectedFacts: selectedFacts.length, tokenUsage });

    return {
      targetRole: strategy.targetRole,
      emphasize: strategy.emphasize ?? [],
      deemphasize: strategy.deemphasize ?? [],
      experiencePriority: strategy.experiencePriority ?? [],
      selectedFacts,
      sectionBudget: strategy.sectionBudget,
    };
  }
}
