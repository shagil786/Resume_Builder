export interface SearchIndexField {
  name: string;
  type: 'Edm.String' | 'Edm.Single' | 'Collection(Edm.String)' | 'Edm.Boolean' | 'Edm.Double' | 'Edm.Int32' | 'Edm.DateTimeOffset';
  filterable?: boolean;
  searchable?: boolean;
  retrievable?: boolean;
  key?: boolean;
  sortable?: boolean;
  facetable?: boolean;
  analyzer?: string;
  dimensions?: number;
  vectorSearchProfile?: string;
}

export interface VectorSearchProfile {
  name: string;
  algorithm: string;
}

export interface SemanticConfiguration {
  name: string;
  prioritizedFields: {
    titleField?: string;
    contentFields: string[];
    keywordFields?: string[];
  };
}

export interface SearchIndexDefinition {
  name: string;
  vectorSearch?: {
    algorithms: { name: string; kind: string; hnswParameters: { metric: string; m: number; efConstruction: number } }[];
    profiles: VectorSearchProfile[];
  };
  semanticSearch?: {
    configurations: SemanticConfiguration[];
  };
  fields: SearchIndexField[];
}

export const CANDIDATE_FACTS_INDEX: SearchIndexDefinition = {
  name: 'candidate-facts',
  vectorSearch: {
    algorithms: [
      {
        name: 'fact-vector-algorithm',
        kind: 'hnsw',
        hnswParameters: { metric: 'cosine', m: 4, efConstruction: 400 },
      },
    ],
    profiles: [
      { name: 'factVectorProfile', algorithm: 'fact-vector-algorithm' },
    ],
  },
  semanticSearch: {
    configurations: [
      {
        name: 'default-semantic-configuration',
        prioritizedFields: {
          contentFields: ['claim', 'context'],
          keywordFields: ['technologies', 'category'],
        },
      },
    ],
  },
  fields: [
    { name: 'id', type: 'Edm.String', key: true, retrievable: true, filterable: true },
    { name: 'profileId', type: 'Edm.String', filterable: true, retrievable: true },
    { name: 'factId', type: 'Edm.String', filterable: true, retrievable: true },
    { name: 'claim', type: 'Edm.String', searchable: true, retrievable: true, analyzer: 'standard.lucene' },
    { name: 'context', type: 'Edm.String', searchable: true, retrievable: true },
    { name: 'category', type: 'Edm.String', filterable: true, retrievable: true, searchable: true },
    { name: 'technologies', type: 'Collection(Edm.String)', filterable: true, retrievable: true, searchable: true },
    { name: 'company', type: 'Edm.String', filterable: true, retrievable: true, searchable: true },
    { name: 'role', type: 'Edm.String', filterable: true, retrievable: true, searchable: true },
    { name: 'status', type: 'Edm.String', filterable: true, retrievable: true },
    { name: 'confidence', type: 'Edm.Double', filterable: true, sortable: true },
    { name: 'sourceDocumentId', type: 'Edm.String', filterable: true, retrievable: true },
    { name: 'embedding', type: 'Edm.Single', dimensions: 1536, vectorSearchProfile: 'factVectorProfile', retrievable: false },
    { name: 'createdAt', type: 'Edm.DateTimeOffset', filterable: true, sortable: true },
  ],
};
