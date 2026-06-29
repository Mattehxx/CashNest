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
