"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const statusSchema = z.object({
  shopId: z.string().min(1),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "CLOSED"]),
});

const commissionSchema = z.object({
  shopId: z.string().min(1),
  commissionRate: z.number().min(0).max(100),
});

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function setShopStatus(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = statusSchema.safeParse({
    shopId: str(formData.get("shopId")),
    status: str(formData.get("status")),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await db.shop.update({
    where: { id: parsed.data.shopId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/shops");
}

export async function setCommissionRate(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = commissionSchema.safeParse({
    shopId: str(formData.get("shopId")),
    commissionRate: Number(str(formData.get("commissionRate"))),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await db.shop.update({
    where: { id: parsed.data.shopId },
    data: {
      commissionRate: new Prisma.Decimal(
        parsed.data.commissionRate.toFixed(2),
      ),
    },
  });

  revalidatePath("/admin/shops");
}
