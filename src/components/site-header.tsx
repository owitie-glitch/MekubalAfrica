"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-store";

type NavItem = { name: string; slug: string };

const NAV = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/shop?view=collections" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader({
  categories,
  user,
}: {
  categories: NavItem[];
  user: { name: string | null; email: string; isAdmin: boolean } | null;
}) {
  const { count, openCart } = useCart();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menu) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menu]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <>
      <header className="glass sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-3.5 md:px-8">
          <button
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            className="flex flex-col gap-[5px] py-2 md:hidden"
          >
            <span className="block h-[2px] w-6 bg-current" />
            <span className="block h-[2px] w-6 bg-current" />
          </button>

          <Link href="/" aria-label="Mekubal Africa — home" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Mekubal Africa"
              width={942}
              height={674}
              className="h-11 w-auto md:h-14"
            />
          </Link>

          <nav className="mx-auto hidden items-center gap-9 md:flex">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm transition-colors hover:text-foreground ${
                    active ? "text-foreground" : "text-grey-600"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] bg-rust transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <button
              onClick={openCart}
              aria-label={`Cart, ${count} items`}
              className="relative flex items-center p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h12l-1 13H7L6 7zM9 7V5a3 3 0 016 0v2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-semibold tabular-nums text-white">
                  {count}
                </span>
              )}
            </button>

            <Link
              href="/shop"
              className="hidden items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-rust-700 sm:inline-flex"
            >
              Shop Now
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen menu — the panel the hamburger implies. */}
      <div
        className={`fixed inset-0 z-50 bg-background transition-[opacity,visibility] duration-400 ${
          menu ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1600px] flex-col px-5 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Mekubal Africa" className="h-10 w-auto md:h-12" />
            </span>
            <button
              onClick={() => setMenu(false)}
              aria-label="Close menu"
              className="text-3xl leading-none transition-transform hover:rotate-90"
            >
              ×
            </button>
          </div>

          <nav className="mt-14 flex flex-col gap-1">
            {NAV.map((item, i) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-display group flex items-baseline gap-4 py-1 text-[clamp(2rem,7vw,4rem)] transition-colors hover:text-rust"
              >
                <span className="text-[11px] font-semibold tracking-normal text-grey-400">
                  0{i + 1}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>

          {categories.length > 0 && (
            <div className="mt-10 border-t border-grey-200 pt-6">
              <p className="eyebrow text-grey-600">Browse by category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?category=${c.slug}`}
                    className="rounded-full border border-grey-200 px-3.5 py-2 text-xs transition-colors hover:border-foreground"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-x-8 gap-y-2 border-t border-grey-200 pt-6 text-sm">
            <Link href="/orders" className="link-underline">
              My orders
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className="link-underline">
                Admin
              </Link>
            )}
            {user ? (
              <form action="/api/logout" method="post">
                <button className="link-underline">Sign out</button>
              </form>
            ) : (
              <Link href="/login" className="link-underline">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
