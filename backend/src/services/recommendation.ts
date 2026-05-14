/**
 * Deterministic recommendation engine.
 *
 * Given a dish (with its platform listings) and a set of user priorities,
 * produce a ranked list with a transparent breakdown.
 *
 * No LLM, no randomness. Every score can be recomputed by hand from inputs,
 * which makes the feature explainable, testable and auditable.
 */
import { prisma } from '../db/client.js';
import { notFound } from '../lib/httpError.js';
import type { Weights } from '../schemas/recommendation.js';

export interface ListingForScoring {
  id: string;
  platformId: string;
  platformName: string;
  brandColor: string;
  price: number;
  deliveryFee: number;
  deliveryMinutes: number;
  available: boolean;
}

export interface ScoredListing {
  listingId: string;
  platformId: string;
  platformName: string;
  brandColor: string;
  total: number;
  deliveryMinutes: number;
  score: number;
  /** 0..1 contribution of each pillar (already weighted) */
  breakdown: {
    price: number;
    speed: number;
    quality: number;
  };
  /** 0..1 raw (unweighted) score per pillar — useful for UI tooltips. */
  raw: {
    price: number;
    speed: number;
    quality: number;
  };
}

export interface RecommendationResult {
  dishId: string;
  weights: Weights;
  ranked: ScoredListing[];
  winnerId: string | null;
  reasoning: string;
}

/**
 * Normalize a value into 0..1 where smaller is better.
 *   min(value) → 1, max(value) → 0, equal values → 1 (no penalty).
 * Robust to edge cases (empty list, single item, identical values).
 */
const normalizeLowerIsBetter = (value: number, values: number[]): number => {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
};

/**
 * Quality proxy when no explicit listing rating is available.
 *
 * We use the restaurant rating (0..5) shared by all listings for a dish.
 * Returned as 0..1 so it sits in the same scale as price and speed.
 */
const qualityFromRating = (rating: number): number => {
  const clamped = Math.max(0, Math.min(5, rating));
  return clamped / 5;
};

/**
 * Pure scoring function — no I/O, fully unit-testable.
 *
 * Exported so tests can hit it directly without spinning up Prisma.
 */
export const scoreListings = (
  listings: ListingForScoring[],
  weights: Weights,
  restaurantRating: number,
): ScoredListing[] => {
  const available = listings.filter((l) => l.available);
  if (available.length === 0) return [];

  const totals = available.map((l) => l.price + l.deliveryFee);
  const minutes = available.map((l) => l.deliveryMinutes);
  const quality = qualityFromRating(restaurantRating);

  // Weights are validated by Zod to sum to 1.0, but we re-normalize defensively
  // so a future change to the schema can't silently produce >1 scores.
  const wSum = weights.price + weights.speed + weights.quality;
  const w = {
    price: weights.price / wSum,
    speed: weights.speed / wSum,
    quality: weights.quality / wSum,
  };

  const scored = available.map((listing, idx) => {
    const total = totals[idx] ?? 0;
    const rawPrice = normalizeLowerIsBetter(total, totals);
    const rawSpeed = normalizeLowerIsBetter(listing.deliveryMinutes, minutes);
    const rawQuality = quality;

    const breakdownPrice = rawPrice * w.price;
    const breakdownSpeed = rawSpeed * w.speed;
    const breakdownQuality = rawQuality * w.quality;

    const score = breakdownPrice + breakdownSpeed + breakdownQuality;

    return {
      listingId: listing.id,
      platformId: listing.platformId,
      platformName: listing.platformName,
      brandColor: listing.brandColor,
      total: Number(total.toFixed(2)),
      deliveryMinutes: listing.deliveryMinutes,
      score: Number(score.toFixed(4)),
      breakdown: {
        price: Number(breakdownPrice.toFixed(4)),
        speed: Number(breakdownSpeed.toFixed(4)),
        quality: Number(breakdownQuality.toFixed(4)),
      },
      raw: {
        price: Number(rawPrice.toFixed(4)),
        speed: Number(rawSpeed.toFixed(4)),
        quality: Number(rawQuality.toFixed(4)),
      },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
};

/**
 * Build a short, deterministic natural-language explanation
 * for the top-ranked listing. Same inputs → same sentence.
 */
const buildReasoning = (ranked: ScoredListing[], weights: Weights): string => {
  if (ranked.length === 0) return 'No available platforms for this dish right now.';
  const top = ranked[0]!;
  const dominantPillar = (['price', 'speed', 'quality'] as const).reduce((a, b) =>
    weights[a] >= weights[b] ? a : b,
  );
  const pillarPhrase = {
    price: `it has the most competitive total price (€${top.total.toFixed(2)})`,
    speed: `it has the fastest estimated delivery (${top.deliveryMinutes} min)`,
    quality: `the restaurant has a strong reputation`,
  }[dominantPillar];
  return `${top.platformName} wins because ${pillarPhrase}, weighted against the other priorities you picked.`;
};

/**
 * High-level entry point used by the route handler.
 * Loads the dish from Prisma and feeds it to the pure scorer.
 */
export const recommendForDish = async (
  dishId: string,
  weights: Weights,
): Promise<RecommendationResult> => {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: {
      restaurant: true,
      listings: {
        include: { platform: true },
      },
    },
  });

  if (!dish) throw notFound(`Dish ${dishId} not found.`);

  const inputs: ListingForScoring[] = dish.listings.map((l) => ({
    id: l.id,
    platformId: l.platformId,
    platformName: l.platform.name,
    brandColor: l.platform.brandColor,
    price: l.price,
    deliveryFee: l.deliveryFee,
    deliveryMinutes: l.deliveryMinutes,
    available: l.available,
  }));

  const ranked = scoreListings(inputs, weights, dish.restaurant.rating);

  return {
    dishId,
    weights,
    ranked,
    winnerId: ranked[0]?.listingId ?? null,
    reasoning: buildReasoning(ranked, weights),
  };
};
