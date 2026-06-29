-- ============================================================
-- 0001_init.sql
-- ============================================================
-- CashNest — 0001 Schema iniziale
-- Esegui le migrazioni in ordine (0001 → 0005) nel SQL Editor di Supabase.

create extension if not exists pgcrypto;

-- ---------- Enumerazioni ----------
create type public.member_role as enum ('admin', 'member');

create type public.account_type as enum ('conto_corrente', 'carta', 'bancomat', 'contanti');

create type public.expense_frequency as enum (
  'giornaliera',
  'settimanale',
  'mensile',
  'bimestrale',
  'trimestrale',
  'semestrale',
  'annuale'
);

-- ---------- Helper updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Famiglie ----------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_families_updated before update on public.families
  for each row execute function public.set_updated_at();

-- ---------- Profili (1:1 con auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- Membri della famiglia ----------
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (family_id, profile_id)
);
create index idx_family_members_family on public.family_members (family_id);
create index idx_family_members_profile on public.family_members (profile_id);

-- ---------- Conti / metodi di pagamento ----------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  type public.account_type not null,
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_accounts_family on public.accounts (family_id);
create trigger trg_accounts_updated before update on public.accounts
  for each row execute function public.set_updated_at();

-- ---------- Categorie ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, name)
);
create index idx_categories_family on public.categories (family_id);
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------- Spese ricorrenti ----------
create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency public.expense_frequency not null,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  start_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_recurring_family on public.recurring_expenses (family_id);
create index idx_recurring_account on public.recurring_expenses (account_id);
create index idx_recurring_category on public.recurring_expenses (category_id);
create index idx_recurring_active on public.recurring_expenses (family_id) where is_active;
create trigger trg_recurring_updated before update on public.recurring_expenses
  for each row execute function public.set_updated_at();

-- ---------- Spese variabili (schema pronto per la Fase 2) ----------
-- Scelta di modellazione: UNA categoria per spesa (category_id) per totali
-- "per categoria" corretti e UX semplice.
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  date date not null default current_date,
  notes text,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_expenses_family on public.expenses (family_id);
create index idx_expenses_family_date on public.expenses (family_id, date desc);
create index idx_expenses_account on public.expenses (account_id);
create index idx_expenses_category on public.expenses (category_id);
create trigger trg_expenses_updated before update on public.expenses
  for each row execute function public.set_updated_at();


-- ============================================================
-- 0002_rls.sql
-- ============================================================
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


-- ============================================================
-- 0003_onboarding.sql
-- ============================================================
-- CashNest — 0003 Onboarding nuovi utenti
-- Alla registrazione: crea il profilo e, se l'email è in allow-list, aggancia
-- l'utente alla famiglia.

-- ---------- Allow-list inviti ----------
create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  email text not null,
  role public.member_role not null default 'member',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (family_id, email)
);

alter table public.family_invites enable row level security;

create policy family_invites_admin_all on public.family_invites
  for all to authenticated
  using ((select app.is_family_admin(family_id)))
  with check ((select app.is_family_admin(family_id)));

-- ---------- Trigger di creazione utente ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar'
  );

  -- Auto-aggancio alla famiglia se l'email è stata invitata.
  insert into public.family_members (family_id, profile_id, role)
  select i.family_id, new.id, i.role
  from public.family_invites i
  where lower(i.email) = lower(new.email)
    and i.accepted_at is null;

  update public.family_invites
  set accepted_at = now()
  where lower(email) = lower(new.email)
    and accepted_at is null;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 0004_seed.sql
-- ============================================================
-- CashNest — 0004 Dati iniziali
-- Famiglia, inviti (allow-list), categorie e conti di default.
-- Idempotente: può essere rieseguito senza creare duplicati.

-- ---------- Famiglia ----------
insert into public.families (id, name)
values ('00000000-0000-0000-0000-0000000000c1', 'Famiglia Rovellini')
on conflict (id) do nothing;

-- ---------- Invito admin (allow-list) ----------
-- Gli altri membri si aggiungono dall'app (sezione Gestione).
insert into public.family_invites (family_id, email, role) values
  ('00000000-0000-0000-0000-0000000000c1', 'teorove04@gmail.com', 'admin')
on conflict (family_id, email) do nothing;

-- ---------- Categorie di default ----------
insert into public.categories (family_id, name, icon, color) values
  ('00000000-0000-0000-0000-0000000000c1', 'Alimentari', 'utensils', '#22c55e'),
  ('00000000-0000-0000-0000-0000000000c1', 'Casa', 'house', '#3b82f6'),
  ('00000000-0000-0000-0000-0000000000c1', 'Auto', 'car', '#ef4444'),
  ('00000000-0000-0000-0000-0000000000c1', 'Assicurazioni', 'shield', '#6366f1'),
  ('00000000-0000-0000-0000-0000000000c1', 'Bollette', 'zap', '#f59e0b'),
  ('00000000-0000-0000-0000-0000000000c1', 'Salute', 'heart-pulse', '#ec4899'),
  ('00000000-0000-0000-0000-0000000000c1', 'Tempo libero', 'gamepad', '#a855f7'),
  ('00000000-0000-0000-0000-0000000000c1', 'Abbonamenti', 'repeat', '#14b8a6')
on conflict (family_id, name) do nothing;

-- ---------- Conti di default ----------
insert into public.accounts (family_id, name, type, icon, color)
select v.family_id, v.name, v.type, v.icon, v.color
from (values
  ('00000000-0000-0000-0000-0000000000c1'::uuid, 'Contanti', 'contanti'::public.account_type, 'banknote', '#22c55e'),
  ('00000000-0000-0000-0000-0000000000c1'::uuid, 'Conto corrente', 'conto_corrente'::public.account_type, 'landmark', '#3b82f6')
) as v (family_id, name, type, icon, color)
where not exists (
  select 1 from public.accounts a
  where a.family_id = v.family_id and a.name = v.name
);


-- ============================================================
-- 0005_realtime.sql
-- ============================================================
-- CashNest — 0005 Realtime
-- Pubblica le tabelle di dominio per la sincronizzazione in tempo reale.
-- replica identity full → il client riceve la PK anche sugli eventi DELETE.
-- La RLS è rispettata anche dal Realtime: ogni client riceve solo i propri eventi.

alter publication supabase_realtime add table public.accounts;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.recurring_expenses;
alter publication supabase_realtime add table public.expenses;

alter table public.accounts replica identity full;
alter table public.categories replica identity full;
alter table public.recurring_expenses replica identity full;
alter table public.expenses replica identity full;


-- ============================================================
-- 0006_profile_email.sql
-- ============================================================
-- CashNest — 0006 Email nel profilo
-- Serve a mostrare l'email dei membri nella gestione utenti in-app.

alter table public.profiles add column if not exists email text;

-- Backfill dalle utenze esistenti.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Aggiorna il trigger di onboarding per popolare anche l'email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'avatar'
  );

  insert into public.family_members (family_id, profile_id, role)
  select i.family_id, new.id, i.role
  from public.family_invites i
  where lower(i.email) = lower(new.email)
    and i.accepted_at is null;

  update public.family_invites
  set accepted_at = now()
  where lower(email) = lower(new.email)
    and accepted_at is null;

  return new;
end;
$$;


-- ============================================================
-- 0007_multifamily.sql
-- ============================================================
-- CashNest — 0007 Multi-famiglia
-- RPC per creare famiglie e agganciare gli inviti in attesa (utenti già esistenti).
-- La RLS esistente supporta già lettura/scrittura su più famiglie.

-- Crea una famiglia e rende il chiamante admin di essa (atomico, bypassa la RLS).
create or replace function public.create_family(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_family_id uuid;
begin
  if v_uid is null then
    raise exception 'Non autenticato';
  end if;
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Nome famiglia mancante';
  end if;

  insert into public.families (name) values (btrim(p_name)) returning id into v_family_id;

  insert into public.family_members (family_id, profile_id, role)
  values (v_family_id, v_uid, 'admin');

  -- Categorie di default per la nuova famiglia.
  insert into public.categories (family_id, name, icon, color) values
    (v_family_id, 'Alimentari', 'utensils', '#22c55e'),
    (v_family_id, 'Casa', 'house', '#3b82f6'),
    (v_family_id, 'Auto', 'car', '#ef4444'),
    (v_family_id, 'Assicurazioni', 'shield', '#6366f1'),
    (v_family_id, 'Bollette', 'zap', '#f59e0b'),
    (v_family_id, 'Salute', 'heart-pulse', '#ec4899'),
    (v_family_id, 'Tempo libero', 'gamepad', '#a855f7'),
    (v_family_id, 'Abbonamenti', 'repeat', '#14b8a6');

  return v_family_id;
end;
$$;

grant execute on function public.create_family(text) to authenticated;

-- Aggancia l'utente corrente a tutti gli inviti in attesa per la sua email.
create or replace function public.claim_pending_invites()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
begin
  if v_uid is null then
    return;
  end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is null then
    return;
  end if;

  insert into public.family_members (family_id, profile_id, role)
  select i.family_id, v_uid, i.role
  from public.family_invites i
  where lower(i.email) = lower(v_email)
    and i.accepted_at is null
  on conflict (family_id, profile_id) do nothing;

  update public.family_invites
  set accepted_at = now()
  where lower(email) = lower(v_email)
    and accepted_at is null;
end;
$$;

grant execute on function public.claim_pending_invites() to authenticated;


-- ============================================================
-- 0008_delete_family.sql
-- ============================================================
-- CashNest — 0008 Eliminazione famiglia (solo admin)
-- I dati collegati (membri, conti, categorie, ricorrenti, spese, inviti) vengono
-- rimossi a cascata dalle FK con ON DELETE CASCADE definite in 0001/0003.

create policy families_delete on public.families
  for delete to authenticated
  using ((select app.is_family_admin(id)));


