-- security definer bypasses RLS internally, which avoids infinite recursion
-- when a household_members policy needs to query household_members itself.
create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

alter table households enable row level security;
alter table household_members enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "members can view their household"
  on households for select
  using (is_household_member(id));

create policy "signed-in users can create a household"
  on households for insert
  with check (auth.uid() is not null);

create policy "view own membership, pending invites, or fellow members"
  on household_members for select
  using (
    user_id = auth.uid()
    or invited_email = (auth.jwt() ->> 'email')
    or is_household_member(household_id)
  );

create policy "join a household as self or invite a member"
  on household_members for insert
  with check (
    user_id = auth.uid()
    or is_household_member(household_id)
  );

create policy "claim a pending invite or manage fellow members"
  on household_members for update
  using (
    invited_email = (auth.jwt() ->> 'email')
    or is_household_member(household_id)
  )
  with check (
    user_id = auth.uid()
    or is_household_member(household_id)
  );

create policy "members manage their household's categories"
  on categories for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members manage their household's transactions"
  on transactions for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
