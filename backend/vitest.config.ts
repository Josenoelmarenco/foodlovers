import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      // Dummy values so env.ts validation passes during tests.
      // Real DB access in tests is fully mocked.
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      PORT: '4000',
      CORS_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
  },
});
