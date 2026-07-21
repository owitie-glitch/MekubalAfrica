"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-store";
import { formatMoney } from "@/components/ui";
import type { CardProduct } from "@/components/product-card";

/** Variant choice, quantity and add-to-cart. The drawer opens itself on add. */
export function BuyPanel({ product }: { product: CardProduct }) {
  const { add, busy } = useCart();

  const allSoldOut = product.variants.every((v) => v.inventory < 1);
  const [variantId, setVariantId] = useState(
    () =>
      product.variants.find((v) => v.inventory > 0)?.id ??
      product.variants[0]?.id ??
      null,
  );
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const soldOut = !variant || variant.inventory < 1;
  const max = Math.max(1, variant?.inventory ?? 1);

  const choose = (id: string, inventory: number) => {
    setVariantId(id);
    // A shorter-stocked variant must not inherit the previous quantity.
    setQuantity((n) => Math.min(n, Math.max(1, inventory)));
  };

  return (
    <div>
      <p className="mt-4 text-xl tabular-nums">
        {formatMoney(variant?.price ?? product.priceMin)}
      </p>

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
                className={`border px-4 py-2.5 text-xs outline-none transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                  v.id === variantId
                    ? "border-black bg-black text-white"
                    : "border-grey-200 hover:border-black"
                }`}
              >
                {v.name}
                <span className="ml-2 text-grey-400">{formatMoney(v.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {allSoldOut ? (
        <p className="mt-8 border border-grey-200 px-4 py-4 text-sm text-grey-600">
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
            <div className="flex items-center border border-grey-200">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                disabled={quantity <= 1}
                className="h-full px-4 text-lg leading-none outline-none transition-colors hover:bg-grey-100 focus-visible:ring-1 focus-visible:ring-black disabled:opacity-30"
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
                className="h-full px-4 text-lg leading-none outline-none transition-colors hover:bg-grey-100 focus-visible:ring-1 focus-visible:ring-black disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => variant && add(variant.id, quantity)}
              disabled={busy || soldOut}
              className="flex-1 bg-black py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white outline-none transition-colors duration-300 hover:bg-neutral-800 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-40"
            >
              {soldOut ? "Sold out" : busy ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
