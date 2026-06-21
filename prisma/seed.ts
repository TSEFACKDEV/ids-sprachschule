import { PrismaClient, Role } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';


import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter });

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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());