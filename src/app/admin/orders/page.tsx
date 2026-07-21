import Link from "next/link";
import type { Prisma, OrderStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Empty, Money } from "@/components/ui";
import { AdminHead, Table, Td, Th } from "../ui";

const STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

function isStatus(value: string | undefined): value is OrderStatus {
  return STATUSES.includes(value as (typeof STATUSES)[number]);
}

function label(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("ADMIN");
  const { status } = await searchParams;

  const where: Prisma.OrderWhereInput = isStatus(status) ? { status } : {};

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <>
      <AdminHead
        eyebrow="Fulfilment"
        title="Orders"
        action={
          <span className="text-sm text-grey-600">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        }
      />

      <form className="mb-10 flex flex-wrap items-end gap-6 border-b border-grey-200 pb-6">
        <label className="block">
          <span className="eyebrow text-grey-600">Status</span>
          <select
            name="status"
            defaultValue={isStatus(status) ? status : ""}
            className="mt-2 w-52 border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-black"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
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

        {isStatus(status) && (
          <Link href="/admin/orders" className="link-underline eyebrow pb-3">
            Clear
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <Empty>No orders match that filter.</Empty>
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
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-grey-100">
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
                <Td>
                  <div>{order.user.name ?? "—"}</div>
                  <div className="mt-1 text-xs text-grey-600">
                    {order.user.email}
                  </div>
                </Td>
                <Td>
                  <Badge>{order.status}</Badge>
                </Td>
                <Td className="text-right tabular-nums">{order._count.items}</Td>
                <Td className="text-right font-semibold tabular-nums">
                  <Money value={order.total} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
