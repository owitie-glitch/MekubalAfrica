import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Badge, Button, Empty, PageHeader } from "@/components/ui";
import { setCommissionRate, setShopStatus } from "./actions";

function StatusButton({
  shopId,
  status,
  label,
  variant = "ghost",
}: {
  shopId: string;
  status: string;
  label: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <form action={setShopStatus} className="inline">
      <input type="hidden" name="shopId" value={shopId} />
      <input type="hidden" name="status" value={status} />
      <Button variant={variant} type="submit" className="px-2 py-1 text-xs">
        {label}
      </Button>
    </form>
  );
}

export default async function AdminShopsPage() {
  await requireRole("ADMIN");

  const shops = await db.shop.findMany({
    include: {
      owner: { select: { email: true } },
      _count: { select: { products: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader title="Shops" subtitle={`${shops.length} registered`} />

      {shops.length === 0 ? (
        <Empty>No shops have been registered yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[--color-border]">
          <table className="w-full text-sm">
            <thead className="border-b border-[--color-border] text-left text-xs text-[--color-muted]">
              <tr>
                <th className="p-3 font-medium">Shop</th>
                <th className="p-3 font-medium">Owner</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Products</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr
                  key={shop.id}
                  className="border-b border-[--color-border] last:border-0"
                >
                  <td className="p-3">
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-xs text-[--color-muted]">/{shop.slug}</p>
                  </td>
                  <td className="p-3 text-[--color-muted]">
                    {shop.owner.email}
                  </td>
                  <td className="p-3">
                    <Badge>{shop.status}</Badge>
                  </td>
                  <td className="p-3">{shop._count.products}</td>
                  <td className="p-3">
                    <form
                      action={setCommissionRate}
                      className="flex items-center gap-1"
                    >
                      <input type="hidden" name="shopId" value={shop.id} />
                      <input
                        name="commissionRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        defaultValue={Number(shop.commissionRate).toFixed(2)}
                        className="w-20 rounded-lg border border-[--color-border] px-2 py-1 text-sm outline-none focus:border-black"
                      />
                      <Button
                        variant="ghost"
                        type="submit"
                        className="px-2 py-1 text-xs"
                      >
                        Set
                      </Button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {shop.status === "PENDING" && (
                        <StatusButton
                          shopId={shop.id}
                          status="ACTIVE"
                          label="Approve"
                          variant="primary"
                        />
                      )}
                      {shop.status === "ACTIVE" && (
                        <StatusButton
                          shopId={shop.id}
                          status="SUSPENDED"
                          label="Suspend"
                          variant="danger"
                        />
                      )}
                      {(shop.status === "SUSPENDED" ||
                        shop.status === "CLOSED") && (
                        <StatusButton
                          shopId={shop.id}
                          status="ACTIVE"
                          label="Reactivate"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
