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

function extractSummary(_content: string, paragraphs: Paragraph[]): string | undefined {
  const firstHeading = paragraphs.find(p => p.role === 'sectionHeading');
  if (!firstHeading) return undefined;

  const firstHeadingIdx = paragraphs.indexOf(firstHeading);
  const linesBeforeHeading = paragraphs.slice(0, firstHeadingIdx).filter(p => !p.role);
  const summaryLines = linesBeforeHeading.slice(1);

  return summaryLines.length > 0 ? summaryLines.map(l => l.content).join(' ') : undefined;
}

export function extractFacts(
  doc: AnalyzedDocument,
  _profileId: string,
  sourceRef: string
): ParseResult {
  const personalInfo = extractPersonalInfo(doc.content, doc.paragraphs);
  const summary = extractSummary(doc.content, doc.paragraphs);
  const facts: CandidateFact[] = [];

  const sections = doc.sections;

  for (const section of sections) {
    const normalizedTitle = section.title.toLowerCase().trim();
    const category = detectCategory(normalizedTitle);
    const heading = section.title.trim();

    // Atomic facts: split the section into individual bullets/lines.
    // Document Intelligence often returns a whole experience block as one
    // paragraph with '·'/'•' separators — each accomplishment must become
    // its own fact so it can be selected, cited, and verified independently.
    const segments = section.content
      .split('\n')
      .flatMap(line => line.split(/\s*[·•]\s+|\s+[-–—]{1,2}\s+(?=[A-Z])/))
      .map(s => s.replace(/^\s*[-–—·•]\s*/, '').trim())
      .filter(s => s.length > 10 && s !== heading);

    for (let i = 0; i < segments.length; i++) {
      const claim = normalizeClaim(segments[i]);
      if (!claim) continue;

      facts.push({
        id: '',
        sourceRef,
        sourceLocation: {
          pageNumber: section.pageNumber,
          characterRange: {
            start: doc.content.indexOf(segments[i]),
            end: doc.content.indexOf(segments[i]) + segments[i].length,
          },
        },
        claim,
        context: buildContext(segments, i),
        confidence: calculateConfidence(claim, category),
        status: 'EXTRACTED',
        category,
        timestamp: new Date(),
        version: 1,
      });
    }
  }

  return { facts, personalInfo, summary };
}

/** Trims trailing separators and collapses whitespace for clean claims. */
function normalizeClaim(text: string): string {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\s*[·•]\s*$/, '')
    .replace(/^[-–—·•]\s*/, '')
    .trim();
  // Drop fragments that are clearly date/location metadata only
  if (/^(aug|jan|feb|mar|apr|may|jun|jul|sep|oct|nov|dec|20\d{2})/i.test(cleaned) && cleaned.length < 40) return '';
  return cleaned;
}

/**
 * Context = neighboring segments ONLY (never duplicates the claim itself).
 */
function buildContext(segments: string[], index: number): string {
  const parts = [
    index > 0 ? segments[index - 1] : '',
    index < segments.length - 1 ? segments[index + 1] : '',
  ]
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return parts.join(' · ').slice(0, 400);
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

function calculateConfidence(line: string, _category: CandidateFact['category']): number {
  let confidence = 0.85;
  if (line.length < 20) confidence -= 0.1;
  if (/\d{2,3}%|\d+x|\$\d+/.test(line)) confidence += 0.05;
  return Math.min(confidence, 1.0);
}
