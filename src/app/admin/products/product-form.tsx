import { Field } from "@/components/ui";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { Checkbox, Select, Textarea } from "../ui";

// Spare rows so adding a second or third size needs no client-side JS. Blank
// rows are dropped server-side, so leaving them empty costs nothing.
const BLANK_ROWS = 3;

/** Decimals and Dates never cross into the form; callers pass plain values. */
export type ProductFormValues = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  categoryId: string;
  collectionId: string;
  material: string;
  artisan: string;
  origin: string;
  dimensions: string;
  featured: boolean;
  images: string;
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    inventory: number;
  }[];
};

export type Option = { id: string; name: string };

const cellInput =
  "w-full border-b border-grey-200 bg-transparent py-2 text-sm outline-none transition-colors focus:border-black";

export function ProductForm({
  action,
  submitLabel,
  values,
  categories,
  collections,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  values?: ProductFormValues;
  categories: Option[];
  collections: Option[];
}) {
  const variantRows = [
    ...(values?.variants ?? []),
    ...Array.from({ length: BLANK_ROWS }, () => ({
      id: "",
      name: "",
      sku: "",
      price: 0,
      inventory: 0,
    })),
  ];

  return (
    <ActionForm action={action} submitLabel={submitLabel} className="space-y-14">
      {values && <input type="hidden" name="id" value={values.id} />}

      {/* -------------------------------------------------------- basics */}
      <section>
        <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
          Basics
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Title"
            name="title"
            required
            defaultValue={values?.title}
            className="md:col-span-2"
          />
          <Field
            label="Slug"
            name="slug"
            defaultValue={values?.slug}
            placeholder="Leave blank to derive from the title"
          />
          <Select label="Status" name="status" defaultValue={values?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Textarea
            label="Description"
            name="description"
            rows={5}
            defaultValue={values?.description}
            className="md:col-span-2"
          />
        </div>
      </section>

      {/* --------------------------------------------------- organisation */}
      <section>
        <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
          Placement
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Select
            label="Category"
            name="categoryId"
            defaultValue={values?.categoryId ?? ""}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Collection"
            name="collectionId"
            defaultValue={values?.collectionId ?? ""}
          >
            <option value="">No collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <Checkbox
              label="Featured"
              name="featured"
              defaultChecked={values?.featured}
              hint="Hand-picked for the home page rail."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- craft */}
      <section>
        <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
          Craft detail
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field label="Material" name="material" defaultValue={values?.material} />
          <Field
            label="Artisan"
            name="artisan"
            defaultValue={values?.artisan}
            placeholder="The maker's name"
          />
          <Field
            label="Origin"
            name="origin"
            defaultValue={values?.origin}
            placeholder="Kisii, Kenya"
          />
          <Field
            label="Dimensions"
            name="dimensions"
            defaultValue={values?.dimensions}
            placeholder="12 × 8 × 3 cm"
          />
        </div>
      </section>

      {/* --------------------------------------------------------- images */}
      <section>
        <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
          Images
        </h2>
        <div className="mt-6">
          <Textarea
            label="Image URLs"
            name="images"
            rows={5}
            defaultValue={values?.images}
            hint="One URL per line. The first is used as the thumbnail."
          />
        </div>
      </section>

      {/* ------------------------------------------------------- variants */}
      <section>
        <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
          Variants
        </h2>
        <p className="mt-3 text-xs text-grey-600">
          Price and stock live on variants, never on the product. A piece sold
          one way still needs one row.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="eyebrow pb-3 text-left text-grey-600">
                  Name
                </th>
                <th scope="col" className="eyebrow pb-3 text-left text-grey-600">
                  SKU
                </th>
                <th scope="col" className="eyebrow pb-3 text-left text-grey-600">
                  Price (KSh)
                </th>
                <th scope="col" className="eyebrow pb-3 text-left text-grey-600">
                  Inventory
                </th>
              </tr>
            </thead>
            <tbody>
              {variantRows.map((variant, i) => (
                <tr key={variant.id || `new-${i}`}>
                  <td className="py-1 pr-4">
                    {/* Carries the row's identity so an edit updates the
                        existing variant instead of replacing it. */}
                    <input type="hidden" name="variantId" value={variant.id} />
                    <input
                      name="variantName"
                      aria-label={`Variant ${i + 1} name`}
                      defaultValue={variant.name}
                      placeholder="Standard"
                      className={cellInput}
                    />
                  </td>
                  <td className="py-1 pr-4">
                    <input
                      name="variantSku"
                      aria-label={`Variant ${i + 1} SKU`}
                      defaultValue={variant.sku}
                      className={cellInput}
                    />
                  </td>
                  <td className="py-1 pr-4">
                    <input
                      name="variantPrice"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label={`Variant ${i + 1} price in shillings`}
                      defaultValue={variant.name ? variant.price : ""}
                      className={cellInput}
                    />
                  </td>
                  <td className="py-1">
                    <input
                      name="variantInventory"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label={`Variant ${i + 1} inventory`}
                      defaultValue={variant.name ? variant.inventory : ""}
                      className={cellInput}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ActionForm>
  );
}
