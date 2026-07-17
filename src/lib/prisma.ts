import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const client =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Retry once on transient Neon connection errors (cold start / idle suspend).
// This prevents a single "Closed" connection error from crashing a request —
// the wake-up reconnect happens automatically on the retried query.
const RETRYABLE_CODES = new Set(["P1001", "P1017"]);

client.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (err) {
    const isRetryable =
      (err instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(err.code)) ||
      (err instanceof Prisma.PrismaClientInitializationError) ||
      (err instanceof Error && err.message.includes("Closed"));

    if (!isRetryable) throw err;

    await new Promise((r) => setTimeout(r, 300));
    return next(params);
  }
});

export const prisma = client;

// Reconnect on connection loss (Neon free tier auto-suspends)
prisma.$connect().catch(() => {});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;