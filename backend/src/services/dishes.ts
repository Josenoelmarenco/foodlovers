import { prisma } from '../db/client.js';
import type { SearchDishesQuery } from '../schemas/dishes.js';

export const searchDishes = async (query: SearchDishesQuery) => {
  const where = {
    ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
    ...(query.cuisine || query.neighborhood
      ? {
          restaurant: {
            ...(query.cuisine
              ? { cuisine: { equals: query.cuisine, mode: 'insensitive' as const } }
              : {}),
            ...(query.neighborhood
              ? { neighborhood: { equals: query.neighborhood, mode: 'insensitive' as const } }
              : {}),
          },
        }
      : {}),
    ...(query.maxPrice ? { basePrice: { lte: query.maxPrice } } : {}),
    ...(query.platformId
      ? {
          listings: {
            some: { platformId: query.platformId, available: true },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.dish.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        restaurant: true,
        listings: {
          where: { available: true },
          include: { platform: true },
          orderBy: { price: 'asc' },
        },
      },
    }),
    prisma.dish.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
};

export const getDishById = async (id: string) => {
  return prisma.dish.findUnique({
    where: { id },
    include: {
      restaurant: true,
      listings: {
        include: { platform: true },
        orderBy: { price: 'asc' },
      },
    },
  });
};
