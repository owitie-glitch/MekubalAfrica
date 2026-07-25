import Link from "next/link";

// Right-hand artwork; falls back to a product photo until /hero-art.png exists.
const FALLBACK_ART = "/uploads/maasai-beaded-leather-cuff-1.webp";

const FEATURES = [
  {
    title: "Handcrafted",
    sub: "Made by skilled artisans",
    icon: (
      <path d="M9 11V6a1.5 1.5 0 013 0v4m0-1a1.5 1.5 0 013 0v2m0-1a1.5 1.5 0 013 0v4a6 6 0 01-6 6h-1.7a4 4 0 01-2.9-1.2L5 15.5a1.6 1.6 0 012.3-2.2L9 15" />
    ),
  },
  {
    title: "Sustainable",
    sub: "Ethical materials & processes",
    icon: (
      <path d="M20 4S9 3 6 9c-2.5 5 1 9 1 9s7 1 10-4c2-3.3 3-10 3-10zM7 18C10 12 15 9 18 8" />
    ),
  },
  {
    title: "Authentically African",
    sub: "Rooted in culture & tradition",
    icon: (
      <path d="M12 3c2 3 2 5 0 8s-2 7 0 10M8 7c1.5 2 1.5 3.5 0 5.5m8-5.5c-1.5 2-1.5 3.5 0 5.5" />
    ),
  },
  {
    title: "Made with Purpose",
    sub: "Beauty that empowers",
    icon: (
      <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0112 8a3.7 3.7 0 017 2.7C19 15.7 12 20 12 20z" />
    ),
  },
];

/**
 * Landing hero: warm editorial split — headline, script line, copy and two
 * calls to action on the left; a piece of artwork on the right; a strip of
 * brand promises beneath. Real, responsive markup. Drop the artwork at
 * /hero-art.png; until then a product photograph fills the frame.
 */
export function HeroLanding({ collectionSlug }: { collectionSlug?: string | null }) {
  const shopHref = collectionSlug ? `/shop?collection=${collectionSlug}` : "/shop";

  return (
    <section className="mx-auto max-w-[1600px] px-5 pt-6 md:px-8 md:pt-10">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.08fr] lg:gap-14">
        {/* copy */}
        <div className="order-2 lg:order-1">
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-grey-600">
            <span>Handcrafted</span>
            <span className="text-rust">•</span>
            <span>African Heritage</span>
            <span className="text-rust">•</span>
            <span>Timeless Design</span>
          </p>

          <h1 className="font-display mt-6 text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] font-medium">
            Celebrate Africa
            <br />
            Through <span className="text-rust">Handmade Art.</span>
          </h1>

          <p className="script mt-5 inline-block text-[clamp(1.6rem,3vw,2.1rem)] leading-none text-foreground/80 underline decoration-foreground/25 decoration-1 underline-offset-8">
            Every piece tells a story.
          </p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-grey-600">
            Discover handcrafted ornaments, wall décor, sculptures, woven baskets
            and unique African-inspired pieces made to transform your space.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={shopHref}
              className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground/85"
            >
              Shop Collection
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-foreground px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-white"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* artwork */}
        <div className="order-1 lg:order-2">
          <div
            className="aspect-4/3 w-full rounded-[1.75rem] bg-paper bg-cover bg-center lg:aspect-3/4"
            style={{
              backgroundImage: `url('/hero-art.png'), url('${FALLBACK_ART}')`,
            }}
            role="img"
            aria-label="Handmade African art and jewellery"
          />
        </div>
      </div>

      {/* brand promises */}
      <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-grey-200 pt-8 md:mt-16 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-grey-200 text-foreground">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {f.icon}
              </svg>
            </span>
            <span>
              <span className="block text-sm font-semibold">{f.title}</span>
              <span className="block text-xs text-grey-600">{f.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
