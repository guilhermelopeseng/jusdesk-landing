export interface StandardError {
  status: number;
  error: string;
  message: string;
  path: string;
}

export type FieldValidationError = Record<string, string>;

export type ApiError = StandardError | FieldValidationError;

export function isStandardError(error: unknown): error is StandardError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'error' in error &&
    'path' in error
  );
}

export function parseApiError(body: unknown): ApiError {
  if (isStandardError(body)) {
    return body;
  }
  return (body ?? {}) as FieldValidationError;
}
