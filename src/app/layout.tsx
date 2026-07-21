import type { Metadata } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readCart, cartTotal } from "@/lib/cart";
import { CartProvider } from "@/components/cart-store";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader } from "@/components/site-header";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "MEKUBAL — Handmade ornaments from East Africa",
    template: "%s · MEKUBAL",
  },
  description:
    "Mekubal Africa. Handmade brass, soapstone, wood and beadwork ornaments, made by artisans across Kenya.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, cart, categories] = await Promise.all([
    getCurrentUser(),
    readCart(),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

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
    <html lang="en" className={`${archivo.variable} h-full`} suppressHydrationWarning>
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
              <div className="display text-[clamp(2.5rem,10vw,8rem)] leading-none">
                MEKUBAL AFRICA
              </div>
              <div className="mt-12 flex flex-wrap justify-between gap-8 border-t border-grey-200 pt-8 text-sm">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <Link href="/shop" className="link-underline">
                    Shop
                  </Link>
                  <Link href="/about" className="link-underline">
                    About
                  </Link>
                  <Link href="/orders" className="link-underline">
                    Orders
                  </Link>
                  <a
                    href="https://www.instagram.com/mekubal_africa"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline"
                  >
                    Instagram
                  </a>
                </div>
                <p className="text-grey-600">
                  © {new Date().getFullYear()} Mekubal Africa
                </p>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
