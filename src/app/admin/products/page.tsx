import Link from "next/link";
import type { Prisma, ProductStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Empty, formatMoney } from "@/components/ui";
import { AdminHead, Table, Td, Th } from "../ui";

const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

function isStatus(value: string | undefined): value is ProductStatus {
  return STATUSES.includes(value as (typeof STATUSES)[number]);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("ADMIN");
  const { status, q } = await searchParams;

  const query = q?.trim() ?? "";
  const where: Prisma.ProductWhereInput = {
    ...(isStatus(status) ? { status } : {}),
    ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
  };

  const [products, categories, collections] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { price: true, inventory: true } },
        category: { select: { name: true } },
        collection: { select: { name: true } },
      },
    }),
    db.category.count(),
    db.collection.count(),
  ]);

  return (
    <>
      <AdminHead
        eyebrow={`${categories} categories · ${collections} collections`}
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center bg-black px-6 py-3.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors duration-300 hover:bg-neutral-800"
          >
            New product
          </Link>
        }
      />

      {/* A plain GET form: filters stay in the URL and survive a refresh. */}
      <form className="mb-10 flex flex-wrap items-end gap-6 border-b border-grey-200 pb-6">
        <label className="block">
          <span className="eyebrow text-grey-600">Search title</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Brass bird"
            className="mt-2 w-56 border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="block">
          <span className="eyebrow text-grey-600">Status</span>
          <select
            name="status"
            defaultValue={isStatus(status) ? status : ""}
            className="mt-2 w-40 border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-black"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="border border-black px-6 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 hover:bg-black hover:text-white"
        >
          Filter
        </button>

        {(query || isStatus(status)) && (
          <Link href="/admin/products" className="link-underline eyebrow pb-3">
            Clear
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <Empty>
          No products match.{" "}
          <Link href="/admin/products/new" className="link-underline">
            Add one
          </Link>
          .
        </Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th className="w-16" />
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Category</Th>
              <Th>Collection</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">Stock</Th>
              <Th className="text-right">Featured</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const prices = product.variants.map((v) => Number(v.price));
              const low = prices.length ? Math.min(...prices) : 0;
              const high = prices.length ? Math.max(...prices) : 0;
              const stock = product.variants.reduce(
                (n, v) => n + v.inventory,
                0,
              );

              return (
                <tr key={product.id} className="transition-colors hover:bg-grey-100">
                  <Td>
                    <div className="h-12 w-12 overflow-hidden bg-grey-100">
                      {product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="link-underline font-semibold"
                    >
                      {product.title}
                    </Link>
                    <div className="mt-1 text-xs text-grey-600">
                      /{product.slug}
                    </div>
                  </Td>
                  <Td>
                    <Badge>{product.status}</Badge>
                  </Td>
                  <Td className="text-grey-600">
                    {product.category?.name ?? "—"}
                  </Td>
                  <Td className="text-grey-600">
                    {product.collection?.name ?? "—"}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {prices.length === 0
                      ? "—"
                      : low === high
                        ? formatMoney(low)
                        : `${formatMoney(low)} – ${formatMoney(high)}`}
                  </Td>
                  <Td
                    className={`text-right tabular-nums ${
                      stock === 0 ? "font-semibold" : "text-grey-600"
                    }`}
                  >
                    {stock}
                  </Td>
                  <Td className="text-right">
                    {product.featured ? (
                      <span aria-label="Featured">●</span>
                    ) : (
                      <span className="text-grey-400" aria-label="Not featured">
                        —
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
