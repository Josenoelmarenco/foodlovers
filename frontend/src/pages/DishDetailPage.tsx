import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDish, useRecommendation } from '../api/hooks';
import { ComparisonTable } from '../components/ComparisonTable';
import { PriorityPanel } from '../components/PriorityPanel';
import type { ScoredListing, Weights } from '../types/api';
import { formatRating } from '../lib/format';

const DEFAULT_WEIGHTS: Weights = { price: 1 / 3, speed: 1 / 3, quality: 1 / 3 };

export default function DishDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: dish, isLoading, isError } = useDish(id);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const recommend = useRecommendation();

  // Re-run the scoring whenever weights change. The mutation is fast (pure
  // math server-side) and Tanstack handles in-flight cancellation for us.
  useEffect(() => {
    if (!id) return;
    recommend.mutate({ dishId: id, weights });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, weights]);

  const scoresById = useMemo<Record<string, ScoredListing>>(() => {
    if (!recommend.data) return {};
    return Object.fromEntries(recommend.data.ranked.map((r) => [r.listingId, r]));
  }, [recommend.data]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !dish) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
          Couldn&apos;t load this dish. It may have been removed.
        </p>
        <Link to="/search" className="mt-3 inline-block text-sm text-orange-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={dish.restaurant ? `/restaurants/${dish.restaurant.id}` : '/search'}
        className="text-sm text-orange-600 hover:underline"
      >
        ← {dish.restaurant ? `Back to ${dish.restaurant.name}` : 'Back to search'}
      </Link>

      <header className="mt-4 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="h-64 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-64 w-full" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{dish.name}</h1>
          {dish.restaurant && (
            <p className="mt-1 text-sm text-slate-500">
              From{' '}
              <Link
                to={`/restaurants/${dish.restaurant.id}`}
                className="font-medium text-slate-800 hover:underline"
              >
                {dish.restaurant.name}
              </Link>{' '}
              · {dish.restaurant.cuisine} · {dish.restaurant.neighborhood} ·{' '}
              <span aria-label={`Rating ${formatRating(dish.restaurant.rating)} out of 5`}>
                ★ {formatRating(dish.restaurant.rating)}
              </span>
            </p>
          )}
          {dish.description && (
            <p className="mt-3 text-sm text-slate-600">{dish.description}</p>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <PriorityPanel value={weights} onChange={setWeights} />
          {recommend.data && (
            <div
              className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed text-orange-900"
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold">Assistant says</p>
              <p className="mt-1">{recommend.data.reasoning}</p>
            </div>
          )}
          {recommend.isError && (
            <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Couldn&apos;t compute a recommendation. Try again in a moment.
            </p>
          )}
        </div>

        <ComparisonTable
          dish={{ name: dish.name }}
          listings={dish.listings ?? []}
          scoresById={scoresById}
          winnerId={recommend.data?.winnerId ?? null}
        />
      </div>
    </div>
  );
}
