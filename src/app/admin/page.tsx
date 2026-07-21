import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Empty, Money } from "@/components/ui";
import { AdminHead, Stat, Table, Td, Th } from "./ui";

// Cancelled and refunded orders took money in and gave it back, so counting
// them as revenue would overstate the till.
const NON_EARNING_STATUSES = ["CANCELLED", "REFUNDED"] as const;

/** Anything at or below this needs restocking before it sells out. */
const LOW_STOCK = 3;

export default async function AdminOverviewPage() {
  await requireRole("ADMIN");

  const [productCounts, lowStock, ordersByStatus, revenue, recentOrders] =
    await Promise.all([
      db.product.groupBy({ by: ["status"], _count: { _all: true } }),
      db.productVariant.findMany({
        where: { inventory: { lte: LOW_STOCK } },
        orderBy: { inventory: "asc" },
        include: { product: { select: { id: true, title: true } } },
      }),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: [...NON_EARNING_STATUSES] } },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

  const productTotal = productCounts.reduce((n, r) => n + r._count._all, 0);
  const byStatus = (status: string) =>
    productCounts.find((r) => r.status === status)?._count._all ?? 0;

  const orderTotal = ordersByStatus.reduce((n, r) => n + r._count._all, 0);

  return (
    <>
      <AdminHead eyebrow="Mekubal Africa" title="Overview" />

      <div className="grid grid-cols-2 gap-px bg-grey-200 md:grid-cols-4">
        <Stat label="Products" value={productTotal} />
        <Stat label="Active" value={byStatus("ACTIVE")} sub="Visible in shop" />
        <Stat label="Draft" value={byStatus("DRAFT")} sub="Not yet published" />
        <Stat
          label="Low stock"
          value={lowStock.length}
          sub={`Variants at ${LOW_STOCK} or fewer`}
        />
      </div>

      <div className="mt-px grid grid-cols-2 gap-px bg-grey-200 md:grid-cols-4">
        <Stat label="Orders" value={orderTotal} />
        <Stat
          label="Revenue"
          value={<Money value={revenue._sum.total ?? 0} />}
          sub="Excludes cancelled and refunded"
        />
        <Stat
          label="To fulfil"
          value={ordersByStatus
            .filter((r) => r.status === "PAID" || r.status === "PROCESSING")
            .reduce((n, r) => n + r._count._all, 0)}
          sub="Paid or processing"
        />
        <Stat
          label="Shipped"
          value={
            ordersByStatus.find((r) => r.status === "SHIPPED")?._count._all ?? 0
          }
        />
      </div>

      {/* ------------------------------------------------------ low stock */}
      <section className="mt-20">
        <div className="mb-6 flex items-end justify-between gap-6 border-b border-grey-200 pb-4">
          <div>
            <div className="eyebrow text-grey-600">Restock</div>
            <h2 className="display mt-2 text-2xl">Low stock</h2>
          </div>
          <Link
            href="/admin/products"
            className="link-underline eyebrow shrink-0 pb-1"
          >
            All products →
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <Empty>Every variant is above {LOW_STOCK} in stock.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Variant</Th>
                <Th>SKU</Th>
                <Th className="text-right">Inventory</Th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((variant) => (
                <tr key={variant.id}>
                  <Td>
                    <Link
                      href={`/admin/products/${variant.product.id}`}
                      className="link-underline"
                    >
                      {variant.product.title}
                    </Link>
                  </Td>
                  <Td className="text-grey-600">{variant.name}</Td>
                  <Td className="text-grey-600">{variant.sku ?? "—"}</Td>
                  <Td className="text-right font-semibold tabular-nums">
                    {variant.inventory === 0 ? "Out of stock" : variant.inventory}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {/* --------------------------------------------------- recent orders */}
      <section className="mt-20">
        <div className="mb-6 flex items-end justify-between gap-6 border-b border-grey-200 pb-4">
          <div>
            <div className="eyebrow text-grey-600">Latest</div>
            <h2 className="display mt-2 text-2xl">Recent orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="link-underline eyebrow shrink-0 pb-1"
          >
            All orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Empty>No orders yet.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th className="text-right">Items</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <Td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="link-underline font-semibold"
                    >
                      {order.orderNumber}
                    </Link>
                  </Td>
                  <Td className="text-grey-600">
                    {order.createdAt.toLocaleDateString("en-KE")}
                  </Td>
                  <Td className="text-grey-600">
                    {order.user.name ?? order.user.email}
                  </Td>
                  <Td>
                    <Badge>{order.status}</Badge>
                  </Td>
                  <Td className="text-right tabular-nums">
                    {order._count.items}
                  </Td>
                  <Td className="text-right font-semibold tabular-nums">
                    <Money value={order.total} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </>
  );
}
