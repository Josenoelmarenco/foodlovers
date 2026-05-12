import { z } from 'zod';
import { paginationSchema } from './common.js';

export const searchDishesQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).optional(),
  cuisine: z.string().trim().min(1).optional(),
  neighborhood: z.string().trim().min(1).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  platformId: z.string().min(20).optional(),
});

export type SearchDishesQuery = z.infer<typeof searchDishesQuerySchema>;
