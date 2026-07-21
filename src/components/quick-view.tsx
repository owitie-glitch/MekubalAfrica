"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";
import { isEnquiry, enquiryUrl, PRICE_ON_REQUEST } from "@/lib/pricing";
import type { CardProduct } from "./product-card";

/** Product preview in a modal — buy without losing your place in the grid. */
export function QuickView({
  product,
  onClose,
}: {
  product: CardProduct | null;
  onClose: () => void;
}) {
  const { add, busy } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [image, setImage] = useState(0);

  // Reset selection whenever a different product is opened.
  useEffect(() => {
    if (!product) return;
    const firstInStock = product.variants.find((v) => v.inventory > 0);
    setVariantId(firstInStock?.id ?? product.variants[0]?.id ?? null);
    setImage(0);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const enquiry = isEnquiry(product.priceMin);
  const soldOut = !enquiry && (!variant || variant.inventory < 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} aria-hidden />

      <div className="relative z-10 grid max-h-[88dvh] w-full max-w-4xl grid-cols-1 overflow-y-auto bg-background md:grid-cols-2">
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-10 text-2xl leading-none transition-transform hover:rotate-90"
        >
          ×
        </button>

        <div className="bg-paper">
          <div className="aspect-3/4 overflow-hidden">
            {product.images[image] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[image].url}
                alt={product.images[image].alt ?? product.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-14 w-12 overflow-hidden border transition-colors ${
                    i === image ? "border-foreground" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 md:p-8">
          {product.categoryName && (
            <span className="eyebrow text-grey-600">{product.categoryName}</span>
          )}
          <h2 className="display mt-2 text-2xl">{product.title}</h2>
          <p className={`mt-3 text-lg ${enquiry ? "text-grey-600" : "tabular-nums"}`}>
            {enquiry
              ? PRICE_ON_REQUEST
              : formatMoney(variant?.price ?? product.priceMin)}
          </p>

          {(product.material || product.artisan) && (
            <dl className="mt-5 space-y-1.5 border-t border-grey-200 pt-5 text-xs">
              {product.material && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-grey-600">Material</dt>
                  <dd>{product.material}</dd>
                </div>
              )}
              {product.artisan && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-grey-600">Maker</dt>
                  <dd>{product.artisan}</dd>
                </div>
              )}
            </dl>
          )}

          {product.variants.length > 1 && (
            <div className="mt-5">
              <span className="eyebrow text-grey-600">Finish</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.inventory < 1}
                    className={`border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      v.id === variantId
                        ? "border-foreground bg-foreground text-white"
                        : "border-grey-200 hover:border-foreground"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variant && variant.inventory > 0 && variant.inventory <= 3 && (
            <p className="mt-4 text-xs text-grey-600">
              Only {variant.inventory} left.
            </p>
          )}

          <div className="mt-auto pt-6">
            {enquiry ? (
              <a
                href={enquiryUrl(product.title, variant?.name)}
                target="_blank"
                rel="noreferrer noopener"
                className="block w-full bg-foreground py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground/85"
              >
                Enquire on WhatsApp
              </a>
            ) : (
              <button
                onClick={() => variant && add(variant.id)}
                disabled={busy || soldOut}
                className="w-full bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground/85 disabled:opacity-40"
              >
                {soldOut ? "Sold out" : busy ? "Adding…" : "Add to cart"}
              </button>
            )}
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="link-underline eyebrow mt-4 inline-block"
            >
              Full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
