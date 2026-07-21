import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Empty, PageHeader } from "@/components/ui";
import { applyForShop } from "./actions";
import { ShopForm } from "./shop-form";

export default async function SellPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Open a shop"
          subtitle="Sell your own products on the marketplace."
        />
        <Empty>
          You need an account to apply.{" "}
          <Link href="/register?next=/sell" className="underline">
            Create one
          </Link>{" "}
          to get started.
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Open a shop"
        subtitle="Applications are reviewed before your shop goes live."
      />
      <ShopForm action={applyForShop} />
    </div>
  );
}
