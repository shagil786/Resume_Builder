import { FIXTURES } from './fixtures/dataset.js';
import { scoreFactAccuracy, scoreTemplateConformance, scoreJobCoverage } from './scorers/index.js';
import type { ScorerResult } from './scorers/index.js';

interface EvaluationReport {
  timestamp: string;
  fixtures: number;
  results: {
    fixtureName: string;
    factAccuracy: ScorerResult;
    templateConformance: ScorerResult;
    jobCoverage: ScorerResult;
    hallucinationRate: number;
    evidenceCoverage: number;
  }[];
  summary: {
    avgFactAccuracy: number;
    avgTemplateConformance: number;
    avgJobCoverage: number;
    avgHallucinationRate: number;
    avgEvidenceCoverage: number;
  };
}

function runEvaluation(): EvaluationReport {
  const results: EvaluationReport['results'] = [];

  for (const fixture of FIXTURES) {
    const jobKeywords = extractKeywords(fixture.job.rawText);
    const resumeContent = buildResumeFromFacts(fixture.facts);

    const factAccuracy = scoreFactAccuracy(fixture.facts, resumeContent);
    const templateConformance = scoreTemplateConformance(resumeContent);
    const jobCoverage = scoreJobCoverage(resumeContent, jobKeywords);

    const hallucinationRate = 1 - factAccuracy.score;
    const claims = resumeContent.sections.flatMap(s =>
      s.items.flatMap(i => i.bulletPoints ?? [])
    );
    const claimsWithEvidence = claims.filter(c => c.evidence.length > 0).length;
    const evidenceCoverage = claims.length > 0 ? claimsWithEvidence / claims.length : 1;

    results.push({
      fixtureName: fixture.name,
      factAccuracy,
      templateConformance,
      jobCoverage,
      hallucinationRate,
      evidenceCoverage,
    });
  }

  const avg = (key: keyof EvaluationReport['results'][0]) => {
    if (typeof results[0][key] === 'number') {
      return results.reduce((sum, r) => sum + (r[key] as number), 0) / results.length;
    }
    return 0;
  };

  return {
    timestamp: new Date().toISOString(),
    fixtures: FIXTURES.length,
    results,
    summary: {
      avgFactAccuracy: results.reduce((s, r) => s + r.factAccuracy.score, 0) / results.length,
      avgTemplateConformance: results.reduce((s, r) => s + r.templateConformance.score, 0) / results.length,
      avgJobCoverage: results.reduce((s, r) => s + r.jobCoverage.score, 0) / results.length,
      avgHallucinationRate: results.reduce((s, r) => s + r.hallucinationRate, 0) / results.length,
      avgEvidenceCoverage: results.reduce((s, r) => s + r.evidenceCoverage, 0) / results.length,
    },
  };
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/[\s,.\n]+/);
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'with', 'of', 'in', 'to', 'is', 'it', 'at', 'we', 'are', 'looking', 'experience']);
  return [...new Set(words.filter(w => w.length > 2 && !stopwords.has(w)))];
}

function buildResumeFromFacts(facts: CandidateFact[]) {
  return {
    sections: [
      {
        id: 'experience', type: 'EXPERIENCE' as const, title: 'Experience', order: 1,
        items: facts.filter(f => f.category === 'WORK').map((f, i) => ({
          id: `item-${i}`,
          content: f.claim,
          bulletPoints: [{
            id: `bullet-${i}`,
            text: f.claim,
            evidence: [f.id],
          }],
        })),
      },
    ],
    metadata: { factUsageMap: {} },
  };
}

const report = runEvaluation();

console.log(JSON.stringify(report, null, 2));
