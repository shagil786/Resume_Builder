import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';

export interface DocumentIntelligenceClientConfig {
  endpoint: string;
  apiKey: string;
  modelId?: string;
}

export interface AnalyzedDocument {
  content: string;
  paragraphs: Paragraph[];
  tables: Table[];
  keyValuePairs: KeyValuePair[];
  sections: DocumentSection[];
  pages: Page[];
}

export interface Paragraph {
  content: string;
  role?: 'title' | 'sectionHeading' | 'pageHeader' | 'pageFooter' | 'footnote' | 'pageNumber';
  boundingRegions?: { pageNumber: number; polygon: number[] }[];
  confidence: number;
}

export interface Table {
  rowCount: number;
  columnCount: number;
  cells: { content: string; rowIndex: number; columnIndex: number }[];
  boundingRegions?: { pageNumber: number; polygon: number[] }[];
}

export interface KeyValuePair {
  key: string;
  value: string;
  confidence: number;
}

export interface DocumentSection {
  title: string;
  content: string;
  pageNumber: number;
}

export interface Page {
  pageNumber: number;
  width: number;
  height: number;
  lines: { content: string; confidence: number }[];
}

export interface AnalyzeResult {
  document: AnalyzedDocument;
  modelId: string;
  apiVersion: string;
}

export function createDocumentIntelligenceClient(config: DocumentIntelligenceClientConfig, logger?: Logger) {
  const log = logger ?? new ConsoleLogger('document-intelligence');
  const modelId = config.modelId ?? 'prebuilt-layout';

  return {
    async analyze(buffer: ArrayBuffer, mimeType: string): Promise<AnalyzeResult> {
      log.info('Analyzing document', { mimeType, size: buffer.byteLength });

      const response = await fetch(
        `${config.endpoint}/documentintelligence/documentModels/${modelId}:analyze?api-version=2024-02-29-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': mimeType,
            'Ocp-Apim-Subscription-Key': config.apiKey,
          },
          body: buffer,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Document Intelligence API error: ${response.status} ${errorText}`);
      }

      const operationLocation = response.headers.get('Operation-Location');
      if (!operationLocation) throw new Error('No Operation-Location header in response');

      const result = await pollForResult(operationLocation, config.apiKey, log);
      return result;
    },

    async analyzeFromUrl(url: string): Promise<AnalyzeResult> {
      log.info('Analyzing document from URL', { url });

      const response = await fetch(
        `${config.endpoint}/documentintelligence/documentModels/${modelId}:analyze?api-version=2024-02-29-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': config.apiKey,
          },
          body: JSON.stringify({ urlSource: url }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Document Intelligence API error: ${response.status} ${errorText}`);
      }

      const operationLocation = response.headers.get('Operation-Location');
      if (!operationLocation) throw new Error('No Operation-Location header in response');

      return await pollForResult(operationLocation, config.apiKey, log);
    },
  };
}

async function pollForResult(
  operationLocation: string,
  apiKey: string,
  log: Logger,
  maxRetries = 60,
  intervalMs = 1000
): Promise<AnalyzeResult> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(operationLocation, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    });

    if (!response.ok) {
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data = await response.json() as {
      status: string;
      analyzeResult?: {
        content: string;
        paragraphs: unknown[];
        tables: unknown[];
        keyValuePairs: unknown[];
        pages: unknown[];
      };
    };

    if (data.status === 'succeeded' && data.analyzeResult) {
      log.info('Document analysis complete', { retries: i + 1 });
      return transformResult(data.analyzeResult);
    }

    if (data.status === 'failed') {
      throw new Error('Document analysis failed');
    }

    await sleep(intervalMs);
  }

  throw new Error('Document analysis timed out');
}

function transformResult(result: {
  content: string;
  paragraphs: unknown[];
  tables: unknown[];
  keyValuePairs: unknown[];
  pages: unknown[];
}): AnalyzeResult {
  const paragraphs: Paragraph[] = (result.paragraphs ?? []).map((p: Record<string, unknown>) => ({
    content: p.content as string,
    role: p.role as Paragraph['role'],
    boundingRegions: p.boundingRegions as Paragraph['boundingRegions'],
    confidence: (p.confidence as number) ?? 1,
  }));

  const tables: Table[] = (result.tables ?? []).map((t: Record<string, unknown>) => ({
    rowCount: t.rowCount as number,
    columnCount: t.columnCount as number,
    cells: (t.cells as Record<string, unknown>[]).map(c => ({
      content: c.content as string,
      rowIndex: c.rowIndex as number,
      columnIndex: c.columnIndex as number,
    })),
    boundingRegions: t.boundingRegions as Table['boundingRegions'],
  }));

  const sections = extractSections(paragraphs);

  const pages: Page[] = (result.pages ?? []).map((p: Record<string, unknown>) => ({
    pageNumber: p.pageNumber as number,
    width: p.width as number,
    height: p.height as number,
    lines: ((p.lines as Record<string, unknown>[]) ?? []).map(l => ({
      content: l.content as string,
      confidence: (l.confidence as number) ?? 1,
    })),
  }));

  return {
    document: {
      content: result.content,
      paragraphs,
      tables,
      keyValuePairs: [],
      sections,
      pages,
    },
    modelId: 'prebuilt-layout',
    apiVersion: '2024-02-29-preview',
  };
}

function extractSections(paragraphs: Paragraph[]): DocumentSection[] {
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;

  for (const p of paragraphs) {
    if (p.role === 'sectionHeading') {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: p.content,
        content: '',
        pageNumber: p.boundingRegions?.[0]?.pageNumber ?? 1,
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + p.content;
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
