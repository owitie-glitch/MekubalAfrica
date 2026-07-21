"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import type { ActionResult } from "@/components/action-form";

/** `next` arrives from the query string, so it is attacker-controlled — only
 *  same-origin paths may be followed. */
function safeNext(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

const credentials = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  // Same message for a malformed email, an unknown account and a wrong
  // password — anything else is an account-enumeration oracle.
  const generic = { error: "Invalid email or password." };
  if (!parsed.success) return generic;

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (
    !user?.passwordHash ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return generic;
  }

  await createSession(user.id);
  // Folds any basket built before signing in into the account's cart. Safe
  // here because a Server Action may write cookies; a page may not.
  await getOrCreateCart();
  redirect(safeNext(formData.get("next")));
}

const registration = z.object({
  name: z.string().trim().optional(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function register(formData: FormData): Promise<ActionResult> {
  const parsed = registration.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Sign in instead." };
  }

  const user = await db.user.create({
    data: {
      email,
      name: parsed.data.name || null,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  await createSession(user.id);
  // Folds any basket built before signing in into the account's cart. Safe
  // here because a Server Action may write cookies; a page may not.
  await getOrCreateCart();
  redirect(safeNext(formData.get("next")));
}
