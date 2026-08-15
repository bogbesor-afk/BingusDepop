drop policy if exists "members can view their household" on households;
drop policy if exists "signed-in users can create a household" on households;
drop policy if exists "view own membership, pending invites, or fellow members" on household_members;
drop policy if exists "join a household as self or invite a member" on household_members;
drop policy if exists "claim a pending invite or manage fellow members" on household_members;
drop policy if exists "members manage their household's categories" on categories;
drop policy if exists "members manage their household's transactions" on transactions;

drop table if exists transactions;
drop table if exists categories;
drop table if exists household_members;
drop table if exists households;
drop function if exists public.is_household_member(uuid);

create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  cost_per_unit numeric not null default 0,
  sale_price_default numeric,
  created_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references items (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_cost numeric not null,
  purchased_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references items (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null,
  sold_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index items_user_id_idx on items (user_id);
create index purchases_user_id_idx on purchases (user_id);
create index purchases_item_id_idx on purchases (item_id);
create index sales_user_id_idx on sales (user_id);
create index sales_item_id_idx on sales (item_id);

alter table items enable row level security;
alter table purchases enable row level security;
alter table sales enable row level security;

create policy "users manage their own items"
  on items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users manage their own purchases"
  on purchases for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users manage their own sales"
  on sales for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
