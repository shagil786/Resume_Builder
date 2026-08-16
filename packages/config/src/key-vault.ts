import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

export type Environment = Record<string, string | undefined>;

export interface SecretClientLike {
  getSecret(name: string): Promise<{ value?: string }>;
}

export interface ApplicationConfig {
  keyVaultUrl: string;
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  azureOpenAI: {
    endpoint?: string;
    deployment?: string;
    apiKey: string;
  };
  blob: {
    accountName?: string;
    container?: string;
    accountKey: string;
  };
  documentIntelligence: {
    endpoint?: string;
    apiKey: string;
  };
  search: {
    endpoint?: string;
    index?: string;
    apiKey: string;
  };
  jwtSecret: string;
}

const SECRET_NAMES = {
  DATABASE_PASSWORD: 'postgres-admin-password',
  DATABASE_USER: 'postgres-admin-username',
  AZURE_OPENAI_KEY: 'azure-openai-key',
  BLOB_ACCOUNT_KEY: 'blob-account-key',
  DOC_INTELLIGENCE_KEY: 'document-intelligence-key',
  SEARCH_KEY: 'search-admin-key',
  JWT_SECRET: 'jwt-secret',
} as const;

export async function loadKeyVaultSecrets(
  keyVaultUrl: string,
  client?: SecretClientLike,
): Promise<Record<keyof typeof SECRET_NAMES, string>> {
  const secretClient = client ?? new SecretClient(keyVaultUrl, new DefaultAzureCredential());
  const entries = await Promise.all(Object.entries(SECRET_NAMES).map(async ([envName, secretName]) => {
    let result: { value?: string };
    try {
      result = await secretClient.getSecret(secretName);
    } catch (error) {
      const statusCode = error instanceof Error && 'statusCode' in error
        ? (error as Error & { statusCode?: number }).statusCode
        : undefined;
      if (statusCode === 403) {
        throw new Error(`Key Vault access denied while reading secret "${secretName}"`);
      }
      if (statusCode === 404) {
        throw new Error(`Required Key Vault secret "${secretName}" was not found`);
      }
      throw new Error(`Unable to read required Key Vault secret "${secretName}"; verify Azure authentication and vault access`);
    }

    if (!result.value) {
      throw new Error(`Required Key Vault secret "${secretName}" is missing`);
    }
    return [envName, result.value] as const;
  }));

  return Object.fromEntries(entries) as Record<keyof typeof SECRET_NAMES, string>;
}

export async function loadApplicationConfig(
  env: Environment = process.env,
  options: { client?: SecretClientLike } = {},
): Promise<ApplicationConfig> {
  const keyVaultUrl = env.KEY_VAULT_URL?.trim();
  if (!keyVaultUrl) {
    if (env.NODE_ENV === 'production') {
      throw new Error('KEY_VAULT_URL is required in production');
    }
    throw new Error('KEY_VAULT_URL is required; authenticate with `az login` before starting the API');
  }

  const secrets = await loadKeyVaultSecrets(keyVaultUrl, options.client);
  const database = env.DATABASE_HOST ? {
    host: env.DATABASE_HOST,
    port: parseInteger(env.DATABASE_PORT, 'DATABASE_PORT'),
    database: requiredSetting(env.DATABASE_NAME, 'DATABASE_NAME'),
    username: secrets.DATABASE_USER,
    password: secrets.DATABASE_PASSWORD,
    ssl: env.DATABASE_SSL === 'true',
  } : undefined;

  return {
    keyVaultUrl,
    database,
    azureOpenAI: {
      endpoint: env.AZURE_OPENAI_ENDPOINT,
      deployment: env.AZURE_OPENAI_DEPLOYMENT,
      apiKey: secrets.AZURE_OPENAI_KEY,
    },
    blob: {
      accountName: env.BLOB_ACCOUNT_NAME,
      container: env.BLOB_CONTAINER,
      accountKey: secrets.BLOB_ACCOUNT_KEY,
    },
    documentIntelligence: {
      endpoint: env.DOC_INTELLIGENCE_ENDPOINT,
      apiKey: secrets.DOC_INTELLIGENCE_KEY,
    },
    search: {
      endpoint: env.SEARCH_ENDPOINT,
      index: env.SEARCH_INDEX,
      apiKey: secrets.SEARCH_KEY,
    },
    jwtSecret: secrets.JWT_SECRET,
  };
}

function requiredSetting(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new Error(`${name} is required when DATABASE_HOST is configured`);
  return value;
}

function parseInteger(value: string | undefined, name: string): number {
  const parsed = Number(value ?? '5432');
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}
