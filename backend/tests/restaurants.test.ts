import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// vi.hoisted runs BEFORE every import, which guarantees the mock factory
// below has access to the mock fns at module-eval time.
const { restaurantMocks } = vi.hoisted(() => ({
  restaurantMocks: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('../src/db/client.js', () => ({
  prisma: { restaurant: restaurantMocks },
}));

import { createApp } from '../src/app.js';

describe('GET /api/restaurants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a paginated list with default page/pageSize', async () => {
    restaurantMocks.findMany.mockResolvedValue([
      {
        id: 'r1',
        name: 'Pizza Bar Roma',
        cuisine: 'Italian',
        neighborhood: 'Kallio',
        rating: 4.6,
        imageUrl: 'x',
        createdAt: new Date(),
      },
    ]);
    restaurantMocks.count.mockResolvedValue(1);

    const res = await request(createApp()).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
  });

  it('filters by cuisine and neighborhood', async () => {
    restaurantMocks.findMany.mockResolvedValue([]);
    restaurantMocks.count.mockResolvedValue(0);

    const res = await request(createApp()).get(
      '/api/restaurants?cuisine=Italian&neighborhood=Kallio',
    );

    expect(res.status).toBe(200);
    expect(restaurantMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cuisine: { equals: 'Italian', mode: 'insensitive' },
          neighborhood: { equals: 'Kallio', mode: 'insensitive' },
        }),
      }),
    );
  });

  it('rejects invalid pagination', async () => {
    const res = await request(createApp()).get('/api/restaurants?page=0');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });
});

describe('GET /api/restaurants/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the restaurant with its dishes', async () => {
    restaurantMocks.findUnique.mockResolvedValue({
      id: 'r1',
      name: 'Pizza Bar Roma',
      cuisine: 'Italian',
      neighborhood: 'Kallio',
      rating: 4.6,
      imageUrl: 'x',
      createdAt: new Date(),
      dishes: [],
    });

    const res = await request(createApp()).get('/api/restaurants/r1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('r1');
  });

  it('returns 404 when not found', async () => {
    restaurantMocks.findUnique.mockResolvedValue(null);
    const res = await request(createApp()).get('/api/restaurants/missing');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('HttpError');
  });
});
