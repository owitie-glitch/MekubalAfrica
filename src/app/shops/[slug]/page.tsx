import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Empty, ProductCard, ShopLocation } from "@/components/ui";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const shop = await db.shop.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" } },
          shop: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shop) notFound();

  return (
    <div className="space-y-8">
      {shop.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shop.bannerUrl}
          alt={`${shop.name} banner`}
          className="h-48 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex items-center gap-4">
        {shop.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.logoUrl}
            alt={`${shop.name} logo`}
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{shop.name}</h1>
          {shop.tagline && (
            <p className="mt-1 text-sm text-[--color-muted]">{shop.tagline}</p>
          )}
          <ShopLocation shop={shop} full className="mt-2" />
        </div>
      </div>

      {shop.description && (
        <p className="max-w-2xl whitespace-pre-line text-sm">
          {shop.description}
        </p>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Products</h2>
        {shop.products.length === 0 ? (
          <Empty>This shop has no products listed yet.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shop.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
