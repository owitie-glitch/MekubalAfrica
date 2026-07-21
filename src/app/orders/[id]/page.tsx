import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Money } from "@/components/ui";

export const metadata: Metadata = { title: "Order" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${id}`);

  // Scoped by userId, so another customer's order id is indistinguishable
  // from one that does not exist.
  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: { address: true, items: true },
  });
  if (!order) notFound();

  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-24 md:px-8">
      <Link
        href="/orders"
        className="link-underline eyebrow text-grey-600"
      >
        ← All orders
      </Link>

      <header className="mt-6 border-b border-grey-200 pb-6">
        <div className="eyebrow text-grey-600">
          Placed{" "}
          {order.createdAt.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="display text-[clamp(1.75rem,5vw,3.25rem)]">
            {order.orderNumber}
          </h1>
          <Badge>{order.status}</Badge>
        </div>
      </header>

      {/* One order, one shipment — CCA fulfils everything itself. */}
      <section aria-labelledby="items-heading" className="mt-12">
        <h2
          id="items-heading"
          className="eyebrow border-b border-grey-200 pb-4 text-grey-600"
        >
          {count} item{count === 1 ? "" : "s"}
        </h2>

        <ul>
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-5 border-b border-grey-200 py-6"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden bg-paper">
                {item.imageSnapshot && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageSnapshot}
                    alt={item.titleSnapshot}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.titleSnapshot}</p>
                <p className="mt-1 text-xs text-grey-600">
                  {item.variantSnapshot}
                </p>
                <p className="mt-0.5 text-xs text-grey-600 tabular-nums">
                  <Money value={item.unitPrice} /> × {item.quantity}
                </p>
              </div>
              <span className="text-sm tabular-nums">
                <Money value={Number(item.unitPrice) * item.quantity} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 grid gap-12 sm:grid-cols-2">
        <section aria-labelledby="address-heading">
          <h2
            id="address-heading"
            className="eyebrow border-b border-grey-200 pb-4 text-grey-600"
          >
            Delivering to
          </h2>
          {order.address ? (
            <address className="mt-5 text-sm leading-relaxed not-italic">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.region}{" "}
              {order.address.postalCode}
              <br />
              {order.address.country}
              {order.address.phone && (
                <>
                  <br />
                  {order.address.phone}
                </>
              )}
            </address>
          ) : (
            <p className="mt-5 text-sm text-grey-600">No address on file.</p>
          )}

          {order.trackingNumber && (
            <div className="mt-8">
              <div className="eyebrow text-grey-600">Tracking</div>
              <p className="mt-2 text-sm">
                {order.carrier ?? "Courier"} ·{" "}
                <span className="tabular-nums">{order.trackingNumber}</span>
              </p>
              {order.shippedAt && (
                <p className="mt-1 text-xs text-grey-600">
                  Shipped{" "}
                  {order.shippedAt.toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="totals-heading">
          <h2
            id="totals-heading"
            className="eyebrow border-b border-grey-200 pb-4 text-grey-600"
          >
            Payment
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-grey-600">Subtotal</dt>
              <dd className="tabular-nums">
                <Money value={order.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey-600">Shipping</dt>
              <dd className="tabular-nums">
                <Money value={order.shipping} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey-600">Tax</dt>
              <dd className="tabular-nums">
                <Money value={order.tax} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-grey-200 pt-4">
              <dt className="eyebrow">Total</dt>
              <dd className="text-lg font-semibold tabular-nums">
                <Money value={order.total} />
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
