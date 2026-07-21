import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readCart, groupByShop, cartTotal } from "@/lib/cart";
import { db } from "@/lib/db";
import { Card, Empty, Field, Money, PageHeader } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { placeOrder } from "./actions";

const SHIPPING_PER_SHOP = 5;

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const cart = await readCart();
  const groups = groupByShop(cart);

  if (groups.length === 0) {
    return (
      <>
        <PageHeader title="Checkout" />
        <Empty>Your cart is empty.</Empty>
      </>
    );
  }

  const address = await db.address.findFirst({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  const subtotal = cartTotal(cart);
  const shipping = SHIPPING_PER_SHOP * groups.length;

  return (
    <>
      <PageHeader
        title="Checkout"
        subtitle="Your order is split across shops — each one ships and charges shipping separately."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Shipping address</h2>
          <ActionForm action={placeOrder} submitLabel="Place order">
            <Field
              label="Full name"
              name="fullName"
              required
              defaultValue={address?.fullName ?? user.name ?? ""}
            />
            <Field
              label="Address"
              name="line1"
              required
              defaultValue={address?.line1 ?? ""}
            />
            <Field
              label="Apartment, suite (optional)"
              name="line2"
              defaultValue={address?.line2 ?? ""}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="City"
                name="city"
                required
                defaultValue={address?.city ?? ""}
              />
              <Field
                label="State / region"
                name="region"
                required
                defaultValue={address?.region ?? ""}
              />
              <Field
                label="Postal code"
                name="postalCode"
                required
                defaultValue={address?.postalCode ?? ""}
              />
              <Field
                label="Country"
                name="country"
                required
                defaultValue={address?.country ?? "US"}
              />
            </div>
            <Field
              label="Phone (optional)"
              name="phone"
              type="tel"
              defaultValue={address?.phone ?? ""}
            />
          </ActionForm>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Order summary</h2>
          {groups.map((group) => (
            <Card key={group.shop.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-medium">{group.shop.name}</span>
                <span className="text-sm text-[--color-muted]">
                  <Money value={group.subtotal} /> + <Money value={SHIPPING_PER_SHOP} />{" "}
                  shipping
                </span>
              </div>
              <ul className="space-y-1 text-sm text-[--color-muted]">
                {group.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.variant.product.title} — {item.variant.name} ×{" "}
                      {item.quantity}
                    </span>
                    <span>
                      <Money value={Number(item.variant.price) * item.quantity} />
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          <dl className="space-y-1 border-t border-[--color-border] pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>
                <Money value={subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping ({groups.length} shops)</dt>
              <dd>
                <Money value={shipping} />
              </dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={subtotal + shipping} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
