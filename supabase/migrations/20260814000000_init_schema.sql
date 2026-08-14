create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  invited_email text not null,
  status text not null default 'invited' check (status in ('invited', 'active')),
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense'))
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  added_by_user_id uuid references auth.users (id) on delete set null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index transactions_household_id_idx on transactions (household_id);
create index transactions_date_idx on transactions (date);
create index categories_household_id_idx on categories (household_id);
create index household_members_household_id_idx on household_members (household_id);
