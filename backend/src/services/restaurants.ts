import { prisma } from '../db/client.js';
import type { ListRestaurantsQuery } from '../schemas/restaurants.js';

export const listRestaurants = async (query: ListRestaurantsQuery) => {
  const where = {
    ...(query.cuisine ? { cuisine: { equals: query.cuisine, mode: 'insensitive' as const } } : {}),
    ...(query.neighborhood
      ? { neighborhood: { equals: query.neighborhood, mode: 'insensitive' as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.restaurant.count({ where }),
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

export const getRestaurantById = async (id: string) => {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      dishes: {
        orderBy: { name: 'asc' },
        include: {
          listings: {
            where: { available: true },
            include: { platform: true },
            orderBy: { price: 'asc' },
          },
        },
      },
    },
  });
};
