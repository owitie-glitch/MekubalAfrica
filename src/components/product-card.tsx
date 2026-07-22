"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";
import { isEnquiry, PRICE_ON_REQUEST } from "@/lib/pricing";

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

  const enquiry = isEnquiry(product.priceMin);
  const soldOut = !enquiry && product.variants.every((v) => v.inventory < 1);
  const single =
    !enquiry && product.variants.length === 1 ? product.variants[0] : null;
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url ?? primary;

  return (
    <article
      className={`group ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* The overlay anchors to THIS box, not the article — otherwise
          `bottom-0` resolves to the bottom of the whole card and the buttons
          land on top of the title. */}
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          {/* 3:4 matches the source photographs exactly, so nothing is cropped
            — a 4:5 frame clipped the ends off the long fringed collars. The
            ring gives the shots an edge; they are lit on white fabric and
            would otherwise bleed into a white page. */}
        <div className="relative aspect-3/4 overflow-hidden bg-paper ring-1 ring-foreground/8">
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
              <span className="absolute left-3 top-3 bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                Sold out
              </span>
            )}
          </div>
        </Link>

        {/* Slides up over the bottom of the image on hover. Hidden on touch,
            where there is no hover and the whole card already opens the
            product — permanently covering the photograph is a worse trade. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 p-3 opacity-0 transition-all duration-300 md:block group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="flex gap-2">
            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                className="flex-1 bg-background/95 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur transition-colors hover:bg-foreground hover:text-white"
              >
                Quick view
              </button>
            )}
            {single && !soldOut && (
              <button
                onClick={() => add(single.id)}
                disabled={busy}
                className="flex-1 bg-foreground py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-foreground/85 disabled:opacity-40"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stacked, not a justified row: "Price on request" beside a title is
          too wide for a two-up mobile card and was clipping off the edge. */}
      <div className="pt-3">
        <Link
          href={`/product/${product.slug}`}
          className="link-underline block text-sm font-medium leading-snug"
        >
          {product.title}
        </Link>
        <p
          className={`mt-1.5 text-sm ${
            enquiry ? "text-grey-600" : "tabular-nums"
          }`}
        >
          {enquiry ? PRICE_ON_REQUEST : formatMoney(product.priceMin)}
        </p>
        <p className="mt-0.5 text-xs text-grey-400">
          {product.material ?? product.categoryName}
        </p>
      </div>
    </article>
  );
}
