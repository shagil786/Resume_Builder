import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { CandidateFact } from '@resume-builder/domain';
import { createSearchClient } from './client/index.js';
import type { SearchClientConfig } from './client/index.js';
import { buildEvidenceSearchQuery } from './queries/index.js';
import type { EvidenceQuery } from './queries/index.js';

export interface EvidenceRetrievalConfig {
  search: SearchClientConfig;
}

export interface EvidenceRetrievalResult {
  facts: CandidateFact[];
  totalCount: number;
  query: string;
}

export function createEvidenceRetrievalService(config: EvidenceRetrievalConfig, logger?: Logger) {
  const log = logger ?? new ConsoleLogger('evidence-retrieval');
  const client = createSearchClient(config.search, logger);

  return {
    async search(query: EvidenceQuery): Promise<EvidenceRetrievalResult> {
      log.info('Searching evidence', { query: query.query, profileId: query.profileId });

      const searchOptions = buildEvidenceSearchQuery(query);
      const result = await client.search(searchOptions);

      const facts: CandidateFact[] = result.documents.map(doc => ({
        id: doc.factId,
        sourceRef: doc.sourceDocumentId ?? '',
        claim: doc.claim,
        context: doc.context,
        confidence: doc.confidence,
        status: doc.status as CandidateFact['status'],
        category: doc.category as CandidateFact['category'],
        timestamp: new Date(doc.createdAt),
        version: 1,
      }));

      log.info('Evidence search complete', { found: facts.length, total: result.totalCount });

      return { facts, totalCount: result.totalCount, query: query.query };
    },

    async indexFacts(facts: CandidateFact[], profileId: string): Promise<void> {
      const documents = facts.map(fact => ({
        id: `${profileId}_${fact.id}`,
        profileId,
        factId: fact.id,
        claim: fact.claim,
        context: fact.context,
        category: fact.category,
        technologies: extractTechnologies(fact),
        company: '',
        role: '',
        status: fact.status,
        confidence: fact.confidence,
        sourceDocumentId: fact.sourceRef,
        createdAt: fact.timestamp.toISOString(),
      }));

      await client.indexDocuments(documents);
      log.info('Facts indexed', { count: documents.length, profileId });
    },

    async deleteProfileFacts(profileId: string): Promise<void> {
      log.info('Deleting profile facts from search index', { profileId });
    },
  };
}

function extractTechnologies(fact: CandidateFact): string[] {
  const techKeywords = [
    'React', 'Angular', 'Vue', 'Node', 'TypeScript', 'JavaScript',
    'Python', 'Java', 'Go', 'Rust', 'C++', 'SQL', 'PostgreSQL',
    'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'GCP', 'GraphQL', 'REST', 'Kafka', 'RabbitMQ', 'Terraform',
    'CI/CD', 'Git', 'Linux',
  ];
  return techKeywords.filter(t => fact.claim.includes(t) || fact.context.includes(t));
}
