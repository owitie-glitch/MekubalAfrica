"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionResult } from "@/components/action-form";

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);

const fulfilmentSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: optional,
  carrier: optional,
});

export async function updateFulfilment(
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const parsed = fulfilmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }
  const { id, status, trackingNumber, carrier } = parsed.data;

  const order = await db.order.findUnique({
    where: { id },
    select: { status: true, shippedAt: true },
  });
  if (!order) return { error: "That order no longer exists." };

  // shippedAt stamps the moment the parcel left, so it is set on the transition
  // into SHIPPED only. Re-saving a shipped order must not move the date, and
  // moving on to DELIVERED must not clear it.
  const shippedAt =
    status === "SHIPPED" && order.status !== "SHIPPED" && !order.shippedAt
      ? new Date()
      : order.shippedAt;

  await db.order.update({
    where: { id },
    data: { status, trackingNumber, carrier, shippedAt },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return undefined;
}
