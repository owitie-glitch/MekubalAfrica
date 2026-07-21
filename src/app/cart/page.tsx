import Link from "next/link";
import type { Metadata } from "next";
import { readCart, cartTotal, cartCount } from "@/lib/cart";
import { Empty, Money } from "@/components/ui";
import { updateQuantity, removeItem } from "./actions";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await readCart();
  const items = cart?.items ?? [];
  const subtotal = cartTotal(cart);
  const count = cartCount(cart);

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-10 pb-24 md:px-8">
      <header className="border-b border-grey-200 pb-6">
        <div className="eyebrow text-grey-600">
          {count > 0 ? `${count} item${count === 1 ? "" : "s"}` : "Empty"}
        </div>
        <h1 className="display mt-3 text-[clamp(2.5rem,8vw,6rem)]">CART</h1>
      </header>

      {items.length === 0 ? (
        <div className="mt-12">
          <Empty>
            Your cart is empty.{" "}
            <Link href="/shop" className="link-underline text-black">
              Browse the collection
            </Link>
            .
          </Empty>
        </div>
      ) : (
        <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Flat list — one seller, one shipment. */}
          <ul className="border-t border-grey-200">
            {items.map((item) => {
              const product = item.variant.product;
              const image = product.images[0];
              const unitPrice = Number(item.variant.price);
              const atStockLimit = item.quantity >= item.variant.inventory;

              return (
                <li
                  key={item.id}
                  className="flex gap-5 border-b border-grey-200 py-8 md:gap-8"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="h-32 w-24 shrink-0 overflow-hidden bg-paper md:h-40 md:w-32"
                  >
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt={image.alt ?? product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-1">
                      <Link
                        href={`/product/${product.slug}`}
                        className="link-underline text-sm font-medium"
                      >
                        {product.title}
                      </Link>
                      <span className="text-sm tabular-nums">
                        <Money value={unitPrice * item.quantity} />
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-grey-600">
                      {item.variant.name}
                    </p>
                    <p className="mt-0.5 text-xs text-grey-600 tabular-nums">
                      <Money value={unitPrice} /> each
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-5">
                      {/* Button `value` carries the new quantity, so each step
                          is a plain submit and works without JavaScript. */}
                      <form
                        action={updateQuantity}
                        className="flex items-center border border-grey-200"
                      >
                        <input
                          type="hidden"
                          name="cartItemId"
                          value={item.id}
                        />
                        <button
                          type="submit"
                          name="quantity"
                          value={item.quantity - 1}
                          aria-label={`Decrease quantity of ${product.title}`}
                          className="px-3 py-1.5 text-sm transition-colors hover:bg-grey-100 focus-visible:bg-grey-100"
                        >
                          −
                        </button>
                        <span className="min-w-9 text-center text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="submit"
                          name="quantity"
                          value={item.quantity + 1}
                          disabled={atStockLimit}
                          aria-label={`Increase quantity of ${product.title}`}
                          className="px-3 py-1.5 text-sm transition-colors hover:bg-grey-100 focus-visible:bg-grey-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </form>

                      <form action={removeItem}>
                        <input
                          type="hidden"
                          name="cartItemId"
                          value={item.id}
                        />
                        <button
                          type="submit"
                          aria-label={`Remove ${product.title} from cart`}
                          className="link-underline text-[11px] text-grey-600"
                        >
                          Remove
                        </button>
                      </form>

                      {atStockLimit && (
                        <span className="text-[11px] text-grey-600">
                          Only {item.variant.inventory} in stock
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-8">
            <h2 className="eyebrow border-b border-grey-200 pb-4 text-grey-600">
              Summary
            </h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-grey-600">Subtotal</dt>
                <dd className="tabular-nums">
                  <Money value={subtotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-grey-600">Shipping</dt>
                <dd className="text-grey-600">Calculated at checkout</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-baseline justify-between border-t border-grey-200 pt-6">
              <span className="eyebrow">Total</span>
              <span className="text-lg font-semibold tabular-nums">
                <Money value={subtotal} />
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-8 block bg-black px-6 py-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors duration-300 hover:bg-neutral-800"
            >
              Checkout
            </Link>

            <Link
              href="/shop"
              className="link-underline eyebrow mt-6 inline-block text-grey-600"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
