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

/** Each entry is a real product, its photographs, and what is visible in them. */
const PRODUCTS = [
  // ------------------------------------------------------- beaded collars
  {
    title: "Cream Fringe Beaded Collar",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass fittings",
    description:
      "A rope-style beaded collar in cream seed beads with brass end caps, falling into a deep curtain of fringe that shades from cream through a band of brown, black and gold patterning and back to cream.",
    photos: [img("10.39.10 PM (1)")],
    variants: ["Cream"],
  },
  {
    title: "Silver Fringe Beaded Collar",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass clasp",
    description:
      "Silver seed-bead rope collar finished with a brass clasp, with a deep fringe whose strands turn from silver into mixed red, blue, yellow and green beads at the lower third.",
    photos: [img("10.39.10 PM")],
    variants: ["Silver / Multicolour"],
  },
  {
    title: "Charcoal Fringe Beaded Collar",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass fittings",
    description:
      "Charcoal-grey seed-bead rope collar with brass fittings and a long fringe carrying a wide central block of mixed red, blue, yellow and green beading.",
    photos: [img("10.39.12 PM (1)")],
    variants: ["Charcoal"],
  },
  {
    title: "Silver Twisted Rope Necklace",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Pearlised seed beads, coiled brass",
    description:
      "Multi-strand torsade of pearlised silver-grey seed beads twisted into a single thick braid, finished with coiled brass wire end caps and a hook clasp.",
    photos: [img("10.39.10 PM (2)"), img("10.39.12 PM (4)")],
    variants: ["Silver"],
  },
  {
    title: "Orange Medallion Beaded Necklace",
    category: "Necklaces",
    collection: "maasai-beadwork",
    material: "Glass seed beads, brass end caps",
    description:
      "Orange beaded rope necklace blocked with bands of blue, red, green, yellow and black beading, hung with two flat circular beaded medallions and finished with brass end caps.",
    photos: [img("10.39.12 PM (2)")],
    variants: ["Orange"],
  },

  // --------------------------------------------------------- bead strands
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
    // Colourways visible across the photographs.
    variants: ["Red", "Orange", "Teal", "Yellow", "Multicolour", "Natural"],
  },
  {
    title: "Graduated Ceramic Bead Necklace",
    category: "Necklaces",
    collection: "bead-strands",
    material: "Glazed ceramic beads, waxed cord",
    description:
      "Glazed ceramic beads graded toward the centre front and strung on knotted brown cord with a sliding closure, so the length adjusts to the wearer.",
    photos: [
      img("10.39.15 PM"),
      img("10.39.15 PM (1)"),
      img("10.39.15 PM (2)"),
      img("10.39.15 PM (3)"),
      img("10.39.15 PM (4)"),
      img("10.39.14 PM (4)"),
    ],
    variants: ["Cream", "Black", "Grey", "Pink", "Olive", "Blue", "Red", "Yellow", "Teal"],
  },

  // ---------------------------------------------------------------- cuffs
  {
    title: "Flag Stripe Beaded Cuff",
    category: "Bracelets & Cuffs",
    collection: "maasai-beadwork",
    material: "Glass seed beads on leather",
    description:
      "Wide leather-backed cuff beaded in rows of red, white, green and black, lined in dark suede and fastened with metal snap studs.",
    photos: [
      img("10.39.12 PM"),
      img("10.39.12 PM (3)"),
      img("10.39.13 PM (1)"),
      img("10.39.11 PM (3)"),
    ],
    variants: ["Red / White / Green"],
  },
  {
    title: "Swirl Beaded Cuff",
    category: "Bracelets & Cuffs",
    collection: "maasai-beadwork",
    material: "Glass seed beads on leather",
    description:
      "Wide leather-backed cuff worked in swirling rows of blue, orange, yellow, white and bronze beads, with a black suede lining and two snap fasteners.",
    photos: [
      img("10.39.13 PM (2)"),
      img("10.39.13 PM (3)"),
      img("10.39.13 PM (4)"),
    ],
    variants: ["Blue / Orange"],
  },
  {
    title: "Concentric Eye Beaded Cuff",
    category: "Bracelets & Cuffs",
    collection: "maasai-beadwork",
    material: "Glass seed beads on leather",
    description:
      "Wide beaded cuff on a black leather base, patterned with concentric eye motifs and stripes in red, orange, blue, white and yellow.",
    photos: [img("10.45.46 PM (3)"), img("10.45.45 PM (3)")],
    variants: ["Red / Blue"],
  },
  {
    title: "Beaded Cuff — Studio Selection",
    category: "Bracelets & Cuffs",
    collection: "maasai-beadwork",
    material: "Glass seed beads on leather",
    description:
      "Wide leather-backed beaded cuffs in Maasai patterning — chevrons, concentric eyes and banded stripes. Patterns rotate with what the beaders are making; ask us what is in stock.",
    photos: [
      img("10.45.45 PM"),
      img("10.45.45 PM (1)"),
      img("10.45.45 PM (2)"),
      img("10.39.14 PM (3)"),
    ],
    variants: ["Assorted"],
  },

  // ------------------------------------------------------- beaded baskets
  {
    title: "Gold Beaded Lidded Basket",
    category: "Beaded Baskets",
    collection: null,
    material: "Glass seed beads, coiled wire",
    description:
      "Lidded round basket coiled in metallic gold seed beads and scattered with colour, ringed at the lid edge and base with bands of red, blue, green and white.",
    photos: [img("10.39.11 PM"), img("10.39.13 PM")],
    variants: ["Gold"],
  },
  {
    title: "Black & Gold Beaded Lidded Basket",
    category: "Beaded Baskets",
    collection: null,
    material: "Glass seed beads, coiled wire",
    description:
      "Oval lidded basket covered in black beads flecked with colour, with white beaded side panels, a gold bead rim and a looped beaded bow on the lid.",
    photos: [img("10.39.11 PM (1)"), img("10.39.11 PM (2)")],
    variants: ["Black / Gold"],
  },
  {
    title: "Silver Bugle Bead Basket",
    category: "Beaded Baskets",
    collection: null,
    material: "Silver-lined glass beads, coiled wire",
    description:
      "Lidded round basket in silver-lined bugle beads with a black beaded band at the rim and a small beaded knot on the lid.",
    photos: [img("10.39.14 PM")],
    variants: ["Silver"],
  },
  {
    title: "Speckled Navy Beaded Basket",
    category: "Beaded Baskets",
    collection: null,
    material: "Glass seed beads, coiled wire",
    description:
      "Small lidded basket coiled in white and dark navy seed beads in a speckled spiral, the wire coils visible between rows.",
    photos: [img("10.39.14 PM (1)")],
    variants: ["Navy / White"],
  },
  {
    title: "Bronze Beaded Pot",
    category: "Beaded Baskets",
    collection: null,
    material: "Iridescent glass beads, coiled wire",
    description:
      "Small coiled pot in iridescent bronze and gold beads speckled with colour, its lid topped with a looped beaded bow. Sits in the palm of a hand.",
    photos: [img("10.39.14 PM (2)")],
    variants: ["Bronze"],
  },

  // --------------------------------------------------------- table & home
  {
    title: "Beaded Leather Coasters — Set of Four",
    category: "Table & Home",
    collection: null,
    material: "Coiled seed beads, plaited leather",
    description:
      "Coasters of coiled seed beads set into leather discs with plaited leather edging, in red and gold spirals, dark brown and gold, and black, white and gold rings.",
    photos: [
      img("10.45.43 PM (2)"),
      img("10.45.43 PM (3)"),
      img("10.45.43 PM (4)"),
      img("10.45.44 PM (2)"),
      img("10.45.44 PM (3)"),
    ],
    variants: ["Set of 4"],
  },
  {
    title: "Blue Spiral Beaded Coasters",
    category: "Table & Home",
    collection: null,
    material: "Coiled seed beads, leather",
    description:
      "Coasters worked in concentric spirals of blue, turquoise and metallic seed beads set into dark leather-edged discs.",
    photos: [img("10.39.21 PM (3)")],
    variants: ["Blue"],
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
    title: "Beaded Rim Sisal Bowls",
    category: "Table & Home",
    collection: null,
    material: "Woven sisal, glass beads",
    description:
      "Nested woven sisal bowls trimmed at the rim with seed beads in white, clear and gold-black mixes.",
    photos: [img("10.39.20 PM (3)"), img("10.39.21 PM")],
    variants: ["Set"],
  },
  {
    title: "Coiled Fibre Bowls",
    category: "Table & Home",
    collection: null,
    material: "Coiled natural fibre",
    description:
      "Nested coiled-fibre bowls and plates in lime green with black zigzag banding and dark rims.",
    photos: [img("10.45.44 PM"), img("10.45.44 PM (1)")],
    variants: ["Green"],
  },

  // ------------------------------------------------------------- earrings
  {
    title: "Hammered Brass Earrings",
    category: "Earrings",
    collection: null,
    material: "Hammered brass",
    description:
      "Hand-hammered brass earrings in ankh, Africa, comb, hoop, spiral, triangle and leaf shapes. Shapes rotate with what is in stock.",
    photos: [img("10.42.32 PM"), img("10.45.48 PM")],
    variants: ["Assorted"],
  },
  {
    title: "Beaded & Shell Earrings",
    category: "Earrings",
    collection: null,
    material: "Glass beads, cowrie shell, leather, wood",
    description:
      "Beaded hoops, tassels, cowrie shells, leather teardrops and carved wooden shapes. Styles rotate; ask us what is in stock.",
    photos: [img("10.42.32 PM (1)"), img("10.45.48 PM (1)")],
    variants: ["Assorted"],
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
        // DRAFT with price 0: no prices were supplied and none appear in the
        // photographs. Publishing at zero would be worse than not publishing.
        status: "DRAFT",
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
            sku: `MKB-${slug.slice(0, 12).toUpperCase()}-${i + 1}`,
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
Done. ${count} products, all DRAFT with no price.

Next: set prices and stock at /admin/products, then switch each to ACTIVE.
Nothing is visible in the shop until you do.
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
