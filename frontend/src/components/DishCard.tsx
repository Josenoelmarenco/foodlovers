import { Link } from 'react-router-dom';
import type { Dish, PlatformListing } from '../types/api';
import { PlatformBadge } from './PlatformBadge';
import { cheapestTotal, formatEuro, formatMinutes } from '../lib/format';

interface Props {
  dish: Dish & { listings?: PlatformListing[] };
  showRestaurant?: boolean;
}

export function DishCard({ dish, showRestaurant = true }: Props) {
  const listings = dish.listings ?? [];
  const available = listings.filter((l) => l.available);
  const cheapest = cheapestTotal(listings);
  const fastest = available.reduce<PlatformListing | undefined>(
    (best, l) => (best === undefined || l.deliveryMinutes < best.deliveryMinutes ? l : best),
    undefined,
  );

  return (
    <Link
      to={`/dishes/${dish.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={dish.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-neutral-900">{dish.name}</h3>
        {showRestaurant && dish.restaurant && (
          <p className="text-xs text-neutral-500">
            {dish.restaurant.name} · {dish.restaurant.neighborhood}
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{dish.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
          {available.slice(0, 3).map((listing) => (
            <PlatformBadge key={listing.id} platform={listing.platform} size="sm" />
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between text-sm">
          <div>
            <p className="text-xs text-neutral-500">From</p>
            <p className="text-lg font-bold text-neutral-900">
              {cheapest !== undefined ? formatEuro(cheapest) : '—'}
            </p>
          </div>
          {fastest && (
            <div className="text-right">
              <p className="text-xs text-neutral-500">Fastest</p>
              <p className="text-sm font-medium text-neutral-900">
                {formatMinutes(fastest.deliveryMinutes)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
