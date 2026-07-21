"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ActionResult } from "@/components/action-form";

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);

const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z.string().trim().default(""),
  headline: optional,
  description: optional,
  heroImage: optional,
  position: z.coerce.number().int().min(0).default(0),
});

const slugTaken = (exclude?: string) => async (slug: string) => {
  const found = await db.collection.findUnique({
    where: { slug },
    select: { id: true },
  });
  return found !== null && found.id !== exclude;
};

export async function createCollection(
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  }
  const { slug, ...fields } = parsed.data;

  await db.collection.create({
    data: {
      ...fields,
      slug: await uniqueSlug(slug || fields.name, slugTaken()),
    },
  });

  revalidatePath("/admin/collections");
  revalidatePath("/");
  return undefined;
}

export async function updateCollection(
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const id = String(formData.get("id") ?? "");
  const existing = await db.collection.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "That collection no longer exists." };

  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  }
  const { slug, ...fields } = parsed.data;

  // Collection slugs appear in shop URLs, so they only move when asked to.
  const wanted = slugify(slug || fields.name);
  const finalSlug =
    wanted === existing.slug
      ? existing.slug
      : await uniqueSlug(wanted, slugTaken(existing.id));

  await db.collection.update({
    where: { id },
    data: { ...fields, slug: finalSlug },
  });

  revalidatePath("/admin/collections");
  revalidatePath("/");
  return undefined;
}

export async function deleteCollection(
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const id = String(formData.get("id") ?? "");
  const count = await db.product.count({ where: { collectionId: id } });
  if (count > 0) {
    return {
      error: `Move its ${count} product${count === 1 ? "" : "s"} out first.`,
    };
  }

  await db.collection.delete({ where: { id } }).catch(() => {});

  revalidatePath("/admin/collections");
  revalidatePath("/");
  redirect("/admin/collections");
}
