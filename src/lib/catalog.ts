import { Prisma } from "@prisma/client";
import type { CardProduct } from "@/components/product-card";

export const cardInclude = {
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { price: "asc" } },
  category: { select: { name: true } },
} satisfies Prisma.ProductInclude;

type ProductWithCard = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

/**
 * Decimals and Dates can't cross into a client component, so every product
 * heading for the grid, carousel or quick-view goes through here first.
 */
export function toCard(product: ProductWithCard): CardProduct {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    priceMin: Number(product.priceMin),
    material: product.material,
    artisan: product.artisan,
    categoryName: product.category?.name ?? null,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      inventory: v.inventory,
    })),
  };
}

/** Only ACTIVE products are ever public. */
export const publicProductWhere = {
  status: "ACTIVE",
} satisfies Prisma.ProductWhereInput;
