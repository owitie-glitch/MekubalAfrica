"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ActionResult } from "@/components/action-form";

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);

const application = z.object({
  name: z.string().trim().min(2, "Shop name is required."),
  // Deliberately not regex-validated: whatever arrives is slugified below.
  // Rejecting "Jossie Bakes" over a capital letter is friction with no upside.
  slug: z.string().trim().optional(),
  city: z.string().trim().min(1, "Tell buyers which city you trade from."),
  country: z.string().trim().min(1, "Country is required."),
  addressLine: optional,
  region: optional,
  postalCode: optional,
  tagline: optional,
  description: optional,
});

export async function applyForShop(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/register?next=/sell");

  const parsed = application.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid application." };
  }

  const { slug: requested, ...data } = parsed.data;

  // Fall back to the shop name when the address field is blank. A name written
  // entirely in a non-Latin script slugifies to nothing, so uniqueSlug's own
  // "shop" fallback takes over rather than dead-ending the applicant.
  const base = slugify(requested ?? "") || slugify(data.name);

  // Collisions resolve to name-2, name-3 rather than dead-ending the applicant.
  const slug = await uniqueSlug(base, async (candidate) =>
    Boolean(
      await db.shop.findUnique({
        where: { slug: candidate },
        select: { id: true },
      }),
    ),
  );

  await db.$transaction([
    db.shop.create({
      data: { ...data, slug, ownerId: user.id, status: "PENDING" },
    }),
    // A second shop from an existing VENDOR must not demote an ADMIN.
    db.user.updateMany({
      where: { id: user.id, role: "CUSTOMER" },
      data: { role: "VENDOR" },
    }),
  ]);

  redirect("/dashboard");
}
