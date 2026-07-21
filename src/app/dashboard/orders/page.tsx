import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";
import { Badge, Empty, Money, PageHeader } from "@/components/ui";

export default async function DashboardOrdersPage() {
  const { shop } = await requireOwnShop();

  // ShopOrders only. The parent Order carries other shops' slices, which
  // this vendor must never see.
  const shopOrders = await db.shopOrder.findMany({
    where: { shopId: shop.id },
    include: {
      order: {
        select: { orderNumber: true, user: { select: { name: true, email: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${shopOrders.length} total`} />

      {shopOrders.length === 0 ? (
        <Empty>No orders yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[--color-border]">
          <table className="w-full text-sm">
            <thead className="border-b border-[--color-border] text-left text-xs text-[--color-muted]">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Subtotal</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium">Payout</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {shopOrders.map((so) => (
                <tr
                  key={so.id}
                  className="border-b border-[--color-border] last:border-0"
                >
                  <td className="p-3 font-medium">{so.order.orderNumber}</td>
                  <td className="p-3">
                    {so.order.user.name ?? so.order.user.email}
                  </td>
                  <td className="p-3 text-[--color-muted]">
                    {so.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Badge>{so.status}</Badge>
                  </td>
                  <td className="p-3">{so._count.items}</td>
                  <td className="p-3">
                    <Money value={so.subtotal} />
                  </td>
                  <td className="p-3">
                    <Money value={so.commission} />
                  </td>
                  <td className="p-3">
                    <Money value={so.payout} />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/dashboard/orders/${so.id}`}
                      className="hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
