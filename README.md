# IndiaMedCare — "Health is Wealth" 💊

A pharmaceutical & wellness e-commerce storefront. Same UI as the JMPOTTERS
fashion store (gold luxury aesthetic, Playfair Display + Inter), rebuilt as a
single-category (Healthcare) shop on the same Supabase backend structure.

## Stack

- Vanilla HTML/CSS/JS (no build step) — deployed as a static site on Vercel
- Supabase (PostgreSQL + Storage) for products, categories, orders, coupons,
  user profiles, hero banners, promo ads and contact submissions
- Admin dashboard: `admindashboardpro.html`

## Pages

| Page | Purpose |
| --- | --- |
| index.html | Home (hero banners, categories, featured, new arrivals, bento) |
| healthcare.html | The single product category listing |
| product.html | Product detail |
| cart.html / checkout.html / invoice.html | Purchase flow |
| login.html / register.html / account.html | Customer accounts (email + phone) |
| contact.html | Contact form → `contact_submissions` |
| admindashboardpro.html | Admin: products, categories, orders, coupons, ads, hero banners, users |

## Supabase setup (new project)

1. Create a new project at https://supabase.com (e.g. name it `zetra`).
2. Open **SQL Editor → New query**, paste the entire `supabase/schema.sql`
   and run it. This creates all 11 tables, the 2 storage buckets
   (`product-images`, `ad-images`), row policies and seeds the `Healthcare`
   category.
3. Copy **Project Settings → API → URL** and **anon public** key.
4. Find & replace the two Supabase lines in the JS configs:
   - `app.js` → `window.ZETRA_CONFIG.supabase.url` / `.key`
   - every `*.html` page has inline `SUPABASE_URL` / `SUPABASE_KEY` constants
     (search for `oalshkwaqaljcaqrsoqi` replacing them all at once is fastest)
5. Products can then be added via `admindashboardpro.html`.

> Note: the dashboard login checks the `user_profiles` table for
> `role = 'admin'` for the admin gate; register an admin account first
> (or flip your own profile's `role` column in the Supabase Table Editor).

## Local preview

Any static server works:

```
npx serve .
# or
python -m http.server 8080
```

Then open http://localhost:8080 (paths are relative, so no build needed).

## Deploying to Vercel

```
npx vercel --prod --token <YOUR_TOKEN>
```

`vercel.json` already marks the root as a static site (no install/build).

## Data model (same structure as the reference project)

`categories`, `products`, `product_colors`, `product_sizes`, `product_media`,
`user_profiles`, `orders`, `coupons`, `hero_banners`, `ads`,
`contact_submissions` + storage buckets `product-images` and `ad-images`.

## Schedule / contact placeholders

Contact details are placeholders: `mail@indiamedcare.com`, `+1 581 705 5013`.
Update them in the footer/contact page before the client launch.
