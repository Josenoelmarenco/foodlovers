import { Link, useParams } from 'react-router-dom';
import { DishCard } from '../components/DishCard';
import { EmptyState } from '../components/EmptyState';
import { useRestaurant } from '../api/hooks';
import { formatRating } from '../lib/format';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: restaurant, isPending, isError } = useRestaurant(id);

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="aspect-[16/6] animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <EmptyState
        title="Restaurant not found"
        message="The restaurant you are looking for does not exist or the API is unreachable."
        action={
          <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back to home
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Link
          to="/"
          className="mb-3 inline-block text-sm font-medium text-neutral-500 hover:text-brand-600"
        >
          ← Back
        </Link>
        <div className="overflow-hidden rounded-2xl">
          <img
            src={restaurant.imageUrl}
            alt=""
            className="aspect-[16/6] w-full object-cover"
          />
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {restaurant.cuisine} · {restaurant.neighborhood}
            </p>
          </div>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
            ★ {formatRating(restaurant.rating)}
          </span>
        </div>
      </header>

      <section aria-labelledby="menu-heading">
        <h2 id="menu-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Menu
        </h2>
        {restaurant.dishes.length === 0 ? (
          <EmptyState title="This restaurant has no dishes yet." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurant.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} showRestaurant={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
