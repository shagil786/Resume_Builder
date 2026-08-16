export { createDocumentIntelligenceClient } from './client';
export type {
  DocumentIntelligenceClientConfig,
  AnalyzedDocument,
  Paragraph,
  Table,
  KeyValuePair,
  DocumentSection,
  Page,
} from './client';

export { extractFacts } from './parsers';
export type { ParseResult } from './parsers';

export { createDocumentProcessor } from './document-processor';
export type { DocumentProcessorConfig, ProcessDocumentInput, ProcessDocumentOutput } from './document-processor';
