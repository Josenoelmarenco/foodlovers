import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { platformMocks } = vi.hoisted(() => ({
  platformMocks: { findMany: vi.fn() },
}));

vi.mock('../src/db/client.js', () => ({
  prisma: { platform: platformMocks },
}));

import { createApp } from '../src/app.js';

describe('GET /api/platforms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the list of platforms', async () => {
    platformMocks.findMany.mockResolvedValue([
      { id: 'p1', name: 'Wolt', brandColor: '#00C2E8', createdAt: new Date() },
      { id: 'p2', name: 'UberEats', brandColor: '#06C167', createdAt: new Date() },
    ]);

    const res = await request(createApp()).get('/api/platforms');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].name).toBe('Wolt');
  });
});
