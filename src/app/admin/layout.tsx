import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { AdminNav } from "./nav";

export const metadata: Metadata = { title: "Admin" };

/**
 * Guards the whole admin tree. Every page and action re-checks the role on its
 * own — a layout is not a security boundary, since server actions posted to a
 * nested route never run it.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-grey-200 pb-4">
        <span className="display text-lg">MEKUBAL ADMIN</span>
        <span className="text-xs text-grey-600">{user.email}</span>
      </div>

      <div className="mt-4">
        <AdminNav />
      </div>

      <div className="mt-12">{children}</div>
    </div>
  );
}
