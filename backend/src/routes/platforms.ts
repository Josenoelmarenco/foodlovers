import { Router } from 'express';
import { listPlatforms } from '../services/platforms.js';

export const platformsRouter: Router = Router();

platformsRouter.get('/', async (_req, res, next) => {
  try {
    const platforms = await listPlatforms();
    res.json({ items: platforms });
  } catch (err) {
    next(err);
  }
});
