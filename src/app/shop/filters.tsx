"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = { slug: string; name: string };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/**
 * Live filter bar. Every control rewrites the query string with
 * router.replace(), so results update in place and the URL stays shareable —
 * no filter state is held anywhere the address bar can't reproduce.
 *
 * The results grid is passed in as children so the bar can dim it while a
 * transition is in flight without lifting pending state into the server page.
 */
export function ShopFilters({
  categories,
  collections,
  children,
}: {
  categories: Option[];
  collections: Option[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const category = params.get("category");
  const collection = params.get("collection");
  const sort = params.get("sort") ?? "newest";
  const anyActive = Boolean(
    q || category || collection || params.get("material") || params.get("sort"),
  );

  const [text, setText] = useState(q);
  const textRef = useRef(text);
  textRef.current = text;

  const apply = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any change to the filters invalidates the current page number.
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  };

  // Keep the input in step when the URL changes from outside the bar —
  // back/forward, or the "clear" links in the empty state.
  useEffect(() => {
    if (q !== textRef.current) setText(q);
  }, [q]);

  // Debounced search: one navigation per pause in typing, not per keystroke.
  useEffect(() => {
    if (text === q) return;
    const timer = setTimeout(() => apply({ q: text || null }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, q]);

  const pill = (active: boolean) =>
    `border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 ${
      active
        ? "border-foreground bg-foreground text-white"
        : "border-grey-200 hover:border-foreground"
    }`;

  return (
    <>
      <div className="mt-8 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <fieldset>
              <legend className="eyebrow text-grey-600">Category</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => apply({ category: null })}
                  aria-pressed={!category}
                  className={pill(!category)}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() =>
                      apply({ category: category === c.slug ? null : c.slug })
                    }
                    aria-pressed={category === c.slug}
                    className={pill(category === c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {collections.length > 0 && (
              <fieldset>
                <legend className="eyebrow text-grey-600">Collection</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {collections.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() =>
                        apply({
                          collection: collection === c.slug ? null : c.slug,
                        })
                      }
                      aria-pressed={collection === c.slug}
                      className={pill(collection === c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <label className="block w-full sm:w-64">
              <span className="eyebrow text-grey-600">Search</span>
              <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Brass, soapstone, bowl…"
                className="mt-2 w-full border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-foreground"
              />
            </label>

            <label className="block">
              <span className="eyebrow text-grey-600">Sort</span>
              <select
                value={sort}
                onChange={(e) =>
                  apply({
                    sort: e.target.value === "newest" ? null : e.target.value,
                  })
                }
                className="mt-2 w-full border-b border-grey-200 bg-transparent py-2.5 pr-6 text-sm outline-none transition-colors focus:border-foreground"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex h-5 items-center justify-between border-t border-grey-200 pt-4">
          <span
            aria-live="polite"
            className={`eyebrow text-grey-400 transition-opacity duration-300 ${
              pending ? "opacity-100" : "opacity-0"
            }`}
          >
            Updating…
          </span>

          {anyActive && (
            <button
              type="button"
              onClick={() => {
                setText("");
                startTransition(() => router.replace(pathname));
              }}
              className="link-underline eyebrow outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Slow fade so a fast transition finishes before the dim is visible. */}
      <div
        aria-busy={pending}
        className={`transition-opacity duration-500 ${
          pending ? "opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
