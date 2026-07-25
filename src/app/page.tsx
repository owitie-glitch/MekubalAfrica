import Link from "next/link";
import { db } from "@/lib/db";
import { cardInclude, toCard, publicProductWhere } from "@/lib/catalog";
import { Reveal } from "@/components/motion";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatMoney } from "@/components/ui";
import { isEnquiry, PRICE_ON_REQUEST } from "@/lib/pricing";
import { lookbook } from "@/lib/lookbook";

// The three earthy tones the category tiles rotate through.
const TILE = [
  { bg: "bg-rust", shape: "leaf-tl", text: "text-white", sub: "text-white/70" },
  { bg: "bg-clay", shape: "leaf-tr", text: "text-foreground", sub: "text-foreground/60" },
  { bg: "bg-olive", shape: "leaf-br", text: "text-white", sub: "text-white/70" },
];

export default async function HomePage() {
  const [latest, collections, categories] = await Promise.all([
    db.product.findMany({
      where: publicProductWhere,
      include: cardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.collection.findMany({ orderBy: { position: "asc" }, take: 2 }),
    db.category.findMany({ orderBy: { position: "asc" }, take: 3 }),
  ]);

  const [lead] = collections;
  const gallery = latest.map(toCard).slice(0, 8);

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-24 md:px-8">
      {/* ---------------------------------------------------------- hero */}
      <section className="grid items-center gap-8 pt-8 md:pt-12 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <Reveal>
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-grey-600">
            <span>Handcrafted</span>
            <span className="text-rust">•</span>
            <span>African Heritage</span>
            <span className="text-rust">•</span>
            <span>Timeless Design</span>
          </p>
          <h1 className="font-display mt-5 text-[clamp(2.6rem,6vw,5.25rem)] leading-[1.02] font-medium">
            Handmade Beauty for <span className="text-rust">Everyday Living.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-grey-600">
            Beaded collars, brass cuffs and woven pieces — made by hand by
            artisans across Kenya, so no two are ever quite alike.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-rust px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-rust-700"
          >
            Shop Now
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <Reveal delay={100} className="order-first lg:order-none">
          <div className="arch mx-auto w-full max-w-sm overflow-hidden bg-black lg:mx-0 lg:ml-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-photo.png"
              alt="Adornment by Mekubal Africa"
              className="aspect-4/5 w-full object-cover object-top"
            />
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------ category tiles */}
      {categories.length > 0 && (
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {categories.map((c, i) => {
            const t = TILE[i % TILE.length];
            return (
              <Reveal key={c.id} delay={i * 90}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className={`group flex min-h-52 flex-col justify-between p-8 transition-transform duration-500 hover:-translate-y-1 ${t.bg} ${t.shape} ${t.text}`}
                >
                  <span className={`eyebrow ${t.sub}`}>0{i + 1}</span>
                  <span>
                    <span className="font-display block text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">
                      {c.name}
                    </span>
                    <span className={`mt-2 inline-flex items-center gap-2 text-xs ${t.sub}`}>
                      Explore
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </section>
      )}

      {/* ---------------------------------------------------- philosophy */}
      <section className="mt-24 grid items-center gap-10 lg:mt-32 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="blob mx-auto max-w-md overflow-hidden bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lookbook[0]?.url ?? "/uploads/lookbook-1.webp"}
              alt="Inside the Mekubal workshop"
              className="aspect-square h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-tight">
            Every piece carries the hand that made it.
          </h2>
          <div className="mt-6 max-w-lg space-y-4 text-sm leading-[1.75] text-grey-600">
            <p>
              Mekubal Africa works with beaders and metalworkers across Kenya.
              Every collar, cuff and bangle is strung and stitched by hand, one
              bead at a time.
            </p>
            <p>
              Small variations in colour, spacing and finish are the signature of
              that work — no two pieces leave the shop identical.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-olive px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-olive-700"
          >
            Learn more
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- gallery */}
      {gallery.length > 0 && (
        <section className="mt-24 lg:mt-32">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)]">Gallery</h2>
            <Link
              href="/shop"
              className="link-underline eyebrow shrink-0 whitespace-nowrap pb-1"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((p, i) => {
              const image = p.images[0];
              const enquiry = isEnquiry(p.priceMin);
              return (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <Link href={`/product/${p.slug}`} className="group block">
                    <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-paper">
                      {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={image.alt ?? p.title}
                          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-snug">{p.title}</p>
                    <p className="mt-0.5 text-xs text-grey-600">
                      {enquiry ? PRICE_ON_REQUEST : formatMoney(p.priceMin)}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------- newsletter */}
      <section className="mt-24 lg:mt-32">
        <div className="leaf-tr grid gap-8 bg-rust p-8 text-white md:grid-cols-[1.1fr_1fr] md:items-center md:p-14">
          <div>
            <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight">
              Stay in the loop.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              New pieces land often and the best ones go fast. Leave your email
              and we&apos;ll send word when fresh work arrives.
            </p>
          </div>
          <div className="md:pl-8">
            <NewsletterForm />
            <p className="mt-3 text-xs text-white/60">
              Or say hello on{" "}
              <Link href={`/shop?collection=${lead?.slug ?? ""}`} className="underline">
                the collection
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
