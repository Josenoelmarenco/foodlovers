import { prisma } from '../db/client.js';

export const listPlatforms = async () => {
  return prisma.platform.findMany({ orderBy: { name: 'asc' } });
};
