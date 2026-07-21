import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { User, UserRole } from "@prisma/client";

const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// The raw token goes to the client; only its SHA-256 is stored. A leaked
// database dump then can't be replayed as live sessions.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);

  await db.session.create({
    data: { token: hashToken(token), userId, expiresAt },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session
      .delete({ where: { token: hashToken(token) } })
      .catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Sends signed-out visitors to the login page rather than erroring. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Wrong-role access 404s rather than 403s — a stranger should not be able to
 * learn that /admin exists by the error it returns.
 */
export async function requireRole(...roles: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) notFound();
  return user;
}

/**
 * Resolves the shop a vendor is acting on behalf of, and proves they own it.
 * Every vendor dashboard query must go through this — it is the tenant
 * boundary that stops one shop from reading or editing another's data.
 */
export async function requireShopAccess(shopId: string) {
  const user = await requireUser();
  if (user.role === "ADMIN") {
    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) notFound();
    return { user, shop };
  }
  // 404 rather than 403: another vendor's shop should be indistinguishable
  // from one that does not exist.
  const shop = await db.shop.findFirst({
    where: { id: shopId, ownerId: user.id },
  });
  if (!shop) notFound();
  return { user, shop };
}

export { SESSION_COOKIE };
