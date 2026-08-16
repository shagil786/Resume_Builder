import { describe, expect, it } from 'vitest';
import { CANDIDATE_FACTS_INDEX } from './candidate-facts.index.js';

describe('candidate facts search index definition', () => {
  it('uses the Azure AI Search semantic index property shape', () => {
    const index = CANDIDATE_FACTS_INDEX as unknown as Record<string, unknown>;
    expect(index.semanticSearch).toBeUndefined();
    expect(index.semantic).toEqual({
      configurations: [{
        name: 'default-semantic-configuration',
        prioritizedFields: {
          prioritizedContentFields: [{ fieldName: 'claim' }, { fieldName: 'context' }],
          prioritizedKeywordsFields: [{ fieldName: 'technologies' }, { fieldName: 'category' }],
        },
      }],
    });
    const embedding = (index.fields as { name: string; type: string }[]).find(field => field.name === 'embedding');
    expect(embedding?.type).toBe('Collection(Edm.Single)');
  });
});
