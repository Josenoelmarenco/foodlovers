/**
 * Tiny typed HTTP client over fetch. Centralizing this here lets us:
 * - inject auth headers later in one place
 * - serialize errors consistently
 * - swap fetch implementations for tests
 */

const baseUrl = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await safeJson(res);
    throw new ApiError(`GET ${path} failed`, res.status, body);
  }
  return (await res.json()) as T;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
}

export const api = {
  health: () => apiGet<HealthResponse>('/api/health'),
};
