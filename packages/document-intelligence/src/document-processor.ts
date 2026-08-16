import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateFact } from '@resume-builder/domain';
import { createDocumentIntelligenceClient } from './client/index.js';
import type { DocumentIntelligenceClientConfig } from './client/index.js';
import { extractFacts } from './parsers/index.js';
import type { ParseResult } from './parsers/index.js';

export interface DocumentProcessorConfig {
  documentIntelligence: DocumentIntelligenceClientConfig;
}

export interface ProcessDocumentInput {
  buffer: ArrayBuffer;
  mimeType: string;
  filename: string;
  profileId: string;
}

export interface ProcessDocumentOutput {
  sourceRef: string;
  parseResult: ParseResult;
  facts: CandidateFact[];
  extractedAt: Date;
}

export function createDocumentProcessor(config: DocumentProcessorConfig, logger?: Logger) {
  const log = logger ?? new ConsoleLogger('document-processor');
  const client = createDocumentIntelligenceClient(config.documentIntelligence, logger);

  return {
    async process(input: ProcessDocumentInput): Promise<ProcessDocumentOutput> {
      const sourceRef = `${input.profileId}/${input.filename}`;
      log.info('Processing document', { filename: input.filename, profileId: input.profileId, mimeType: input.mimeType });

      const result = await client.analyze(input.buffer, input.mimeType);
      const parseResult = extractFacts(result.document, input.profileId, sourceRef);

      log.info('Document processed', {
        filename: input.filename,
        facts: parseResult.facts.length,
        sections: result.document.sections.length,
      });

      return {
        sourceRef,
        parseResult,
        facts: parseResult.facts.map((f, i) => ({
          ...f,
          id: `fact-${Date.now()}-${i}`,
        })),
        extractedAt: new Date(),
      };
    },
  };
}
