-- CashNest — 0004 Dati iniziali
-- Famiglia, inviti (allow-list), categorie e conti di default.
-- Idempotente: può essere rieseguito senza creare duplicati.

-- ---------- Famiglia ----------
insert into public.families (id, name)
values ('00000000-0000-0000-0000-0000000000c1', 'Famiglia Rovellini')
on conflict (id) do nothing;

-- ---------- Inviti (allow-list) ----------
-- Aggiorna le email reali di Stefano/Sabina/Sara quando disponibili.
insert into public.family_invites (family_id, email, role) values
  ('00000000-0000-0000-0000-0000000000c1', 'mrovellini@hortus.it', 'admin'),
  ('00000000-0000-0000-0000-0000000000c1', 'stefano@example.com', 'member'),
  ('00000000-0000-0000-0000-0000000000c1', 'sabina@example.com', 'member'),
  ('00000000-0000-0000-0000-0000000000c1', 'sara@example.com', 'member')
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
