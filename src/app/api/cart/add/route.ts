import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";

/** Only same-origin paths — an attacker-supplied absolute URL here would turn
 *  "add to cart" into an open redirect. */
function safePath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/cart";
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const variantId = String(form.get("variantId") ?? "");
  const back = safePath(form.get("redirectTo"));
  const redirect = () =>
    NextResponse.redirect(new URL(back, req.url), { status: 303 });

  const requested = Math.floor(Number(form.get("quantity") ?? 1));
  const quantity = Number.isFinite(requested) && requested > 0 ? requested : 1;

  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || variant.product.status !== "ACTIVE" || variant.inventory < 1) {
    return redirect();
  }

  const cart = await getOrCreateCart();
  const existing = cart.items.find((i) => i.variantId === variant.id);

  // The line total, not just this request, is what has to fit in stock.
  const total = Math.min((existing?.quantity ?? 0) + quantity, variant.inventory);

  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    create: { cartId: cart.id, variantId: variant.id, quantity: total },
    update: { quantity: total },
  });

  return redirect();
}
