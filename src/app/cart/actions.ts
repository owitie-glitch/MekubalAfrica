"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";

/**
 * Resolves a client-supplied cart item id against the caller's own cart. A
 * cart item id is guessable and carries no ownership proof, so every mutation
 * goes through this rather than querying CartItem by id directly.
 */
async function ownedItem(formData: FormData) {
  const cartItemId = String(formData.get("cartItemId") ?? "");
  const cart = await getOrCreateCart();
  return cart.items.find((i) => i.id === cartItemId) ?? null;
}

export async function updateQuantity(formData: FormData) {
  const item = await ownedItem(formData);
  if (!item) return;

  const requested = Math.floor(Number(formData.get("quantity") ?? 0));
  const quantity = Number.isFinite(requested) ? requested : item.quantity;

  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: item.id } });
  } else {
    await db.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(quantity, item.variant.inventory) },
    });
  }

  revalidatePath("/cart");
}

export async function removeItem(formData: FormData) {
  const item = await ownedItem(formData);
  if (!item) return;

  await db.cartItem.delete({ where: { id: item.id } });
  revalidatePath("/cart");
}
