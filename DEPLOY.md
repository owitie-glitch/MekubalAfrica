# Deploying Mekubal Africa to Vercel

The app is a Next.js storefront backed by **PostgreSQL** (via Prisma). To go
live you need three things: the code on GitHub (done), a cloud database, and a
host. Follow these steps in order.

---

## 1. Create a cloud database (Neon — free)

1. Go to **https://neon.tech** and sign up.
2. Create a project (any region near your customers, e.g. Frankfurt).
3. Copy the **connection string**. It looks like:
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Keep the `?sslmode=require` — the app needs SSL to Neon.

## 2. Load your catalogue into the cloud database

Do this **once**, from your own machine, pointed at the Neon database:

```bash
# in the project folder, temporarily use the cloud DB
# (PowerShell)   $env:DATABASE_URL="postgresql://...neon.../neondb?sslmode=require"
# (macOS/Linux)  export DATABASE_URL="postgresql://...neon.../neondb?sslmode=require"

npm run db:push     # creates the tables in Neon
npm run db:seed     # loads categories, collections and products
```

Your product photos live in `public/uploads` and are already committed, so
they ship with the code — nothing extra to upload for the catalogue.

## 3. Deploy on Vercel

1. Go to **https://vercel.com**, sign in **with GitHub**.
2. **Add New → Project → Import** `owitie-glitch/MekubalAfrica`.
3. Before deploying, open **Environment Variables** and add:

   | Name             | Value                                                        |
   | ---------------- | ------------------------------------------------------------ |
   | `DATABASE_URL`   | your Neon connection string (with `?sslmode=require`)        |
   | `SESSION_SECRET` | any long random string (e.g. 40+ characters)                 |

4. Click **Deploy**. Vercel runs `npm install` (which runs `prisma generate`)
   and `next build`. The build does **not** need the database; the running site
   does.

That's it — your store is live at the Vercel URL. Point your custom domain at it
from **Vercel → Settings → Domains** when ready.

---

## Notes & limitations

- **Every page is server-rendered** (`force-dynamic`), so inventory, cart and
  the catalogue are always live. There is no stale static cache to bust.
- **Admin image uploads** (`/admin` → add product photos) write to the local
  filesystem, which is **read-only on Vercel**, so that one feature is disabled
  on the live site (it returns a clear message). Everything else — browsing,
  cart, the per-product WhatsApp enquiry, WhatsApp ordering — works. To enable
  live uploads, wire up **Vercel Blob**:
  1. Vercel → **Storage → Create → Blob**; it sets `BLOB_READ_WRITE_TOKEN`.
  2. Ask to have `src/app/api/upload/route.ts` switched to `@vercel/blob`.
- **Ordering is over WhatsApp**, so no payment provider is required to launch.
- To update the live site later: commit and `git push` — Vercel redeploys
  automatically.

## Environment variables (summary)

| Variable         | Where          | Purpose                                  |
| ---------------- | -------------- | ---------------------------------------- |
| `DATABASE_URL`   | Vercel + local | Postgres connection (Neon), needs SSL    |
| `SESSION_SECRET` | Vercel + local | Signs login session cookies              |
