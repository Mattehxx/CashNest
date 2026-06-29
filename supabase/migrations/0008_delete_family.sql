-- CashNest — 0008 Eliminazione famiglia (solo admin)
-- I dati collegati (membri, conti, categorie, ricorrenti, spese, inviti) vengono
-- rimossi a cascata dalle FK con ON DELETE CASCADE definite in 0001/0003.

create policy families_delete on public.families
  for delete to authenticated
  using ((select app.is_family_admin(id)));
