/**
 * Convenience class so route handlers can throw HTTP-aware errors
 * and have the central errorHandler turn them into the right status.
 */
export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const notFound = (message = 'Not found.') => new HttpError(404, message);
export const badRequest = (message: string) => new HttpError(400, message);
