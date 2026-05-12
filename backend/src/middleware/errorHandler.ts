import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

/**
 * Central error handler. Keeps responses consistent across the API.
 * Place this AFTER all routes in app.ts.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      issues: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({
      error: err.name || 'InternalServerError',
      message: status >= 500 ? 'Something went wrong.' : err.message,
    });
    return;
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Unknown error.' });
};
