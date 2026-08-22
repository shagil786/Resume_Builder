import type { LLMClient, LLMMessage, LLMClientConfig } from '../llm';
import { completeJson } from '../llm';
import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateProfile, Job, JobAnalysis, ResumeStrategy, ResumeContent, CandidateFact, ResumeSection } from '@resume-builder/domain';
import { getPrompt } from '../prompts';
import { RESUME_CONTENT_SCHEMA } from '../schemas/json-schemas';

interface WriterExperience {
  company: string;
  role: string;
  bullets: { text: string; evidence: string[] }[];
}

interface WriterContent {
  headline: string;
  summary: string;
  skills: { category: string; items: string[] }[];
  experience: WriterExperience[];
}

export class ResumeWriter {
  private client: LLMClient;
  private config: LLMClientConfig;
  private logger: Logger;

  constructor(client: LLMClient, config: Partial<LLMClientConfig> = {}, logger?: Logger) {
    this.client = client;
    this.config = { model: 'gpt-4o', temperature: 0.2, ...config };
    this.logger = logger ?? new ConsoleLogger('resume-writer');
  }

  async write(profile: CandidateProfile, strategy: ResumeStrategy, job: Job, jobAnalysis: JobAnalysis, facts: CandidateFact[], language?: string): Promise<ResumeContent> {
    const systemPrompt = getPrompt('resume-writer-system');
    if (!systemPrompt) throw new Error('resume-writer-system prompt not registered');

    // Honor the strategist's selection when it picked valid facts; otherwise
    // fall back to every non-rejected fact so thin evidence still produces output.
    const eligible = facts.filter(f => f.status !== 'REJECTED');
    const chosen = strategy.selectedFacts.length > 0
      ? eligible.filter(f => strategy.selectedFacts.includes(f.id))
      : [];
    const sourceFacts = chosen.length > 0 ? chosen : eligible;

    const factText = sourceFacts.map(f =>
      `[${f.id}] (${f.category}) ${f.claim} — Source: ${f.sourceRef}`
    ).join('\n');

    const jobRequirements = `Job Requirements:
- Must-have skills: ${jobAnalysis.mustHaveSkills.map(skill => skill.skill).join(', ')}
- Preferred skills: ${jobAnalysis.preferredSkills.map(skill => skill.skill).join(', ')}
- Responsibilities: ${jobAnalysis.responsibilities.join('; ')}
- Keywords: ${jobAnalysis.keywords.join(', ')}

Full Job Description:
${job.rawText}`;

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: `Target Role: ${strategy.targetRole}
Language: ${language ?? 'English'}

${jobRequirements}

Strategy:
- Emphasize: ${strategy.emphasize.join(', ')}
- De-emphasize: ${strategy.deemphasize.join(', ') || 'none'}
- Experience priority: ${strategy.experiencePriority.join(' > ') || 'most relevant first'}
- Section budget (approximate words): ${JSON.stringify(strategy.sectionBudget)}

Candidate Facts (use ONLY these; preserve all relevant source history):
${factText}

Generate a targeted ATS resume for this job:
- Preserve EVERY distinct employer, role, and date range present in the facts — never merge two jobs into one entry.
- Order experience entries by relevance to the target role first.
- Write 2-5 accomplishment bullets per relevant employer; each bullet cites the fact IDs it derives from in "evidence".
- Group skills into categories (e.g. Languages, Frameworks, Tools) using only technologies supported by evidence.
- Summary: max 3 sentences, specific, no buzzwords.`,
      },
    ];

    this.logger.info('Generating resume content', { targetRole: strategy.targetRole, evidenceFacts: sourceFacts.length });

    const { data, tokenUsage } = await completeJson(this.client, messages, {
      ...this.config,
      jsonSchema: RESUME_CONTENT_SCHEMA,
    });
    const content = data as unknown as WriterContent;

    this.logger.info('Resume generation complete', { tokenUsage });

    const matchingExperience = (company: string, role: string) => profile.workExperience.find(experience =>
      experience.company.toLowerCase() === company.toLowerCase() ||
      experience.title.toLowerCase() === role.toLowerCase()
    );
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const formatRange = (start: Date, end?: Date) => `${formatDate(start)} - ${end ? formatDate(end) : 'Present'}`;
    const experienceItems = content.experience.map((exp, i) => {
      const source = matchingExperience(exp.company, exp.role);
      return {
        id: `exp-${i}`,
        content: exp.company,
        subtitle: exp.role,
        meta: source ? `${formatRange(source.startDate, source.endDate)}${source.location ? ` · ${source.location}` : ''}` : undefined,
        bulletPoints: (exp.bullets ?? []).map(b => ({
          id: `bullet-${i}-${b.evidence[0] ?? 'unknown'}`,
          text: b.text,
          evidence: b.evidence,
        })),
      };
    });
    const profileSkills = profile.skills.reduce<Record<string, string[]>>((groups, skill) => {
      (groups[skill.category || 'Skills'] ??= []).push(skill.name);
      return groups;
    }, {});
    const skillGroups = content.skills.length > 0
      ? content.skills
      : Object.entries(profileSkills).map(([category, items]) => ({ category, items }));
    const sections: ResumeSection[] = [
        {
          id: 'summary',
          type: 'SUMMARY',
          title: 'Summary',
          order: 1,
          items: [{ id: 'summary-1', content: content.summary || profile.summary || '' }],
        },
        {
          id: 'experience',
          type: 'EXPERIENCE',
          title: 'Experience',
          order: 2,
          items: experienceItems,
        },
        {
          id: 'skills',
          type: 'SKILL',
          title: 'Skills',
          order: 3,
          items: skillGroups.map((group, i) => ({
            id: `skills-${i}`,
            content: `${group.category}: ${group.items.join(', ')}`,
          })),
        },
      ];
    if (profile.projects.length > 0) sections.push({
      id: 'projects', type: 'PROJECT', title: 'Projects', order: 4,
      items: profile.projects.map(project => ({
        id: project.id, content: project.name,
        bulletPoints: project.bulletPoints.map(bullet => ({ id: bullet.id, text: bullet.text, evidence: bullet.factIds })),
      })),
    });
    if (profile.education.length > 0) sections.push({
      id: 'education', type: 'EDUCATION', title: 'Education', order: 5,
      items: profile.education.map(entry => ({
        id: entry.id,
        content: entry.institution,
        subtitle: `${entry.degree}${entry.fieldOfStudy ? ` in ${entry.fieldOfStudy}` : ''}`,
        meta: formatRange(entry.startDate, entry.endDate),
      })),
    });

    const personal = profile.personalInfo;
    const contact = [personal.location, personal.phone, personal.email, personal.linkedinUrl, personal.githubUrl, personal.portfolioUrl]
      .filter((value): value is string => Boolean(value));
    return {
      header: {
        name: `${personal.firstName} ${personal.lastName}`.trim(),
        headline: content.headline || strategy.targetRole,
        contact,
      },
      sections,
      metadata: {
        factUsageMap: {},
      },
    };
  }
}
