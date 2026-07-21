"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";

const schema = z.object({
  name: z.string().min(1, "Shop name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.url("Logo must be a valid URL").optional(),
  bannerUrl: z.url("Banner must be a valid URL").optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const LOCATION_FIELDS = [
  "addressLine",
  "city",
  "region",
  "postalCode",
  "country",
] as const;

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateShopSettings(formData: FormData) {
  // The shop comes from the session, never the form — slug and
  // commissionRate are deliberately absent from the schema so a crafted
  // POST can't reach them.
  const { shop } = await requireOwnShop();

  const parsed = schema.safeParse({
    name: str(formData.get("name")),
    tagline: str(formData.get("tagline")) || undefined,
    description: str(formData.get("description")) || undefined,
    logoUrl: str(formData.get("logoUrl")) || undefined,
    bannerUrl: str(formData.get("bannerUrl")) || undefined,
    ...Object.fromEntries(
      LOCATION_FIELDS.map((f) => [f, str(formData.get(f)) || undefined]),
    ),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await db.shop.update({
    where: { id: shop.id },
    data: {
      name: parsed.data.name,
      tagline: parsed.data.tagline ?? null,
      description: parsed.data.description ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      bannerUrl: parsed.data.bannerUrl ?? null,
      ...Object.fromEntries(
        LOCATION_FIELDS.map((f) => [f, parsed.data[f] ?? null]),
      ),
    },
  });

  revalidatePath("/dashboard/settings");
}
