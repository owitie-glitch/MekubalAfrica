import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Empty, PageHeader, ProductCard } from "@/components/ui";

const PER_PAGE = 24;

const sorts: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { priceMin: "asc" },
  "price-desc": { priceMin: "desc" },
  rating: { ratingAvg: "desc" },
};

type SearchParams = { [key: string]: string | string[] | undefined };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = one(sp.q) ?? "";
  const category = one(sp.category) ?? "";
  const shop = one(sp.shop) ?? "";
  const sort = one(sp.sort) ?? "newest";
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    shop: { status: "ACTIVE", ...(shop ? { slug: shop } : {}) },
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const [categories, total, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" } },
        shop: { select: { slug: true, name: true } },
      },
      orderBy: sorts[sort] ?? sorts.newest,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  // Page links keep whatever filters are already applied.
  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (shop) params.set("shop", shop);
    if (sort) params.set("sort", sort);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <div>
      <PageHeader title="Products" subtitle={`${total} items`} />

      <form className="mb-6 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="flex-1 rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black"
        />
        {shop && <input type="hidden" name="shop" value={shop} />}
        <select
          name="category"
          defaultValue={category}
          className="rounded-lg border border-[--color-border] px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-lg border border-[--color-border] px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
          Apply
        </button>
      </form>

      {products.length === 0 ? (
        <Empty>No products match those filters.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="mt-8 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="hover:underline">
              ← Previous
            </Link>
          ) : (
            <span className="text-[--color-muted]">← Previous</span>
          )}
          <span className="text-[--color-muted]">
            Page {page} of {lastPage}
          </span>
          {page < lastPage ? (
            <Link href={pageHref(page + 1)} className="hover:underline">
              Next →
            </Link>
          ) : (
            <span className="text-[--color-muted]">Next →</span>
          )}
        </div>
      )}
    </div>
  );
}
