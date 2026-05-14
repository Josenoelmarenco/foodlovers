import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { healthRouter } from './routes/health.js';
import { restaurantsRouter } from './routes/restaurants.js';
import { dishesRouter } from './routes/dishes.js';
import { platformsRouter } from './routes/platforms.js';
import { recommendationsRouter } from './routes/recommendations.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): express.Express => {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  // Friendly landing for anyone hitting the bare API host (e.g. recruiters).
  app.get('/', (_req, res) => {
    res.json({
      name: 'foodlovers-api',
      status: 'ok',
      description:
        'JSON API for the FoodLovers project. See https://github.com/Josenoelmarenco/foodlovers',
      endpoints: [
        'GET  /api/health',
        'GET  /api/platforms',
        'GET  /api/restaurants',
        'GET  /api/restaurants/:id',
        'GET  /api/dishes/search',
        'GET  /api/dishes/:id',
        'POST /api/recommendations',
      ],
    });
  });

  // Routes
  app.use('/api/health', healthRouter);
  app.use('/api/restaurants', restaurantsRouter);
  app.use('/api/dishes', dishesRouter);
  app.use('/api/platforms', platformsRouter);
  app.use('/api/recommendations', recommendationsRouter);

  // 404 fallback
  app.use((_req, res) => {
    res.status(404).json({ error: 'NotFound', message: 'Route does not exist.' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
