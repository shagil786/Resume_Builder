export { createSearchClient } from './client';
export type { SearchClientConfig, SearchDocument, SearchOptions, SearchResult } from './client';

export { CANDIDATE_FACTS_INDEX } from './indexes';
export type { SearchIndexDefinition, SearchIndexField, VectorSearchProfile, SemanticConfiguration } from './indexes';

export { buildEvidenceSearchQuery } from './queries';
export type { EvidenceQuery } from './queries';

export { createEvidenceRetrievalService } from './evidence-retrieval.service';
export type { EvidenceRetrievalConfig, EvidenceRetrievalResult } from './evidence-retrieval.service';
