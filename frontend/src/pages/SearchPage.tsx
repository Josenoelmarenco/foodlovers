import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { FiltersPanel, type FiltersValue } from '../components/FiltersPanel';
import { DishCard } from '../components/DishCard';
import { EmptyState } from '../components/EmptyState';
import { useDishSearch } from '../api/hooks';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? undefined;
  const cuisine = params.get('cuisine') ?? undefined;
  const neighborhood = params.get('neighborhood') ?? undefined;
  const maxPriceParam = params.get('maxPrice');
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const updateParams = (next: Record<string, string | number | undefined>) => {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '') {
        merged.delete(k);
      } else {
        merged.set(k, String(v));
      }
    }
    setParams(merged, { replace: true });
  };

  const onSubmit = (value: string) => updateParams({ q: value || undefined });

  const onFiltersChange = (filters: FiltersValue) =>
    updateParams({
      cuisine: filters.cuisine,
      neighborhood: filters.neighborhood,
      maxPrice: filters.maxPrice,
    });

  const { data, isPending, isError } = useDishSearch({
    q,
    cuisine,
    neighborhood,
    maxPrice,
    pageSize: 24,
  });

  return (
    <div className="space-y-6">
      <SearchBar initialValue={q ?? ''} onSubmit={onSubmit} />

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <FiltersPanel
          value={{ cuisine, neighborhood, maxPrice }}
          onChange={onFiltersChange}
        />

        <div>
          {isPending && <SearchSkeleton />}
          {isError && (
            <EmptyState
              title="Search failed"
              message="The API is unreachable. Make sure the backend is running."
            />
          )}
          {data && data.items.length === 0 && (
            <EmptyState
              title="No dishes matched your filters"
              message="Try removing a filter or searching for something else."
            />
          )}
          {data && data.items.length > 0 && (
            <>
              <p className="mb-4 text-sm text-neutral-500">
                {data.meta.total} {data.meta.total === 1 ? 'result' : 'results'}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-neutral-100" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
