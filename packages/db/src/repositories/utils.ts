import { RepositoryError, REPOSITORY_ERRORS } from './errors';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginatedResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export function paginate(params: PaginationParams): { offset: number; limit: number } {
  return {
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
  };
}

export function repoError(code: keyof typeof REPOSITORY_ERRORS, message: string, options?: { table?: string; constraint?: string; originalError?: unknown }): RepositoryError {
  return new RepositoryError(
    REPOSITORY_ERRORS[code],
    message,
    { ...options, originalError: options?.originalError instanceof Error ? options.originalError : undefined }
  );
}
