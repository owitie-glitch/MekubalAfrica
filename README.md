# MEKUBAL AFRICA

Online store for Mekubal Africa — handmade ornaments by artisans across Kenya.
Single seller, one catalogue, one checkout.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Prisma 7 · PostgreSQL.

## Getting started

```bash
cp .env.example .env      # DATABASE_URL is already set for the local dev server
npm install
npm run db:dev            # starts a real local Postgres (no Docker) — leave running
npm run db:push           # create the tables
npm run db:seed           # sample catalogue
npm run dev
```

`npm run db:dev` runs an embedded Postgres binary on port 5433 with its data in
`.pgdata/`. To deploy, point `DATABASE_URL` at any hosted Postgres (Neon,
Supabase, Railway) — nothing else changes.

Seeded logins (both `password123`):

| Role     | Email                     |
| -------- | ------------------------- |
| Admin    | `admin@mekubal.africa`    |
| Customer | `customer@mekubal.africa` |

## Content status

**The catalogue is placeholder.** Product names, makers, prices and imagery were
invented, because the Instagram account (@mekubal_africa) is login-gated and
could not be read. What exists is a structure waiting for real content:

- Product photography — the layout is photography-led and placeholder images
  undersell it badly. Real shots on a neutral ground will change how the whole
  site reads.
- Real products, prices and makers — add through `/admin/products`.
- About page copy — written deliberately free of invented dates, headcounts and
  awards, so real copy drops straight in.

## Design

Editorial monochrome, after the Promax reference: oversized uppercase display
type, square corners, thin rules, a narrow grey ramp. Photography supplies the
only colour — nothing in the chrome competes with the product.

Tokens live in `src/app/globals.css`: `.display`, `.eyebrow`, `.link-underline`,
`.reveal`, and the grey ramp.

## Interaction

- **Draggable product rail** — click-drag on mouse, native swipe on touch
  (hijacking touch breaks momentum scrolling), arrows on hover, keyboard
  scrollable. A drag ending over a card does not register as a click.
- **Live catalogue filtering** — filter changes rewrite the URL via
  `router.replace`, so results update without a reload and the URL stays
  shareable.
- **Quick view + cart drawer** — a JSON cart API (`/api/cart`) with optimistic
  client updates, then `router.refresh()` so server-rendered stock stays honest.
- **Scroll reveals** — IntersectionObserver, not scroll handlers. All motion
  collapses under `prefers-reduced-motion`.

## Layout

```
prisma/schema.prisma   data model (start here)
prisma/seed.ts         placeholder catalogue
src/lib/db.ts          Prisma client singleton
src/lib/auth.ts        sessions, password hashing, role guards
src/lib/cart.ts        guest + user carts (readCart vs getOrCreateCart)
src/lib/orders.ts      checkout: cart -> Order
src/lib/catalog.ts     product query shape + client-safe serialisation
src/app/               /, /shop, /product/[slug], /cart, /checkout, /orders
src/app/admin/         catalogue, orders, collections
src/components/        cart store/drawer, quick view, motion, product card
```

## Things that will bite you

- **`readCart()` in pages, `getOrCreateCart()` in actions.** Next.js only allows
  cookie writes in Server Actions and Route Handlers. Calling the write path
  during render 500s every page that renders the header.
- **Restart the dev server after editing `schema.prisma`.** Prisma selects
  columns explicitly, so a server holding a stale client silently returns
  `undefined` for new fields — the data is in the database but renders blank.
- **Never pass a `Decimal` or `Date` into a client component.** Convert with
  `Number()`, or run the product through `toCard()` in `src/lib/catalog.ts`.

## Not built yet

- **Payments.** `checkout/actions.ts` marks orders paid immediately. Real
  implementation: Stripe — or M-Pesa, given the market — with the order staying
  `PENDING_PAYMENT` until the payment webhook confirms.
- Image uploads (product images are URLs today), transactional email, real
  shipping rates (flat KSh 500), tax.

Git history holds an earlier multi-vendor marketplace version of this codebase
at commit `b139192`, if the store ever opens to other sellers.
