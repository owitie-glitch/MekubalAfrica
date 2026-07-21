import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));

// Placeholder imagery — swap for real assets later.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;

async function main() {
  console.log("Resetting…");
  // Order matters: children before parents, since not every relation cascades.
  await db.orderItem.deleteMany();
  await db.shopOrder.deleteMany();
  await db.order.deleteMany();
  await db.payout.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.review.deleteMany();
  await db.productImage.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.shop.deleteMany();
  await db.session.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  console.log("Users…");
  const admin = await db.user.create({
    data: {
      email: "admin@marketplace.test",
      name: "Marketplace Admin",
      role: "ADMIN",
      passwordHash: password,
    },
  });

  const customer = await db.user.create({
    data: {
      email: "customer@marketplace.test",
      name: "Ryman Alex",
      role: "CUSTOMER",
      passwordHash: password,
    },
  });

  console.log("Categories…");
  // Category-agnostic on purpose — the marketplace is not audio-specific.
  const tree = [
    { slug: "electronics", name: "Electronics", children: ["Audio", "Wearables", "Computing"] },
    { slug: "home", name: "Home & Living", children: ["Furniture", "Kitchen"] },
    { slug: "apparel", name: "Apparel", children: ["Footwear", "Outerwear"] },
  ];
  const leaves: { id: string; name: string }[] = [];
  for (const node of tree) {
    const parent = await db.category.create({
      data: { slug: node.slug, name: node.name },
    });
    for (const childName of node.children) {
      const child = await db.category.create({
        data: {
          slug: childName.toLowerCase().replace(/\W+/g, "-"),
          name: childName,
          parentId: parent.id,
        },
      });
      leaves.push({ id: child.id, name: child.name });
    }
  }

  console.log("Shops…");
  const shopSpecs = [
    {
      slug: "sequoia-audio",
      name: "Sequoia Audio",
      tagline: "Making your dream music come true.",
      status: "ACTIVE" as const,
      commission: 10,
      email: "sequoia@marketplace.test",
      owner: "Dana Sequoia",
      city: "Nairobi",
      region: "Nairobi",
      country: "Kenya",
    },
    {
      slug: "northline-goods",
      name: "Northline Goods",
      tagline: "Considered objects for everyday use.",
      status: "ACTIVE" as const,
      commission: 12.5,
      email: "northline@marketplace.test",
      owner: "Priya Raman",
      city: "Mombasa",
      region: "Mombasa",
      country: "Kenya",
    },
    {
      slug: "atlas-supply",
      name: "Atlas Supply Co.",
      tagline: "Built to outlast the season.",
      status: "ACTIVE" as const,
      commission: 8,
      email: "atlas@marketplace.test",
      owner: "Marcus Hale",
      city: "Kisumu",
      region: "Kisumu",
      country: "Kenya",
    },
    {
      // Left pending so the admin approval queue has something in it.
      slug: "verde-studio",
      name: "Verde Studio",
      tagline: "Small-batch ceramics.",
      status: "PENDING" as const,
      commission: 10,
      email: "verde@marketplace.test",
      owner: "Lena Verde",
      city: "Nakuru",
      region: "Nakuru",
      country: "Kenya",
    },
  ];

  const shops = [];
  for (const spec of shopSpecs) {
    const owner = await db.user.create({
      data: {
        email: spec.email,
        name: spec.owner,
        role: "VENDOR",
        passwordHash: password,
      },
    });
    shops.push(
      await db.shop.create({
        data: {
          slug: spec.slug,
          name: spec.name,
          tagline: spec.tagline,
          description: `${spec.name} sells on the marketplace. ${spec.tagline}`,
          status: spec.status,
          ownerId: owner.id,
          commissionRate: dec(spec.commission),
          payoutsEnabled: spec.status === "ACTIVE",
          city: spec.city,
          region: spec.region,
          country: spec.country,
          logoUrl: img(`${spec.slug}-logo`),
          bannerUrl: img(`${spec.slug}-banner`),
        },
      }),
    );
  }

  console.log("Products…");
  const catalog = [
    { shop: 0, title: "Sequoia Studio Over-Ear Headphones", price: 349, variants: ["Blue", "Midnight", "Silver"] },
    { shop: 0, title: "X-Bud Wireless Earbuds", price: 179, variants: ["White", "Graphite"] },
    { shop: 0, title: "Field Recorder Mk II", price: 529, variants: ["Standard"] },
    { shop: 1, title: "Linen Lounge Cushion", price: 68, variants: ["Sand", "Moss"] },
    { shop: 1, title: "Stoneware Pour-Over Set", price: 94, variants: ["Standard"] },
    { shop: 1, title: "Walnut Desk Riser", price: 145, variants: ["Walnut", "Oak"] },
    { shop: 2, title: "All-Weather Trail Jacket", price: 215, variants: ["S", "M", "L", "XL"] },
    { shop: 2, title: "Canvas Weekender Bag", price: 132, variants: ["Olive", "Black"] },
    { shop: 2, title: "Merino Trail Socks (3-pack)", price: 38, variants: ["M", "L"] },
  ];

  const created = [];
  for (const [i, spec] of catalog.entries()) {
    const slug = spec.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
    const product = await db.product.create({
      data: {
        slug,
        title: spec.title,
        description: `${spec.title} — sold by ${shops[spec.shop].name}. Replace this copy with real product detail.`,
        status: "ACTIVE",
        shopId: shops[spec.shop].id,
        categoryId: leaves[i % leaves.length].id,
        priceMin: dec(spec.price),
        images: {
          create: [
            { url: img(`${slug}-1`), alt: spec.title, position: 0 },
            { url: img(`${slug}-2`), alt: spec.title, position: 1 },
          ],
        },
        variants: {
          create: spec.variants.map((name, v) => ({
            name,
            sku: `${slug.slice(0, 12).toUpperCase()}-${v + 1}`,
            // Later variants cost a little more, so price ranges are visible.
            price: dec(spec.price + v * 10),
            compareAt: v === 0 ? dec(spec.price * 1.25) : null,
            inventory: 5 + ((i * 7 + v * 3) % 40),
          })),
        },
      },
    });
    created.push(product);
  }

  console.log("Reviews…");
  for (const product of created.slice(0, 5)) {
    const rating = 4 + (product.title.length % 2);
    await db.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating,
        body: "Solid quality, shipped quickly.",
      },
    });
    await db.product.update({
      where: { id: product.id },
      data: { ratingAvg: rating, ratingCount: 1 },
    });
  }

  console.log(`
Seed complete.

  Admin     admin@marketplace.test     / password123
  Customer  customer@marketplace.test  / password123
  Vendor    sequoia@marketplace.test   / password123

  ${shops.length} shops (1 PENDING, awaiting admin approval)
  ${created.length} products
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
