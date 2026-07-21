import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-black text-white hover:bg-neutral-800",
    ghost: "border border-[--color-border] hover:bg-neutral-50",
    danger: "border border-red-300 text-red-700 hover:bg-red-50",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[--color-border] bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black"
      />
    </label>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[--color-muted]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[--color-border] p-10 text-center text-sm text-[--color-muted]">
      {children}
    </div>
  );
}

export function Money({ value }: { value: unknown }) {
  return <>${Number(value).toFixed(2)}</>;
}

type ShopLocationFields = {
  addressLine?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

/** "Nairobi, Kenya" — skips whatever the shop left blank. */
export function formatLocation(shop: ShopLocationFields, full = false) {
  const parts = full
    ? [shop.addressLine, shop.city, shop.region, shop.postalCode, shop.country]
    : [shop.city, shop.country];
  return parts.filter(Boolean).join(", ");
}

export function ShopLocation({
  shop,
  full = false,
  className = "",
}: {
  shop: ShopLocationFields;
  full?: boolean;
  className?: string;
}) {
  const label = formatLocation(shop, full);
  if (!label) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-[--color-muted] ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      {label}
    </span>
  );
}

const badgeTones: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DRAFT: "bg-neutral-100 text-neutral-700",
  SUSPENDED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-red-100 text-red-800",
};

export function Badge({ children }: { children: string }) {
  const tone = badgeTones[children] ?? "bg-neutral-100 text-neutral-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {children.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}

export function ProductCard({
  product,
}: {
  product: {
    slug: string;
    title: string;
    priceMin: unknown;
    ratingAvg: number;
    ratingCount: number;
    images: { url: string; alt: string | null }[];
    shop: { slug: string; name: string };
  };
}) {
  return (
    <Card className="flex flex-col gap-2">
      <Link href={`/products/${product.slug}`}>
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-[--color-muted]">No image</span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-medium">{product.title}</h3>
      </Link>
      <Link
        href={`/shops/${product.shop.slug}`}
        className="text-xs text-[--color-muted] hover:underline"
      >
        {product.shop.name}
      </Link>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          <Money value={product.priceMin} />
        </span>
        {product.ratingCount > 0 && (
          <span className="text-xs text-[--color-muted]">
            ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})
          </span>
        )}
      </div>
    </Card>
  );
}
