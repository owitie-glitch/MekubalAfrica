import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button, Card, Money } from "@/components/ui";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE", shop: { status: "ACTIVE" } },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { price: "asc" } },
      shop: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const prices = product.variants.map((v) => Number(v.price));
  const low = prices.length ? Math.min(...prices) : Number(product.priceMin);
  const high = prices.length ? Math.max(...prices) : low;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {product.images.map((image) => (
            <div
              key={image.id}
              className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt ?? product.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {product.title}
          </h1>
          <p className="text-lg font-semibold">
            <Money value={low} />
            {high > low && (
              <>
                {" – "}
                <Money value={high} />
              </>
            )}
          </p>
          <p className="text-sm text-[--color-muted]">
            Sold by{" "}
            <Link
              href={`/shops/${product.shop.slug}`}
              className="hover:underline"
            >
              {product.shop.name}
            </Link>
          </p>
          {product.ratingCount > 0 && (
            <p className="text-sm text-[--color-muted]">
              ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount} reviews)
            </p>
          )}
          {product.description && (
            <p className="whitespace-pre-line text-sm">{product.description}</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Options</h2>
        <div className="space-y-2">
          {product.variants.map((variant) => (
            <Card key={variant.id} className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium">{variant.name}</div>
                <div className="text-sm text-[--color-muted]">
                  <Money value={variant.price} />
                  {variant.inventory > 0
                    ? ` · ${variant.inventory} in stock`
                    : " · out of stock"}
                </div>
              </div>
              {variant.inventory > 0 && (
                <form
                  action="/api/cart/add"
                  method="post"
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={`/products/${product.slug}`}
                  />
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={1}
                    min={1}
                    max={variant.inventory}
                    className="w-20 rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <Button type="submit">Add to cart</Button>
                </form>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-[--color-muted]">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {review.user.name ?? "Anonymous"}
                  </span>
                  <span className="text-[--color-muted]">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.body && <p className="mt-2 text-sm">{review.body}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
