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
