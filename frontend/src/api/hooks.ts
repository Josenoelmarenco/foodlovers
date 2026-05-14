import { useMutation, useQuery } from '@tanstack/react-query';
import { api, type ListRestaurantsParams, type SearchDishesParams } from './client';
import type { Weights } from '../types/api';

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30_000,
  });

export const usePlatforms = () =>
  useQuery({
    queryKey: ['platforms'],
    queryFn: api.listPlatforms,
    staleTime: 5 * 60_000,
  });

export const useRestaurants = (params: ListRestaurantsParams) =>
  useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => api.listRestaurants(params),
  });

export const useRestaurant = (id: string | undefined) =>
  useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.getRestaurant(id!),
    enabled: Boolean(id),
  });

export const useDishSearch = (params: SearchDishesParams) =>
  useQuery({
    queryKey: ['dishes', 'search', params],
    queryFn: () => api.searchDishes(params),
  });

export const useDish = (id: string | undefined) =>
  useQuery({
    queryKey: ['dish', id],
    queryFn: () => api.getDish(id!),
    enabled: Boolean(id),
  });

export const useRecommendation = () =>
  useMutation({
    mutationFn: ({ dishId, weights }: { dishId: string; weights: Weights }) =>
      api.recommend(dishId, weights),
  });
