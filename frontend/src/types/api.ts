/**
 * Domain types matching the backend response shapes.
 * Keep this aligned with backend/src/services/*.ts.
 */

export interface Platform {
  id: string;
  name: string;
  brandColor: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  rating: number;
  imageUrl: string;
  createdAt: string;
}

export interface PlatformListing {
  id: string;
  dishId: string;
  platformId: string;
  price: number;
  deliveryFee: number;
  deliveryMinutes: number;
  available: boolean;
  updatedAt: string;
  platform: Platform;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  createdAt: string;
  restaurant?: Restaurant;
  listings?: PlatformListing[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface RestaurantWithDishes extends Restaurant {
  dishes: (Dish & { listings: PlatformListing[] })[];
}
