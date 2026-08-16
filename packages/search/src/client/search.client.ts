import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';

export interface SearchClientConfig {
  endpoint: string;
  apiKey: string;
  indexName: string;
}

export interface SearchDocument {
  id: string;
  profileId: string;
  factId: string;
  claim: string;
  context: string;
  category: string;
  technologies?: string[];
  company?: string;
  role?: string;
  status: string;
  confidence: number;
  sourceDocumentId?: string;
  createdAt: string;
  embedding?: number[];
}

export interface SearchOptions {
  searchMode?: 'any' | 'all';
  queryType?: 'simple' | 'full' | 'semantic';
  filter?: string;
  top?: number;
  skip?: number;
  select?: string[];
  orderBy?: string[];
  vectorQueries?: {
    kind: 'vector' | 'text';
    vector?: number[];
    fields: string;
    k?: number;
    exhaustive?: boolean;
  }[];
  semanticConfiguration?: string;
  captions?: 'extractive' | 'none';
}

export interface SearchResult {
  documents: SearchDocument[];
  totalCount: number;
  coverage?: number;
}

export function createSearchClient(config: SearchClientConfig, logger?: Logger) {
  const log = logger ?? new ConsoleLogger('search-client');
  const apiVersion = '2024-11-01-preview';

  const baseUrl = `${config.endpoint}/indexes/${config.indexName}`;

  return {
    async search(options: SearchOptions = {}): Promise<SearchResult> {
      const body: Record<string, unknown> = {
        search: options.queryType === 'semantic' ? '*' : undefined,
        searchMode: options.searchMode ?? 'any',
        queryType: options.queryType ?? 'simple',
        top: options.top ?? 50,
        skip: options.skip ?? 0,
        filter: options.filter,
        select: options.select?.join(',') ?? '*',
        orderBy: options.orderBy?.join(','),
      };

      if (options.queryType === 'semantic' && options.semanticConfiguration) {
        body.semanticConfiguration = options.semanticConfiguration;
        body.captions = options.captions ?? 'extractive';
      }

      if (options.vectorQueries) {
        body.vectorQueries = options.vectorQueries;
        body.vectorFilterMode = 'preFilter';
      }

      const response = await fetch(`${baseUrl}/docs/search.post.search?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Search error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as {
        value: { '@search.score': number; [key: string]: unknown }[];
        '@odata.count'?: number;
        '@search.coverage'?: number;
      };

      const documents: SearchDocument[] = data.value.map(item => {
        const fields = options.select ?? Object.keys(item).filter(k => !k.startsWith('@search'));
        const doc: Record<string, unknown> = {};
        for (const field of fields) {
          if (field === '@search.score') continue;
          doc[field] = item[field];
        }
        return doc as unknown as SearchDocument;
      });

      return {
        documents,
        totalCount: data['@odata.count'] ?? documents.length,
        coverage: data['@search.coverage'],
      };
    },

    async indexDocument(document: SearchDocument): Promise<void> {
      const body = {
        value: [
          {
            '@search.action': 'mergeOrUpload',
            ...document,
          },
        ],
      };

      const response = await fetch(`${baseUrl}/docs/index?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Search index error: ${response.status} ${errorText}`);
      }

      log.info('Document indexed', { factId: document.factId });
    },

    async indexDocuments(documents: SearchDocument[]): Promise<void> {
      const body = {
        value: documents.map(doc => ({
          '@search.action': 'mergeOrUpload' as const,
          ...doc,
        })),
      };

      const response = await fetch(`${baseUrl}/docs/index?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Search batch index error: ${response.status} ${errorText}`);
      }

      log.info('Documents indexed', { count: documents.length });
    },

    async deleteDocument(key: string): Promise<void> {
      const body = {
        value: [{ '@search.action': 'delete', id: key }],
      };

      await fetch(`${baseUrl}/docs/index?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(body),
      });
    },

    async createIndex(): Promise<void> {
      const indexDefinition = await import('../indexes').then(m => m.CANDIDATE_FACTS_INDEX);

      const response = await fetch(`${config.endpoint}/indexes?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(indexDefinition),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400 && errorText.includes('already exists')) {
          log.info('Index already exists', { indexName: config.indexName });
          return;
        }
        throw new Error(`Azure AI Search create index error: ${response.status} ${errorText}`);
      }

      log.info('Index created', { indexName: config.indexName });
    },

    async healthCheck(): Promise<boolean> {
      try {
        const result = await this.search({ top: 1 });
        return result.totalCount >= 0;
      } catch {
        return false;
      }
    },
  };
}
