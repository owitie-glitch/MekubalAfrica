import Link from "next/link";
import { db } from "@/lib/db";
import { cardInclude, toCard, publicProductWhere } from "@/lib/catalog";
import { ProductRail, ProductGrid } from "@/components/catalog-views";
import { Reveal, Marquee, DragRow } from "@/components/motion";
import { SectionHead } from "@/components/ui";
import { lookbook } from "@/lib/lookbook";

export default async function HomePage() {
  const [featured, latest, collections, categories] = await Promise.all([
    db.product.findMany({
      where: { ...publicProductWhere, featured: true },
      include: cardInclude,
      take: 8,
    }),
    db.product.findMany({
      where: publicProductWhere,
      include: cardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.collection.findMany({ orderBy: { position: "asc" }, take: 2 }),
    db.category.findMany({ orderBy: { position: "asc" }, take: 5 }),
  ]);

  const [lead, second] = collections;

  return (
    <div>
      {/* ---------------------------------------------------------- hero */}
      <section className="pt-6">
        <Reveal>
          <ProductRail products={featured.map(toCard)} />
        </Reveal>

        <div className="mx-auto mt-16 max-w-[1600px] px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <Reveal>
              {/* Bodoni is a wide face, so the vw term — not the floor — is
                  what governs phone width. 7vw keeps "THE BEADWORK" on one line
                  inside a 360px screen while still filling a desktop hero. */}
              <h1 className="display text-[clamp(1.75rem,7vw,9rem)] font-normal">
                {lead ? (
                  <>
                    THE <span className="text-grey-400">{lead.name}</span>
                    <br />
                    COLLECTION
                  </>
                ) : (
                  <>
                    HANDMADE
                    <br />
                    IN EAST
                    <br />
                    AFRICA
                  </>
                )}
              </h1>
            </Reveal>

            <Reveal delay={120} className="lg:pb-6">
              <div className="flex flex-wrap items-center gap-8 opacity-40">
                {["GLASS BEADS", "BRASS", "LEATHER", "SISAL"].map((m) => (
                  <span key={m} className="display text-lg">
                    {m}
                  </span>
                ))}
              </div>

              <Link
                href={lead ? `/shop?collection=${lead.slug}` : "/shop"}
                className="link-underline eyebrow mt-10 inline-flex items-center gap-3"
              >
                Discover the collection
                <span aria-hidden>⟶</span>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-grey-600">
                {lead?.description ??
                  "Hand-made pieces from artisans across Kenya. No two are identical."}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mt-20">
        <Marquee
          words={[
            "HAND-MADE IN KENYA",
            "ONE-OF-A-KIND PIECES",
            "MADE BY NAMED ARTISANS",
            "SHIPPED WORLDWIDE",
          ]}
        />
      </div>

      {/* ---------------------------------------------------- categories */}
      <section className="mx-auto mt-24 max-w-[1600px] px-5 md:px-8">
        <SectionHead eyebrow="Browse" title="Categories" href="/shop" />
        <div className="grid grid-cols-2 gap-px bg-grey-200 md:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="group flex h-full min-h-40 flex-col justify-between bg-background p-5 transition-colors hover:bg-foreground hover:text-white"
              >
                <span className="eyebrow text-grey-400">0{i + 1}</span>
                <span className="display mt-8 text-xl leading-tight">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ campaign block */}
      {second && (
        <section className="mt-28">
          <Reveal>
            <div className="relative min-h-[70vh] overflow-hidden bg-paper">
              {second.heroImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={second.heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative mx-auto flex min-h-[70vh] max-w-[1600px] flex-col justify-end px-5 py-14 md:px-8">
                <h2 className="display max-w-4xl text-[clamp(2rem,7vw,6rem)] text-white">
                  {second.headline ?? second.name}
                </h2>
                <p className="mt-4 max-w-lg text-sm text-white/80">
                  {second.description}
                </p>
                <Link
                  href={`/shop?collection=${second.slug}`}
                  className="link-underline eyebrow mt-8 inline-flex w-fit items-center gap-3 text-white"
                >
                  Shop {second.name}
                  <span aria-hidden>⟶</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* -------------------------------------------------- latest grid */}
      <section className="mx-auto mt-28 max-w-[1600px] px-5 md:px-8">
        <SectionHead
          eyebrow="Just added"
          title="New arrivals"
          href="/shop?sort=newest"
        />
        <Reveal>
          <ProductGrid products={latest.map(toCard)} />
        </Reveal>
      </section>

      {/* ---------------------------------------------------- lookbook */}
      <section className="mt-28">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8">
          <SectionHead
            eyebrow="Westlands Market, Nairobi"
            title="Inside the shop"
            href="/contact"
            hrefLabel="Visit us"
          />
        </div>
        <Reveal>
          {/* Full-bleed: these are wide, dim interiors and they need room. */}
          <DragRow ariaLabel="Photographs from the shop" className="gap-3 px-5 md:px-8">
            {lookbook.map((shot, i) => (
              <figure
                key={shot.url}
                className={`shrink-0 snap-start ${
                  i % 3 === 0 ? "w-[86vw] lg:w-[46vw]" : "w-[70vw] lg:w-[30vw]"
                }`}
              >
                <div className="aspect-4/3 overflow-hidden bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.url}
                    alt={shot.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-xs text-grey-600">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </DragRow>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- story */}
      <section className="mx-auto mt-28 max-w-[1600px] px-5 md:px-8">
        <Reveal>
          <div className="grid gap-12 border-t border-grey-200 pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            {/* Italic Didone, mixed case. Caps would shout; this is the one
                place on the page allowed to be quiet and expensive. */}
            <h2 className="display-quote text-[clamp(2rem,5.5vw,4.25rem)]">
              Every piece carries
              <br />
              the hand that
              <br />
              made it.
            </h2>
            <div className="max-w-lg space-y-5 text-sm leading-[1.75] text-grey-600 lg:pt-3">
              <p>
                Mekubal Africa works with beaders and metalworkers across Kenya.
                Every collar, cuff and bangle is strung and stitched by hand, one
                bead at a time.
              </p>
              <p>
                Small variations in colour, spacing and finish are the signature
                of that work rather than a fault — no two pieces leave the shop
                identical.
              </p>
              <Link href="/about" className="link-underline eyebrow inline-block">
                Read more →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
