/** Normalized error shape derived from an RFC 7807 ProblemDetails response. */
export interface AppError {
  status: number;
  title: string;
  detail?: string;
  /** Per-field validation messages, when present. */
  fieldErrors?: Record<string, string[]>;
}

interface ProblemDetails {
  status?: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export function toAppError(status: number, body: unknown): AppError {
  const problem = (body ?? {}) as ProblemDetails;
  return {
    status: problem.status ?? status,
    title: problem.title ?? 'Error',
    detail: problem.detail,
    fieldErrors: problem.errors,
  };
}
