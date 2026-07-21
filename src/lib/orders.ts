import { Prisma } from "@prisma/client";
import { db } from "./db";
import { groupByShop, type CartWithItems } from "./cart";

function money(n: number) {
  return new Prisma.Decimal(n.toFixed(2));
}

function orderNumber() {
  // Short, human-quotable, and unique enough for a support conversation.
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${rand}`;
}

export class CheckoutError extends Error {}

/**
 * Turns a cart into one Order plus one ShopOrder per participating shop.
 *
 * Everything runs in a single transaction: stock is decremented, the order is
 * written, and the cart is emptied together, so a crash mid-checkout can't
 * leave sold inventory with no order attached to it.
 */
export async function createOrderFromCart(opts: {
  cart: CartWithItems;
  userId: string;
  addressId: string;
  shippingPerShop?: number;
}) {
  const { cart, userId, addressId, shippingPerShop = 0 } = opts;

  if (cart.items.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }

  const groups = groupByShop(cart);

  // Reject closed shops up front — a suspended vendor must not take money.
  for (const g of groups) {
    if (g.shop.status !== "ACTIVE") {
      throw new CheckoutError(`${g.shop.name} is not currently accepting orders.`);
    }
  }

  return db.$transaction(async (tx) => {
    // Re-read inventory inside the transaction. The quantity shown on the
    // cart page may be minutes stale; this is the check that actually counts.
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
          `Only ${variant.inventory} left of ${variant.product.title}.`,
        );
      }
    }

    const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
    const shipping = shippingPerShop * groups.length;
    const total = subtotal + shipping;

    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        userId,
        addressId,
        subtotal: money(subtotal),
        shipping: money(shipping),
        tax: money(0),
        total: money(total),
        status: "PENDING_PAYMENT",
      },
    });

    for (const group of groups) {
      const rate = Number(group.shop.commissionRate) / 100;
      const commission = group.subtotal * rate;
      // Shipping passes through to the vendor uncommissioned — they pay the
      // carrier, so taking a cut of it would put them underwater.
      const payout = group.subtotal + shippingPerShop - commission;

      await tx.shopOrder.create({
        data: {
          orderId: order.id,
          shopId: group.shop.id,
          subtotal: money(group.subtotal),
          shipping: money(shippingPerShop),
          commission: money(commission),
          payout: money(payout),
          status: "PENDING",
          items: {
            create: group.items.map((item) => ({
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

      for (const item of group.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventory: { decrement: item.quantity } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}

/**
 * Rolls the parent Order's status up from its slices. A marketplace order is
 * only FULFILLED once every shop has shipped; until then it is partial.
 */
export async function syncOrderStatus(orderId: string) {
  const shopOrders = await db.shopOrder.findMany({ where: { orderId } });
  if (shopOrders.length === 0) return;

  const done = (s: string) => ["SHIPPED", "DELIVERED"].includes(s);
  const dead = (s: string) => ["CANCELLED", "REFUNDED"].includes(s);

  const live = shopOrders.filter((s) => !dead(s.status));

  let status: "PAID" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";
  if (live.length === 0) status = "CANCELLED";
  else if (live.every((s) => done(s.status))) status = "FULFILLED";
  else if (live.some((s) => done(s.status))) status = "PARTIALLY_FULFILLED";
  else status = "PAID";

  await db.order.update({ where: { id: orderId }, data: { status } });
}
