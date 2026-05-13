import { Link } from 'react-router-dom';
import type { Restaurant } from '../types/api';
import { formatRating } from '../lib/format';

interface Props {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: Props) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
        <img
          src={restaurant.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">{restaurant.name}</h3>
          <span
            className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800"
            aria-label={`Rating ${restaurant.rating}`}
          >
            ★ {formatRating(restaurant.rating)}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {restaurant.cuisine} · {restaurant.neighborhood}
        </p>
      </div>
    </Link>
  );
}
