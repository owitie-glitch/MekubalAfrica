"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades and lifts children into view once. Uses IntersectionObserver rather
 * than scroll handlers so it costs nothing on the main thread, and the CSS
 * honours prefers-reduced-motion by starting visible.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Endless scrolling strip. The content is duplicated so the loop is seamless. */
export function Marquee({ words }: { words: string[] }) {
  const run = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-grey-200 py-4">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {run.map((word, i) => (
          <span key={i} className="eyebrow flex items-center gap-10 text-grey-600">
            {word}
            <span className="h-1 w-1 rounded-full bg-grey-400" />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal filmstrip you can drag, swipe, or arrow through. Native scroll
 * does the work — pointer handlers only add click-drag for mouse users, so
 * touch, trackpad and keyboard all keep working untouched.
 */
export function DragRow({
  children,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, scroll: 0, moved: 0 });

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth outline-none ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        } ${className}`}
        onPointerDown={(e) => {
          // Mouse only: touch already scrolls natively, and hijacking it
          // breaks momentum scrolling on phones.
          if (e.pointerType !== "mouse") return;
          const el = ref.current!;
          setDragging(true);
          start.current = { x: e.clientX, scroll: el.scrollLeft, moved: 0 };
          el.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const el = ref.current!;
          const dx = e.clientX - start.current.x;
          start.current.moved = Math.abs(dx);
          el.scrollLeft = start.current.scroll - dx;
        }}
        onPointerUp={(e) => {
          if (!dragging) return;
          setDragging(false);
          ref.current?.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => setDragging(false)}
        // A drag that ends over a card must not also register as a click.
        onClickCapture={(e) => {
          if (start.current.moved > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>

      {[-1, 1].map((dir) => (
        <button
          key={dir}
          type="button"
          aria-label={dir === -1 ? "Scroll left" : "Scroll right"}
          onClick={() => scrollBy(dir as 1 | -1)}
          className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-grey-200 bg-white/90 opacity-0 backdrop-blur transition-opacity duration-300 group-hover/row:opacity-100 hover:bg-black hover:text-white md:flex ${
            dir === -1 ? "left-2" : "right-2"
          }`}
        >
          {dir === -1 ? "←" : "→"}
        </button>
      ))}
    </div>
  );
}
