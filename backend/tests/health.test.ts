import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Even though this test doesn't touch the DB, the app imports services that
// instantiate Prisma. Stub the client module so importing it doesn't try to
// connect.
vi.mock('../src/db/client.js', () => ({ prisma: {} }));

import { createApp } from '../src/app.js';

describe('GET /api/health', () => {
  const app = createApp();

  it('returns 200 and a healthy payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'foodlovers-api',
    });
    expect(res.body.timestamp).toEqual(expect.any(String));
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'NotFound' });
  });
});
