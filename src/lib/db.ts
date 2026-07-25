import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js dev mode hot-reloads modules, which would otherwise open a new
// connection pool on every save until Postgres refuses them.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — see .env.example");
  }
  client =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Lazy: the client — and the DATABASE_URL check — is only created on first
// query, so importing this module never throws. That lets `next build` collect
// page data for routes that don't actually hit the database (e.g. /_not-found)
// even when no DATABASE_URL is present in the build environment.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const value = getClient()[prop as keyof PrismaClient];
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
