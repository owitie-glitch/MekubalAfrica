import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await requireOwnShop();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New product" />
      <ProductForm categories={categories} />
    </div>
  );
}
