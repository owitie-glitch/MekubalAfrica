# KIOSKYANGU

KIOSKYANGU is a multi-vendor ecommerce marketplace: many independent kiosks and
shops, one shared storefront and one checkout.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Prisma 7 · PostgreSQL.

## Getting started

You need a Postgres database. Nothing to install locally — create a free one at
[neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) and copy
the connection string.

```bash
cp .env.example .env      # then paste your DATABASE_URL into .env
npm install
npm run db:push           # create the tables
npm run db:seed           # sample shops, products, reviews
npm run dev
```

Seeded logins (all `password123`):

| Role     | Email                       |
| -------- | --------------------------- |
| Admin    | `admin@marketplace.test`    |
| Customer | `customer@marketplace.test` |
| Vendor   | `sequoia@marketplace.test`  |

## How the marketplace works

The design decision everything else follows from:

**One `Order` fans out into one `ShopOrder` per participating shop.**

A customer with items from three shops pays once and sees one receipt. Behind
it, each shop gets its own slice that it fulfils, ships, and is paid out on
independently — with its own status, tracking number, commission and payout.
That split is what makes this a marketplace rather than one store with
categories.

```
Order (customer pays once)
├── ShopOrder → Sequoia Audio    → PROCESSING → commission 10%
├── ShopOrder → Northline Goods  → SHIPPED    → commission 12.5%
└── ShopOrder → Atlas Supply     → PENDING    → commission 8%
```

`syncOrderStatus()` rolls the parent status back up: the order is only
`FULFILLED` once every shop has shipped, `PARTIALLY_FULFILLED` while some have.

Other things worth knowing:

- **Every product has at least one variant**, even single-option products, so
  price and stock never live in two places.
- **Order items are snapshotted** at purchase time. A vendor renaming or
  repricing a product must not rewrite an old receipt.
- **Shops are approved by an admin.** New shops start `PENDING` and cannot take
  orders until an admin activates them at `/admin/shops`.
- **`Product.priceMin` and the rating fields are denormalised** for cheap
  sorting on listing pages, recomputed on write.

## Layout

```
prisma/schema.prisma   data model (start here)
prisma/seed.ts         sample data
src/lib/db.ts          Prisma client singleton
src/lib/auth.ts        sessions, password hashing, requireShopAccess
src/lib/cart.ts        guest + user carts, groupByShop
src/lib/orders.ts      checkout: cart -> Order + ShopOrders
src/app/               /, /products, /shops, /cart, /checkout, /orders
src/app/dashboard/     vendor: products, orders, settings
src/app/admin/         shop approval queue
```

## Multi-tenancy

A vendor must never read or write another shop's data. Every dashboard query is
scoped to the shop derived from the session, never from a URL or form value.
`requireShopAccess()` in `src/lib/auth.ts` is that boundary — new dashboard code
should go through it.

Detail pages use `findFirst({ where: { id, shopId } })` so another shop's record
is indistinguishable from a missing one.

## Not built yet

- **Payments.** `checkout/actions.ts` marks orders paid immediately. Real
  implementation: Stripe Connect with destination charges, order stays
  `PENDING_PAYMENT` until the `payment_intent.succeeded` webhook. The `Payout`
  model and `Shop.stripeAccountId` are already in the schema for it.
- **The landing page design.** `src/app/page.tsx` is deliberately plain — the
  bento-grid design pass is next.
- Image uploads (product images are URLs today), email, search indexing,
  shipping rates (flat $5 per shop), tax.
