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
