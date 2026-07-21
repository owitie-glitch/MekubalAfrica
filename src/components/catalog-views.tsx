"use client";

import { useState } from "react";
import { ProductCard, type CardProduct } from "./product-card";
import { QuickView } from "./quick-view";
import { DragRow } from "./motion";

/** Grid of products with quick-view wired in. */
export function ProductGrid({
  products,
  columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: {
  products: CardProduct[];
  columns?: string;
}) {
  const [quick, setQuick] = useState<CardProduct | null>(null);

  return (
    <>
      <div className={`grid gap-x-4 gap-y-10 ${columns}`}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onQuickView={setQuick} />
        ))}
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}

/**
 * The draggable filmstrip from the reference: captions sit in a row above the
 * images, and both scroll together as one strip.
 */
export function ProductRail({ products }: { products: CardProduct[] }) {
  const [quick, setQuick] = useState<CardProduct | null>(null);

  return (
    <>
      <DragRow ariaLabel="Featured pieces" className="gap-4 px-5 md:px-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] lg:w-[23vw]"
          >
            <ProductCard product={p} onQuickView={setQuick} />
          </div>
        ))}
      </DragRow>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
