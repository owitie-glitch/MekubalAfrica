import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));

// Placeholder imagery. Replace with CCA's own product photography — the
// editorial layout leans hard on full-bleed shots, so real cut-outs on a
// neutral ground will change how the whole site reads.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/1500`;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  console.log("Resetting…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.review.deleteMany();
  await db.productImage.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.collection.deleteMany();
  await db.category.deleteMany();
  await db.session.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  console.log("Users…");
  await db.user.create({
    data: {
      email: "admin@cca.co.ke",
      name: "CCA Studio",
      role: "ADMIN",
      passwordHash: password,
    },
  });
  const customer = await db.user.create({
    data: {
      email: "customer@cca.co.ke",
      name: "Amina Wanjiru",
      role: "CUSTOMER",
      passwordHash: password,
    },
  });

  console.log("Categories…");
  const categorySpecs = [
    { name: "Wall Pieces", position: 0 },
    { name: "Sculpture", position: 1 },
    { name: "Vessels", position: 2 },
    { name: "Hanging Ornaments", position: 3 },
    { name: "Table Objects", position: 4 },
  ];
  const categories: { id: string; name: string }[] = [];
  for (const spec of categorySpecs) {
    categories.push(
      await db.category.create({
        data: { slug: slugify(spec.name), name: spec.name, position: spec.position },
      }),
    );
  }
  const byName = (n: string) => categories.find((c) => c.name === n)!.id;

  console.log("Collections…");
  const brass = await db.collection.create({
    data: {
      slug: "brass",
      name: "Brass",
      headline: "THE BRASS COLLECTION",
      description:
        "Hand-cast and hand-polished in Nairobi. Each piece carries the marks of the hands that made it.",
      heroImage: img("cca-brass-hero"),
      position: 0,
    },
  });
  const soapstone = await db.collection.create({
    data: {
      slug: "soapstone",
      name: "Soapstone",
      headline: "CARVED IN KISII",
      description:
        "Soapstone quarried and carved by artisans in Kisii, finished by hand and dyed with natural pigment.",
      heroImage: img("cca-soapstone-hero"),
      position: 1,
    },
  });

  console.log("Products…");
  const catalog = [
    {
      title: "Ndege Brass Hanging Bird",
      category: "Hanging Ornaments",
      collection: brass.id,
      price: 3200,
      material: "Recycled brass",
      artisan: "Joseph Kimani",
      origin: "Nairobi, Kenya",
      dimensions: "12 × 8 × 2 cm",
      featured: true,
      variants: ["Polished", "Antiqued"],
    },
    {
      title: "Kisii Soapstone Nesting Bowls",
      category: "Vessels",
      collection: soapstone.id,
      price: 4500,
      material: "Kisii soapstone",
      artisan: "Mary Nyaboke",
      origin: "Kisii, Kenya",
      dimensions: "Set of 3, 14 / 11 / 8 cm",
      featured: true,
      variants: ["Natural", "Charcoal", "Ochre"],
    },
    {
      title: "Maasai Beaded Wall Disc",
      category: "Wall Pieces",
      collection: null,
      price: 6800,
      material: "Glass beads on leather",
      artisan: "Naserian Ole Sankale",
      origin: "Kajiado, Kenya",
      dimensions: "40 cm diameter",
      featured: true,
      variants: ["Red / White", "Indigo / White"],
    },
    {
      title: "Olive Wood Standing Figure",
      category: "Sculpture",
      collection: null,
      price: 8900,
      material: "Reclaimed olive wood",
      artisan: "Daniel Mutiso",
      origin: "Machakos, Kenya",
      dimensions: "32 cm tall",
      featured: true,
      variants: ["Natural oil finish"],
    },
    {
      title: "Brass Crescent Mobile",
      category: "Hanging Ornaments",
      collection: brass.id,
      price: 5400,
      material: "Recycled brass, cotton cord",
      artisan: "Joseph Kimani",
      origin: "Nairobi, Kenya",
      dimensions: "55 cm drop",
      featured: false,
      variants: ["Brass", "Blackened brass"],
    },
    {
      title: "Soapstone Egg Set",
      category: "Table Objects",
      collection: soapstone.id,
      price: 2400,
      material: "Kisii soapstone",
      artisan: "Mary Nyaboke",
      origin: "Kisii, Kenya",
      dimensions: "Set of 5, 6 cm each",
      featured: false,
      variants: ["Mixed pigment"],
    },
    {
      title: "Woven Sisal Wall Basket",
      category: "Wall Pieces",
      collection: null,
      price: 3900,
      material: "Hand-dyed sisal",
      artisan: "Grace Auma",
      origin: "Kisumu, Kenya",
      dimensions: "35 cm diameter",
      featured: false,
      variants: ["Natural", "Rust", "Indigo"],
    },
    {
      title: "Blackened Brass Incense Holder",
      category: "Table Objects",
      collection: brass.id,
      price: 2800,
      material: "Blackened brass",
      artisan: "Joseph Kimani",
      origin: "Nairobi, Kenya",
      dimensions: "18 × 4 cm",
      featured: false,
      variants: ["Standard"],
    },
    {
      title: "Carved Soapstone Elephant",
      category: "Sculpture",
      collection: soapstone.id,
      price: 3600,
      material: "Kisii soapstone",
      artisan: "Peter Ombati",
      origin: "Kisii, Kenya",
      dimensions: "15 × 10 cm",
      featured: false,
      variants: ["Natural", "Etched"],
    },
    {
      title: "Terracotta Ridge Vase",
      category: "Vessels",
      collection: null,
      price: 5200,
      material: "Unglazed terracotta",
      artisan: "Faith Wambui",
      origin: "Nairobi, Kenya",
      dimensions: "26 cm tall",
      featured: false,
      variants: ["Terracotta", "Smoked"],
    },
    {
      title: "Beaded Brass Bangle Ornament",
      category: "Hanging Ornaments",
      collection: brass.id,
      price: 1900,
      material: "Brass and glass beads",
      artisan: "Naserian Ole Sankale",
      origin: "Kajiado, Kenya",
      dimensions: "9 cm diameter",
      featured: false,
      variants: ["Warm", "Cool"],
    },
    {
      title: "Ebony Serving Board",
      category: "Table Objects",
      collection: null,
      price: 7400,
      material: "Reclaimed ebony",
      artisan: "Daniel Mutiso",
      origin: "Machakos, Kenya",
      dimensions: "45 × 18 cm",
      featured: false,
      variants: ["Standard"],
    },
  ];

  const created = [];
  for (const [i, spec] of catalog.entries()) {
    const slug = slugify(spec.title);
    const product = await db.product.create({
      data: {
        slug,
        title: spec.title,
        description: `${spec.title}. Hand-made by ${spec.artisan} in ${spec.origin} from ${spec.material.toLowerCase()}. No two pieces are identical — small variations in colour, grain and finish are the signature of hand work, not a fault.`,
        status: "ACTIVE",
        categoryId: byName(spec.category),
        collectionId: spec.collection,
        material: spec.material,
        artisan: spec.artisan,
        origin: spec.origin,
        dimensions: spec.dimensions,
        featured: spec.featured,
        priceMin: dec(spec.price),
        images: {
          create: [
            { url: img(`${slug}-1`), alt: spec.title, position: 0 },
            { url: img(`${slug}-2`), alt: `${spec.title}, detail`, position: 1 },
            { url: img(`${slug}-3`), alt: `${spec.title}, in situ`, position: 2 },
          ],
        },
        variants: {
          create: spec.variants.map((name, v) => ({
            name,
            sku: `CCA-${slug.slice(0, 10).toUpperCase()}-${v + 1}`,
            price: dec(spec.price + v * 200),
            compareAt: v === 0 && i % 3 === 0 ? dec(spec.price * 1.3) : null,
            inventory: 3 + ((i * 5 + v * 3) % 18),
          })),
        },
      },
    });
    created.push(product);
  }

  console.log("Reviews…");
  const bodies = [
    "Even better in person. The finish is beautiful.",
    "Arrived well packed and exactly as photographed.",
    "Bought two as gifts and kept one for myself.",
    "Lovely weight to it. You can tell it's hand-made.",
  ];
  for (const [i, product] of created.slice(0, 8).entries()) {
    const rating = 4 + (i % 2);
    await db.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating,
        body: bodies[i % bodies.length],
      },
    });
    await db.product.update({
      where: { id: product.id },
      data: { ratingAvg: rating, ratingCount: 1 },
    });
  }

  console.log(`
Seed complete.

  Admin     admin@cca.co.ke     / password123
  Customer  customer@cca.co.ke  / password123

  ${categories.length} categories, 2 collections, ${created.length} products
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
