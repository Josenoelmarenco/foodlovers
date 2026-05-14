import type { Dish, PlatformListing, ScoredListing } from '../types/api';
import { formatEuro, formatMinutes } from '../lib/format';
import { PlatformBadge } from './PlatformBadge';

interface Props {
  listings: PlatformListing[];
  /** Map from listingId → scoring result, if a recommendation has been computed. */
  scoresById?: Record<string, ScoredListing>;
  winnerId?: string | null;
  dish: Pick<Dish, 'name'>;
}

const Bar = ({ value, color }: { value: number; color: string }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
    <div
      className="h-full rounded-full transition-[width] duration-300"
      style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        backgroundColor: color,
      }}
    />
  </div>
);

export const ComparisonTable = ({ listings, scoresById = {}, winnerId, dish }: Props) => {
  if (listings.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        This dish is not currently available on any platform.
      </p>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      role="region"
      aria-label={`Platform comparison for ${dish.name}`}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">
              Platform
            </th>
            <th scope="col" className="px-4 py-3">
              Total
            </th>
            <th scope="col" className="px-4 py-3">
              Delivery
            </th>
            <th scope="col" className="px-4 py-3">
              ETA
            </th>
            <th scope="col" className="px-4 py-3">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {listings.map((l) => {
            const scored = scoresById[l.id];
            const total = l.price + l.deliveryFee;
            const isWinner = winnerId === l.id;
            return (
              <tr
                key={l.id}
                className={
                  isWinner ? 'bg-orange-50/60' : 'transition-colors hover:bg-slate-50'
                }
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={l.platform} />
                    {isWinner && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Best match
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <div className="font-semibold text-slate-900">{formatEuro(total)}</div>
                  <div className="text-xs text-slate-500">
                    {formatEuro(l.price)} + {formatEuro(l.deliveryFee)} fee
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{formatEuro(l.deliveryFee)}</td>
                <td className="px-4 py-3 text-slate-700">{formatMinutes(l.deliveryMinutes)}</td>
                <td className="px-4 py-3">
                  {scored ? (
                    <div className="space-y-1">
                      <div className="font-semibold tabular-nums text-slate-900">
                        {(scored.score * 100).toFixed(0)}
                      </div>
                      <div className="space-y-0.5">
                        <Bar value={scored.raw.price} color="#f97316" />
                        <Bar value={scored.raw.speed} color="#0ea5e9" />
                        <Bar value={scored.raw.quality} color="#10b981" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Adjust priorities →</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {Object.keys(scoresById).length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Price
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Speed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Quality
          </span>
        </div>
      )}
    </div>
  );
};
