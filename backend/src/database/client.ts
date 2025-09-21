import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.database.url,
      },
    },
    log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

// Export singleton Prisma client
export const prisma = globalThis.__prisma || createPrismaClient();

// In development, store the client globally to prevent multiple instances
if (config.nodeEnv === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
