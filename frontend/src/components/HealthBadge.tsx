import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function HealthBadge() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30_000,
  });

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" aria-hidden />
        Checking API…
      </span>
    );
  }

  if (isError) {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800"
      >
        <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden />
        API unreachable
      </span>
    );
  }

  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
      title={`Service: ${data.service} · Uptime: ${data.uptimeSeconds}s`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
      API online
    </span>
  );
}
