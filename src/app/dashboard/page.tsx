import { db } from "@/lib/db";
import { getOwnShop } from "@/lib/vendor";
import { Card, Money, PageHeader } from "@/components/ui";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <p className="text-xs text-[--color-muted]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </Card>
  );
}

export default async function DashboardPage() {
  const { shop } = await getOwnShop();
  if (!shop) return null; // layout already shows the "open a shop" prompt

  const [products, activeProducts, byStatus, totals, owed] = await Promise.all([
    db.product.count({ where: { shopId: shop.id } }),
    db.product.count({ where: { shopId: shop.id, status: "ACTIVE" } }),
    db.shopOrder.groupBy({
      by: ["status"],
      where: { shopId: shop.id },
      _count: { _all: true },
    }),
    db.shopOrder.aggregate({
      where: { shopId: shop.id },
      _sum: { subtotal: true, commission: true },
    }),
    // Owed = earned but not yet attached to a payout, and not written off.
    db.shopOrder.aggregate({
      where: {
        shopId: shop.id,
        payoutId: null,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { payout: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Overview" subtitle={shop.name} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Products" value={products} />
        <Stat label="Active products" value={activeProducts} />
        <Stat
          label="Gross revenue"
          value={<Money value={totals._sum.subtotal ?? 0} />}
        />
        <Stat
          label="Commission paid"
          value={<Money value={totals._sum.commission ?? 0} />}
        />
        <Stat
          label="Net payout owed"
          value={<Money value={owed._sum.payout ?? 0} />}
        />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Orders by status</h2>
      {byStatus.length === 0 ? (
        <p className="text-sm text-[--color-muted]">No orders yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {byStatus.map((row) => (
            <Stat
              key={row.status}
              label={row.status.toLowerCase()}
              value={row._count._all}
            />
          ))}
        </div>
      )}
    </div>
  );
}
