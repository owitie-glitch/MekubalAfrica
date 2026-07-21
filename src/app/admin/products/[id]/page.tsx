import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui";
import { AdminHead } from "../../ui";
import { ProductForm } from "../product-form";
import { updateProduct, deleteProduct } from "../actions";
import { ConfirmDelete } from "../../confirm-delete";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { price: "asc" } },
      },
    }),
    db.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
    db.collection.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminHead
        eyebrow={
          <Link href="/admin/products" className="link-underline">
            ← Products
          </Link>
        }
        title={product.title}
        action={<Badge>{product.status}</Badge>}
      />

      <ProductForm
        action={updateProduct}
        submitLabel="Save changes"
        categories={categories}
        collections={collections}
        // Decimals are converted here so nothing but plain values reaches the
        // client component that renders the form.
        values={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description ?? "",
          status: product.status,
          categoryId: product.categoryId ?? "",
          collectionId: product.collectionId ?? "",
          material: product.material ?? "",
          artisan: product.artisan ?? "",
          origin: product.origin ?? "",
          dimensions: product.dimensions ?? "",
          featured: product.featured,
          images: product.images.map((i) => i.url).join("\n"),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku ?? "",
            price: Number(v.price),
            inventory: v.inventory,
          })),
        }}
      />

      <section className="mt-20 border-t border-grey-200 pt-8">
        <h2 className="eyebrow text-grey-600">Danger zone</h2>
        <p className="mt-3 max-w-lg text-sm text-grey-600">
          Deleting removes the product, its images and its variants. Past orders
          keep their snapshotted title and price, so receipts stay readable.
        </p>
        <div className="mt-5">
          <ConfirmDelete
            action={deleteProduct}
            id={product.id}
            label="Delete product"
            confirmText="Delete this product? This cannot be undone."
          />
        </div>
      </section>
    </>
  );
}
