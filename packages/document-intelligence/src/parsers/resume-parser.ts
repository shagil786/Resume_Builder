import type { CandidateFact } from '@resume-builder/domain';
import type { AnalyzedDocument, Paragraph } from '../client';

export interface ParseResult {
  facts: CandidateFact[];
  personalInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
}

function extractPersonalInfo(content: string, paragraphs: Paragraph[]): ParseResult['personalInfo'] {
  const info: ParseResult['personalInfo'] = {};

  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) info.email = emailMatch[0];

  const phoneMatch = content.match(/\+?1?\d{10,15}/);
  if (phoneMatch) info.phone = phoneMatch[0];

  const linkedinMatch = content.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) info.linkedinUrl = `https://${linkedinMatch[0]}`;

  const githubMatch = content.match(/github\.com\/[\w-]+/i);
  if (githubMatch) info.githubUrl = `https://${githubMatch[0]}`;

  const firstLine = paragraphs[0]?.content ?? '';
  const nameParts = firstLine.split(' ').filter(Boolean);
  if (nameParts.length >= 2) {
    info.firstName = nameParts[0];
    info.lastName = nameParts.slice(1).join(' ');
  }

  return info;
}

function extractSummary(content: string, paragraphs: Paragraph[]): string | undefined {
  const firstHeading = paragraphs.find(p => p.role === 'sectionHeading');
  if (!firstHeading) return undefined;

  const firstHeadingIdx = paragraphs.indexOf(firstHeading);
  const linesBeforeHeading = paragraphs.slice(0, firstHeadingIdx).filter(p => !p.role);
  const summaryLines = linesBeforeHeading.slice(1);

  return summaryLines.length > 0 ? summaryLines.map(l => l.content).join(' ') : undefined;
}

export function extractFacts(
  doc: AnalyzedDocument,
  profileId: string,
  sourceRef: string
): ParseResult {
  const personalInfo = extractPersonalInfo(doc.content, doc.paragraphs);
  const summary = extractSummary(doc.content, doc.paragraphs);
  const facts: CandidateFact[] = [];

  const sections = doc.sections;

  for (const section of sections) {
    const normalizedTitle = section.title.toLowerCase().trim();
    const category = detectCategory(normalizedTitle);

    const lines = section.content.split('\n').filter(l => l.trim().length > 10);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const pageNumber = section.pageNumber;

      facts.push({
        id: '',
        sourceRef,
        sourceLocation: {
          pageNumber,
          characterRange: {
            start: doc.content.indexOf(line),
            end: doc.content.indexOf(line) + line.length,
          },
        },
        claim: line,
        context: getContext(lines, i),
        confidence: calculateConfidence(line, category),
        status: 'EXTRACTED',
        category,
        timestamp: new Date(),
        version: 1,
      });
    }
  }

  return { facts, personalInfo, summary };
}

function detectCategory(sectionTitle: string): CandidateFact['category'] {
  if (/experience|work|employment|career|professional/i.test(sectionTitle)) return 'WORK';
  if (/skill|technical|competenc|expertise|proficien/i.test(sectionTitle)) return 'SKILL';
  if (/project/i.test(sectionTitle)) return 'PROJECT';
  if (/education|academic|university|college|degree/i.test(sectionTitle)) return 'EDUCATION';
  if (/certif|certification|credential/i.test(sectionTitle)) return 'CERTIFICATION';
  if (/achiev|award|honor|accomplish/i.test(sectionTitle)) return 'ACHIEVEMENT';
  return 'WORK';
}

function getContext(lines: string[], index: number): string {
  const before = index > 0 ? lines[index - 1] : '';
  const after = index < lines.length - 1 ? lines[index + 1] : '';
  return [before, lines[index], after].filter(Boolean).join('\n');
}

function calculateConfidence(line: string, _category: CandidateFact['category']): number {
  let confidence = 0.85;
  if (line.length < 20) confidence -= 0.1;
  if (/\d{2,3}%|\d+x|\$\d+/.test(line)) confidence += 0.05;
  return Math.min(confidence, 1.0);
}
