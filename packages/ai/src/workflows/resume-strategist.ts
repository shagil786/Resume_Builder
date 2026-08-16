import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, JobAnalysis, ResumeStrategy } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import type { ResumeStrategySchema } from '../schemas';

export class ResumeStrategist {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o', temperature: 0.2, ...config };
    this.logger = logger ?? new ConsoleLogger('resume-strategist');
  }

  async plan(profile: CandidateProfile, jobAnalysis: JobAnalysis): Promise<ResumeStrategy> {
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

Create a resume strategy for this candidate targeting this job.`,
      },
    ];

    this.logger.info('Planning resume strategy', { targetRole: jobAnalysis.role });

    const response = await this.client.complete(messages, this.config);
    const strategy = JSON.parse(response.content) as ResumeStrategySchema;

    this.logger.info('Strategy complete', { targetRole: strategy.targetRole, selectedFacts: strategy.selectedFacts.length });

    return {
      targetRole: strategy.targetRole,
      emphasize: strategy.emphasize,
      deemphasize: strategy.deemphasize,
      experiencePriority: strategy.experiencePriority,
      selectedFacts: strategy.selectedFacts,
      sectionBudget: strategy.sectionBudget,
    };
  }
}
