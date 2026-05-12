import { PrismaClient } from '@prisma/client';
import { env } from '../lib/env.js';

/**
 * Single shared Prisma instance.
 * In dev with hot reload we attach it to globalThis to avoid spawning many clients.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
