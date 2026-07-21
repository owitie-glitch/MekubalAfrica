import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Card, Money, PageHeader } from "@/components/ui";

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
    include: {
      address: true,
      shopOrders: {
        include: { shop: true, items: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed ${order.createdAt.toLocaleDateString()}`}
        action={<Badge>{order.status}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Shipping to</h2>
          {order.address ? (
            <address className="text-sm not-italic text-[--color-muted]">
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
            <p className="text-sm text-[--color-muted]">No address on file.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-2 text-sm font-semibold">Totals</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>
                <Money value={order.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>
                <Money value={order.shipping} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>
                <Money value={order.tax} />
              </dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={order.total} />
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <h2 className="mt-8 mb-1 text-lg font-semibold">
        {order.shopOrders.length} shipment
        {order.shopOrders.length === 1 ? "" : "s"}
      </h2>
      <p className="mb-4 text-sm text-[--color-muted]">
        Each shop fulfils and ships its own items, so they may arrive at
        different times and track separately.
      </p>

      <div className="space-y-4">
        {order.shopOrders.map((shopOrder) => (
          <Card key={shopOrder.id}>
            <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-[--color-border] pb-3">
              <span className="font-semibold">{shopOrder.shop.name}</span>
              <Badge>{shopOrder.status}</Badge>
            </div>

            <ul className="space-y-2">
              {shopOrder.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                    {item.imageSnapshot && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div>{item.titleSnapshot}</div>
                    <div className="text-xs text-[--color-muted]">
                      {item.variantSnapshot} × {item.quantity}
                    </div>
                  </div>
                  <span>
                    <Money value={Number(item.unitPrice) * item.quantity} />
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between border-t border-[--color-border] pt-3 text-sm text-[--color-muted]">
              <span>
                {shopOrder.trackingNumber
                  ? `${shopOrder.carrier ?? "Tracking"} · ${shopOrder.trackingNumber}`
                  : "No tracking yet"}
              </span>
              <span>
                <Money value={shopOrder.subtotal} /> +{" "}
                <Money value={shopOrder.shipping} /> shipping
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
