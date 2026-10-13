# Velvet Essence — دار الجمال

A production-shaped e-commerce storefront for a luxury makeup and fragrance boutique,
**localised for Jordan: Arabic-only, fully RTL, priced in JOD, cash on delivery.**

Built with **Next.js 15 (App Router, TypeScript)**, **Tailwind CSS v4**, **Supabase**
(Postgres + Auth + Row Level Security) and deployed on **Vercel**.

> **It runs with zero configuration.** Clone, install, `npm run dev` — the storefront
> serves a curated 24-piece catalogue from a bundled JSON file. Connect Supabase to
> switch on accounts, carts, orders and the admin dashboard.

---

## Table of contents

- [What is in here](#what-is-in-here)
- [Quick start](#quick-start)
- [Connecting Supabase](#connecting-supabase)
- [Becoming an administrator](#becoming-an-administrator)
- [Google OAuth](#google-oauth)
- [The security model](#the-security-model)
- [Deploying to Vercel](#deploying-to-vercel)
- [Demo walkthrough](#demo-walkthrough)
- [Project structure](#project-structure)
- [Design decisions worth knowing](#design-decisions-worth-knowing)
- [Scripts](#scripts)
- [Known boundaries](#known-boundaries)

---

## What is in here

**Storefront**

- Editorial landing page: hero with floating glass cards, Makeup vs. Perfume collection
  bento, an auto-advancing promotional carousel, trending and new-arrival rails,
  testimonials, and an atelier booking band.
- Catalogue with URL-driven filtering — category (repeatable), price range, five sort
  modes, pagination — plus a **debounced instant-search overlay** (`⌘K` / `Ctrl-K`) backed
  by Postgres full-text search.
- Product detail: gallery that follows the selected variant, colour-swatch shade selector
  for makeup, size/volume selector with per-size price deltas for fragrance, live stock
  messaging, wishlist toggle, quantity stepper and an accordion of product care.
- Slide-over cart drawer with a free-shipping progress meter, quantity editing, syncing
  indicator and a reactive order summary.
- Checkout with validated contact / address / delivery sections, **cash on delivery** (no
  card step at all), promo codes, express shipping and a sticky summary. Orders are written
  to Postgres in a single transaction and confirmed on a receipt page.
- Accounts: sign up, sign in, Google OAuth, profile editing, order history with
  expandable breakdowns, and a wishlist.
- **Arabic-only, fully RTL, Jordanian**: JOD pricing with Western digits, the twelve
  governorates, Jordanian phone validation, 16% GST, and Arabic typography rules in the
  design system rather than bolted on per component.

**Back of house**

- Protected admin dashboard: revenue / order / product / client tiles, latest orders,
  full catalogue table with publish toggles and inline delete confirmation, a complete
  product editor (imagery uploader, variant-group builder, slug generation, merchandising
  flags) and one-click order fulfilment status.

**Engineering**

- Zod schemas for every form, server action and route handler — the same schema validates
  on the client for instant feedback and on the server as the authority.
- Row Level Security on every table, plus `SECURITY DEFINER` helper functions and a
  privilege-escalation guard on `profiles.role`.
- Server-side price recomputation at checkout: the browser only ever sends product ids,
  variant ids and quantities.
- 29 hand-generated SVG illustrations (zero external image dependencies, no layout shift,
  infinitely crisp), `next/image` everywhere, 103 kB shared JS.

---

## Quick start

```bash
git clone <your-fork-url> velvet-essence
cd velvet-essence
npm install
npm run dev
```

Open <http://localhost:3000>. You are in **demo mode**:

| Works                                                                 | Needs Supabase |
| --------------------------------------------------------------------- | -------------- |
| Browsing, filtering, Arabic instant search                             | —              |
| Product pages, shade/size selection, wishlist button (prompts sign-in) | —              |
| Cart drawer, quantity editing, free-delivery meter                     | —              |
| Cash-on-delivery checkout + receipt page (labelled as a demo order)    | —              |
| Sign up / sign in, saved carts, real orders, wishlist persistence      | ✅             |
| Admin dashboard CRUD + image upload                                    | ✅             |

Demo-mode carts persist in `localStorage`; nothing is written to a database.

---

## Connecting Supabase

**1. Create the project.** <https://supabase.com/dashboard> → *New project*. Copy the
project URL and the `anon` key from *Settings → API*.

**2. Apply the schema.** Open *SQL Editor* → *New query*, paste the whole of
[`supabase/schema.sql`](./supabase/schema.sql) and run it. It creates every table, index,
trigger, function, view, storage bucket and RLS policy. It is idempotent — safe to re-run.

**3. Seed the catalogue.** Paste and run [`supabase/seed.sql`](./supabase/seed.sql).

> `seed.sql` is a **generated file**. Edit `src/data/catalog.json` and run
> `npm run seed` to regenerate it. The same JSON powers demo mode, so the two can never
> drift.

**4. Point the app at it.**

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**5. Configure auth redirects.** *Authentication → URL Configuration*:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs** (add both, plus your production domain later):
  - `http://localhost:3000/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

Restart `npm run dev`. The gold "Demo" ribbon disappears.

`SUPABASE_SERVICE_ROLE_KEY` is optional and only read by
[`src/lib/supabase/admin.ts`](./src/lib/supabase/admin.ts), which is marked `server-only`.
The application never needs it; leave it blank unless you add background jobs.

---

## Becoming an administrator

Sign up through the storefront first, then promote yourself in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in so the session picks up the new role, then visit `/admin`.

`role` is protected by the `guard_profile_role` trigger: a signed-in shopper cannot
promote themselves, no matter what they send. The SQL editor works because there is no
`auth.uid()` in that context.

---

## Google OAuth

1. In Google Cloud Console create an **OAuth 2.0 Client ID** (Web application).
2. Authorised redirect URI — this is Supabase's callback, not yours:
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. Paste the client ID and secret into Supabase → *Authentication → Providers → Google*.
4. Add `https://<project-ref>.supabase.co/auth/v1/callback` to the Supabase redirect
   allow-list (it usually is already) and keep your own `/auth/callback` URLs registered
   as in step 5 above.

The app's `/auth/callback` handler accepts **both** the PKCE `code` flow and the
`token_hash` OTP flow, so OAuth, magic links and email confirmation all land correctly.
`next` is validated to a same-site relative path — the endpoint cannot be used as an open
redirect.

---

## The security model

### Roles

| Role            | Can do                                                                               |
| --------------- | ------------------------------------------------------------------------------------ |
| `anon`          | Read active products. Insert a newsletter subscription. Nothing else.                 |
| `authenticated` | Everything above, plus full CRUD on **their own** profile, cart, wishlist and orders. |
| admin           | Everything, plus create/update/delete products and read/update every order.           |

### Defence in depth

1. **`middleware.ts`** refreshes the session cookie and redirects unauthenticated traffic
   away from `/checkout`, `/account` and `/admin` — and non-admins away from `/admin`.
2. **`src/app/admin/layout.tsx`** re-checks the role independently, in case a route is ever
   added that the middleware matcher misses.
3. **Every admin server action** calls `requireAdmin()` before touching the database.
4. **Row Level Security** is the actual enforcement point. Even a hand-crafted PostgREST
   request with a valid JWT cannot read another shopper's cart or order.

### How RLS is written

- `public.is_admin()` is a `SECURITY DEFINER`, `STABLE`, `search_path`-pinned SQL function.
  It is the single source of truth for authorization and is reused by every policy.
- `products` — readable when `is_active`, otherwise admin-only; writes are admin-only.
- `cart_items` / `wishlists` — `auth.uid() = user_id` on **select, insert, update and
  delete**. The unique cart index coalesces `variant_option_id` so variant-less lines
  de-duplicate correctly (bare `NULL`s would not).
- `orders` — read when `auth.uid() = user_id` or admin. Insert only as yourself. A shopper
  may move their own `pending` order to `cancelled` and nothing else; admins may set any
  status.
- `order_items` — visible only through an order you can read; insertable only into your own
  `pending` order.
- `newsletter_subscribers` — anyone may insert; only admins may read.
- `profiles` — read/update your own row; a `BEFORE UPDATE` trigger blocks role changes
  unless the caller is already an admin (or the change comes from a context without an
  `auth.uid()`, i.e. the SQL editor).
- **Storage** — `product-images` is publicly readable and writable only by admins.

### Checkout is the trust boundary

`POST /api/checkout` never trusts a price, a product name or an image from the client:

1. Zod validates the payload shape.
2. The catalogue is re-read server-side for the requested ids.
3. Every line's unit price is recomputed from `products.price` + the variant's
   `priceDelta`; unknown or inactive products are rejected with `409`.
4. Quantities are clamped to real stock.
5. Discount codes are resolved against the rule table and re-derived.
6. Shipping, tax and total are computed by the same `computeTotals()` the UI uses.
7. `place_order()` — a single `SECURITY INVOKER` PL/pgSQL function — writes the order and
   its items in one transaction, forcing `user_id = auth.uid()`. RLS still applies inside
   it, and database `CHECK` constraints reject incoherent arithmetic.

### Other hardening

- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) on every route.
- Zod `.catch()`-guarded query parsing, so a hand-edited URL degrades to defaults instead
  of throwing a 500.
- Full-text search uses `websearch_to_tsquery`, which cannot be induced to raise on
  arbitrary input — no SQL injection surface, no error-based probing.
- `dangerouslySetInnerHTML` appears exactly once, for the product JSON-LD block, and only
  serialises our own server-side data.
- No secrets in client code: the service-role key lives behind a `server-only` import, and
  `.env.local` is gitignored.

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Vercel → *Add New Project* → import the repo. The framework is detected automatically;
   no build settings need changing.
3. Add the environment variables under *Settings → Environment Variables*:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

4. Deploy, then add `https://your-app.vercel.app/auth/callback` to Supabase's redirect
   allow-list and update the Site URL.

`NEXT_PUBLIC_SITE_URL` matters: it is what OAuth and email confirmation links redirect
back to. Without it the app falls back to `VERCEL_URL`, which changes per deployment.

---

## Demo walkthrough

Sign in → browse → add to bag → check out:

1. **Sign up** at `/signup` (or continue with Google once OAuth is configured).
2. `⌘K` and type `عطر` or `ورد` — instant Arabic full-text results from Postgres.
3. Open **روز أمبري**, switch between 30 / 50 / 100 مل — price, stock and badge update.
4. Add to bag, open the drawer, push the subtotal past **50 د.أ** for free delivery.
5. **Checkout** → apply **`WELCOME10`** → pick a governorate → choose Express →
   place the order. **There is no card step** — it is cash on delivery.
6. The receipt page reads the order back **through RLS**, proving it belongs to you.
7. Promote yourself to admin and visit `/admin` → edit a price → watch the storefront
   update.

Promo codes: `WELCOME10` (10% off), `VELVET20` (20% off over 100 JOD),
`BLOOM5` (5 JOD off over 40 JOD).

---

## Localisation — Jordan, Arabic, RTL

The storefront is **Arabic-only**, so the document is `<html lang="ar" dir="rtl">` and the
whole UI is written right-to-left rather than mirrored at runtime.

**Currency and locale.** Prices are stored and displayed in **Jordanian Dinar**.
`formatPrice()` uses `Intl.NumberFormat("ar-JO-u-nu-latn")` — Arabic wording with **Western
digits**, which is what Jordanian retail actually uses — and appends `د.أ` by hand, because
CLDR's Arabic JOD symbol carries a trailing Arabic letter mark that renders as a stray mark
inside buttons. Tax is Jordan's 16% general sales tax on cosmetics; delivery is domestic,
free above 50 JOD.

**Addressing.** The country is fixed to الأردن rather than chosen, the region field is a
select of the twelve governorates, and phone numbers are validated against Jordanian mobile
(`07X XXXXXXX`) and landline (`0X XXXXXXX`) formats with or without the `+962` prefix.

**Payment.** Cash on delivery only. `orders.payment_method` is a text column with an
explicit `check` allow-list, `place_order()` takes it as a parameter, and the checkout form
has no card, CVC or expiry field anywhere — there is nothing to leak because nothing is
collected.

### Arabic typography rules

Two Latin-centric habits actively damage Arabic text, and both are neutralised in the RTL
base layer of `src/app/globals.css`:

1. **Letter-spacing breaks the script.** Arabic is cursive; inserted space splits the joins
   between letters and every word looks broken. Tracking is stripped from all RTL content,
   and Latin runs — promo codes, order numbers, the wordmark, `@velvetessence.jo` — opt back
   in with the `.latin` utility.
2. **Synthetic italics look like a rendering bug.** Arabic has no italic tradition, so
   `font-style: italic` is reset to normal throughout.

Emphasis for key words therefore uses **colour and the rose-gold gradient**
(`text-rose-700`, `.text-foil`) instead of slant. Numeric runs get the `.num` utility, which
forces a tabular, LTR-isolated rendering so discount badges and order references are never
reordered by the bidi algorithm.

### Layout direction

Tailwind v4's `space-x-*` is already logical, so sibling spacing mirrors for free. Everything
else uses logical utilities — `ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`
— rather than physical `left`/`right`, so components read correctly without per-component
conditionals. A test asserts no physical directional utilities survive in the rendered markup.

Physical transforms do not mirror, so the three places that need them are written explicitly
for RTL: the cart drawer is anchored `end-0` (the left edge) and hidden with
`-translate-x-full`; the mobile menu slides in from the `start` edge; and inactive carousel
slides drift `-translate-x-8`. Directional icons are swapped at the source
(`ArrowRight` → `ArrowLeft`, pagination chevrons reversed) rather than flipped with CSS, so
they never fight a `transform` utility on the same element.

Fonts are **El Messiri** for display and **IBM Plex Sans Arabic** for text — both ship proper
Arabic shaping plus a matching Latin set, so codes and SKUs sit harmoniously beside Arabic
copy instead of falling back to Arial.

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            fonts, providers, navbar/footer shell
│  ├─ page.tsx              landing page
│  ├─ shop/                 catalogue (URL-driven filters) + loading skeleton
│  ├─ product/[slug]/       product detail + JSON-LD
│  ├─ cart/ checkout/       bag page, checkout, receipt
│  ├─ login/ signup/        auth screens
│  ├─ account/              profile, orders, wishlist (+ server actions)
│  ├─ admin/                protected dashboard (+ server actions)
│  ├─ api/                  products (search), checkout, wishlist, newsletter
│  ├─ auth/                 callback (PKCE + OTP), signout (POST)
│  ├─ sitemap.ts robots.ts error.tsx not-found.tsx
│  └─ globals.css           the entire design system, as Tailwind v4 @theme tokens
├─ components/
│  ├─ layout/  home/  product/  cart/  checkout/  shop/
│  ├─ admin/  account/  auth/  search/  providers/  ui/
├─ lib/
│  ├─ supabase/             browser, server, middleware, admin (service-role) clients
│  ├─ products.ts account.ts admin.ts    server-side data access
│  ├─ catalog.ts product-mapper.ts       demo catalogue + row → domain mapping
│  ├─ cart.ts discounts.ts               pure pricing logic shared by both sides
│  ├─ validation.ts         every Zod schema, in one auditable place
│  └─ env.ts constants.ts utils.ts format.ts
├─ types/                   domain types + hand-written Database types
├─ data/catalog.json        single source of truth for the 24 products
└─ middleware.ts            session refresh + route gating
supabase/
├─ schema.sql               tables, RLS, functions, triggers, storage policies
└─ seed.sql                 GENERATED from src/data/catalog.json
scripts/
├─ generate-product-art.mjs writes the 29 SVG illustrations
└─ generate-seed.mjs        writes supabase/seed.sql
```

---

## Design decisions worth knowing

**The catalogue is a JSON file, not 24 rows of SQL.** `src/data/catalog.json` feeds demo
mode *and* generates `seed.sql`, so a fresh clone looks identical to a seeded database and
the two can never disagree.

**Filters live in the URL.** Category, price, sort, search term and page are all query
parameters. Every filtered view is shareable, back-button correct, server-rendered and
crawlable — with no duplicated client-side catalogue. A `useTransition` keeps the grid
from flashing while the server responds.

**Only the interactive parts are client components.** `ProductGrid` and the landing-page
sections are server components; `ProductCard` is the client shell that wraps them. Product
data never crosses into the JS bundle, which is why the shared first-load JS is 103 kB.

**The imagery is vector art, generated in-repo.** `scripts/generate-product-art.mjs`
produces 29 parameterised SVGs (five lipstick colourways, four palettes, three blush
compacts, flacons, mists, serums, jars and a hero still life) — one per shade, so selecting
a shade genuinely swaps the image. Deep-zoom crispness on every device, no CDN, no pop-in,
no copyright question. Admin uploads to Supabase Storage are supported alongside.

**Money is computed in one place.** `computeTotals()` in `lib/cart.ts` is pure and shared
by the cart drawer, the checkout summary and the checkout API, so the number a shopper
sees is the number the server charges.

**Demo mode is a first-class path, not a stub.** Every server-side data function falls back
to the bundled catalogue when Supabase is absent, and every failure path (missing schema,
RLS denial) degrades to the local cart rather than a 500.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also typechecks and lints) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals` + `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run art` | Regenerate the 29 product illustrations |
| `npm run seed` | Regenerate `supabase/seed.sql` from `catalog.json` |

---

## Known boundaries

These are deliberate scoping decisions, called out honestly:

- **Payments are cash on delivery.** There is no card step and no PSP: the checkout
  collects contact, address and delivery only, and orders land as `pending` for the
  courier to collect at the door. To add a tender later, extend the
  `orders.payment_method` check constraint and replace the `place_order` RPC call with
  one that runs after a webhook confirms capture — the trust boundary is already in the
  right place for it.
- **Tax is a flat blended rate** (`COMMERCE.taxRate`). Real deployments should use Stripe
  Tax or similar; the shape of the code does not need to change.
- **Email is not wired up.** Supabase handles confirmation and password-reset emails; the
  order confirmation itself is on-screen only.
- **No rate limiting.** Add Vercel WAF or Upstash Ratelimit in front of `/api/*` for a
  public launch.
- **Reviews are seeded, not user-authored.** `rating` and `review_count` are merchandising
  fields; there is no review submission flow.
- **Guest checkout is intentionally not supported.** The cart works for guests from
  `localStorage`, and sign-in is required at checkout — which keeps the RLS model for
  orders provably simple. Merging a guest cart into the account cart is handled on sign-in.

---

## Licence

MIT for the code. The Velvet Essence name, copy and illustrations are part of this
demonstration build.
