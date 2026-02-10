import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.util';

// Singleton Prisma Client instance
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

/**
 * Connect to PostgreSQL via Prisma.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected successfully via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

/**
 * Disconnect from PostgreSQL.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting from PostgreSQL:', error);
    throw error;
  }
}

export default prisma;
