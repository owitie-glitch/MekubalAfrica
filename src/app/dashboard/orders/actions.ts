"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireShopAccess } from "@/lib/auth";
import { syncOrderStatus } from "@/lib/orders";

const schema = z.object({
  shopOrderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function fulfilShopOrder(formData: FormData) {
  const parsed = schema.safeParse({
    shopOrderId: str(formData.get("shopOrderId")),
    status: str(formData.get("status")),
    trackingNumber: str(formData.get("trackingNumber")) || undefined,
    carrier: str(formData.get("carrier")) || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const shopOrder = await db.shopOrder.findUnique({
    where: { id: data.shopOrderId },
  });
  if (!shopOrder) throw new Error("NOT_FOUND");
  await requireShopAccess(shopOrder.shopId);

  // Stamp the ship date on the transition only, so re-saving tracking
  // details later doesn't move it.
  const shipped =
    data.status === "SHIPPED" && shopOrder.status !== "SHIPPED"
      ? new Date()
      : shopOrder.shippedAt;

  await db.shopOrder.update({
    where: { id: shopOrder.id },
    data: {
      status: data.status,
      trackingNumber: data.trackingNumber ?? null,
      carrier: data.carrier ?? null,
      shippedAt: shipped,
    },
  });

  await syncOrderStatus(shopOrder.orderId);

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${shopOrder.id}`);
}
