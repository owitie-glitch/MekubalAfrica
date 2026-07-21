import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cardInclude, toCard, publicProductWhere } from "@/lib/catalog";
import { ProductRail } from "@/components/catalog-views";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/ui";
import { BuyPanel } from "./buy-panel";

const RELATED_LIMIT = 8;

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="tracking-[0.15em]">
      <span aria-hidden>{"★".repeat(rating) + "☆".repeat(5 - rating)}</span>
    </span>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { title: true, description: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return { title: "Not found" };
  return {
    title: `${product.title} — MEKUBAL`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      ...cardInclude,
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  // Same category first; a thin category falls back to the wider catalogue so
  // the rail is never a lonely one-tile strip.
  const sameCategory = product.categoryId
    ? await db.product.findMany({
        where: {
          ...publicProductWhere,
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        include: cardInclude,
        orderBy: { createdAt: "desc" },
        take: RELATED_LIMIT,
      })
    : [];

  const related =
    sameCategory.length >= 4
      ? sameCategory
      : await db.product.findMany({
          where: { ...publicProductWhere, id: { not: product.id } },
          include: cardInclude,
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: RELATED_LIMIT,
        });

  // toCard() strips the Decimals — nothing below may read product.variants
  // or product.priceMin directly on its way into a client component.
  const card = toCard(product);

  const details = [
    ["Material", product.material],
    ["Maker", product.artisan],
    ["Origin", product.origin],
    ["Dimensions", product.dimensions],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <div>
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8 md:py-14">
        <nav aria-label="Breadcrumb" className="eyebrow text-grey-600">
          <Link href="/shop" className="link-underline">
            Shop
          </Link>
          {product.category && (
            <>
              <span className="mx-2 text-grey-400">/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="link-underline"
              >
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          {/* Images stack and scroll; the detail column stays put beside them. */}
          <div className="space-y-2">
            {product.images.length === 0 && (
              <div className="aspect-3/4 bg-paper" aria-hidden />
            )}
            {product.images.map((image) => (
              <div key={image.id} className="aspect-3/4 overflow-hidden bg-paper ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? product.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start lg:pb-10">
            {product.category && (
              <span className="eyebrow text-grey-600">
                {product.category.name}
              </span>
            )}
            <h1 className="display mt-3 text-[clamp(1.85rem,4.5vw,3.5rem)]">
              {product.title}
            </h1>

            {product.ratingCount > 0 && (
              <p className="mt-4 flex items-center gap-3 text-sm">
                <Stars rating={Math.round(product.ratingAvg)} />
                <span className="text-grey-600">
                  {product.ratingAvg.toFixed(1)} · {product.ratingCount}{" "}
                  {product.ratingCount === 1 ? "review" : "reviews"}
                </span>
              </p>
            )}

            <BuyPanel product={card} />

            {product.description && (
              <div className="mt-10 border-t border-grey-200 pt-8">
                <h2 className="eyebrow text-grey-600">Description</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-grey-600">
                  {product.description.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {details.length > 0 && (
              <div className="mt-10 border-t border-grey-200 pt-8">
                <h2 className="eyebrow text-grey-600">Details</h2>
                <dl className="mt-4 divide-y divide-grey-200 text-sm">
                  {details.map(([label, value]) => (
                    <div key={label} className="flex gap-6 py-3">
                      <dt className="w-32 shrink-0 text-grey-600">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 text-xs leading-relaxed text-grey-400">
                  Made by hand, so colour, grain and finish vary a little from
                  piece to piece.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- reviews */}
      <section className="mx-auto mt-16 max-w-[1600px] px-5 md:px-8">
        <Reveal>
          <SectionHead
            eyebrow={`${product.reviews.length} in total`}
            title="Reviews"
          />
          {product.reviews.length === 0 ? (
            <p className="text-sm text-grey-600">
              No reviews yet — this piece is waiting for its first one.
            </p>
          ) : (
            <ul className="grid gap-px bg-grey-200 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.map((review) => (
                <li key={review.id} className="bg-white p-6">
                  <Stars rating={review.rating} />
                  <p className="mt-3 text-sm font-medium">
                    {review.user.name ?? "Verified buyer"}
                  </p>
                  <p className="eyebrow mt-1 text-grey-400">
                    {review.createdAt.toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {review.body && (
                    <p className="mt-4 text-sm leading-relaxed text-grey-600">
                      {review.body}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>

      {/* -------------------------------------------------------- related */}
      {related.length > 0 && (
        <section className="mt-24 pb-24">
          <div className="mx-auto max-w-[1600px] px-5 md:px-8">
            <SectionHead
              eyebrow="Keep looking"
              title="You may also like"
              href="/shop"
            />
          </div>
          <Reveal>
            <ProductRail products={related.map(toCard)} />
          </Reveal>
        </section>
      )}
    </div>
  );
}
