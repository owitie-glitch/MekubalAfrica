"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./cart-store";
import { formatMoney } from "./ui";
import { isEnquiry, enquiryUrl, PRICE_ON_REQUEST } from "@/lib/pricing";
import { useOrigin, absoluteUrl } from "./use-origin";
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
  const origin = useOrigin();
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
  const enquiryLink = enquiryUrl(absoluteUrl(origin, product.images[0]?.url));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="glass-backdrop absolute inset-0" onClick={onClose} aria-hidden />

      <div className="glass-panel relative z-10 grid max-h-[88dvh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl md:grid-cols-2">
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
                  className={`h-14 w-12 overflow-hidden rounded-lg border transition-colors ${
                    i === image ? "border-rust" : "border-transparent"
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
                    className={`rounded-full border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
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
                href={enquiryLink}
                target="_blank"
                rel="noreferrer noopener"
                className="block w-full rounded-full bg-rust py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-rust-700"
              >
                Enquire on WhatsApp
              </a>
            ) : (
              <button
                onClick={() => variant && add(variant.id)}
                disabled={busy || soldOut}
                className="w-full rounded-full bg-rust py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-rust-700 disabled:opacity-40"
              >
                {soldOut ? "Sold out" : busy ? "Adding…" : "Add to cart"}
              </button>
            )}
            {/* Priced pieces still get a WhatsApp enquiry option. */}
            {!enquiry && (
              <a
                href={enquiryLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
                </svg>
                Enquire on WhatsApp
              </a>
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
