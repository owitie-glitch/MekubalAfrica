import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";
import { Badge, Empty, Money, PageHeader } from "@/components/ui";

export default async function DashboardProductsPage() {
  const { shop } = await requireOwnShop();

  const products = await db.product.findMany({
    where: { shopId: shop.id },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { price: true, inventory: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} in your catalog`}
        action={
          <Link
            href="/dashboard/products/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            New product
          </Link>
        }
      />

      {products.length === 0 ? (
        <Empty>No products yet. Add your first one to get started.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[--color-border]">
          <table className="w-full text-sm">
            <thead className="border-b border-[--color-border] text-left text-xs text-[--color-muted]">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Inventory</th>
                <th className="p-3" />
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
                  <tr
                    key={product.id}
                    className="border-b border-[--color-border] last:border-0"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                          {product.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge>{product.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Money value={low} />
                      {high > low && (
                        <>
                          {" – "}
                          <Money value={high} />
                        </>
                      )}
                    </td>
                    <td className="p-3">{stock}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
