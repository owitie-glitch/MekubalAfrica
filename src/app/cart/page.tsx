import Link from "next/link";
import { readCart, groupByShop, cartTotal } from "@/lib/cart";
import { Card, Empty, Money, PageHeader } from "@/components/ui";
import { updateQuantity, removeItem } from "./actions";

export default async function CartPage() {
  const cart = await readCart();
  const groups = groupByShop(cart);
  const total = cartTotal(cart);

  if (groups.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" />
        <Empty>
          Your cart is empty.{" "}
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
      <PageHeader
        title="Your cart"
        subtitle={`${groups.length} shop${groups.length === 1 ? "" : "s"} — each ships separately.`}
      />

      <div className="space-y-6">
        {groups.map((group) => (
          <Card key={group.shop.id}>
            <div className="mb-4 flex items-baseline justify-between border-b border-[--color-border] pb-3">
              <Link
                href={`/shops/${group.shop.slug}`}
                className="font-semibold hover:underline"
              >
                {group.shop.name}
              </Link>
              <span className="text-sm text-[--color-muted]">
                Subtotal <Money value={group.subtotal} />
              </span>
            </div>

            <ul className="space-y-4">
              {group.items.map((item) => {
                const image = item.variant.product.images[0];
                return (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={image.alt ?? item.variant.product.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/products/${item.variant.product.slug}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.variant.product.title}
                      </Link>
                      <div className="text-xs text-[--color-muted]">
                        {item.variant.name}
                      </div>
                      <div className="mt-1 text-sm">
                        <Money value={item.variant.price} /> each
                      </div>

                      <form
                        action={updateQuantity}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input type="hidden" name="cartItemId" value={item.id} />
                        <input
                          type="number"
                          name="quantity"
                          defaultValue={item.quantity}
                          min={0}
                          max={item.variant.inventory}
                          className="w-16 rounded-lg border border-[--color-border] px-2 py-1 text-sm"
                        />
                        <button
                          type="submit"
                          className="text-sm underline hover:no-underline"
                        >
                          Update
                        </button>
                        <button
                          type="submit"
                          formAction={removeItem}
                          className="text-sm text-red-700 underline hover:no-underline"
                        >
                          Remove
                        </button>
                      </form>
                    </div>

                    <div className="text-sm font-medium">
                      <Money value={Number(item.variant.price) * item.quantity} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[--color-border] pt-4">
        <span className="text-lg font-semibold">
          Total <Money value={total} />
        </span>
        <Link
          href="/checkout"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Checkout
        </Link>
      </div>
      <p className="mt-2 text-xs text-[--color-muted]">
        Shipping is calculated per shop at checkout.
      </p>
    </>
  );
}
