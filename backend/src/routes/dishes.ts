import { Router } from 'express';
import { searchDishesQuerySchema } from '../schemas/dishes.js';
import { getDishById, searchDishes } from '../services/dishes.js';
import { notFound } from '../lib/httpError.js';

export const dishesRouter: Router = Router();

dishesRouter.get('/search', async (req, res, next) => {
  try {
    const query = searchDishesQuerySchema.parse(req.query);
    const result = await searchDishes(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

dishesRouter.get('/:id', async (req, res, next) => {
  try {
    const dish = await getDishById(req.params.id);
    if (!dish) throw notFound(`Dish ${req.params.id} not found.`);
    res.json(dish);
  } catch (err) {
    next(err);
  }
});
