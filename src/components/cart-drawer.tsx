"use client";

import Link from "next/link";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";
import { orderUrl } from "@/lib/pricing";

export function CartDrawer() {
  const { open, closeCart, items, subtotal, count, busy, notice, setQuantity } =
    useCart();

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden
        className={`glass-backdrop fixed inset-0 z-40 transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Cart"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-background transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-grey-100"
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
                      <div className="flex items-center overflow-hidden rounded-full border border-grey-200">
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
              Delivery &amp; payment confirmed on WhatsApp.
            </p>
            <a
              href={orderUrl(items, subtotal)}
              target="_blank"
              rel="noreferrer noopener"
              onClick={closeCart}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-rust px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-rust-700"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
              </svg>
              Order on WhatsApp
            </a>
          </footer>
        )}
      </aside>
    </>
  );
}
