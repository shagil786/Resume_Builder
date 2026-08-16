import type { SearchOptions } from '../client';

export interface EvidenceQuery {
  query: string;
  profileId: string;
  skills?: string[];
  employers?: string[];
  categories?: string[];
  status?: string[];
  minConfidence?: number;
  limit?: number;
  useSemantic?: boolean;
  embedding?: number[];
}

export function buildEvidenceSearchQuery(params: EvidenceQuery): SearchOptions {
  const filters: string[] = [`profileId eq '${escapeFilterValue(params.profileId)}'`];

  if (params.status && params.status.length > 0) {
    filters.push(`search.in(status, '${params.status.join('|')}', '|')`);
  }

  if (params.skills && params.skills.length > 0) {
    const escaped = params.skills.map(s => escapeFilterValue(s));
    filters.push(`search.in(technologies, '${escaped.join('|')}', '|')`);
  }

  if (params.employers && params.employers.length > 0) {
    const escaped = params.employers.map(e => escapeFilterValue(e));
    filters.push(`search.in(company, '${escaped.join('|')}', '|')`);
  }

  if (params.categories && params.categories.length > 0) {
    filters.push(`search.in(category, '${params.categories.join('|')}', '|')`);
  }

  if (params.minConfidence !== undefined) {
    filters.push(`confidence ge ${params.minConfidence}`);
  }

  const q = params.embedding
    ? '*'
    : params.query;

  const options: SearchOptions = {
    filter: filters.join(' and '),
    top: params.limit ?? 20,
    select: [
      'id', 'profileId', 'factId', 'claim', 'context',
      'category', 'technologies', 'company', 'role',
      'status', 'confidence', 'sourceDocumentId', 'createdAt',
    ],
    orderBy: ['confidence desc'],
  };

  if (params.embedding) {
    options.vectorQueries = [
      {
        kind: 'vector',
        vector: params.embedding,
        fields: 'embedding',
        k: params.limit ?? 20,
        exhaustive: false,
      },
    ];
    options.queryType = 'semantic';
    options.semanticConfiguration = 'default-semantic-configuration';
  }

  if (params.useSemantic) {
    options.queryType = 'semantic';
    options.semanticConfiguration = 'default-semantic-configuration';
    options.searchMode = 'any';
  }

  return {
    ...options,
    searchMode: options.searchMode ?? 'any',
    queryType: q === '*' ? 'simple' : (options.queryType ?? 'full'),
  };
}

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}
