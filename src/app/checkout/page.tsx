import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readCart, cartTotal } from "@/lib/cart";
import { db } from "@/lib/db";
import { Empty, Field, Money } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { placeOrder } from "./actions";

export const metadata: Metadata = { title: "Checkout" };

// Mirrors SHIPPING_FLAT in ./actions — the action is the authority; this copy
// only renders the figure.
const SHIPPING_FLAT = 500;

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const cart = await readCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-10 pb-24 md:px-8">
        <h1 className="display text-[clamp(2.5rem,8vw,5rem)]">CHECKOUT</h1>
        <div className="mt-10">
          <Empty>
            Your cart is empty.{" "}
            <Link href="/shop" className="link-underline text-foreground">
              Browse the collection
            </Link>
            .
          </Empty>
        </div>
      </div>
    );
  }

  const address = await db.address.findFirst({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  const subtotal = cartTotal(cart);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 pb-24 md:px-8">
      <header className="border-b border-grey-200 pb-6">
        <div className="eyebrow text-grey-600">Secure checkout</div>
        <h1 className="display mt-3 text-[clamp(2.5rem,8vw,5rem)]">CHECKOUT</h1>
      </header>

      <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_340px] lg:items-start">
        <section aria-labelledby="delivery-heading">
          <h2
            id="delivery-heading"
            className="eyebrow border-b border-grey-200 pb-4 text-grey-600"
          >
            Delivery address
          </h2>

          <div className="mt-8">
            <ActionForm action={placeOrder} submitLabel="Place order">
              <Field
                label="Full name"
                name="fullName"
                required
                autoComplete="name"
                defaultValue={address?.fullName ?? user.name ?? ""}
              />
              <Field
                label="Address"
                name="line1"
                required
                autoComplete="address-line1"
                defaultValue={address?.line1 ?? ""}
              />
              <Field
                label="Apartment, suite (optional)"
                name="line2"
                autoComplete="address-line2"
                defaultValue={address?.line2 ?? ""}
              />
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field
                  label="City"
                  name="city"
                  required
                  autoComplete="address-level2"
                  defaultValue={address?.city ?? ""}
                />
                <Field
                  label="County / region"
                  name="region"
                  required
                  autoComplete="address-level1"
                  defaultValue={address?.region ?? ""}
                />
                <Field
                  label="Postal code"
                  name="postalCode"
                  required
                  autoComplete="postal-code"
                  defaultValue={address?.postalCode ?? ""}
                />
                <Field
                  label="Country"
                  name="country"
                  required
                  autoComplete="country-name"
                  defaultValue={address?.country ?? "Kenya"}
                />
              </div>
              <Field
                label="Phone (optional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={address?.phone ?? ""}
              />
            </ActionForm>
          </div>
        </section>

        <aside aria-labelledby="summary-heading" className="lg:sticky lg:top-8">
          <h2
            id="summary-heading"
            className="eyebrow border-b border-grey-200 pb-4 text-grey-600"
          >
            Order summary
          </h2>

          <ul className="border-b border-grey-200">
            {items.map((item) => {
              const product = item.variant.product;
              const image = product.images[0];
              return (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-grey-200 py-5 last:border-b-0"
                >
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-paper">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt={image.alt ?? product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{product.title}</p>
                    <p className="mt-0.5 text-xs text-grey-600">
                      {item.variant.name} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">
                    <Money value={Number(item.variant.price) * item.quantity} />
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-grey-600">Subtotal</dt>
              <dd className="tabular-nums">
                <Money value={subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey-600">Shipping</dt>
              <dd className="tabular-nums">
                <Money value={SHIPPING_FLAT} />
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-baseline justify-between border-t border-grey-200 pt-6">
            <span className="eyebrow">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              <Money value={subtotal + SHIPPING_FLAT} />
            </span>
          </div>

          <Link
            href="/cart"
            className="link-underline eyebrow mt-6 inline-block text-grey-600"
          >
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
