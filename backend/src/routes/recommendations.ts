import { Router } from 'express';
import { recommendationRequestSchema } from '../schemas/recommendation.js';
import { recommendForDish } from '../services/recommendation.js';

export const recommendationsRouter: Router = Router();

/**
 * POST /api/recommendations
 *
 * Body: { dishId: string, weights: { price, speed, quality } }
 * Each weight is 0..1 and the three must sum to 1.0 (±0.01).
 *
 * Returns the same dish ranked across its available platforms,
 * with a per-pillar breakdown and a short human-readable reason.
 */
recommendationsRouter.post('/', async (req, res, next) => {
  try {
    const body = recommendationRequestSchema.parse(req.body);
    const result = await recommendForDish(body.dishId, body.weights);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
