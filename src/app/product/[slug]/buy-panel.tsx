"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-store";
import { formatMoney } from "@/components/ui";
import { isEnquiry, enquiryUrl, PRICE_ON_REQUEST } from "@/lib/pricing";
import { useOrigin, absoluteUrl } from "@/components/use-origin";
import type { CardProduct } from "@/components/product-card";

/** Variant choice, quantity and add-to-cart. The drawer opens itself on add. */
export function BuyPanel({ product }: { product: CardProduct }) {
  const { add, busy } = useCart();
  const origin = useOrigin();
  const enquiryLink = enquiryUrl(absoluteUrl(origin, product.images[0]?.url));

  const allSoldOut = product.variants.every((v) => v.inventory < 1);
  const [variantId, setVariantId] = useState(
    () =>
      product.variants.find((v) => v.inventory > 0)?.id ??
      product.variants[0]?.id ??
      null,
  );
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const enquiry = isEnquiry(product.priceMin);
  const soldOut = !enquiry && (!variant || variant.inventory < 1);
  const max = Math.max(1, variant?.inventory ?? 1);

  const choose = (id: string, inventory: number) => {
    setVariantId(id);
    // A shorter-stocked variant must not inherit the previous quantity.
    setQuantity((n) => Math.min(n, Math.max(1, inventory)));
  };

  return (
    <div>
      <p className={`mt-4 text-xl ${enquiry ? "text-grey-600" : "tabular-nums"}`}>
        {enquiry
          ? PRICE_ON_REQUEST
          : formatMoney(variant?.price ?? product.priceMin)}
      </p>
      {enquiry && (
        <p className="mt-2 max-w-sm text-xs text-grey-600">
          This piece is priced on enquiry — message us and we&apos;ll confirm
          the price and availability.
        </p>
      )}

      {product.variants.length > 1 && (
        <fieldset className="mt-8">
          <legend className="eyebrow text-grey-600">Finish</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => choose(v.id, v.inventory)}
                disabled={v.inventory < 1}
                aria-pressed={v.id === variantId}
                className={`rounded-full border px-4 py-2.5 text-xs outline-none transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                  v.id === variantId
                    ? "border-foreground bg-foreground text-white"
                    : "border-grey-200 hover:border-foreground"
                }`}
              >
                {v.name}
                <span className="ml-2 text-grey-400">{formatMoney(v.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {enquiry ? (
        <a
          href={enquiryLink}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-8 block w-full rounded-full bg-rust py-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white uppercase outline-none transition-colors duration-300 hover:bg-rust-700 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          Enquire on WhatsApp
        </a>
      ) : allSoldOut ? (
        <p className="mt-8 rounded-lg border border-grey-200 px-4 py-4 text-sm text-grey-600">
          Sold out. Every piece is made by hand — write to us and we will say
          when the next one is ready.
        </p>
      ) : (
        <>
          {variant && variant.inventory > 0 && variant.inventory <= 3 && (
            <p className="mt-6 text-xs text-grey-600">
              Only {variant.inventory} left.
            </p>
          )}

          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center overflow-hidden rounded-full border border-grey-200">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                disabled={quantity <= 1}
                className="h-full px-4 text-lg leading-none outline-none transition-colors hover:bg-grey-100 focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-30"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="w-10 text-center text-sm tabular-nums"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((n) => Math.min(max, n + 1))}
                disabled={quantity >= max}
                className="h-full px-4 text-lg leading-none outline-none transition-colors hover:bg-grey-100 focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => variant && add(variant.id, quantity)}
              disabled={busy || soldOut}
              className="flex-1 rounded-full bg-rust py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white outline-none transition-colors duration-300 hover:bg-rust-700 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:opacity-40"
            >
              {soldOut ? "Sold out" : busy ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </>
      )}

      {/* Every product can be taken to WhatsApp. For enquiry pieces the button
          above already does this; priced and sold-out pieces get it here too. */}
      {!enquiry && (
        <a
          href={enquiryLink}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-foreground py-4 text-center text-[11px] font-semibold tracking-[0.14em] uppercase outline-none transition-colors duration-300 hover:bg-foreground hover:text-white focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
          </svg>
          Enquire on WhatsApp
        </a>
      )}
    </div>
  );
}
