import Link from "next/link";
import { db } from "@/lib/db";
import {
  ArrowButton,
  AvatarStack,
  HeroDots,
  Pill,
  Stars,
  Tile,
} from "@/components/landing";

// Category accents for the "Shop by category" tile. Purely decorative — the
// data model has no colour, and the marketplace is not category-specific.
const ACCENTS = ["#4f7df0", "#f59e0b", "#22c55e", "#ef4444", "#22d3ee"];

export default async function Home() {
  const [featured, shops, productCount, shopCount, recent, agg] =
    await Promise.all([
      db.product.findMany({
        where: { status: "ACTIVE", shop: { status: "ACTIVE" } },
        include: {
          images: { orderBy: { position: "asc" } },
          shop: { select: { slug: true, name: true, tagline: true } },
        },
        orderBy: [{ ratingAvg: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
      db.shop.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
        take: 5,
      }),
      db.product.count({
        where: { status: "ACTIVE", shop: { status: "ACTIVE" } },
      }),
      db.shop.count({ where: { status: "ACTIVE" } }),
      db.product.findMany({
        where: { status: "ACTIVE", shop: { status: "ACTIVE" } },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.product.aggregate({
        where: { status: "ACTIVE", ratingCount: { gt: 0 } },
        _avg: { ratingAvg: true },
        _sum: { ratingCount: true },
      }),
    ]);

  const categories = await db.category.findMany({
    where: { parentId: { not: null } },
    take: 5,
  });

  const [hero, second, third, fourth] = featured;
  const avgRating = agg._avg.ratingAvg ?? 0;
  const reviewCount = agg._sum.ratingCount ?? 0;
  const image = (p?: (typeof featured)[number]) => p?.images[0]?.url;

  // Full-bleed: the design's tinted background has to escape the centred
  // container that every other page sits inside.
  return (
    <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2 bg-gradient-to-b from-[#e7ece3] via-[#eef1ea] to-[#f4f2e9] px-4 py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-12">
        {/* ------------------------------------------------ left column */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <Tile className="min-h-[460px] flex-1 p-8">
            <div className="relative z-10 max-w-[54%]">
              <Pill>
                <span className="text-[13px]">◧</span> {shopCount} shops ·{" "}
                {productCount} products
              </Pill>

              <h1 className="mt-6 text-[44px] font-bold leading-[1.05] tracking-tight text-neutral-900 xl:text-[52px]">
                Many shops.
                <br />
                One storefront.
              </h1>

              <div className="mt-8 flex items-start gap-5">
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-3xl font-light text-neutral-300">
                    01
                  </span>
                  <span className="hidden h-px w-16 bg-neutral-300 xl:block" />
                </div>
                {hero && (
                  <div className="max-w-[230px]">
                    <div className="text-sm font-semibold">
                      {hero.shop.name}
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-neutral-500">
                      {hero.shop.tagline ??
                        "Independent sellers, one checkout."}
                    </p>
                  </div>
                )}
              </div>

              <Link
                href="/products"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#d7f24a] py-2 pl-7 pr-2 transition hover:bg-[#cbe93c]"
              >
                <span className="text-[15px] font-semibold">
                  View All Products
                </span>
                <ArrowButton />
              </Link>

              <div className="mt-10 flex items-center gap-4">
                <span className="text-xs text-neutral-400">Follow us on:</span>
                {["X", "TT", "IG", "in"].map((s) => (
                  <span
                    key={s}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4f7df0] text-[10px] font-bold text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero product, floating over the card like the reference. */}
            <div className="absolute inset-y-0 right-0 w-[52%]">
              <HeroDots />
              {image(hero) && (
                <Link href={`/products/${hero.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image(hero)}
                    alt={hero.title}
                    className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-3xl object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
                  />
                </Link>
              )}
            </div>
          </Tile>

          {/* ------------------------------------------- bottom three-up */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Tile className="p-5" href="/products">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[15px] font-semibold">More Products</div>
                  <div className="text-xs text-neutral-500">
                    {productCount} plus items.
                  </div>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe9e9]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444">
                    <path d="M12 21s-7-4.6-9.3-8.3A5.3 5.3 0 0112 6.6a5.3 5.3 0 019.3 6.1C19 16.4 12 21 12 21z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {recent.map((p) => (
                  <div
                    key={p.id}
                    className="aspect-square overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Tile>

            <Tile className="flex flex-col items-center justify-center gap-3 p-5">
              <AvatarStack seeds={shops.slice(0, 3).map((s) => s.slug)} />
              <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-[#eaf0ff]">
                <span className="text-xl font-bold text-[#2b5fd9]">
                  {productCount}+
                </span>
                <span className="text-[10px] text-neutral-500">Products</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1">
                <Stars rating={avgRating} />
                <span className="text-[11px] text-neutral-500">
                  {reviewCount} reviews
                </span>
              </span>
            </Tile>

            {third && (
              <Tile className="p-5" href={`/products/${third.slug}`}>
                <div className="flex items-start justify-between">
                  <Pill>
                    <span className="text-red-500">♥</span> Popular
                  </Pill>
                  <ArrowButton className="!h-8 !w-8 bg-neutral-100 !text-black" />
                </div>
                <div className="mt-4 line-clamp-2 text-[15px] font-semibold leading-snug">
                  {third.title}
                </div>
                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                  {image(third) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image(third)}
                      alt={third.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {third.ratingCount > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur">
                      <Stars rating={third.ratingAvg} />
                    </span>
                  )}
                </div>
              </Tile>
            )}
          </div>
        </div>

        {/* ----------------------------------------------- right column */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Tile className="p-6">
            <div className="text-[15px] font-semibold">Shop by category</div>
            <div className="mt-4 flex items-center justify-between gap-2">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  title={c.name}
                  aria-label={c.name}
                  className="h-9 w-9 rounded-full ring-2 ring-white transition hover:scale-110"
                  style={{ background: ACCENTS[i % ACCENTS.length] }}
                />
              ))}
            </div>
          </Tile>

          {second && (
            <Tile className="min-h-[190px] p-6" href={`/products/${second.slug}`}>
              <div className="relative z-10 max-w-[52%]">
                <div className="text-[17px] font-semibold leading-tight">
                  {second.title}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {second.shop.name}
                </div>
                <ArrowButton className="mt-8 bg-white !text-black shadow-sm ring-1 ring-black/5" />
              </div>
              {image(second) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image(second)}
                  alt={second.title}
                  className="absolute bottom-0 right-0 h-full w-[48%] object-cover"
                />
              )}
            </Tile>
          )}

          {fourth && (
            <Tile
              className="min-h-[260px] flex-1"
              href={`/products/${fourth.slug}`}
            >
              {image(fourth) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image(fourth)}
                  alt={fourth.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16">
                <div className="text-[17px] font-semibold leading-tight text-white">
                  {fourth.title}
                </div>
                <div className="mt-1 text-xs text-white/70">
                  {fourth.shop.tagline ?? fourth.shop.name}
                </div>
              </div>
              <ArrowButton light className="absolute right-5 top-5 shadow-sm" />
            </Tile>
          )}
        </div>
      </div>

      {/* Shop strip — the marketplace's actual point, kept below the fold. */}
      <div className="mx-auto mt-4 max-w-6xl">
        <Tile className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold">
              Shops on the marketplace
            </div>
            <Link
              href="/shops"
              className="text-xs text-neutral-500 hover:text-black"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 transition hover:bg-neutral-100"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                  {shop.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shop.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {shop.name}
                  </div>
                  <div className="truncate text-[11px] text-neutral-500">
                    {shop.tagline}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Tile>
      </div>
    </div>
  );
}
