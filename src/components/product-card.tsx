"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";

export type CardProduct = {
  id: string;
  slug: string;
  title: string;
  priceMin: number;
  material: string | null;
  artisan: string | null;
  categoryName: string | null;
  images: { url: string; alt: string | null }[];
  variants: { id: string; name: string; price: number; inventory: number }[];
};

/**
 * Product tile. The second photograph swaps in on hover — the cheapest way to
 * make a monochrome grid feel alive without motion for its own sake.
 */
export function ProductCard({
  product,
  onQuickView,
  className = "",
}: {
  product: CardProduct;
  onQuickView?: (product: CardProduct) => void;
  className?: string;
}) {
  const { add, busy } = useCart();
  const [hover, setHover] = useState(false);

  const soldOut = product.variants.every((v) => v.inventory < 1);
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url ?? primary;

  return (
    <article
      className={`group relative ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-paper">
          {primary && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primary}
                alt={product.images[0]?.alt ?? product.title}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  hover && secondary !== primary ? "opacity-0" : "opacity-100"
                }`}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={secondary}
                alt=""
                aria-hidden
                className={`absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-700 ${
                  hover && secondary !== primary ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          )}

          {soldOut && (
            <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
              Sold out
            </span>
          )}
        </div>
      </Link>

      {/* Actions slide up over the image on hover; always reachable on touch. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100">
        <div className="flex gap-2">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 bg-white/95 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur transition-colors hover:bg-black hover:text-white"
            >
              Quick view
            </button>
          )}
          {single && !soldOut && (
            <button
              onClick={() => add(single.id)}
              disabled={busy}
              className="flex-1 bg-black py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-40"
            >
              Add
            </button>
          )}
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="link-underline text-sm font-medium leading-snug"
          >
            {product.title}
          </Link>
          <span className="shrink-0 text-sm tabular-nums">
            {formatMoney(product.priceMin)}
          </span>
        </div>
        <p className="mt-1 text-xs text-grey-600">
          {product.material ?? product.categoryName}
        </p>
      </div>
    </article>
  );
}
