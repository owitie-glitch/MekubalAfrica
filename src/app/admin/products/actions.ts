"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ActionResult } from "@/components/action-form";

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().default(""),
  description: optional,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  categoryId: optional,
  collectionId: optional,
  material: optional,
  artisan: optional,
  origin: optional,
  dimensions: optional,
  featured: z.coerce.boolean(),
  images: z.string().default(""),
});

const variantSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Every variant needs a name."),
  sku: optional,
  price: z.coerce.number().min(0, "Price cannot be negative."),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative."),
});

type Variant = z.infer<typeof variantSchema>;

/** One URL per line — the admin pastes from the CDN, there is no uploader. */
function parseImages(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Variant rows arrive as parallel arrays, so a blank trailing row is simply one
 * with no name and gets dropped rather than erroring.
 */
type ParsedVariants = { error: string } | { rows: Variant[] };

function parseVariants(formData: FormData): ParsedVariants {
  const ids = formData.getAll("variantId").map(String);
  const names = formData.getAll("variantName").map(String);
  const skus = formData.getAll("variantSku").map(String);
  const prices = formData.getAll("variantPrice").map(String);
  const inventories = formData.getAll("variantInventory").map(String);

  const rows: Variant[] = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i]?.trim()) continue;
    const parsed = variantSchema.safeParse({
      id: ids[i] ?? "",
      name: names[i],
      sku: skus[i] ?? "",
      price: prices[i] ?? "0",
      inventory: inventories[i] ?? "0",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid variant." };
    }
    rows.push(parsed.data);
  }

  if (rows.length === 0) {
    return { error: "Add at least one variant — price and stock live there." };
  }
  return { rows };
}

const slugTaken = (exclude?: string) => async (slug: string) => {
  const found = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  return found !== null && found.id !== exclude;
};

/** priceMin is denormalised for cheap sorting, so it is recomputed on write. */
function priceMinOf(rows: Variant[]) {
  return Math.min(...rows.map((v) => v.price));
}

/** SKUs are unique store-wide, so a repeat is a typo worth naming precisely. */
function isSkuConflict(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

const SKU_TAKEN = "That SKU is already used by another variant.";

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireRole("ADMIN");

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(formData),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const { images, slug, ...fields } = parsed.data;

  const variants = parseVariants(formData);
  if ("error" in variants) return variants;

  // A blank slug field just means "derive it from the title".
  const finalSlug = await uniqueSlug(slug || fields.title, slugTaken());

  let productId: string;
  try {
    const product = await db.product.create({
      data: {
        ...fields,
        slug: finalSlug,
        priceMin: priceMinOf(variants.rows),
        images: {
          create: parseImages(images).map((url, position) => ({
            url,
            position,
          })),
        },
        variants: {
          create: variants.rows.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            inventory: v.inventory,
          })),
        },
      },
    });
    productId = product.id;
  } catch (err) {
    if (isSkuConflict(err)) return { error: SKU_TAKEN };
    throw err;
  }

  revalidatePath("/admin/products");
  // redirect() signals by throwing — it must stay outside any try above.
  redirect(`/admin/products/${productId}`);
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  await requireRole("ADMIN");

  // The id comes from a hidden field, but it only ever names *which* product to
  // edit — the acting admin is the session, never the form.
  const id = String(formData.get("id") ?? "");
  const existing = await db.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "That product no longer exists." };

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(formData),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const { images, slug, ...fields } = parsed.data;

  const variants = parseVariants(formData);
  if ("error" in variants) return variants;

  // Keep the current slug unless the admin actually changed it; live URLs
  // should not shift because someone fixed a typo in the title.
  const wanted = slugify(slug || fields.title);
  const finalSlug =
    wanted === existing.slug
      ? existing.slug
      : await uniqueSlug(wanted, slugTaken(existing.id));

  const keptIds = variants.rows.map((v) => v.id).filter(Boolean);

  try {
    await db.$transaction([
      // Variants are updated in place rather than replaced: order items point
      // at them, and a delete would blank the link on old receipts.
      db.productVariant.deleteMany({
        where: { productId: id, id: { notIn: keptIds } },
      }),
      ...variants.rows.map((v) =>
        v.id
          ? db.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                sku: v.sku,
                price: v.price,
                inventory: v.inventory,
              },
            })
          : db.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                sku: v.sku,
                price: v.price,
                inventory: v.inventory,
              },
            }),
      ),
      db.productImage.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: {
          ...fields,
          slug: finalSlug,
          priceMin: priceMinOf(variants.rows),
          images: {
            create: parseImages(images).map((url, position) => ({
              url,
              position,
            })),
          },
        },
      }),
    ]);
  } catch (err) {
    if (isSkuConflict(err)) return { error: SKU_TAKEN };
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  return undefined;
}

export async function deleteProduct(formData: FormData): Promise<ActionResult> {
  await requireRole("ADMIN");

  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!product) return { error: "That product no longer exists." };

  // Images and variants cascade; an order item's variant link is set to null so
  // the receipt survives with its snapshotted title and price intact.
  await db.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
