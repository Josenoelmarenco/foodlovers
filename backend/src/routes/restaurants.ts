import { Router } from 'express';
import { listRestaurantsQuerySchema } from '../schemas/restaurants.js';
import { getRestaurantById, listRestaurants } from '../services/restaurants.js';
import { notFound } from '../lib/httpError.js';

export const restaurantsRouter: Router = Router();

restaurantsRouter.get('/', async (req, res, next) => {
  try {
    const query = listRestaurantsQuerySchema.parse(req.query);
    const result = await listRestaurants(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

restaurantsRouter.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) throw notFound(`Restaurant ${req.params.id} not found.`);
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});
