import { Prisma } from "@prisma/client";
import { db } from "./db";
import type { CartWithItems } from "./cart";

function money(n: number) {
  return new Prisma.Decimal(n.toFixed(2));
}

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CCA-${stamp}-${rand}`;
}

export class CheckoutError extends Error {}

/**
 * Turns a cart into an Order. Single-seller, so items hang directly off the
 * order — no per-shop splitting.
 *
 * Stock decrement, order write and cart clear share one transaction, so a
 * crash mid-checkout can't leave sold inventory with no order attached.
 */
export async function createOrderFromCart(opts: {
  cart: CartWithItems | null;
  userId: string;
  addressId: string;
  shipping?: number;
}) {
  const { cart, userId, addressId, shipping = 0 } = opts;

  if (!cart || cart.items.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }

  return db.$transaction(async (tx) => {
    // Re-read inventory inside the transaction — the quantity shown on the
    // cart page may be minutes stale; this is the check that counts.
    for (const item of cart.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });
      if (!variant || variant.product.status !== "ACTIVE") {
        throw new CheckoutError(
          `${item.variant.product.title} is no longer available.`,
        );
      }
      if (variant.inventory < item.quantity) {
        throw new CheckoutError(
          variant.inventory === 0
            ? `${variant.product.title} has just sold out.`
            : `Only ${variant.inventory} left of ${variant.product.title}.`,
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + Number(i.variant.price) * i.quantity,
      0,
    );

    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        userId,
        addressId,
        subtotal: money(subtotal),
        shipping: money(shipping),
        tax: money(0),
        total: money(subtotal + shipping),
        status: "PENDING_PAYMENT",
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            titleSnapshot: item.variant.product.title,
            variantSnapshot: item.variant.name,
            imageSnapshot: item.variant.product.images[0]?.url ?? null,
            unitPrice: item.variant.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
