import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHead } from "../../ui";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  await requireRole("ADMIN");

  const [categories, collections] = await Promise.all([
    db.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
    db.collection.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <AdminHead
        eyebrow={
          <Link href="/admin/products" className="link-underline">
            ← Products
          </Link>
        }
        title="New product"
      />
      <ProductForm
        action={createProduct}
        submitLabel="Create product"
        categories={categories}
        collections={collections}
      />
    </>
  );
}
