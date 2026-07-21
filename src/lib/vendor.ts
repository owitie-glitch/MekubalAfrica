import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { db } from "./db";

/**
 * Resolves the shop the dashboard is acting as, from the session alone.
 * Nothing here is client-supplied, so anything scoped by the returned
 * shop.id is inside the tenant boundary by construction.
 */
export async function getOwnShop() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return { user, shop };
}

/** For pages that cannot render without a shop; the layout owns the prompt. */
export async function requireOwnShop() {
  const { user, shop } = await getOwnShop();
  if (!shop) redirect("/dashboard");
  return { user, shop };
}
