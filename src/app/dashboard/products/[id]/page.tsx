import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";
import { Button, PageHeader } from "@/components/ui";
import { ProductForm } from "../product-form";
import { deleteProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shop } = await requireOwnShop();

  // Scoped by shopId, so another shop's product is indistinguishable from
  // one that doesn't exist.
  const product = await db.product.findFirst({
    where: { id, shopId: shop.id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { name: "asc" } },
    },
  });
  if (!product) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title={product.title} subtitle={`/${product.slug}`} />
      <ProductForm product={product} categories={categories} />

      <form action={deleteProduct} className="mt-6">
        <input type="hidden" name="productId" value={product.id} />
        <Button variant="danger" type="submit">
          Delete product
        </Button>
      </form>
    </div>
  );
}
