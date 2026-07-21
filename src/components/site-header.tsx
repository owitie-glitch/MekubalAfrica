"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-store";

type NavItem = { name: string; slug: string };

export function SiteHeader({
  categories,
  user,
}: {
  categories: NavItem[];
  user: { name: string | null; email: string; isAdmin: boolean } | null;
}) {
  const { count, openCart } = useCart();
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();

  // The header sits over the hero on the home page and turns solid once you
  // scroll past it; everywhere else it is solid from the start.
  const overlay = pathname === "/";

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    if (!overlay) return setSolid(true);
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menu) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menu]);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-colors duration-500 ${
          solid ? "bg-background" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-4 md:px-8">
          <button
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            className="flex flex-col gap-[5px] py-2"
          >
            <span className="block h-[2px] w-6 bg-current" />
            <span className="block h-[2px] w-6 bg-current" />
          </button>

          <Link href="/" aria-label="Mekubal Africa — home" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              width={35}
              height={28}
              className="h-7 w-auto md:h-8"
            />
            <span className="display text-xl tracking-tight md:text-2xl">
              MEKUBAL
            </span>
          </Link>

          <nav className="mx-auto hidden gap-8 md:flex">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="link-underline text-sm"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <Link href="/shop" aria-label="Search" className="p-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M20 20l-3.6-3.6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </Link>

            <span className="hidden h-4 w-px bg-grey-200 sm:block" />

            <button
              onClick={openCart}
              aria-label={`Cart, ${count} items`}
              className="flex items-center gap-2 p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h12l-1 13H7L6 7zM9 7V5a3 3 0 016 0v2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="flex h-6 min-w-6 items-center justify-center bg-foreground px-1 text-[11px] font-semibold tabular-nums text-white">
                {count}
              </span>
            </button>
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
            <span className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-7 w-auto md:h-8" />
              <span className="display text-xl md:text-2xl">MEKUBAL</span>
            </span>
            <button
              onClick={() => setMenu(false)}
              aria-label="Close menu"
              className="text-3xl leading-none transition-transform hover:rotate-90"
            >
              ×
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-1">
            {[{ name: "All pieces", slug: "" }, ...categories].map((c, i) => (
              <Link
                key={c.slug || "all"}
                href={c.slug ? `/shop?category=${c.slug}` : "/shop"}
                className="display group flex items-baseline gap-4 py-1 text-[clamp(2rem,7vw,4.5rem)] transition-colors hover:text-grey-400"
              >
                <span className="text-[11px] font-semibold tracking-normal text-grey-400">
                  0{i + 1}
                </span>
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-wrap gap-x-8 gap-y-2 border-t border-grey-200 pt-6 text-sm">
            <Link href="/about" className="link-underline">
              About Mekubal
            </Link>
            <Link href="/contact" className="link-underline">
              Visit &amp; contact
            </Link>
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
