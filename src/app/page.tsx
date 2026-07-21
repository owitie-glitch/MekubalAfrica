import Link from "next/link";
import { db } from "@/lib/db";
import { cardInclude, toCard, publicProductWhere } from "@/lib/catalog";
import { ProductRail, ProductGrid } from "@/components/catalog-views";
import { Reveal, Marquee } from "@/components/motion";
import { SectionHead } from "@/components/ui";

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
              <h1 className="display text-[clamp(2.75rem,9vw,8.5rem)]">
                {lead ? (
                  <>
                    NEW <span className="text-grey-400">{lead.name}</span>
                    <br />
                    ORNAMENT
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
                {["BRASS", "SOAPSTONE", "SISAL", "OLIVE WOOD"].map((m) => (
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
                className="group flex h-full min-h-40 flex-col justify-between bg-white p-5 transition-colors hover:bg-black hover:text-white"
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

      {/* ------------------------------------------------------- story */}
      <section className="mx-auto mt-28 max-w-[1600px] px-5 md:px-8">
        <Reveal>
          <div className="grid gap-10 border-t border-grey-200 pt-14 lg:grid-cols-[1fr_1fr]">
            <h2 className="display text-[clamp(1.75rem,5vw,4rem)]">
              EVERY PIECE
              <br />
              HAS A MAKER&apos;S
              <br />
              NAME ON IT
            </h2>
            <div className="max-w-lg space-y-4 text-sm leading-relaxed text-grey-600 lg:pt-2">
              <p>
                Mekubal Africa works directly with artisans across
                Kenya — brass casters in Nairobi, soapstone carvers in Kisii,
                beadworkers in Kajiado, weavers in Kisumu.
              </p>
              <p>
                Each piece is made by hand, so small variations in colour, grain
                and finish are the signature of the work rather than a fault.
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
