import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Reconnect on connection loss (Neon free tier auto-suspends)
prisma.$connect().catch(() => {});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;