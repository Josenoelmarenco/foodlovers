import type { Weights } from '../types/api';

interface Props {
  value: Weights;
  onChange: (next: Weights) => void;
}

/**
 * Three range sliders representing the relative importance of
 * price, speed and quality. When the user moves one slider we
 * proportionally rebalance the other two so the trio sums to 1.0.
 *
 * If the other two were both zero, we split the remainder evenly to
 * avoid divide-by-zero and to keep the UI predictable.
 */
const PILLARS: Array<{ key: keyof Weights; label: string; hint: string }> = [
  { key: 'price', label: 'Price', hint: 'cheapest total wins' },
  { key: 'speed', label: 'Speed', hint: 'fastest delivery wins' },
  { key: 'quality', label: 'Quality', hint: 'best-rated restaurant wins' },
];

export const PriorityPanel = ({ value, onChange }: Props) => {
  const handle = (changed: keyof Weights, raw: number) => {
    const next = Math.max(0, Math.min(1, raw));
    const others = PILLARS.map((p) => p.key).filter((k) => k !== changed) as Array<keyof Weights>;
    const remaining = 1 - next;
    const otherSum = others.reduce((s, k) => s + value[k], 0);

    const rebalanced: Weights = { ...value, [changed]: next };
    if (otherSum === 0) {
      // Split remainder evenly between the other two.
      const each = remaining / others.length;
      for (const k of others) rebalanced[k] = each;
    } else {
      for (const k of others) {
        rebalanced[k] = (value[k] / otherSum) * remaining;
      }
    }
    onChange(rebalanced);
  };

  const reset = () => onChange({ price: 1 / 3, speed: 1 / 3, quality: 1 / 3 });

  return (
    <section
      aria-label="Recommendation priorities"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Your priorities</h2>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-orange-600 underline-offset-2 hover:underline"
        >
          Reset
        </button>
      </header>

      <div className="space-y-4">
        {PILLARS.map(({ key, label, hint }) => {
          const pct = Math.round(value[key] * 100);
          return (
            <div key={key}>
              <label htmlFor={`priority-${key}`} className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-800">{label}</span>
                <span className="text-xs tabular-nums text-slate-500">{pct}%</span>
              </label>
              <input
                id={`priority-${key}`}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value[key]}
                onChange={(e) => handle(key, Number(e.target.value))}
                className="mt-1 w-full accent-orange-500"
                aria-valuetext={`${label} priority ${pct} percent`}
              />
              <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
