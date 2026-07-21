import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cardInclude, toCard, publicProductWhere } from "@/lib/catalog";
import { ProductGrid } from "@/components/catalog-views";
import { Reveal } from "@/components/motion";
import { Empty } from "@/components/ui";
import { ShopFilters } from "./filters";

const PER_PAGE = 24;

type SearchParams = { [key: string]: string | string[] | undefined };

/** A repeated ?sort=a&sort=b only ever means the first value here. */
function first(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v.trim() : undefined;
}

const SORTS = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ priceMin: "asc" }],
  "price-desc": [{ priceMin: "desc" }],
  // Featured is editorial, so hand-picked pieces float up and everything
  // else stays in newest order beneath them.
  featured: [{ featured: "desc" }, { createdAt: "desc" }],
} satisfies Record<string, Prisma.ProductOrderByWithRelationInput[]>;

type SortKey = keyof typeof SORTS;

function isSortKey(value: string | undefined): value is SortKey {
  return value != null && value in SORTS;
}

export const metadata = {
  title: "Shop — KIOSKYANGU",
  description: "Hand-made ornaments from artisans across Kenya.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = first(sp.q);
  const category = first(sp.category);
  const collection = first(sp.collection);
  const material = first(sp.material);
  const sortParam = first(sp.sort);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "newest";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where: Prisma.ProductWhereInput = {
    ...publicProductWhere,
    ...(q && { title: { contains: q, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
    ...(collection && { collection: { slug: collection } }),
    ...(material && { material: { equals: material, mode: "insensitive" } }),
  };

  const [products, total, categories, collections] = await Promise.all([
    db.product.findMany({
      where,
      include: cardInclude,
      orderBy: SORTS[sort],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.product.count({ where }),
    db.category.findMany({
      orderBy: { position: "asc" },
      select: { slug: true, name: true },
    }),
    db.collection.findMany({
      orderBy: { position: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  // Paging must not drop the filters that produced the result set.
  const pageHref = (n: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({
      q,
      category,
      collection,
      material,
      sort: sortParam,
    })) {
      if (value) next.set(key, value);
    }
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const activeCollection = collections.find((c) => c.slug === collection);
  const heading =
    activeCollection?.name ?? activeCategory?.name ?? (q ? `“${q}”` : "All pieces");

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <header className="border-b border-grey-200 pb-6">
          <div className="eyebrow text-grey-600">Catalogue</div>
          <h1 className="display mt-3 text-[clamp(2.25rem,7vw,6rem)]">
            {heading}
          </h1>
          <p className="mt-4 text-sm text-grey-600" aria-live="polite">
            {total} {total === 1 ? "piece" : "pieces"}
            {lastPage > 1 && ` · page ${Math.min(page, lastPage)} of ${lastPage}`}
          </p>
        </header>
      </Reveal>

      <ShopFilters categories={categories} collections={collections}>
        <div className="mt-12">
          {products.length === 0 ? (
            <Empty>
              Nothing matches those filters yet.{" "}
              <Link href="/shop" className="link-underline font-medium">
                Clear them
              </Link>{" "}
              to see the whole catalogue.
            </Empty>
          ) : (
            <Reveal>
              <ProductGrid products={products.map(toCard)} />
            </Reveal>
          )}
        </div>
      </ShopFilters>

      {lastPage > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-20 flex items-center justify-between border-t border-grey-200 pt-6"
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="link-underline eyebrow">
              ← Previous
            </Link>
          ) : (
            <span className="eyebrow text-grey-400">← Previous</span>
          )}

          <span className="eyebrow text-grey-600 tabular-nums">
            {Math.min(page, lastPage)} / {lastPage}
          </span>

          {page < lastPage ? (
            <Link href={pageHref(page + 1)} className="link-underline eyebrow">
              Next →
            </Link>
          ) : (
            <span className="eyebrow text-grey-400">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
