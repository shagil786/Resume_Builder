import { describe, expect, it, vi } from 'vitest';
import { loadApplicationConfig, type Environment } from './key-vault.js';

const baseEnvironment: Environment = {
  NODE_ENV: 'development',
  KEY_VAULT_URL: 'https://example.vault.azure.net/',
  DATABASE_HOST: 'db.example.com',
  DATABASE_PORT: '5432',
  DATABASE_NAME: 'resume_builder',
  DATABASE_SSL: 'true',
  AZURE_OPENAI_ENDPOINT: 'https://openai.example.com',
  AZURE_OPENAI_DEPLOYMENT: 'gpt-4o',
  BLOB_ACCOUNT_NAME: 'resumeaccount',
  BLOB_CONTAINER: 'resumes',
  DOC_INTELLIGENCE_ENDPOINT: 'https://doc.example.com',
  SEARCH_ENDPOINT: 'https://search.example.com',
  SEARCH_INDEX: 'candidate-facts',
};

const secretValues = {
  'postgres-admin-password': 'password-from-vault',
  'postgres-admin-username': 'resumeadmin',
  'azure-openai-key': 'openai-key-from-vault',
  'blob-account-key': 'blob-key-from-vault',
  'document-intelligence-key': 'doc-key-from-vault',
  'search-admin-key': 'search-key-from-vault',
  'jwt-secret': 'jwt-secret-from-vault',
};

function mockClient() {
  return {
    getSecret: vi.fn(async (name: string) => ({ value: secretValues[name as keyof typeof secretValues] })),
  };
}

describe('loadApplicationConfig', () => {
  it('loads Key Vault secrets and maps them to application settings', async () => {
    const client = mockClient();

    const config = await loadApplicationConfig(baseEnvironment, { client });

    expect(config.database).toEqual({
      host: 'db.example.com', port: 5432, database: 'resume_builder',
      username: 'resumeadmin', password: 'password-from-vault', ssl: true,
    });
    expect(config.azureOpenAI.apiKey).toBe('openai-key-from-vault');
    expect(config.blob.accountKey).toBe('blob-key-from-vault');
    expect(config.documentIntelligence.apiKey).toBe('doc-key-from-vault');
    expect(config.search.apiKey).toBe('search-key-from-vault');
    expect(config.jwtSecret).toBe('jwt-secret-from-vault');
    expect(client.getSecret).toHaveBeenCalledTimes(7);
  });

  it('fails without revealing the missing secret value or secret contents', async () => {
    const client = {
      getSecret: vi.fn(async (name: string) => ({ value: name === 'jwt-secret' ? undefined : secretValues[name as keyof typeof secretValues] })),
    };

    await expect(loadApplicationConfig(baseEnvironment, { client })).rejects.toThrow(
      'Required Key Vault secret "jwt-secret" is missing'
    );
  });

  it('fails in production when KEY_VAULT_URL is not configured', async () => {
    await expect(loadApplicationConfig({ ...baseEnvironment, NODE_ENV: 'production', KEY_VAULT_URL: undefined })).rejects.toThrow(
      'KEY_VAULT_URL is required in production'
    );
  });

  it('reports Key Vault access denial without exposing secret data', async () => {
    const client = {
      getSecret: vi.fn(async () => {
        throw Object.assign(new Error('sensitive response body'), { statusCode: 403 });
      }),
    };

    await expect(loadApplicationConfig(baseEnvironment, { client })).rejects.toThrow(
      'Key Vault access denied while reading secret "postgres-admin-password"'
    );
  });
});
