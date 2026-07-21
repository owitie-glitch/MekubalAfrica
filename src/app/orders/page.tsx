import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Card, Empty, Money, PageHeader } from "@/components/ui";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { shopOrders: true } } },
  });

  if (orders.length === 0) {
    return (
      <>
        <PageHeader title="Your orders" />
        <Empty>
          You haven&apos;t placed an order yet.{" "}
          <Link href="/products" className="underline">
            Browse products
          </Link>
          .
        </Empty>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your orders" />
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block">
            <Card className="flex items-center justify-between gap-4 hover:bg-neutral-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{order.orderNumber}</span>
                  <Badge>{order.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-[--color-muted]">
                  {order.createdAt.toLocaleDateString()} ·{" "}
                  {order._count.shopOrders} shop
                  {order._count.shopOrders === 1 ? "" : "s"}
                </div>
              </div>
              <span className="text-sm font-semibold">
                <Money value={order.total} />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
