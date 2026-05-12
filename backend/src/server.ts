import { createApp } from './app.js';
import { env } from './lib/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[foodlovers-api] listening on http://localhost:${env.PORT}`);
  console.log(`[foodlovers-api] env: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n[foodlovers-api] received ${signal}, shutting down...`);
  server.close(() => {
    console.log('[foodlovers-api] closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
