import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateCart, readCart, cartTotal } from "@/lib/cart";

/** Shape the cart drawer renders. Kept flat so the client does no maths. */
function serialise(cart: Awaited<ReturnType<typeof readCart>>) {
  return {
    count: (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0),
    subtotal: cartTotal(cart),
    items: (cart?.items ?? []).map((i) => ({
      id: i.id,
      variantId: i.variantId,
      quantity: i.quantity,
      title: i.variant.product.title,
      slug: i.variant.product.slug,
      variantName: i.variant.name,
      unitPrice: Number(i.variant.price),
      inventory: i.variant.inventory,
      image: i.variant.product.images[0]?.url ?? null,
    })),
  };
}

export async function GET() {
  return NextResponse.json(serialise(await readCart()));
}

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function POST(req: Request) {
  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const variant = await db.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: true },
  });
  if (!variant || variant.product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unavailable." }, { status: 404 });
  }

  const cart = await getOrCreateCart();
  const existing = cart.items.find((i) => i.variantId === variant.id);

  // Clamp the resulting line, not just the increment, or repeated adds walk
  // past the stock level one click at a time.
  const wanted = (existing?.quantity ?? 0) + parsed.data.quantity;
  if (variant.inventory < 1) {
    return NextResponse.json({ error: "Sold out." }, { status: 409 });
  }
  const quantity = Math.min(wanted, variant.inventory);

  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    create: { cartId: cart.id, variantId: variant.id, quantity },
    update: { quantity },
  });

  const fresh = serialise(await readCart());
  return NextResponse.json({
    ...fresh,
    clamped: quantity < wanted ? variant.inventory : null,
  });
}

const patchSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Resolve the line through the caller's own cart — an item id from the
  // client is never trusted straight into a query.
  const cart = await readCart();
  const item = cart?.items.find((i) => i.id === parsed.data.itemId);
  if (!item) {
    return NextResponse.json({ error: "Not in your cart." }, { status: 404 });
  }

  if (parsed.data.quantity === 0) {
    await db.cartItem.delete({ where: { id: item.id } });
  } else {
    await db.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(parsed.data.quantity, item.variant.inventory) },
    });
  }

  return NextResponse.json(serialise(await readCart()));
}
