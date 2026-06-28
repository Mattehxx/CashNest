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
