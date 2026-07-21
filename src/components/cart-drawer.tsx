"use client";

import Link from "next/link";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";

export function CartDrawer() {
  const { open, closeCart, items, subtotal, count, busy, notice, setQuantity } =
    useCart();

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Cart"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-grey-200 px-6 py-5">
          <span className="eyebrow">
            Cart {count > 0 && `(${count})`}
          </span>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-xl leading-none transition-transform hover:rotate-90"
          >
            ×
          </button>
        </header>

        {notice && (
          <p className="border-b border-grey-200 bg-grey-100 px-6 py-3 text-xs text-grey-600">
            {notice}
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm text-grey-600">Your cart is empty.</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="link-underline eyebrow mt-4 inline-block"
              >
                Browse the collection
              </Link>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-grey-200 px-6 py-5"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="h-24 w-20 shrink-0 overflow-hidden bg-grey-100"
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="link-underline text-sm font-medium"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-grey-600">
                      {item.variantName}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-grey-200">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          disabled={busy}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="px-2.5 py-1 text-sm hover:bg-grey-100 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          disabled={busy || item.quantity >= item.inventory}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="px-2.5 py-1 text-sm hover:bg-grey-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm tabular-nums">
                        {formatMoney(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => setQuantity(item.id, 0)}
                      disabled={busy}
                      className="link-underline mt-2 text-[11px] text-grey-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-grey-200 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-grey-600">Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-grey-600">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 block bg-black px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800"
            >
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
