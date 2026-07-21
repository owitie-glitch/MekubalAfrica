import Link from "next/link";
import { db } from "@/lib/db";
import { Card, Empty, PageHeader, ShopLocation } from "@/components/ui";

export default async function ShopsPage() {
  const shops = await db.shop.findMany({
    where: { status: "ACTIVE" },
    // Filtered count so draft/archived products don't inflate the total.
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Shops" subtitle="Independent sellers on the marketplace" />

      {shops.length === 0 ? (
        <Empty>No shops are open yet.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.slug}`}>
              <Card className="h-full">
                <div className="font-medium">{shop.name}</div>
                {shop.tagline && (
                  <p className="mt-1 text-sm text-[--color-muted]">
                    {shop.tagline}
                  </p>
                )}
                <ShopLocation shop={shop} className="mt-2" />
                <p className="mt-3 text-xs text-[--color-muted]">
                  {shop._count.products} products
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
