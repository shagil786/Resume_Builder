export const REPOSITORY_ERRORS = {
  CONNECTION_FAILED: 'REPOSITORY_CONNECTION_FAILED',
  TRANSACTION_FAILED: 'REPOSITORY_TRANSACTION_FAILED',
  ENTITY_NOT_FOUND: 'REPOSITORY_ENTITY_NOT_FOUND',
  DUPLICATE_KEY: 'REPOSITORY_DUPLICATE_KEY',
  VALIDATION_ERROR: 'REPOSITORY_VALIDATION_ERROR',
  FOREIGN_KEY_VIOLATION: 'REPOSITORY_FOREIGN_KEY_VIOLATION',
  QUERY_TIMEOUT: 'REPOSITORY_QUERY_TIMEOUT',
  SERIALIZATION_ERROR: 'REPOSITORY_SERIALIZATION_ERROR',
} as const;

export type RepositoryErrorCode = typeof REPOSITORY_ERRORS[keyof typeof REPOSITORY_ERRORS];

export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly table?: string;
  public readonly constraint?: string;
  public readonly originalError?: Error;
  public readonly timestamp: Date;

  constructor(
    code: RepositoryErrorCode,
    message: string,
    options?: { table?: string; constraint?: string; originalError?: Error }
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.table = options?.table;
    this.constraint = options?.constraint;
    this.originalError = options?.originalError;
    this.timestamp = new Date();
  }
}
