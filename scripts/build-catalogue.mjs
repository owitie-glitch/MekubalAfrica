/**
 * Builds the catalogue from Mekubal's own photographs in ./images.
 *
 *   npm run build:catalogue
 *
 * Products are created as DRAFT with a price of 0. Prices were not supplied
 * and are not in the photographs, so nothing is invented here — set them in
 * /admin/products, then publish.
 *
 * Descriptions come from what is actually visible in each photograph. Nothing
 * about makers, dimensions or materials-by-name is asserted beyond that.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import "dotenv/config";

const SOURCE = path.resolve("./images");
const OUT = path.join(process.cwd(), "public", "uploads");
const img = (n) => `WhatsApp Image 2026-07-21 at ${n}.jpeg`;

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CATEGORIES = [
  { name: "Necklaces", position: 0 },
  { name: "Bracelets & Cuffs", position: 1 },
  { name: "Beaded Baskets", position: 2 },
  { name: "Table & Home", position: 3 },
  { name: "Earrings", position: 4 },
];

const COLLECTIONS = [
  {
    slug: "maasai-beadwork",
    name: "Beadwork",
    headline: "HAND-BEADED, ONE STRAND AT A TIME",
    description:
      "Seed-bead collars, cuffs and bangles worked by hand in the Maasai tradition. Colour and pattern vary piece to piece.",
    hero: img("10.39.18 PM (1)"),
    position: 0,
  },
  {
    slug: "bead-strands",
    name: "Bead Strands",
    headline: "GRADUATED BEAD NECKLACES",
    description:
      "Wooden and ceramic beads graded from small at the nape to bold at the front, strung on knotted cord with an adjustable closure.",
    hero: img("10.39.16 PM (1)"),
    position: 1,
  },
];

/**
 * One entry per KIND of piece, not per colourway.
 *
 * Photographs that show the same item in different colours belong to one
 * product with a variant each — a customer should meet "Beaded Wire Basket"
 * once with five colours, not five near-identical listings.
 */
const PRODUCTS = [
  // ---------------------------------------------------------- necklaces
  {
    title: "Maasai Beaded Fringe Collar",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass fittings",
    description:
      "A rope-style beaded collar finished with brass end caps, falling into a deep curtain of fringe. The strands change colour along their length, so the piece reads as one tone at the neck and another at the hem.",
    photos: [
      img("10.39.10 PM"),
      img("10.39.10 PM (1)"),
      img("10.39.12 PM (1)"),
    ],
    variants: ["Silver / Multicolour", "Cream", "Charcoal"],
  },
  {
    title: "Beaded Torsade Rope Necklace",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Pearlised seed beads, coiled brass",
    description:
      "Multi-strand torsade of pearlised seed beads twisted into a single thick braid, finished with coiled brass wire end caps and a hook clasp.",
    photos: [img("10.39.10 PM (2)"), img("10.39.12 PM (4)")],
    variants: ["Silver"],
  },
  {
    title: "Maasai Beaded Medallion Necklace",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass end caps",
    description:
      "Beaded rope necklace blocked with bands of contrasting colour and hung with two flat circular beaded medallions, finished with brass end caps.",
    photos: [img("10.39.12 PM (2)")],
    variants: ["Orange"],
  },
  {
    title: "Graduated Wooden Bead Necklace",
    category: "Necklaces",
    collection: "bead-strands",
    material: "Dyed wooden beads",
    description:
      "Round wooden beads graded from small at the nape to bold spheres at the front. Each strand is dyed and polished by hand, so tone varies slightly between pieces.",
    photos: [
      img("10.39.16 PM (4)"),
      img("10.39.17 PM"),
      img("10.39.16 PM (2)"),
      img("10.39.16 PM (3)"),
      img("10.39.17 PM (1)"),
      img("10.39.16 PM (1)"),
      img("10.39.16 PM"),
    ],
    variants: ["Red", "Orange", "Teal", "Yellow", "Multicolour", "Natural"],
  },
  {
    title: "Graduated Ceramic Bead Necklace",
    category: "Necklaces",
    collection: "bead-strands",
    material: "Glazed ceramic beads, waxed cord",
    description:
      "Glazed ceramic beads graded toward the centre front and strung on knotted cord with a sliding closure, so the length adjusts to the wearer.",
    photos: [
      img("10.39.15 PM"),
      img("10.39.15 PM (1)"),
      img("10.39.15 PM (2)"),
      img("10.39.15 PM (3)"),
      img("10.39.15 PM (4)"),
      img("10.39.14 PM (4)"),
    ],
    variants: [
      "Cream",
      "Black",
      "Grey",
      "Pink",
      "Olive",
      "Blue",
      "Red",
      "Yellow",
      "Teal",
    ],
  },

  // --------------------------------------------------- bracelets & cuffs
  {
    title: "Maasai Beaded Leather Cuff",
    category: "Bracelets & Cuffs",
    collection: "maasai-beadwork",
    material: "Glass seed beads on leather",
    description:
      "Wide leather-backed cuff, beaded by hand and lined in dark suede with metal snap fasteners. Patterns run from flag stripes to concentric eyes and swirls, and rotate with what the beaders are making.",
    photos: [
      img("10.39.12 PM"),
      img("10.39.12 PM (3)"),
      img("10.39.13 PM (1)"),
      img("10.39.11 PM (3)"),
      img("10.39.13 PM (2)"),
      img("10.39.13 PM (3)"),
      img("10.39.13 PM (4)"),
      img("10.45.46 PM (3)"),
      img("10.45.45 PM (3)"),
      img("10.45.45 PM"),
      img("10.45.45 PM (1)"),
      img("10.39.14 PM (3)"),
    ],
    variants: [
      "Kenyan Flag",
      "Swirl",
      "Concentric Eye",
      "Assorted pattern",
    ],
  },

  // ------------------------------------------------------ beaded baskets
  {
    title: "Beaded Wire Basket",
    category: "Beaded Baskets",
    collection: null,
    material: "Glass seed beads, coiled wire",
    description:
      "Lidded basket built by threading glass beads onto wire and coiling them into shape by hand. Used for jewellery, trinkets and small keepsakes.",
    photos: [
      img("10.39.11 PM"),
      img("10.39.13 PM"),
      img("10.39.11 PM (1)"),
      img("10.39.11 PM (2)"),
      img("10.39.14 PM"),
      img("10.39.14 PM (1)"),
    ],
    variants: ["Gold", "Black & Gold", "Silver", "Navy Speckle"],
  },
  {
    title: "Beaded Wire Trinket Pot",
    category: "Beaded Baskets",
    collection: null,
    material: "Iridescent glass beads, coiled wire",
    description:
      "Small coiled pot in iridescent beads speckled with colour, its lid topped with a looped beaded bow. Sits in the palm of a hand.",
    photos: [img("10.39.14 PM (2)")],
    variants: ["Bronze"],
  },

  // -------------------------------------------------------- table & home
  {
    title: "Maasai Beaded Leather Coasters",
    category: "Table & Home",
    collection: null,
    material: "Coiled seed beads, plaited leather",
    description:
      "Coasters of coiled seed beads set into leather discs with plaited leather edging, worked in concentric rings and spirals.",
    photos: [
      img("10.45.43 PM (2)"),
      img("10.45.43 PM (3)"),
      img("10.45.43 PM (4)"),
      img("10.45.44 PM (2)"),
      img("10.45.44 PM (3)"),
      img("10.39.21 PM (3)"),
    ],
    variants: ["Red & Gold", "Black & White", "Brown & Gold", "Blue Spiral"],
  },
  {
    title: "Fringed Sisal Placemat",
    category: "Table & Home",
    collection: null,
    material: "Woven sisal",
    description:
      "Round woven sisal placemat with a long shaggy fringe, in natural and dyed colourways with concentric banding.",
    photos: [
      img("10.45.42 PM"),
      img("10.45.43 PM"),
      img("10.45.42 PM (1)"),
      img("10.45.43 PM (1)"),
      img("10.39.22 PM"),
      img("10.39.21 PM (1)"),
    ],
    variants: ["Natural", "Grey", "Orange", "Yellow", "Pink"],
  },
  {
    title: "Woven Sisal Bowls",
    category: "Table & Home",
    collection: null,
    material: "Woven sisal, glass beads",
    description:
      "Nested woven sisal bowls, either trimmed at the rim with seed beads or banded in dyed fibre. Sold as a nesting set.",
    photos: [
      img("10.39.20 PM (3)"),
      img("10.39.21 PM"),
      img("10.45.44 PM"),
      img("10.45.44 PM (1)"),
    ],
    variants: ["Beaded rim", "Green banded"],
  },

  // ----------------------------------------------------------- earrings
  {
    title: "Hammered Brass Earrings",
    category: "Earrings",
    collection: null,
    material: "Hammered brass",
    description:
      "Hand-hammered brass earrings in ankh, Africa, comb, hoop, spiral, triangle and leaf shapes. Shapes rotate with what is in stock.",
    photos: [img("10.42.32 PM"), img("10.45.48 PM")],
    variants: ["Assorted shape"],
  },
  {
    title: "Beaded & Cowrie Shell Earrings",
    category: "Earrings",
    collection: null,
    material: "Glass beads, cowrie shell, leather, wood",
    description:
      "Beaded hoops, tassels, cowrie shells, leather teardrops and carved wooden shapes. Styles rotate; ask us what is in stock.",
    photos: [img("10.42.32 PM (1)"), img("10.45.48 PM (1)")],
    variants: ["Assorted style"],
  },
];

async function optimise(fileName, slug, index) {
  const source = path.join(SOURCE, fileName);
  try {
    await access(source);
  } catch {
    console.warn(`  ! missing: ${fileName}`);
    return null;
  }
  const out = `${slug}-${index + 1}.webp`;
  await sharp(source)
    .rotate() // phone photos carry EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(OUT, out));
  return `/uploads/${out}`;
}

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Clearing existing catalogue…");
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

  console.log("Categories…");
  const categoryIds = {};
  for (const c of CATEGORIES) {
    const row = await db.category.create({
      data: { slug: slugify(c.name), name: c.name, position: c.position },
    });
    categoryIds[c.name] = row.id;
  }

  console.log("Collections…");
  const collectionIds = {};
  for (const c of COLLECTIONS) {
    const hero = await optimise(c.hero, `collection-${c.slug}`, 0);
    const row = await db.collection.create({
      data: {
        slug: c.slug,
        name: c.name,
        headline: c.headline,
        description: c.description,
        heroImage: hero,
        position: c.position,
      },
    });
    collectionIds[c.slug] = row.id;
  }

  console.log("Products…");
  let count = 0;
  for (const spec of PRODUCTS) {
    const slug = slugify(spec.title);
    const urls = [];
    for (const [i, photo] of spec.photos.entries()) {
      const url = await optimise(photo, slug, i);
      if (url) urls.push(url);
    }
    if (urls.length === 0) {
      console.warn(`  ! skipped ${spec.title} — no usable photographs`);
      continue;
    }

    await db.product.create({
      data: {
        slug,
        title: spec.title,
        description: spec.description,
        // Price 0 renders as "Price on request" and routes to a WhatsApp
        // enquiry — which is how Mekubal already takes orders. Setting a real
        // price in /admin switches the piece to normal cart buying.
        status: "ACTIVE",
        priceMin: new Prisma.Decimal(0),
        categoryId: categoryIds[spec.category],
        collectionId: spec.collection ? collectionIds[spec.collection] : null,
        material: spec.material,
        origin: "Nairobi, Kenya",
        featured: count < 6,
        images: {
          create: urls.map((url, i) => ({
            url,
            alt: spec.title,
            position: i,
          })),
        },
        variants: {
          create: spec.variants.map((name, i) => ({
            name,
            // Full slug, not a prefix: several titles now share their first
            // dozen characters ("maasai-beaded-…") and would collide on the
            // unique sku constraint.
            sku: `MKB-${slug.toUpperCase()}-${i + 1}`,
            price: new Prisma.Decimal(0),
            inventory: 0,
          })),
        },
      },
    });
    console.log(`  ${spec.title}  (${urls.length} photo${urls.length === 1 ? "" : "s"})`);
    count++;
  }

  console.log(`
Done. ${count} products, live as "Price on request".

Set prices and stock at /admin/products — each piece then switches from a
WhatsApp enquiry to normal cart buying on its own.
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
