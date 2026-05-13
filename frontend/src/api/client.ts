import type {
  Dish,
  Paginated,
  Platform,
  Restaurant,
  RestaurantWithDishes,
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

const toQuery = (obj: Record<string, string | number | undefined>): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
};

export const api = {
  health: () => apiGet<HealthResponse>('/api/health'),

  listPlatforms: () => apiGet<{ items: Platform[] }>('/api/platforms'),

  listRestaurants: (params: ListRestaurantsParams = {}) =>
    apiGet<Paginated<Restaurant>>(`/api/restaurants${toQuery(params)}`),

  getRestaurant: (id: string) => apiGet<RestaurantWithDishes>(`/api/restaurants/${id}`),

  searchDishes: (params: SearchDishesParams = {}) =>
    apiGet<Paginated<Dish>>(`/api/dishes/search${toQuery(params)}`),

  getDish: (id: string) => apiGet<Dish>(`/api/dishes/${id}`),
};
