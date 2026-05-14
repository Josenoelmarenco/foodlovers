import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { scoreListings, type ListingForScoring } from '../src/services/recommendation.js';

// ── Pure scorer ─────────────────────────────────────────────────────────────
//
// These tests exercise the scoring function in isolation, no DB needed.
// They guard the algorithm's invariants and protect against subtle
// regressions (off-by-one, normalization edges, weight tie-breaking).

const listings: ListingForScoring[] = [
  // Cheap & slow & quality reused (all share the same restaurant rating)
  {
    id: 'l-cheap',
    platformId: 'p-foodora',
    platformName: 'Foodora',
    brandColor: '#D6116B',
    price: 9,
    deliveryFee: 1,
    deliveryMinutes: 45,
    available: true,
  },
  // Mid price, fastest
  {
    id: 'l-fast',
    platformId: 'p-wolt',
    platformName: 'Wolt',
    brandColor: '#00C2E8',
    price: 11,
    deliveryFee: 2,
    deliveryMinutes: 20,
    available: true,
  },
  // Expensive, mid speed
  {
    id: 'l-expensive',
    platformId: 'p-ubereats',
    platformName: 'UberEats',
    brandColor: '#06C167',
    price: 14,
    deliveryFee: 3,
    deliveryMinutes: 30,
    available: true,
  },
];

const RATING = 4.5;

describe('scoreListings (pure)', () => {
  it('returns an empty list when no listings are available', () => {
    const result = scoreListings([], { price: 1, speed: 0, quality: 0 }, RATING);
    expect(result).toEqual([]);
  });

  it('drops unavailable listings', () => {
    const unavailable = listings.map((l) => ({ ...l, available: false }));
    expect(scoreListings(unavailable, { price: 1, speed: 0, quality: 0 }, RATING)).toEqual([]);
  });

  it('ranks the cheapest first when price has full weight', () => {
    const ranked = scoreListings(listings, { price: 1, speed: 0, quality: 0 }, RATING);
    expect(ranked.map((r) => r.listingId)).toEqual(['l-cheap', 'l-fast', 'l-expensive']);
    // Cheapest gets normalized price = 1.
    expect(ranked[0]!.raw.price).toBe(1);
    expect(ranked[2]!.raw.price).toBe(0);
  });

  it('ranks the fastest first when speed has full weight', () => {
    const ranked = scoreListings(listings, { price: 0, speed: 1, quality: 0 }, RATING);
    expect(ranked[0]!.listingId).toBe('l-fast');
    expect(ranked[0]!.raw.speed).toBe(1);
  });

  it('breakdown components sum to the total score', () => {
    const ranked = scoreListings(listings, { price: 0.5, speed: 0.3, quality: 0.2 }, RATING);
    for (const r of ranked) {
      const sum = r.breakdown.price + r.breakdown.speed + r.breakdown.quality;
      // Floats — allow a tiny tolerance because each value is rounded to 4 decimals.
      expect(Math.abs(sum - r.score)).toBeLessThan(0.001);
    }
  });

  it('keeps scores in 0..1 regardless of weight distribution', () => {
    const ranked = scoreListings(listings, { price: 0.33, speed: 0.33, quality: 0.34 }, RATING);
    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it('does not crash on identical values (no NaN division)', () => {
    const flat: ListingForScoring[] = listings.map((l) => ({
      ...l,
      price: 10,
      deliveryFee: 1,
      deliveryMinutes: 25,
    }));
    const ranked = scoreListings(flat, { price: 0.5, speed: 0.3, quality: 0.2 }, RATING);
    expect(ranked).toHaveLength(3);
    for (const r of ranked) expect(Number.isFinite(r.score)).toBe(true);
  });

  it('uses restaurant rating as the quality proxy', () => {
    const lowRated = scoreListings(listings, { price: 0, speed: 0, quality: 1 }, 1);
    const highRated = scoreListings(listings, { price: 0, speed: 0, quality: 1 }, 5);
    expect(lowRated[0]!.raw.quality).toBe(0.2);
    expect(highRated[0]!.raw.quality).toBe(1);
  });
});

// ── Endpoint integration with Prisma mocked ──────────────────────────────────

const { dishMocks } = vi.hoisted(() => ({
  dishMocks: { findUnique: vi.fn() },
}));

vi.mock('../src/db/client.js', () => ({
  prisma: { dish: dishMocks },
}));

const { createApp } = await import('../src/app.js');

describe('POST /api/recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('400s on weights that do not sum to 1', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/recommendations')
      .send({
        dishId: 'cl00000000000000000000000',
        weights: { price: 0.5, speed: 0.5, quality: 0.5 },
      });
    expect(res.status).toBe(400);
  });

  it('404s when the dish is not found', async () => {
    dishMocks.findUnique.mockResolvedValue(null);
    const app = createApp();
    const res = await request(app)
      .post('/api/recommendations')
      .send({
        dishId: 'cl00000000000000000000000',
        weights: { price: 0.5, speed: 0.3, quality: 0.2 },
      });
    expect(res.status).toBe(404);
  });

  it('200s and returns ranked listings for a known dish', async () => {
    dishMocks.findUnique.mockResolvedValue({
      id: 'cl00000000000000000000001',
      name: 'Margherita Pizza',
      restaurant: { rating: 4.6 },
      listings: [
        {
          id: 'list-1',
          platformId: 'p1',
          price: 12,
          deliveryFee: 2,
          deliveryMinutes: 25,
          available: true,
          platform: { id: 'p1', name: 'Wolt', brandColor: '#00C2E8' },
        },
        {
          id: 'list-2',
          platformId: 'p2',
          price: 10,
          deliveryFee: 1,
          deliveryMinutes: 40,
          available: true,
          platform: { id: 'p2', name: 'Foodora', brandColor: '#D6116B' },
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/recommendations')
      .send({
        dishId: 'cl00000000000000000000001',
        weights: { price: 1, speed: 0, quality: 0 },
      });

    expect(res.status).toBe(200);
    expect(res.body.dishId).toBe('cl00000000000000000000001');
    expect(res.body.ranked).toHaveLength(2);
    expect(res.body.ranked[0].platformName).toBe('Foodora');
    expect(res.body.winnerId).toBe('list-2');
    expect(typeof res.body.reasoning).toBe('string');
  });
});
