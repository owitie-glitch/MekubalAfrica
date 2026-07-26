# Moving Mekubal Africa to WordPress + WooCommerce

The original site is a custom React/Next.js app; it can't be copied into
WordPress. Instead you rebuild it as a **WooCommerce** store and bring across
your **products, images and branding** — which is what this folder contains:

```
wordpress/
├─ products-woocommerce.csv   ← your 23 products, ready to import
├─ theme.css                  ← brand colours, fonts, pill buttons
├─ brand/logo.png             ← logo
├─ brand/favicon.png          ← site icon
└─ brand/hero.png             ← the landing portrait
```
Product photos to upload live in the project's `public/uploads/` folder (86 files).

---

## Step 1 — Get WordPress with WooCommerce

You need WordPress **hosting** (e.g. Hostinger, SiteGround, Bluehost, or
WordPress.com Business — anything that lets you install plugins).

1. Install WordPress (most hosts have a one-click installer).
2. In the WordPress admin: **Plugins → Add New → search "WooCommerce" →
   Install → Activate**, then run its setup wizard (currency: **KES**;
   location: **Kenya**).

## Step 2 — Create your categories

WooCommerce → **Products → Categories**, and add the ones you use:
Necklaces, Bracelets & Cuffs, Metal Jewellery, Belts & Bands, Earrings,
Beaded Baskets, Table & Home, Souvenirs & Curios. (The import will also create
any it doesn't find.)

## Step 3 — Get the product images online

WooCommerce imports images from a **web address**, so the photos need a URL.
Easiest option:

- **Deploy the current site first** (see the main `DEPLOY.md`). Once it's live at
  `https://your-site.vercel.app`, every image is reachable at
  `https://your-site.vercel.app/uploads/<filename>`.
- Then open `products-woocommerce.csv` and **find-and-replace**
  `https://REPLACE-WITH-YOUR-IMAGE-HOST/uploads` with
  `https://your-site.vercel.app/uploads`.

(Alternative: upload all files from `public/uploads/` into WordPress →
**Media**, then replace that placeholder with your media URL, e.g.
`https://your-wp-site.com/wp-content/uploads/2026/07`.)

## Step 4 — Import the products

WooCommerce → **Products → Import** → choose `products-woocommerce.csv` →
**Run the importer**. It creates all 23 products with names, categories,
descriptions, finishes (as a "Finish" attribute) and images.

> **Note on prices:** every piece is **"price on request"**, so the CSV leaves
> the price blank on purpose. WooCommerce then shows the product without an
> "Add to cart" button. To keep your WhatsApp-enquiry flow, add one of:
> - **"WhatsApp Chat" / "Click to Chat"** plugin (adds a floating/product WhatsApp
>   button pre-filled with the product name), or
> - **"Request a Quote for WooCommerce"** plugin (replaces buy buttons with an
>   enquiry form).
>
> Your WhatsApp number: **+254 732 441 905**.

## Step 5 — Apply the branding

**Recommended — install the ready-made theme** (colours, serif headings, pill
buttons and fonts, all pre-built):

1. Appearance → **Themes → Add New → search "Storefront" → Install** (do **not**
   activate — it's the base).
2. Appearance → **Themes → Add New → Upload Theme** → choose
   `mekubal-africa-theme.zip` (in this folder) → **Install → Activate**.

That's the whole look done. (If you'd rather not use a child theme, the
alternative is to paste `theme.css` into Appearance → **Customize → Additional
CSS** and load the fonts **Archivo**, **Bodoni Moda**, **Caveat** yourself.)

Then finish the identity:

1. **Logo:** Customize → **Site Identity** → upload `brand/logo.png`.
3. **Favicon:** same screen → **Site Icon** → upload `brand/favicon.png`.
4. **Homepage hero:** use `brand/hero.png` in a banner block, with the headline
   *Handmade Beauty for <span class="mk-accent">Everyday Living.</span>* and a
   terracotta "Shop Now" button.

## Step 6 — Pages & menu

Recreate the simple pages: **About**, **Contact** (with your Westlands Market
address and WhatsApp), and set the menu to **Home · Shop · Collections · About ·
Contact**, matching the original.

---

### What carries over vs. what's rebuilt

| Original (Next.js)            | In WordPress                                  |
| ----------------------------- | --------------------------------------------- |
| Products, prices, categories  | ✅ imported via the CSV                        |
| Product photos                | ✅ imported (once the URLs resolve)            |
| Look & feel (colours/fonts)   | ✅ approximated via `theme.css`                |
| Shop / cart                   | ↻ rebuilt with WooCommerce                    |
| WhatsApp ordering & enquiry   | ↻ rebuilt with a WhatsApp plugin              |
| Custom admin                  | ↻ replaced by the WordPress/WooCommerce admin |
| The React code                | ✗ does not transfer                           |

### Colours (for reference)

| Name        | Hex       |
| ----------- | --------- |
| Cream       | `#f4efe4` |
| Ink         | `#2f2a20` |
| Terracotta  | `#bd6a4c` |
| Olive       | `#6f7353` |
| Clay        | `#ccbca0` |
