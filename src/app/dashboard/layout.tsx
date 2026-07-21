import Link from "next/link";
import type { ReactNode } from "react";
import { getOwnShop } from "@/lib/vendor";
import { Badge, Empty } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { shop } = await getOwnShop();

  if (!shop) {
    return (
      <Empty>
        You don&apos;t have a shop yet.{" "}
        <Link href="/sell" className="font-medium text-black underline">
          Open a shop
        </Link>{" "}
        to start selling.
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="md:w-48 md:shrink-0">
        <div className="mb-4">
          <p className="text-sm font-semibold">{shop.name}</p>
          <Badge>{shop.status}</Badge>
        </div>
        <nav className="flex gap-4 text-sm md:flex-col md:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-1 text-[--color-muted] hover:bg-neutral-50 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Pending shops can build a catalog, they just can't sell yet — so
            this is a notice rather than a lock on the products pages. */}
        {shop.status === "PENDING" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Awaiting approval</p>
            <p className="mt-1">
              An admin is reviewing your shop. You can add and edit products
              now, but they won&apos;t appear in the storefront and you can&apos;t
              take orders until your shop is approved.
            </p>
          </div>
        )}
        {shop.status === "SUSPENDED" && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-medium">Shop suspended</p>
            <p className="mt-1">
              Your shop is not accepting orders. Contact marketplace support.
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
