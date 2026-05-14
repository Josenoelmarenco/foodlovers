import { z } from 'zod';

/**
 * Weights are normalized 0..1 floats that must sum to 1.0 (±0.01).
 *
 * The 0.01 tolerance protects against floating-point UI sliders
 * (e.g. 0.34 + 0.33 + 0.33 = 0.9999...).
 */
const weightSchema = z.number().min(0).max(1);

export const weightsSchema = z
  .object({
    price: weightSchema,
    speed: weightSchema,
    quality: weightSchema,
  })
  .refine((w) => Math.abs(w.price + w.speed + w.quality - 1) <= 0.01, {
    message: 'Weights must sum to 1.0 (±0.01).',
  });

export const recommendationRequestSchema = z.object({
  dishId: z.string().min(20, 'Invalid dishId.'),
  weights: weightsSchema,
});

export type Weights = z.infer<typeof weightsSchema>;
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;
