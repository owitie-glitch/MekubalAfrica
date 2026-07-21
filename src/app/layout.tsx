import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { readCart, cartCount } from "@/lib/cart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KIOSKYANGU — many shops, one storefront",
    template: "%s · KIOSKYANGU",
  },
  description:
    "KIOSKYANGU is a multi-vendor marketplace: independent kiosks and shops selling their own products, with one cart and one checkout.",
};

async function Header() {
  const user = await getCurrentUser();
  const count = cartCount(await readCart());

  // Floating pill bar from the design reference: logo + search on the left,
  // account controls on the right, all riding on the page background.
  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-5">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full border border-black/5 bg-white px-5 py-3.5 shadow-sm"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-[13px] font-bold text-white">
            K
          </span>
          <span className="text-[17px] font-bold tracking-tight">
            KIOSKYANGU
          </span>
        </Link>

        <form
          action="/products"
          className="flex min-w-0 flex-1 items-center rounded-full border border-black/5 bg-white py-1.5 pl-5 pr-1.5 shadow-sm"
        >
          <input
            name="q"
            placeholder="Search products..."
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400"
          />
          <button
            aria-label="Search"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-neutral-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/5 bg-white shadow-sm transition hover:bg-neutral-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 7h12l-1 13H7L6 7zM9 7V5a3 3 0 016 0v2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            aria-label="Orders"
            className="hidden h-[52px] w-[52px] items-center justify-center rounded-full border border-black/5 bg-white shadow-sm transition hover:bg-neutral-50 sm:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M12 21s-7-4.6-9.3-8.3A5.3 5.3 0 0112 6.6a5.3 5.3 0 019.3 6.1C19 16.4 12 21 12 21z" />
            </svg>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white py-1.5 pl-4 pr-1.5 shadow-sm">
              <span className="hidden text-sm font-medium sm:block">
                {user.name ?? user.email.split("@")[0]}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.image ??
                  `https://i.pravatar.cc/80?u=${encodeURIComponent(user.email)}`
                }
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-[52px] items-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Secondary nav — the account routes the pill bar has no room for. */}
      <nav className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 px-2 text-[13px] text-neutral-500">
        <Link href="/products" className="hover:text-black">
          Products
        </Link>
        <Link href="/shops" className="hover:text-black">
          Shops
        </Link>
        {user ? (
          <>
            <Link href="/orders" className="hover:text-black">
              My orders
            </Link>
            {(user.role === "VENDOR" || user.role === "ADMIN") && (
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin/shops" className="hover:text-black">
                Admin
              </Link>
            )}
            <form action="/api/logout" method="post" className="contents">
              <button className="hover:text-black">Sign out</button>
            </form>
          </>
        ) : (
          <Link href="/sell" className="hover:text-black">
            Open a shop
          </Link>
        )}
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions commonly stamp attributes
    // onto <html> before React hydrates, which React reports as a mismatch.
    // This applies to this element's own attributes only — real hydration bugs
    // in the tree below still surface.
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* overflow-x-clip contains the landing page's full-bleed breakout. */}
      <body className="flex min-h-full flex-col overflow-x-clip">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-[--color-border] py-8 text-center text-xs text-[--color-muted]">
          KIOSKYANGU — many shops, one storefront
        </footer>
      </body>
    </html>
  );
}
