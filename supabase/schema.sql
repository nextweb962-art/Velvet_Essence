-- ===========================================================================
-- Velvet Essence — Supabase schema
-- ---------------------------------------------------------------------------
-- Run this file in the Supabase SQL Editor (or `supabase db push`) to create
-- every table, index, trigger and Row Level Security policy the storefront
-- needs. It is idempotent: re-running it is safe.
--
-- Security model
--   • anon                → may read active products, place a newsletter signup
--   • authenticated       → anon + full CRUD on their OWN profile, cart,
--                           wishlist and orders (enforced by RLS)
--   • authenticated admin → additionally may CRUD products and read/update
--                           every order (via public.is_admin())
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_category') then
    create type public.product_category as enum
      ('lipstick', 'eyeshadow', 'blush', 'fragrance', 'skincare');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum
      ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles — one row per auth.users row, holds the role claim
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public mirror of auth.users, plus the authorization role used by RLS policies.';

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- is_admin() — the single source of truth for authorization.
-- SECURITY DEFINER so it can read profiles regardless of the caller's RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Privilege-escalation guard: a user may edit their own profile, never their
-- own role. Contexts without an auth.uid() (SQL editor, service role) may.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an administrator may change a profile role'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Auto-provision a profile on signup (email/password and OAuth alike)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- products
-- ===========================================================================
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  tagline           text,
  description       text not null default '',
  category          public.product_category not null,
  collection        text,
  price             numeric(10, 2) not null check (price >= 0),
  compare_at_price  numeric(10, 2) check (compare_at_price >= 0),
  images            jsonb not null default '[]'::jsonb,
  variant_groups    jsonb not null default '[]'::jsonb,
  badge             text,
  rating            numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count      integer not null default 0 check (review_count >= 0),
  stock             integer not null default 0 check (stock >= 0),
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Weighted full-text index target. A generated column keeps it in sync with
  -- no trigger and no application code.
  search_vector     tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tagline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(collection, '') || ' ' || array_to_string(tags, ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,
  constraint products_compare_at_above_price
    check (compare_at_price is null or compare_at_price >= price),
  constraint products_images_is_array
    check (jsonb_typeof(images) = 'array'),
  constraint products_variants_is_array
    check (jsonb_typeof(variant_groups) = 'array')
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_active_created_idx on public.products (is_active, created_at desc);
create index if not exists products_tags_idx on public.products using gin (tags);
create index if not exists products_search_idx on public.products using gin (search_vector);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

-- Storefront: anybody may read a live product. Drafts are admin-only.
drop policy if exists "products: public read active, admin read all" on public.products;
create policy "products: public read active, admin read all"
  on public.products for select
  to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "products: admin update" on public.products;
create policy "products: admin update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- cart_items — server-side cart for signed-in shoppers
-- ===========================================================================
create table if not exists public.cart_items (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  product_id        uuid not null references public.products (id) on delete cascade,
  variant_group_id  text,
  variant_option_id text,
  variant_label     text,
  quantity          integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists cart_items_user_idx on public.cart_items (user_id);

-- NULLs are distinct in a plain unique index, so coalesce the variant away.
create unique index if not exists cart_items_unique_line_idx
  on public.cart_items (user_id, product_id, coalesce(variant_option_id, ''));

drop trigger if exists cart_items_touch_updated_at on public.cart_items;
create trigger cart_items_touch_updated_at
  before update on public.cart_items
  for each row execute function public.touch_updated_at();

alter table public.cart_items enable row level security;

drop policy if exists "cart_items: owner read" on public.cart_items;
create policy "cart_items: owner read"
  on public.cart_items for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "cart_items: owner insert" on public.cart_items;
create policy "cart_items: owner insert"
  on public.cart_items for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "cart_items: owner update" on public.cart_items;
create policy "cart_items: owner update"
  on public.cart_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_items: owner delete" on public.cart_items;
create policy "cart_items: owner delete"
  on public.cart_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ===========================================================================
-- wishlists
-- ===========================================================================
create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_idx on public.wishlists (user_id);

alter table public.wishlists enable row level security;

drop policy if exists "wishlists: owner read" on public.wishlists;
create policy "wishlists: owner read"
  on public.wishlists for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "wishlists: owner insert" on public.wishlists;
create policy "wishlists: owner insert"
  on public.wishlists for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "wishlists: owner delete" on public.wishlists;
create policy "wishlists: owner delete"
  on public.wishlists for delete
  to authenticated
  using (auth.uid() = user_id);

-- ===========================================================================
-- orders + order_items
-- Orders are never written straight from the browser for guests; checkout runs
-- through /api/checkout which resolves prices server-side.
-- ===========================================================================
create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns text
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  select 'VE-' || to_char(now(), 'YYYYMMDD') || '-' ||
         lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

grant execute on function public.generate_order_number() to authenticated;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique default public.generate_order_number(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  email            text not null,
  customer_name    text not null,
  status           public.order_status not null default 'pending',
  subtotal         numeric(10, 2) not null check (subtotal >= 0),
  discount_code    text,
  discount_total   numeric(10, 2) not null default 0 check (discount_total >= 0),
  shipping_cost    numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  tax              numeric(10, 2) not null default 0 check (tax >= 0),
  total            numeric(10, 2) not null check (total >= 0),
  shipping_method  text not null default 'standard'
                     check (shipping_method in ('standard', 'express')),
  -- Delivery in Jordan is settled in cash at the door. Kept as text with an
  -- explicit allow-list rather than an enum so further tenders (bank transfer,
  -- e-wallet, card-on-delivery) can be added with a one-line constraint change.
  payment_method   text not null default 'cash_on_delivery'
                     check (payment_method in ('cash_on_delivery')),
  shipping_address jsonb not null,
  notes            text,
  constraint orders_discount_within_subtotal check (discount_total <= subtotal),
  constraint orders_total_is_coherent
    check (abs(total - (subtotal - discount_total + shipping_cost + tax)) < 0.02),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "orders: owner or admin read" on public.orders;
create policy "orders: owner or admin read"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- A shopper may only ever create an order attributed to themselves.
drop policy if exists "orders: owner insert" on public.orders;
create policy "orders: owner insert"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Customers may cancel their own pending order; only admins may move status on.
drop policy if exists "orders: owner limited update" on public.orders;
create policy "orders: owner limited update"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'cancelled');

drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "orders: admin delete" on public.orders;
create policy "orders: admin delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  product_slug  text,
  variant_label text,
  image         text,
  unit_price    numeric(10, 2) not null check (unit_price >= 0),
  quantity      integer not null check (quantity > 0),
  line_total    numeric(10, 2) not null check (line_total >= 0),
  created_at    timestamptz not null default now(),
  constraint order_items_line_total_matches
    check (abs(line_total - unit_price * quantity) < 0.01)
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

alter table public.order_items enable row level security;

drop policy if exists "order_items: readable with parent order" on public.order_items;
create policy "order_items: readable with parent order"
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items: insert into own order" on public.order_items;
create policy "order_items: insert into own order"
  on public.order_items for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'pending'
    )
  );

drop policy if exists "order_items: admin modify" on public.order_items;
create policy "order_items: admin modify"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "order_items: admin delete" on public.order_items;
create policy "order_items: admin delete"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- place_order() — atomic checkout.
--
-- SECURITY INVOKER on purpose: it runs as the caller, so the orders and
-- order_items RLS policies still decide what is allowed. All it buys us is a
-- single transaction, so a failure can never leave an order without its items.
--
-- Prices are *not* trusted from here for authorization purposes; the
-- authoritative recomputation happens in /api/checkout, and the coherence
-- constraints on both tables reject nonsense arithmetic.
-- ===========================================================================
create or replace function public.place_order(
  p_items            jsonb,
  p_email            text,
  p_customer_name    text,
  p_shipping_address jsonb,
  p_notes            text,
  p_shipping_method  text,
  p_payment_method   text,
  p_subtotal         numeric,
  p_discount_code    text,
  p_discount_total   numeric,
  p_shipping_cost    numeric,
  p_tax              numeric,
  p_total            numeric
)
returns public.orders
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  v_user  uuid := auth.uid();
  v_order public.orders;
  v_items integer;
begin
  if v_user is null then
    raise exception 'Authentication is required to place an order'
      using errcode = '42501';
  end if;

  v_items := coalesce(jsonb_array_length(p_items), 0);
  if v_items = 0 then
    raise exception 'An order needs at least one item'
      using errcode = '22023';
  end if;

  insert into public.orders (
    user_id, email, customer_name, status,
    subtotal, discount_code, discount_total,
    shipping_cost, tax, total, shipping_method, payment_method,
    shipping_address, notes
  ) values (
    v_user,                       -- never p_user_id: the caller cannot choose
    p_email, p_customer_name, 'pending',
    p_subtotal, nullif(p_discount_code, ''), coalesce(p_discount_total, 0),
    coalesce(p_shipping_cost, 0), coalesce(p_tax, 0), p_total,
    coalesce(p_shipping_method, 'standard'),
    coalesce(p_payment_method, 'cash_on_delivery'),
    p_shipping_address, nullif(p_notes, '')
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, product_slug,
    variant_label, image, unit_price, quantity, line_total
  )
  select
    v_order.id,
    nullif(item ->> 'product_id', '')::uuid,
    item ->> 'product_name',
    nullif(item ->> 'product_slug', ''),
    nullif(item ->> 'variant_label', ''),
    nullif(item ->> 'image', ''),
    (item ->> 'unit_price')::numeric,
    (item ->> 'quantity')::integer,
    (item ->> 'line_total')::numeric
  from jsonb_array_elements(p_items) as item;

  return v_order;
end;
$$;

grant execute on function public.place_order(
  jsonb, text, text, jsonb, text, text, text, numeric, text, numeric, numeric, numeric, numeric
) to authenticated;

-- ===========================================================================
-- newsletter_subscribers — write-only from the browser
-- ===========================================================================
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text default 'footer',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter: anyone may subscribe" on public.newsletter_subscribers;
create policy "newsletter: anyone may subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "newsletter: admin read" on public.newsletter_subscribers;
create policy "newsletter: admin read"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- Storage — public product imagery, admin-only writes
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "product images: public read" on storage.objects;
create policy "product images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product images: admin insert" on storage.objects;
create policy "product images: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin update" on storage.objects;
create policy "product images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin delete" on storage.objects;
create policy "product images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ===========================================================================
-- Grants — RLS still applies on top of these.
-- ===========================================================================
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant all on public.products to authenticated;
grant all on public.cart_items to authenticated;
grant all on public.wishlists to authenticated;
grant all on public.orders to authenticated;
grant all on public.order_items to authenticated;
grant all on public.profiles to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant usage, select on sequence public.order_number_seq to authenticated;

-- ===========================================================================
-- Bootstrap the first administrator (run once, replacing the address):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Then sign out and back in so the new role is picked up.
-- ===========================================================================
