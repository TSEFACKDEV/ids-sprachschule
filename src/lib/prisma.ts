import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 10,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 60000,
  })
  return new PrismaClient({ adapter, log: ['error'] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Neon (hébergement Postgres) met le serveur en veille après ~5 min sans activité.
// La toute première requête après une mise en veille peut dépasser le timeout et
// provoquer des erreurs 500. Ce ping périodique maintient la base réveillée.
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  setInterval(() => {
    prisma.$queryRaw`SELECT 1`.catch(() => {})
  }, 120_000)
}