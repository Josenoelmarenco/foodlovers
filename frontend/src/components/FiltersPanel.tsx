import { type ChangeEvent } from 'react';

export interface FiltersValue {
  cuisine?: string;
  neighborhood?: string;
  maxPrice?: number;
}

interface Props {
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
}

const CUISINES = ['Italian', 'Asian', 'Burgers', 'Vegan', 'Finnish', 'Mexican'];
const NEIGHBORHOODS = ['Kallio', 'Punavuori', 'Kamppi', 'Hakaniemi', 'Töölö', 'Kruununhaka'];

export function FiltersPanel({ value, onChange }: Props) {
  const update = <K extends keyof FiltersValue>(key: K, v: FiltersValue[K]) => {
    onChange({ ...value, [key]: v });
  };

  const handleMaxPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    update('maxPrice', num > 0 ? num : undefined);
  };

  const clear = () => onChange({});

  const hasAny = Boolean(value.cuisine || value.neighborhood || value.maxPrice);

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Filters
        </h2>
        {hasAny && (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        <Field label="Cuisine">
          <select
            value={value.cuisine ?? ''}
            onChange={(e) => update('cuisine', e.target.value || undefined)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any cuisine</option>
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Neighborhood">
          <select
            value={value.neighborhood ?? ''}
            onChange={(e) => update('neighborhood', e.target.value || undefined)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any area</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Max price${value.maxPrice ? `: €${value.maxPrice}` : ''}`}>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={value.maxPrice ?? 30}
            onChange={handleMaxPrice}
            className="w-full accent-brand-500"
            aria-label="Max price in euros"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>€5</span>
            <span>€30</span>
          </div>
        </Field>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
