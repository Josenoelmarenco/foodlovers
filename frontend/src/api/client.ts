import type {
  Dish,
  Paginated,
  Platform,
  RecommendationResult,
  Restaurant,
  RestaurantWithDishes,
  Weights,
} from '../types/api';

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

async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
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

export interface SearchDishesParams {
  q?: string;
  cuisine?: string;
  neighborhood?: string;
  maxPrice?: number;
  platformId?: string;
  page?: number;
  pageSize?: number;
}

export interface ListRestaurantsParams {
  cuisine?: string;
  neighborhood?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Build a `?a=1&b=2` query string from any plain object.
 *
 * Typed as a generic over `object` (rather than `Record<string, ...>`)
 * so that explicit interfaces like ListRestaurantsParams — which lack
 * an index signature — are still assignable. Values are coerced via
 * String() and empty/undefined keys are dropped.
 */
function toQuery<T extends object>(obj: T): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new ApiError(`POST ${path} failed`, res.status, errBody);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => apiGet<HealthResponse>('/api/health'),

  listPlatforms: () => apiGet<{ items: Platform[] }>('/api/platforms'),

  listRestaurants: (params: ListRestaurantsParams = {}) =>
    apiGet<Paginated<Restaurant>>(`/api/restaurants${toQuery(params)}`),

  getRestaurant: (id: string) => apiGet<RestaurantWithDishes>(`/api/restaurants/${id}`),

  searchDishes: (params: SearchDishesParams = {}) =>
    apiGet<Paginated<Dish>>(`/api/dishes/search${toQuery(params)}`),

  getDish: (id: string) => apiGet<Dish>(`/api/dishes/${id}`),

  recommend: (dishId: string, weights: Weights) =>
    apiPost<RecommendationResult>('/api/recommendations', { dishId, weights }),
};
