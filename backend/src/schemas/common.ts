import { z } from 'zod';

/**
 * Shared query primitives. Re-exported by feature-specific schemas.
 */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const cuidSchema = z.string().min(20, 'Invalid id.');
