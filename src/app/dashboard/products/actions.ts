"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireShopAccess } from "@/lib/auth";
import { requireOwnShop } from "@/lib/vendor";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  price: z.number().nonnegative(),
  inventory: z.number().int().nonnegative(),
});

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  images: z.array(z.url("Each image must be a valid URL")),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

function money(n: number) {
  return new Prisma.Decimal(n.toFixed(2));
}

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseProductForm(formData: FormData) {
  // Variant fields arrive as parallel repeated inputs, one entry per row.
  const ids = formData.getAll("variantId").map(str);
  const names = formData.getAll("variantName").map(str);
  const skus = formData.getAll("variantSku").map(str);
  const prices = formData.getAll("variantPrice").map(str);
  const inventories = formData.getAll("variantInventory").map(str);

  const variants = names
    .map((name, i) => ({
      id: ids[i] || undefined,
      name,
      sku: skus[i] || undefined,
      price: Number(prices[i] || 0),
      inventory: Number(inventories[i] || 0),
    }))
    // A blank row is the vendor declining the "add another" slot, not an error.
    .filter((v) => v.name !== "");

  const images = str(formData.get("images"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = productSchema.safeParse({
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")) || undefined,
    categoryId: str(formData.get("categoryId")) || undefined,
    status: str(formData.get("status")),
    images,
    variants,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

function priceMinOf(variants: { price: number }[]) {
  return money(Math.min(...variants.map((v) => v.price)));
}

export async function createProduct(formData: FormData) {
  const { shop } = await requireOwnShop();
  const data = parseProductForm(formData);

  const product = await db.product.create({
    data: {
      shopId: shop.id,
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      categoryId: data.categoryId ?? null,
      status: data.status,
      priceMin: priceMinOf(data.variants),
      images: {
        create: data.images.map((url, position) => ({ url, position })),
      },
      variants: {
        create: data.variants.map((v) => ({
          name: v.name,
          sku: v.sku ?? null,
          price: money(v.price),
          inventory: v.inventory,
        })),
      },
    },
  });

  revalidatePath("/dashboard/products");
  redirect(`/dashboard/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  const productId = str(formData.get("productId"));
  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) throw new Error("NOT_FOUND");
  await requireShopAccess(existing.shopId);

  const data = parseProductForm(formData);

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        categoryId: data.categoryId ?? null,
        status: data.status,
        priceMin: priceMinOf(data.variants),
      },
    });

    // Images are positional and cheap; replacing them wholesale beats
    // diffing a textarea.
    await tx.productImage.deleteMany({ where: { productId: existing.id } });
    if (data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((url, position) => ({
          productId: existing.id,
          url,
          position,
        })),
      });
    }

    // Variants are diffed rather than replaced — order items reference them.
    const keep = data.variants.map((v) => v.id).filter(Boolean) as string[];
    await tx.productVariant.deleteMany({
      where: { productId: existing.id, id: { notIn: keep } },
    });

    for (const v of data.variants) {
      const values = {
        name: v.name,
        sku: v.sku ?? null,
        price: money(v.price),
        inventory: v.inventory,
      };
      if (v.id) {
        // Scoped by productId so a forged variantId can't retarget another
        // product's row.
        await tx.productVariant.updateMany({
          where: { id: v.id, productId: existing.id },
          data: values,
        });
      } else {
        await tx.productVariant.create({
          data: { ...values, productId: existing.id },
        });
      }
    }
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${existing.id}`);
}

export async function deleteProduct(formData: FormData) {
  const productId = str(formData.get("productId"));
  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) throw new Error("NOT_FOUND");
  await requireShopAccess(existing.shopId);

  await db.product.delete({ where: { id: existing.id } });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}
