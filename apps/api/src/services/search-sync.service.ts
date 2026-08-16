import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import { createEvidenceRetrievalService } from '@resume-builder/search';
import { createSearchClient } from '@resume-builder/search';
import type { CandidateFact } from '@resume-builder/domain';

export interface SearchConfig {
  endpoint: string;
  apiKey: string;
  indexName: string;
}

export class SearchSyncService {
  private logger: Logger;
  private svc: ReturnType<typeof createEvidenceRetrievalService> | null = null;

  constructor(private config?: SearchConfig, logger?: Logger) {
    this.logger = logger ?? new ConsoleLogger('search-sync');
  }

  async initialize(): Promise<void> {
    if (!this.config) {
      this.logger.warn('No search config — facts will not be indexed for search');
      return;
    }

    try {
      const client = createSearchClient({
        endpoint: this.config.endpoint,
        apiKey: this.config.apiKey,
        indexName: this.config.indexName,
      }, this.logger);
      await client.createIndex();
      this.svc = createEvidenceRetrievalService(
        { search: { endpoint: this.config.endpoint, apiKey: this.config.apiKey, indexName: this.config.indexName } },
        this.logger
      );
      this.logger.info('Search index initialized', { indexName: this.config.indexName });
    } catch (err) {
      this.logger.error('Failed to initialize search index', { error: err });
    }
  }

  async syncFacts(facts: CandidateFact[], profileId: string): Promise<void> {
    if (!this.svc) return;
    try {
      await this.svc.indexFacts(facts, profileId);
    } catch (err) {
      this.logger.error('Failed to sync facts to search index', { error: err, profileId });
    }
  }

  async searchFacts(profileId: string, query: string): Promise<{ facts: CandidateFact[]; total: number }> {
    if (!this.svc) return { facts: [], total: 0 };
    try {
      const result = await this.svc.search({ query, profileId });
      return { facts: result.facts, total: result.totalCount };
    } catch (err) {
      this.logger.error('Search failed', { error: err, profileId, query });
      return { facts: [], total: 0 };
    }
  }
}
