import Link from "next/link";
import type { ReactNode } from "react";

/** Bento tile. Every card on the landing page is one of these. */
export function Tile({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const body = (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-white ${className}`}
    >
      {children}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/** The black circular arrow that appears on most cards in the reference. */
export function ArrowButton({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
        light ? "bg-white text-black" : "bg-black text-white"
      } ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M4 12L12 4M12 4H6M12 4V10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 backdrop-blur">
      {children}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" aria-hidden>
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

/**
 * Decorative floating dots from the reference hero. Positions are fixed rather
 * than random so the layout is stable between renders.
 */
export function HeroDots() {
  const dots = [
    { top: "18%", left: "63%", size: 14, color: "#c7ccd1" },
    { top: "10%", left: "78%", size: 9, color: "#9aa3ab" },
    { top: "30%", left: "88%", size: 11, color: "#1e3a8a" },
    { top: "34%", left: "70%", size: 10, color: "#1e40af" },
    { top: "72%", left: "58%", size: 12, color: "#1e3a8a" },
    { top: "80%", left: "86%", size: 8, color: "#94a3b8" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
          }}
        />
      ))}
    </div>
  );
}

/** Overlapping avatar stack for the social-proof tile. */
export function AvatarStack({ seeds }: { seeds: string[] }) {
  return (
    <div className="flex -space-x-2">
      {seeds.map((seed) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={seed}
          src={`https://i.pravatar.cc/64?u=${encodeURIComponent(seed)}`}
          alt=""
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
        />
      ))}
    </div>
  );
}
