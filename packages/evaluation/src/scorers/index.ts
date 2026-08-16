import type { CandidateFact, ResumeContent } from '@resume-builder/domain';

export interface ScorerResult {
  score: number;
  details: string[];
}

export function scoreFactAccuracy(facts: CandidateFact[], resume: ResumeContent): ScorerResult {
  const details: string[] = [];
  const resumeClaims = resume.sections.flatMap(s =>
    s.items.flatMap(item => [
      item.content,
      ...(item.bulletPoints?.map(b => ({ text: b.text, evidence: b.evidence })) ?? []),
    ])
  );

  let supported = 0;
  let total = 0;

  if (Array.isArray(resumeClaims)) {
    for (const claim of resumeClaims) {
      total++;
      const text = typeof claim === 'string' ? claim : claim.text;
      const evidence = typeof claim === 'string' ? [] : claim.evidence;

      if (evidence.length > 0) {
        supported++;
        details.push(`SUPPORTED: "${text.slice(0, 60)}..." → ${evidence.length} evidence refs`);
      } else {
        const matched = facts.some(f => f.claim.includes(text.slice(0, 20)));
        if (matched) {
          supported++;
          details.push(`PARAPHRASED: "${text.slice(0, 60)}..."`);
        } else {
          details.push(`UNSUPPORTED: "${text.slice(0, 60)}..."`);
        }
      }
    }
  }

  const score = total > 0 ? supported / total : 1;
  return { score, details };
}

export function scoreTemplateConformance(resume: ResumeContent): ScorerResult {
  const details: string[] = [];
  let issues = 0;

  for (const section of resume.sections) {
    if (section.items.length === 0) {
      issues++;
      details.push(`Empty section: ${section.title}`);
    }
    for (const item of section.items) {
      if (!item.content || item.content.trim().length === 0) {
        issues++;
        details.push(`Empty item in section: ${section.title}`);
      }
    }
  }

  const score = Math.max(0, 1 - issues * 0.1);
  return { score, details };
}

export function scoreJobCoverage(resume: ResumeContent, jobKeywords: string[]): ScorerResult {
  const details: string[] = [];
  const resumeText = resume.sections.flatMap(s =>
    s.items.map(i => i.content).join(' ')
  ).join(' ').toLowerCase();

  let matched = 0;
  for (const keyword of jobKeywords) {
    if (resumeText.includes(keyword.toLowerCase())) {
      matched++;
    } else {
      details.push(`Missing keyword: "${keyword}"`);
    }
  }

  const score = jobKeywords.length > 0 ? matched / jobKeywords.length : 1;
  return { score, details };
}
