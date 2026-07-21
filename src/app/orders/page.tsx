import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Empty, Money } from "@/components/ui";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 pb-24 md:px-8">
      <header className="border-b border-grey-200 pb-6">
        <div className="eyebrow text-grey-600">
          {user.name ?? user.email}
        </div>
        <h1 className="display mt-3 text-[clamp(2.5rem,8vw,5rem)]">ORDERS</h1>
      </header>

      {orders.length === 0 ? (
        <div className="mt-12">
          <Empty>
            You haven&apos;t placed an order yet.{" "}
            <Link href="/shop" className="link-underline text-foreground">
              Browse the collection
            </Link>
            .
          </Empty>
        </div>
      ) : (
        <ul className="mt-12 border-t border-grey-200">
          {orders.map((order) => {
            const count = order.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <li key={order.id} className="border-b border-grey-200">
                <Link
                  href={`/orders/${order.id}`}
                  className="group flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-7 transition-colors hover:bg-grey-100"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium tracking-wide">
                        {order.orderNumber}
                      </span>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-grey-600">
                      {order.createdAt.toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {count} item{count === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold tabular-nums">
                      <Money value={order.total} />
                    </span>
                    <span
                      aria-hidden
                      className="text-grey-400 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      ⟶
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
