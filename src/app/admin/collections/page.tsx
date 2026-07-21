import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Field, Empty } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { AdminHead, Textarea } from "../ui";
import { ConfirmDelete } from "../confirm-delete";
import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "./actions";

// Collections are few and edited rarely, so they are edited in place rather
// than behind a detail route — the whole set fits on one page.
export default async function AdminCollectionsPage() {
  await requireRole("ADMIN");

  const collections = await db.collection.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <AdminHead
        eyebrow="Home page campaigns"
        title="Collections"
        action={
          <p className="max-w-xs text-right text-xs text-grey-600">
            The first two by position drive the hero and the full-bleed campaign
            block, so headline and hero image carry the home page.
          </p>
        }
      />

      {collections.length === 0 ? (
        <Empty>No collections yet. Create the first one below.</Empty>
      ) : (
        <div className="space-y-16">
          {collections.map((collection) => (
            <section
              key={collection.id}
              className="border-t border-grey-200 pt-8"
            >
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="display text-2xl">{collection.name}</h2>
                <div className="flex items-center gap-6 text-xs text-grey-600">
                  <span>
                    {collection._count.products}{" "}
                    {collection._count.products === 1 ? "product" : "products"}
                  </span>
                  <Link
                    href={`/admin/products?q=${encodeURIComponent(collection.name)}`}
                    className="link-underline eyebrow"
                  >
                    Products →
                  </Link>
                </div>
              </div>

              <ActionForm
                action={updateCollection}
                submitLabel="Save collection"
              >
                <input type="hidden" name="id" value={collection.id} />
                <CollectionFields
                  values={{
                    name: collection.name,
                    slug: collection.slug,
                    headline: collection.headline ?? "",
                    description: collection.description ?? "",
                    heroImage: collection.heroImage ?? "",
                    position: collection.position,
                  }}
                />
              </ActionForm>

              <div className="mt-8">
                <ConfirmDelete
                  action={deleteCollection}
                  id={collection.id}
                  label="Delete collection"
                  confirmText={`Delete "${collection.name}"?`}
                />
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------ new */}
      <section className="mt-20 border-t border-grey-200 pt-8">
        <h2 className="display mb-6 text-2xl">New collection</h2>
        <ActionForm action={createCollection} submitLabel="Create collection">
          <CollectionFields />
        </ActionForm>
      </section>
    </>
  );
}

function CollectionFields({
  values,
}: {
  values?: {
    name: string;
    slug: string;
    headline: string;
    description: string;
    heroImage: string;
    position: number;
  };
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="Name" name="name" required defaultValue={values?.name} />
      <Field
        label="Slug"
        name="slug"
        defaultValue={values?.slug}
        placeholder="Leave blank to derive from the name"
      />
      <Field
        label="Headline"
        name="headline"
        defaultValue={values?.headline}
        placeholder="Set in brass, made in Nairobi"
        className="md:col-span-2"
      />
      <Textarea
        label="Description"
        name="description"
        rows={3}
        defaultValue={values?.description}
        className="md:col-span-2"
      />
      <Field
        label="Hero image URL"
        name="heroImage"
        type="url"
        defaultValue={values?.heroImage}
        className="md:col-span-2"
      />
      <Field
        label="Position"
        name="position"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        defaultValue={values?.position ?? 0}
      />
    </div>
  );
}
