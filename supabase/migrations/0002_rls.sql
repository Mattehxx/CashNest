-- CashNest — 0002 Row Level Security
-- Ogni utente accede SOLO ai dati delle famiglie di cui è membro.

-- ---------- Schema privato con helper SECURITY DEFINER ----------
-- I controlli di appartenenza vivono in funzioni SECURITY DEFINER (bypassano la
-- RLS) per evitare la ricorsione infinita nelle policy su family_members.
create schema if not exists app;
revoke all on schema app from anon, authenticated;

create or replace function app.is_family_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = target
      and fm.profile_id = (select auth.uid())
  );
$$;

create or replace function app.is_family_admin(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = target
      and fm.profile_id = (select auth.uid())
      and fm.role = 'admin'
  );
$$;

create or replace function app.current_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select fm.family_id from public.family_members fm
  where fm.profile_id = (select auth.uid());
$$;

grant execute on function app.is_family_member(uuid) to authenticated;
grant execute on function app.is_family_admin(uuid) to authenticated;
grant execute on function app.current_family_ids() to authenticated;

-- ---------- Abilita RLS ----------
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.expenses enable row level security;

-- ---------- Famiglie ----------
create policy families_select on public.families
  for select to authenticated
  using (id in (select app.current_family_ids()));

create policy families_update on public.families
  for update to authenticated
  using ((select app.is_family_admin(id)))
  with check ((select app.is_family_admin(id)));

-- ---------- Profili (sé stessi + co-membri) ----------
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or id in (
      select fm.profile_id from public.family_members fm
      where fm.family_id in (select app.current_family_ids())
    )
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------- Membri (gestione riservata agli admin) ----------
create policy family_members_select on public.family_members
  for select to authenticated
  using ((select app.is_family_member(family_id)));

create policy family_members_insert on public.family_members
  for insert to authenticated
  with check ((select app.is_family_admin(family_id)));

create policy family_members_update on public.family_members
  for update to authenticated
  using ((select app.is_family_admin(family_id)))
  with check ((select app.is_family_admin(family_id)));

create policy family_members_delete on public.family_members
  for delete to authenticated
  using ((select app.is_family_admin(family_id)));

-- ---------- Dati di dominio: tutti i membri hanno CRUD completo ----------
create policy accounts_all on public.accounts
  for all to authenticated
  using ((select app.is_family_member(family_id)))
  with check ((select app.is_family_member(family_id)));

create policy categories_all on public.categories
  for all to authenticated
  using ((select app.is_family_member(family_id)))
  with check ((select app.is_family_member(family_id)));

create policy recurring_expenses_all on public.recurring_expenses
  for all to authenticated
  using ((select app.is_family_member(family_id)))
  with check ((select app.is_family_member(family_id)));

create policy expenses_all on public.expenses
  for all to authenticated
  using ((select app.is_family_member(family_id)))
  with check ((select app.is_family_member(family_id)));
