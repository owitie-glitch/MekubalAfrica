import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwnShop } from "@/lib/vendor";
import { Badge, Button, Card, Field, Money, PageHeader } from "@/components/ui";
import { fulfilShopOrder } from "../actions";

const inputClass =
  "w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black";

const statuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default async function ShopOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shop } = await requireOwnShop();

  const shopOrder = await db.shopOrder.findFirst({
    where: { id, shopId: shop.id },
    include: {
      items: true,
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
          address: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!shopOrder) notFound();

  const address = shopOrder.order.address;

  return (
    <div>
      <PageHeader
        title={shopOrder.order.orderNumber}
        subtitle={shopOrder.order.createdAt.toLocaleString()}
        action={<Badge>{shopOrder.status}</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-3 text-sm font-semibold">Items</p>
          <table className="w-full text-sm">
            <tbody>
              {shopOrder.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[--color-border] last:border-0"
                >
                  <td className="py-2">
                    <p className="font-medium">{item.titleSnapshot}</p>
                    <p className="text-xs text-[--color-muted]">
                      {item.variantSnapshot}
                    </p>
                  </td>
                  <td className="py-2 text-right">
                    <Money value={item.unitPrice} /> × {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-semibold">Ship to</p>
          {address ? (
            <address className="text-sm not-italic text-[--color-muted]">
              {address.fullName}
              <br />
              {address.line1}
              <br />
              {address.line2 && (
                <>
                  {address.line2}
                  <br />
                </>
              )}
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.country}
              {address.phone && (
                <>
                  <br />
                  {address.phone}
                </>
              )}
            </address>
          ) : (
            <p className="text-sm text-[--color-muted]">No address on file.</p>
          )}
          <p className="mt-4 text-xs text-[--color-muted]">
            {shopOrder.order.user.name ?? shopOrder.order.user.email}
          </p>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-semibold">Money</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-[--color-muted]">Subtotal</dt>
              <dd>
                <Money value={shopOrder.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[--color-muted]">Shipping</dt>
              <dd>
                <Money value={shopOrder.shipping} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[--color-muted]">Commission</dt>
              <dd>
                −<Money value={shopOrder.commission} />
              </dd>
            </div>
            <div className="flex justify-between border-t border-[--color-border] pt-1 font-medium">
              <dt>Payout</dt>
              <dd>
                <Money value={shopOrder.payout} />
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <p className="mb-3 text-sm font-semibold">Fulfilment</p>
          <form action={fulfilShopOrder} className="space-y-3">
            <input type="hidden" name="shopOrderId" value={shopOrder.id} />
            <label className="block space-y-1">
              <span className="text-sm font-medium">Status</span>
              <select
                name="status"
                defaultValue={shopOrder.status}
                className={inputClass}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Tracking number"
                name="trackingNumber"
                defaultValue={shopOrder.trackingNumber ?? ""}
              />
              <Field
                label="Carrier"
                name="carrier"
                defaultValue={shopOrder.carrier ?? ""}
              />
            </div>
            <Button type="submit">Update fulfilment</Button>
          </form>
          {shopOrder.shippedAt && (
            <p className="mt-3 text-xs text-[--color-muted]">
              Shipped {shopOrder.shippedAt.toLocaleString()}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
