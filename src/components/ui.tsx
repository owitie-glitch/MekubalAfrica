import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Kenyan shillings, no decimals — prices here are whole numbers. */
export function formatMoney(value: unknown) {
  return `KSh ${Math.round(Number(value)).toLocaleString("en-KE")}`;
}

export function Money({ value }: { value: unknown }) {
  return <>{formatMoney(value)}</>;
}

export function Button({
  className = "",
  variant = "solid",
  ...props
}: ComponentProps<"button"> & { variant?: "solid" | "outline" | "ghost" }) {
  const styles = {
    solid: "bg-foreground text-white hover:bg-foreground/85",
    outline: "border border-foreground hover:bg-foreground hover:text-white",
    ghost: "hover:bg-grey-100",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Field({
  label,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-grey-600">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

/** Section heading: eyebrow label, rule, optional link. */
export function SectionHead({
  eyebrow,
  title,
  href,
  hrefLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-grey-200 pb-4">
      <div>
        {eyebrow && <div className="eyebrow text-grey-600">{eyebrow}</div>}
        <h2 className="display mt-3 text-[clamp(1.9rem,4.5vw,3.5rem)] font-normal">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="link-underline eyebrow shrink-0 pb-1 whitespace-nowrap"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-grey-200 px-6 py-20 text-center text-sm text-grey-600">
      {children}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  PAID: "bg-foreground text-white",
  DELIVERED: "bg-foreground text-white",
  SHIPPED: "bg-neutral-700 text-white",
  PROCESSING: "bg-grey-200 text-foreground",
  PENDING_PAYMENT: "bg-grey-100 text-grey-600",
  DRAFT: "bg-grey-100 text-grey-600",
  ACTIVE: "bg-foreground text-white",
  ARCHIVED: "bg-grey-100 text-grey-600",
  CANCELLED: "bg-grey-100 text-grey-600",
  REFUNDED: "bg-grey-100 text-grey-600",
};

export function Badge({ children }: { children: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        badgeTones[children] ?? "bg-grey-100 text-grey-600"
      }`}
    >
      {children.replaceAll("_", " ")}
    </span>
  );
}
