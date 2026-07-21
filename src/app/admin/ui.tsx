import type { ComponentProps, ReactNode } from "react";

// Admin-only form and table primitives. The storefront's <Field/> covers plain
// inputs; everything else an editor needs (select, textarea, checkbox) lives
// here rather than in the shared kit, which the customer side never uses.

const controlStyles =
  "mt-2 w-full border-b border-grey-200 bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-black";

export function Select({
  label,
  className = "",
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-grey-600">{label}</span>
      <select {...props} className={controlStyles}>
        {children}
      </select>
    </label>
  );
}

export function Textarea({
  label,
  hint,
  className = "",
  ...props
}: ComponentProps<"textarea"> & { label: string; hint?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-grey-600">{label}</span>
      {hint && <span className="mt-1 block text-xs text-grey-400">{hint}</span>}
      <textarea {...props} className={`${controlStyles} leading-relaxed`} />
    </label>
  );
}

export function Checkbox({
  label,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 py-2">
      <input
        {...props}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 appearance-none border border-grey-400 bg-white checked:border-black checked:bg-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
      />
      <span>
        <span className="eyebrow block">{label}</span>
        {hint && <span className="mt-1 block text-xs text-grey-600">{hint}</span>}
      </span>
    </label>
  );
}

/** Page title block — the admin echo of the storefront's <SectionHead/>. */
export function AdminHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-grey-200 pb-5">
      <div>
        {eyebrow && <div className="eyebrow text-grey-600">{eyebrow}</div>}
        <h1 className="display mt-2 text-[clamp(1.75rem,4vw,3rem)]">{title}</h1>
      </div>
      {action}
    </div>
  );
}

/** A single headline number. Used in a grid of hairline-separated cells. */
export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-white p-5">
      <div className="eyebrow text-grey-600">{label}</div>
      <div className="display mt-3 text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-grey-600">{sub}</div>}
    </div>
  );
}

// Dense monochrome table. Horizontal rules only — vertical lines would make a
// catalogue listing read as a spreadsheet.

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`eyebrow border-b border-grey-200 pb-3 text-left font-semibold text-grey-600 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-grey-200 py-4 pr-4 align-middle ${className}`}>
      {children}
    </td>
  );
}
