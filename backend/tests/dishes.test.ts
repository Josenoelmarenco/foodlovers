import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { dishMocks } = vi.hoisted(() => ({
  dishMocks: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('../src/db/client.js', () => ({
  prisma: { dish: dishMocks },
}));

import { createApp } from '../src/app.js';

describe('GET /api/dishes/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matches for a query string', async () => {
    dishMocks.findMany.mockResolvedValue([
      {
        id: 'd1',
        name: 'Margherita Pizza',
        description: '...',
        basePrice: 13.5,
        imageUrl: 'x',
        restaurant: { id: 'r1', name: 'Pizza Bar Roma' },
        listings: [],
      },
    ]);
    dishMocks.count.mockResolvedValue(1);

    const res = await request(createApp()).get('/api/dishes/search?q=margherita');

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toMatch(/margherita/i);
    expect(dishMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: 'margherita', mode: 'insensitive' },
        }),
      }),
    );
  });

  it('filters by maxPrice', async () => {
    dishMocks.findMany.mockResolvedValue([]);
    dishMocks.count.mockResolvedValue(0);

    await request(createApp()).get('/api/dishes/search?maxPrice=12');

    expect(dishMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          basePrice: { lte: 12 },
        }),
      }),
    );
  });
});

describe('GET /api/dishes/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the dish with restaurant and listings', async () => {
    dishMocks.findUnique.mockResolvedValue({
      id: 'd1',
      name: 'Margherita Pizza',
      description: '...',
      basePrice: 13.5,
      imageUrl: 'x',
      restaurant: { id: 'r1', name: 'Pizza Bar Roma' },
      listings: [],
    });

    const res = await request(createApp()).get('/api/dishes/d1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('d1');
  });

  it('returns 404 when not found', async () => {
    dishMocks.findUnique.mockResolvedValue(null);
    const res = await request(createApp()).get('/api/dishes/missing');
    expect(res.status).toBe(404);
  });
});
