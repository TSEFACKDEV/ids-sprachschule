import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getDatabaseUrl } from '@/lib/database-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
    max: 10,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 60000,
  })
  return new PrismaClient({ adapter, log: ['error'] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma