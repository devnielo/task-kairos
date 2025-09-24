export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: Record<string, unknown>;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
