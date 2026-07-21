import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { getCurrentUser } from "./auth";

const CART_COOKIE = "cart";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: { shop: true, images: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

/**
 * Read-only cart lookup — safe to call while rendering.
 *
 * Next.js only permits cookie writes inside Server Actions and Route Handlers,
 * so anything reached from a page or layout must not mint a guest cart. Pages
 * render `null` as an empty cart; the cart is created lazily on the first
 * write, which is the only moment it actually needs to exist.
 */
export async function readCart(): Promise<CartWithItems | null> {
  const user = await getCurrentUser();
  if (user) {
    const owned = await db.cart.findUnique({
      where: { userId: user.id },
      include: cartInclude,
    });
    if (owned) return owned;
  }

  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  if (!token) return null;

  return db.cart.findUnique({
    where: { sessionToken: token },
    include: cartInclude,
  });
}

/**
 * Cart lookup that will create one if needed, and merge a guest cart into the
 * signed-in user's on first use. Writes cookies, so it is only legal from a
 * Server Action or Route Handler — never from a page or layout.
 */
export async function getOrCreateCart(): Promise<CartWithItems> {
  const jar = await cookies();
  const user = await getCurrentUser();
  const guestToken = jar.get(CART_COOKIE)?.value;

  if (user) {
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: cartInclude,
    });
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: cartInclude,
      });
    }

    if (guestToken) {
      await mergeGuestCart(guestToken, cart.id);
      jar.delete(CART_COOKIE);
      cart = await db.cart.findUnique({
        where: { id: cart.id },
        include: cartInclude,
      });
    }
    return cart!;
  }

  if (guestToken) {
    const existing = await db.cart.findUnique({
      where: { sessionToken: guestToken },
      include: cartInclude,
    });
    if (existing) return existing;
  }

  const token = randomBytes(24).toString("hex");
  jar.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return db.cart.create({
    data: { sessionToken: token },
    include: cartInclude,
  });
}

async function mergeGuestCart(guestToken: string, targetCartId: string) {
  const guestCart = await db.cart.findUnique({
    where: { sessionToken: guestToken },
    include: { items: true },
  });
  if (!guestCart || guestCart.id === targetCartId) return;

  for (const item of guestCart.items) {
    // Same variant in both carts: sum the quantities rather than clobbering.
    await db.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: targetCartId, variantId: item.variantId },
      },
      create: {
        cartId: targetCartId,
        variantId: item.variantId,
        quantity: item.quantity,
      },
      update: { quantity: { increment: item.quantity } },
    });
  }
  await db.cart.delete({ where: { id: guestCart.id } });
}

/** Groups cart lines by shop — the shape checkout and the cart page both need. */
export function groupByShop(cart: CartWithItems | null) {
  const groups = new Map<
    string,
    {
      shop: CartWithItems["items"][number]["variant"]["product"]["shop"];
      items: CartWithItems["items"];
      subtotal: number;
    }
  >();

  for (const item of cart?.items ?? []) {
    const shop = item.variant.product.shop;
    const group = groups.get(shop.id) ?? { shop, items: [], subtotal: 0 };
    group.items.push(item);
    group.subtotal += Number(item.variant.price) * item.quantity;
    groups.set(shop.id, group);
  }
  return [...groups.values()];
}

export function cartTotal(cart: CartWithItems | null) {
  return (cart?.items ?? []).reduce(
    (sum, i) => sum + Number(i.variant.price) * i.quantity,
    0,
  );
}

export function cartCount(cart: CartWithItems | null) {
  return (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0);
}
