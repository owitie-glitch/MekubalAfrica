"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { createOrderFromCart, CheckoutError } from "@/lib/orders";
import type { ActionResult } from "@/components/action-form";

// Flat nationwide rate — one seller, one shipment. A "use server" module may
// only export async functions, so the checkout page keeps its own copy.
const SHIPPING_FLAT = 500;

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  line1: z.string().trim().min(1, "Address is required."),
  line2: optional,
  city: z.string().trim().min(1, "City is required."),
  region: z.string().trim().min(1, "County or region is required."),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
  phone: optional,
});

export async function placeOrder(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }
  const fields = parsed.data;

  let orderId: string;
  try {
    // Reuse an identical address rather than accumulating duplicates every
    // time the same customer checks out.
    const existing = await db.address.findFirst({
      where: { userId: user.id, ...fields },
    });
    const address =
      existing ??
      (await db.address.create({
        data: {
          userId: user.id,
          ...fields,
          isDefault:
            (await db.address.count({ where: { userId: user.id } })) === 0,
        },
      }));

    const cart = await getOrCreateCart();
    const order = await createOrderFromCart({
      cart,
      userId: user.id,
      addressId: address.id,
      shipping: SHIPPING_FLAT,
    });

    // No payment provider is wired up yet, so the order settles the instant it
    // is created. Stripe replaces this line: the order stays PENDING_PAYMENT
    // until the payment_intent.succeeded webhook arrives, and that webhook is
    // what flips it to PAID.
    await db.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    orderId = order.id;
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    throw err;
  }

  // redirect() signals by throwing — it must stay outside the try above.
  redirect(`/orders/${orderId}`);
}
