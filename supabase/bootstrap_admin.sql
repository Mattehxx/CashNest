-- CashNest — Bootstrap admin (eseguire UNA VOLTA nel SQL Editor, DOPO 0006).
-- Imposta teorove04@gmail.com come unico admin e rimuove gli inviti placeholder.

-- 1) Pulisce gli inviti placeholder iniziali.
delete from public.family_invites
where family_id = '00000000-0000-0000-0000-0000000000c1'
  and email in (
    'mrovellini@hortus.it',
    'stefano@example.com',
    'sabina@example.com',
    'sara@example.com'
  );

-- 2) Aggiunge (o aggiorna) l'invito admin.
insert into public.family_invites (family_id, email, role)
values ('00000000-0000-0000-0000-0000000000c1', 'teorove04@gmail.com', 'admin')
on conflict (family_id, email) do update set role = 'admin';

-- 3) Se teorove04@gmail.com ha GIÀ un account, promuovilo ad admin.
update public.family_members fm
set role = 'admin'
from public.profiles p
where p.id = fm.profile_id and lower(p.email) = 'teorove04@gmail.com';
