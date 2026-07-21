import { requireOwnShop } from "@/lib/vendor";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { updateShopSettings } from "./actions";

const inputClass =
  "w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black";

export default async function ShopSettingsPage() {
  const { shop } = await requireOwnShop();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your shop's public details" />

      <form action={updateShopSettings} className="space-y-4">
        <Card className="space-y-3">
          <Field label="Shop name" name="name" defaultValue={shop.name} />
          <Field
            label="Tagline"
            name="tagline"
            defaultValue={shop.tagline ?? ""}
          />
          <label className="block space-y-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={shop.description ?? ""}
              className={inputClass}
            />
          </label>
          <Field
            label="Logo URL"
            name="logoUrl"
            defaultValue={shop.logoUrl ?? ""}
          />
          <Field
            label="Banner URL"
            name="bannerUrl"
            defaultValue={shop.bannerUrl ?? ""}
          />

          <div className="flex items-center gap-3 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[--color-muted]">
              Shop location
            </h2>
            <span className="h-px flex-1 bg-[--color-border]" />
          </div>
          <Field
            label="Street address"
            name="addressLine"
            defaultValue={shop.addressLine ?? ""}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" name="city" defaultValue={shop.city ?? ""} />
            <Field
              label="County / State"
              name="region"
              defaultValue={shop.region ?? ""}
            />
            <Field
              label="Postal code"
              name="postalCode"
              defaultValue={shop.postalCode ?? ""}
            />
            <Field
              label="Country"
              name="country"
              defaultValue={shop.country ?? ""}
            />
          </div>

          <Button type="submit">Save settings</Button>
        </Card>
      </form>

      <Card className="mt-4 space-y-3">
        <p className="text-sm font-semibold">Managed by the marketplace</p>
        <div className="text-sm">
          <p className="font-medium">Shop URL</p>
          <p className="text-[--color-muted]">/shops/{shop.slug}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Commission rate</p>
          <p className="text-[--color-muted]">
            {Number(shop.commissionRate).toFixed(2)}% of each order subtotal
          </p>
        </div>
        <p className="text-xs text-[--color-muted]">
          Your slug and commission rate are set by the marketplace and can&apos;t
          be edited here — the commission rate is a term of your seller
          agreement. Contact support to change either.
        </p>
      </Card>
    </div>
  );
}
