import { Button, Card, Field } from "@/components/ui";
import { createProduct, updateProduct } from "./actions";

const inputClass =
  "w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  price: unknown;
  inventory: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  status: string;
  images: { url: string }[];
  variants: Variant[];
};

function VariantRow({ variant }: { variant?: Variant }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {variant && <input type="hidden" name="variantId" value={variant.id} />}
      <Field
        label="Name"
        name="variantName"
        defaultValue={variant?.name ?? ""}
        placeholder="Default"
      />
      <Field
        label="SKU"
        name="variantSku"
        defaultValue={variant?.sku ?? ""}
      />
      <Field
        label="Price"
        name="variantPrice"
        type="number"
        step="0.01"
        min="0"
        defaultValue={variant ? String(Number(variant.price)) : ""}
      />
      <Field
        label="Inventory"
        name="variantInventory"
        type="number"
        min="0"
        defaultValue={variant ? String(variant.inventory) : "0"}
      />
    </div>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
}) {
  return (
    <form
      action={product ? updateProduct : createProduct}
      className="space-y-4"
    >
      {product && <input type="hidden" name="productId" value={product.id} />}

      <Card className="space-y-3">
        <Field label="Title" name="title" defaultValue={product?.title ?? ""} />
        <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} />

        <label className="block space-y-1">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            className={inputClass}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Category</span>
            <select
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className={inputClass}
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={product?.status ?? "DRAFT"}
              className={inputClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Image URLs</span>
          <textarea
            name="images"
            rows={3}
            defaultValue={(product?.images ?? []).map((i) => i.url).join("\n")}
            placeholder="One URL per line"
            className={inputClass}
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-semibold">Variants</p>
        {product?.variants.map((variant) => (
          <VariantRow key={variant.id} variant={variant} />
        ))}
        {/* Always one blank row so adding a variant needs no client JS. */}
        <VariantRow />
        <p className="text-xs text-[--color-muted]">
          Leave the blank row empty if you don&apos;t need another variant. Rows
          you clear the name of are removed.
        </p>
      </Card>

      <Button type="submit">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
