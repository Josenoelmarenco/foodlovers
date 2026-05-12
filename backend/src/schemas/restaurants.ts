import { z } from 'zod';
import { paginationSchema } from './common.js';

export const listRestaurantsQuerySchema = paginationSchema.extend({
  cuisine: z.string().trim().min(1).optional(),
  neighborhood: z.string().trim().min(1).optional(),
});

export type ListRestaurantsQuery = z.infer<typeof listRestaurantsQuerySchema>;
