import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { RestaurantCard } from '../components/RestaurantCard';
import { EmptyState } from '../components/EmptyState';
import { useRestaurants } from '../api/hooks';

const QUICK_CUISINES = ['Italian', 'Asian', 'Burgers', 'Vegan', 'Finnish', 'Mexican'];

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useRestaurants({ pageSize: 6, page: 1 });

  return (
    <div className="space-y-12">
      <section className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-600">
          Side-by-side delivery comparison
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Find the cheapest and fastest place to order what you want.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          We line up the same dish across delivery platforms so you can decide in seconds.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {QUICK_CUISINES.map((cuisine) => (
            <Link
              key={cuisine}
              to={`/search?cuisine=${encodeURIComponent(cuisine)}`}
              className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-brand-300 hover:text-brand-600"
            >
              {cuisine}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-heading">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight">
            Top-rated restaurants
          </h2>
          <Link
            to="/search"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Browse all →
          </Link>
        </div>

        {isPending && <CardGridSkeleton />}
        {isError && (
          <EmptyState
            title="Could not load restaurants"
            message="The API is unreachable. Make sure the backend is running."
          />
        )}
        {data && data.items.length === 0 && (
          <EmptyState title="No restaurants yet" message="Run the database seed to populate data." />
        )}
        {data && data.items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
        >
          <div className="aspect-[16/9] animate-pulse bg-neutral-100" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
