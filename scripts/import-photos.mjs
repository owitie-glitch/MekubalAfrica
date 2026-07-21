/**
 * Bulk photo import.
 *
 *   npm run import:photos                 # reads ./import
 *   npm run import:photos -- ./some/dir   # or any folder
 *   npm run import:photos -- --dry-run    # show what would happen, change nothing
 *   npm run import:photos -- --replace    # replace a product's images instead of adding
 *
 * Filenames decide which product a photo belongs to. Everything before a
 * trailing number is the product name, so these three land on one product:
 *
 *   Ndege Brass Bird-1.jpg
 *   ndege brass bird 2.JPG
 *   ndege_brass_bird_3.png
 *
 * A photo whose name matches no existing product creates a DRAFT product, so
 * nothing appears in the shop until someone sets a price and publishes it.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import "dotenv/config";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const replace = args.includes("--replace");
const sourceDir = path.resolve(args.find((a) => !a.startsWith("--")) ?? "./import");
const outputDir = path.join(process.cwd(), "public", "uploads");

const MAX_WIDTH = 2000;
const QUALITY = 82;
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (s) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();

/** "ndege-brass-bird-2.jpg" -> { base: "ndege brass bird", index: 2 } */
function parseName(filename) {
  const stem = path.basename(filename, path.extname(filename));
  const cleaned = stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  // Trailing number, with or without brackets: "bowl 2", "bowl (2)", "bowl-02"
  const match = cleaned.match(/^(.*?)[\s(]*(\d{1,3})\)?$/);
  if (match && match[1].trim()) {
    return { base: match[1].trim(), index: Number(match[2]) };
  }
  return { base: cleaned, index: 0 };
}

async function main() {
  try {
    await stat(sourceDir);
  } catch {
    console.error(`\nNo folder at ${sourceDir}`);
    console.error(`Create it and drop the photographs in:\n\n  mkdir import\n`);
    process.exit(1);
  }

  const entries = (await readdir(sourceDir, { withFileTypes: true }))
    .filter((e) => e.isFile() && EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name);

  if (entries.length === 0) {
    console.error(`No images found in ${sourceDir}`);
    console.error(`Accepted: ${[...EXTS].join(", ")}`);
    process.exit(1);
  }

  // Group by product, keeping the numeric suffix as the display order.
  const groups = new Map();
  for (const name of entries) {
    const { base, index } = parseName(name);
    const slug = slugify(base);
    if (!slug) continue;
    const group = groups.get(slug) ?? { slug, title: titleCase(base), files: [] };
    group.files.push({ name, index });
    groups.set(slug, group);
  }
  for (const g of groups.values()) {
    g.files.sort((a, b) => a.index - b.index || a.name.localeCompare(b.name));
  }

  console.log(
    `\n${entries.length} photo(s) -> ${groups.size} product(s) from ${sourceDir}`,
  );
  if (dryRun) console.log("DRY RUN — nothing will be written.\n");

  if (!dryRun) await mkdir(outputDir, { recursive: true });

  let created = 0;
  let updated = 0;
  let written = 0;

  for (const group of groups.values()) {
    const existing = await db.product.findUnique({
      where: { slug: group.slug },
      include: { images: true },
    });

    const action = existing
      ? replace
        ? "replace images"
        : "add images"
      : "CREATE draft";
    console.log(
      `\n${group.title}  (${group.slug})\n  ${action} — ${group.files.length} photo(s)`,
    );

    if (dryRun) {
      group.files.forEach((f) => console.log(`    ${f.name}`));
      continue;
    }

    // Optimise first: if a file is corrupt, fail before touching the database.
    const urls = [];
    for (const file of group.files) {
      const source = path.join(sourceDir, file.name);
      const outName = `${group.slug}-${file.index || urls.length + 1}-${Date.now().toString(36)}.webp`;
      await sharp(source)
        .rotate() // honour EXIF orientation — phone photos are often sideways
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(outputDir, outName));
      urls.push(`/uploads/${outName}`);
      written++;
      console.log(`    ${file.name} -> ${outName}`);
    }

    let product = existing;
    if (!product) {
      product = await db.product.create({
        data: {
          slug: group.slug,
          title: group.title,
          status: "DRAFT", // never publish something with no price set
          priceMin: 0,
          variants: { create: [{ name: "Standard", price: 0, inventory: 0 }] },
        },
        include: { images: true },
      });
      created++;
    } else {
      updated++;
    }

    if (replace && product.images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: product.id } });
    }

    const offset = replace ? 0 : product.images.length;
    await db.productImage.createMany({
      data: urls.map((url, i) => ({
        productId: product.id,
        url,
        alt: group.title,
        position: offset + i,
      })),
    });
  }

  console.log(
    `\nDone. ${written} image(s) optimised, ${created} draft product(s) created, ${updated} updated.`,
  );
  if (created > 0) {
    console.log(
      `\nNew products are DRAFT with no price. Set price and publish at /admin/products\n`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
