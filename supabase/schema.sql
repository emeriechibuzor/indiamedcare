-- ============================================================================
-- IndiaMedCare — "Health is Wealth" (pharmaceutical e-commerce)
-- Supabase schema. Mirrors the exact backend contract used by
-- admindashboardpro.html + the storefront (same structure as JMPOTTERS).
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → paste entire file → Run.
-- ============================================================================

-- ---------- shops data tables ----------
create table if not exists categories (
  id           bigint generated always as identity primary key,
  name         text not null,
  slug         text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create table if not exists products (
  id            bigint generated always as identity primary key,
  name          text not null,
  price         numeric not null default 0,
  compare_price numeric default 0,
  category_id   bigint references categories(id) on delete set null,
  description   text,
  image_url     text,
  slug          text,
  stock         integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
create index if not exists products_category_idx on products(category_id);
create unique index if not exists products_slug_key on products(slug);

create table if not exists product_colors (
  id         bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  color_name text,
  color_code text,
  is_default boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists product_sizes (
  id             bigint generated always as identity primary key,
  product_id     bigint not null references products(id) on delete cascade,
  color_id       bigint references product_colors(id) on delete cascade,
  size_value     text,
  stock_quantity integer default 0,
  is_available   boolean default true,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

create table if not exists product_media (
  id              bigint generated always as identity primary key,
  product_id      bigint not null references products(id) on delete cascade,
  url             text not null,
  storage_path    text,
  media_type      text default 'image',
  sort_order      integer default 0,
  alt_text        text default '',
  caption         text default '',
  file_size_bytes bigint,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create table if not exists user_profiles (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  full_name  text,
  phone      text unique,
  address    text,
  city       text,
  state      text,
  role       text default 'customer',
  newsletter boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists orders (
  id                  bigint generated always as identity primary key,
  order_number        text,
  user_id             text,
  user_name           text,
  user_email          text,
  user_phone          text,
  full_name           text,
  shipping_address    text,
  city                text,
  state               text,
  total_amount        numeric default 0,
  shipping_fee        numeric default 0,
  grand_total         numeric default 0,
  status              text default 'pending',
  payment_status      text default 'pending',
  payment_method      text default 'card',
  items               jsonb default '[]'::jsonb,
  receipt_url         text,
  receipt_uploaded_at timestamptz,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists coupons (
  id               bigint generated always as identity primary key,
  code             text not null,
  discount_percent integer not null default 0,
  usage_limit      integer,
  times_used       integer default 0,
  expires_at       date,
  is_active        boolean default true,
  created_at       timestamptz default now() not null
);

create table if not exists hero_banners (
  id          bigint generated always as identity primary key,
  title       text,
  subtitle    text default '',
  image_url   text,
  link        text,
  target_page text default 'all',
  is_active   boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create table if not exists ads (
  id            bigint generated always as identity primary key,
  name          text,
  image_url     text,
  link_url      text,
  target_page   text default 'all',
  placement     text default 'after-hero',
  image_size    text default 'auto',
  custom_width  integer,
  custom_height integer,
  is_active     boolean default true,
  start_date    date,
  end_date      date,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create table if not exists contact_submissions (
  id         bigint generated always as identity primary key,
  name       text,
  email      text,
  phone      text,
  subject    text,
  message    text,
  created_at timestamptz default now() not null
);

-- ---------- stock decrement RPC (best-effort, race-safe; used at checkout) --
create or replace function decrement_product_stock(p_product_id bigint, p_quantity int)
returns void language plpgsql as $$
begin
  update products set stock = greatest(stock - p_quantity, 0), updated_at = now()
  where id = p_product_id;
end $$;

create or replace function decrement_size_stock(p_size_id bigint, p_quantity int)
returns void language plpgsql as $$
begin
  update product_sizes
  set stock_quantity = greatest(stock_quantity - p_quantity, 0),
      is_available = greatest(stock_quantity - p_quantity, 0) > 0,
      updated_at = now()
  where id = p_size_id;
end $$;

-- ---------- storage buckets (public read) -----------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true), ('ad-images', 'ad-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id in ('product-images','ad-images'));
create policy "anon upload product images" on storage.objects
  for insert with check (bucket_id in ('product-images','ad-images'));
create policy "anon update product images" on storage.objects
  for update using (bucket_id in ('product-images','ad-images'));
create policy "anon delete product images" on storage.objects
  for delete using (bucket_id in ('product-images','ad-images'));

-- ---------- RLS: open anon access (matches original storefront contract) ----
-- The vanilla storefront + admin use the anon key directly, so all wide reads
-- and admin writes must be allowed. Tighten later (e.g. service-role checks).
alter table categories enable row level security;
alter table products enable row level security;
alter table product_colors enable row level security;
alter table product_sizes enable row level security;
alter table product_media enable row level security;
alter table user_profiles enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;
alter table hero_banners enable row level security;
alter table ads enable row level security;
alter table contact_submissions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','products','product_colors','product_sizes',
                           'product_media','user_profiles','orders','coupons',
                           'hero_banners','ads','contact_submissions'] loop
    execute format('create policy "anon_write_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ---------- seed: the single Healthcare category ----------------------------
insert into categories (name, slug) values ('Drug and Meds', 'healthcare')
on conflict do nothing;

-- Key/value store used by checkout (crypto wallet addresses) and the admin settings panel
create table if not exists store_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now() not null
);
alter table store_settings enable row level security;
create policy store_settings_read on store_settings for select using (true);
create policy store_settings_write on store_settings for insert with check (true);
create policy store_settings_update on store_settings for update using (true) with check (true);
-- Pharmacist profiles shown on the homepage (uploaded from the admin dashboard)
create table if not exists pharmacists (
  id             bigint generated always as identity primary key,
  name           text not null,
  specialization text,
  photo_url      text,
  bio            text,
  sort_order     integer default 0,
  is_active      boolean default true,
  created_at     timestamptz default now() not null
);
alter table pharmacists enable row level security;
drop policy if exists pharmacists_read on pharmacists;
drop policy if exists pharmacists_write on pharmacists;
drop policy if exists pharmacists_update on pharmacists;
drop policy if exists pharmacists_delete on pharmacists;
create policy pharmacists_read   on pharmacists for select using (true);
create policy pharmacists_write  on pharmacists for insert with check (true);
create policy pharmacists_update on pharmacists for update using (true) with check (true);
create policy pharmacists_delete on pharmacists for delete using (true);
