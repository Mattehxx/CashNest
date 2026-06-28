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
