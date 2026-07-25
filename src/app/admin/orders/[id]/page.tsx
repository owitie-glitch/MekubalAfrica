import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Field, Money } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { AdminHead, Select } from "../../ui";
import { updateFulfilment } from "../actions";

const STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

function label(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: true,
    },
  });
  if (!order) notFound();

  return (
    <>
      <AdminHead
        eyebrow={
          <Link href="/admin/orders" className="link-underline">
            ← Orders
          </Link>
        }
        title={order.orderNumber}
        action={
          <div className="text-right">
            <Badge>{order.status}</Badge>
            <div className="mt-2 text-xs text-grey-600">
              Placed {order.createdAt.toLocaleDateString("en-KE")}
            </div>
          </div>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        {/* ------------------------------------------------------- items */}
        <div>
          <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </h2>
          <ul className="divide-y divide-grey-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-grey-100">
                  {item.imageSnapshot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageSnapshot}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {item.titleSnapshot}
                  </div>
                  <div className="mt-1 text-xs text-grey-600">
                    {item.variantSnapshot} · <Money value={item.unitPrice} /> ×{" "}
                    {item.quantity}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  <Money value={Number(item.unitPrice) * item.quantity} />
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-grey-200 pt-6 text-sm">
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
            <div className="flex justify-between border-t border-grey-200 pt-2 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">
                <Money value={order.total} />
              </dd>
            </div>
          </dl>
        </div>

        {/* --------------------------------------- customer and fulfilment */}
        <div className="space-y-12">
          <section>
            <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
              Customer
            </h2>
            <div className="mt-4 text-sm">
              <div>{order.user.name ?? "—"}</div>
              <a
                href={`mailto:${order.user.email}`}
                className="link-underline mt-1 inline-block text-grey-600"
              >
                {order.user.email}
              </a>
            </div>

            <h3 className="eyebrow mt-8 text-grey-600">Ship to</h3>
            {order.address ? (
              <address className="mt-3 text-sm leading-relaxed not-italic">
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
              <p className="mt-3 text-sm text-grey-600">No address on file.</p>
            )}
          </section>

          <section>
            <h2 className="eyebrow border-b border-grey-200 pb-3 text-grey-600">
              Fulfilment
            </h2>
            {order.shippedAt && (
              <p className="mt-4 text-xs text-grey-600">
                Shipped {order.shippedAt.toLocaleDateString("en-KE")}
              </p>
            )}
            <div className="mt-4">
              <ActionForm action={updateFulfilment} submitLabel="Save">
                <input type="hidden" name="id" value={order.id} />
                <Select label="Status" name="status" defaultValue={order.status}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </Select>
                <Field
                  label="Carrier"
                  name="carrier"
                  defaultValue={order.carrier ?? ""}
                  placeholder="G4S, Wells Fargo, DHL"
                />
                <Field
                  label="Tracking number"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                />
              </ActionForm>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
