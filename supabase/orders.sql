create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  pickup_type text not null check (pickup_type in ('ASAP', 'Later')),
  pickup_time text not null,
  payment_method text not null check (payment_method in ('Cash', 'Cash App')),
  special_instructions text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  status text not null default 'New' check (
    status in ('New', 'Accepted', 'Ready', 'Completed', 'Cancelled')
  ),
  printed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  menu_item_number text not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  selected_price_id text,
  selected_price_label text,
  selected_price text,
  modifiers jsonb not null default '[]'::jsonb,
  notes text,
  spicy boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists selected_price_id text,
  add column if not exists selected_price_label text,
  add column if not exists selected_price text,
  add column if not exists modifiers jsonb not null default '[]'::jsonb;

create table if not exists public.restaurant_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (key, value)
values ('online_ordering_open', '{"open": true}'::jsonb)
on conflict (key) do nothing;

create index if not exists orders_created_at_idx
  on public.orders(created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists restaurant_settings_set_updated_at on public.restaurant_settings;

create trigger restaurant_settings_set_updated_at
before update on public.restaurant_settings
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.restaurant_settings enable row level security;

drop policy if exists "Anyone can create pickup orders" on public.orders;
create policy "Anyone can create pickup orders"
on public.orders
for insert
to anon
with check (true);

drop policy if exists "Anyone can read pickup orders for MVP admin" on public.orders;
create policy "Anyone can read pickup orders for MVP admin"
on public.orders
for select
to anon
using (true);

drop policy if exists "Anyone can update pickup orders for MVP admin" on public.orders;
create policy "Anyone can update pickup orders for MVP admin"
on public.orders
for update
to anon
using (true)
with check (true);

drop policy if exists "Anyone can create pickup order items" on public.order_items;
create policy "Anyone can create pickup order items"
on public.order_items
for insert
to anon
with check (true);

drop policy if exists "Anyone can read pickup order items for MVP admin" on public.order_items;
create policy "Anyone can read pickup order items for MVP admin"
on public.order_items
for select
to anon
using (true);

drop policy if exists "Anyone can read restaurant settings for MVP" on public.restaurant_settings;
create policy "Anyone can read restaurant settings for MVP"
on public.restaurant_settings
for select
to anon
using (true);

drop policy if exists "Anyone can update restaurant settings for MVP admin" on public.restaurant_settings;
create policy "Anyone can update restaurant settings for MVP admin"
on public.restaurant_settings
for update
to anon
using (true)
with check (true);

drop policy if exists "Anyone can create restaurant settings for MVP admin" on public.restaurant_settings;
create policy "Anyone can create restaurant settings for MVP admin"
on public.restaurant_settings
for insert
to anon
with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_items'
  ) then
    alter publication supabase_realtime add table public.order_items;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'restaurant_settings'
  ) then
    alter publication supabase_realtime add table public.restaurant_settings;
  end if;
end $$;
