import { PrismaClient, Role } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
import { sanitizeDatabaseUrl } from '../src/lib/database-url';

import { PrismaPg } from '@prisma/adapter-pg'

// connectionTimeoutMillis plus généreux : une base Neon en veille ("auto-suspend")
// peut mettre plusieurs secondes à se réveiller lors de la toute première connexion.
const adapter = new PrismaPg({
  connectionString: sanitizeDatabaseUrl(process.env.DATABASE_URL),
  connectionTimeoutMillis: 30_000,
})
const prisma = new PrismaClient({ adapter });

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 3000): Promise<T> {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLast = i === attempts;
      console.warn(
        `Tentative ${i}/${attempts} échouée${isLast ? "" : `, nouvel essai dans ${delayMs / 1000}s...`}`,
        error instanceof Error ? error.message : error
      );
      if (isLast) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@ids-sprachschule.com" },
  });

  if (!existing) {
    const hash = await bcrypt.hash("IDS@Admin2025!", 12);
    await prisma.user.create({
      data: {
        email: "admin@ids-sprachschule.com",
        password: hash,
        role: Role.ADMIN,
        mustChangePassword: false,
      },
    });
    console.log("Admin créé : admin@ids-sprachschule.com / IDS@Admin2025!");
  } else {
    console.log("Admin existe déjà.");
  }

  const existingSecretaire = await prisma.user.findUnique({
    where: { email: "secretariat@ids-sprachschule.com" },
  });

  if (!existingSecretaire) {
    const hash = await bcrypt.hash("IDS@Secretaire2025!", 12);
    await prisma.user.create({
      data: {
        email: "secretariat@ids-sprachschule.com",
        password: hash,
        role: Role.SECRETAIRE,
        mustChangePassword: true,
      },
    });
    console.log(
      "Secrétaire créé : secretariat@ids-sprachschule.com / IDS@Secretaire2025!"
    );
  } else {
    console.log("Compte secrétaire existe déjà.");
  }
}

withRetry(main)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());