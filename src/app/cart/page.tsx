import Link from "next/link";
import type { Metadata } from "next";
import { readCart, cartTotal, cartCount } from "@/lib/cart";
import { Empty, Money } from "@/components/ui";
import { orderUrl } from "@/lib/pricing";
import { updateQuantity, removeItem } from "./actions";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await readCart();
  const items = cart?.items ?? [];
  const subtotal = cartTotal(cart);
  const count = cartCount(cart);

  const orderLines = items.map((item) => ({
    title: item.variant.product.title,
    variantName: item.variant.name,
    quantity: item.quantity,
    unitPrice: Number(item.variant.price),
  }));

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
            <Link href="/shop" className="link-underline text-foreground">
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
                    className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-paper md:h-40 md:w-32"
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
                        className="flex items-center overflow-hidden rounded-full border border-grey-200"
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
                <dd className="text-grey-600">Confirmed on WhatsApp</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-baseline justify-between border-t border-grey-200 pt-6">
              <span className="eyebrow">Total</span>
              <span className="text-lg font-semibold tabular-nums">
                <Money value={subtotal} />
              </span>
            </div>

            <a
              href={orderUrl(orderLines, subtotal)}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-rust px-6 py-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors duration-300 hover:bg-rust-700"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
              </svg>
              Order on WhatsApp
            </a>

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
