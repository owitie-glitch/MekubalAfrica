import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Bodoni_Moda, Caveat } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readCart, cartTotal } from "@/lib/cart";
import { CartProvider } from "@/components/cart-store";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader } from "@/components/site-header";
import {
  site,
  addressLines,
  instagramUrl,
  whatsappUrl,
  telHref,
  mailHref,
} from "@/lib/site";

// Grotesque for anything functional — navigation, buttons, prices, body.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Didone for display, chosen to rhyme with the MA monogram: same hairline
// contrast, same classical axis.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Handwriting, for the one script line in the landing hero.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `MEKUBAL AFRICA — ${site.tagline}`,
    template: "%s · MEKUBAL AFRICA",
  },
  description: `${site.name}. ${site.tagline}. ${addressLines.join(", ")}. Open ${site.hours[0].days}, ${site.hours[0].time}.`,
};

// The store reads live data (catalogue, cart, session) on every request, so
// render dynamically rather than prerendering at build time. This also keeps
// the production build from needing a database connection. Applies to every
// route beneath the root layout.
export const dynamic = "force-dynamic";

async function loadShell() {
  try {
    const [user, cart, categories] = await Promise.all([
      getCurrentUser(),
      readCart(),
      db.category.findMany({
        where: { parentId: null },
        orderBy: { position: "asc" },
        select: { name: true, slug: true },
      }),
    ]);
    return { user, cart, categories };
  } catch (err) {
    console.error("Layout shell data unavailable — rendering empty shell:", err);
    return {
      user: null,
      cart: null,
      categories: [] as { name: string; slug: string }[],
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Load the chrome's data, but never let it fail the render. During a
  // production build (or a transient database outage) the DB may be
  // unreachable — fall back to an empty shell so pages like /_not-found still
  // prerender; real data fills in at request time once the DB is connected.
  const { user, cart, categories } = await loadShell();

  const initialCart = {
    count: (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0),
    subtotal: cartTotal(cart),
    items: (cart?.items ?? []).map((i) => ({
      id: i.id,
      variantId: i.variantId,
      quantity: i.quantity,
      title: i.variant.product.title,
      slug: i.variant.product.slug,
      variantName: i.variant.name,
      unitPrice: Number(i.variant.price),
      inventory: i.variant.inventory,
      image: i.variant.product.images[0]?.url ?? null,
    })),
  };

  return (
    // Browser extensions stamp attributes on <html> before hydration; this
    // suppresses that one element's attribute diff only.
    <html lang="en" className={`${archivo.variable} ${bodoni.variable} ${caveat.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <CartProvider initial={initialCart}>
          <SiteHeader
            categories={categories}
            user={
              user
                ? { name: user.name, email: user.email, isAdmin: user.role === "ADMIN" }
                : null
            }
          />
          <main className="flex-1">{children}</main>
          <CartDrawer />

          <footer className="mt-24 border-t border-grey-200">
            <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-8">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Mekubal Africa"
                  className="h-[clamp(6rem,20vw,14rem)] w-auto"
                />
              </div>
              <div className="mt-12 grid gap-10 border-t border-grey-200 pt-10 text-sm sm:grid-cols-3">
                <div>
                  <div className="eyebrow text-grey-600">Visit</div>
                  <address className="mt-3 not-italic leading-relaxed">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  <Link
                    href="/contact"
                    className="link-underline eyebrow mt-3 inline-block"
                  >
                    Directions →
                  </Link>
                </div>

                <div>
                  <div className="eyebrow text-grey-600">Contact</div>
                  <div className="mt-3 space-y-1.5">
                    <a href={telHref} className="link-underline block">
                      {site.phone}
                    </a>
                    <a href={mailHref} className="link-underline block break-all">
                      {site.email}
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline block"
                    >
                      WhatsApp
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-grey-600">
                    {site.hours[0].days}, {site.hours[0].time}
                  </p>
                </div>

                <div className="flex flex-col gap-y-2">
                  <div className="eyebrow text-grey-600">Browse</div>
                  <div className="mt-1 flex flex-col gap-1.5">
                    <Link href="/shop" className="link-underline w-fit">
                      Shop
                    </Link>
                    <Link href="/about" className="link-underline w-fit">
                      About
                    </Link>
                    <Link href="/contact" className="link-underline w-fit">
                      Visit &amp; contact
                    </Link>
                    <Link href="/orders" className="link-underline w-fit">
                      Orders
                    </Link>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline w-fit"
                    >
                      @{site.instagram}
                    </a>
                  </div>
                </div>
              </div>

              <p className="mt-10 border-t border-grey-200 pt-6 text-xs text-grey-600">
                © {new Date().getFullYear()} {site.name} · {site.hashtag}
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
