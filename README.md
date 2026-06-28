# CashNest

Progressive Web App per la gestione delle spese familiari. Pensata per essere
**semplicissima**: pulsanti grandi, pochi passaggi, stile da app bancaria, in italiano.

Stack: **Vue 3** + **Vite** + **TypeScript** (strict) + **Tailwind CSS v4** +
**shadcn-vue** + **Pinia** + **Vue Router** + **Supabase** (PostgreSQL, Auth, RLS,
Realtime). Installabile come PWA.

---

## Prerequisiti

- **Node.js ≥ 22.12** (richiesto da Vite 8)
- Un progetto **Supabase**

## Avvio rapido

```bash
npm install
# 1) Configura le credenziali (vedi sotto)
# 2) Applica lo schema al database (vedi sotto)
npm run dev
```

App su http://localhost:5173

### 1. Credenziali Supabase

Crea `.env.local` (copia da `.env.example`) con i valori del tuo progetto
(Dashboard → Project Settings → API):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### 2. Database (migrazioni)

Lo schema vive in `supabase/migrations/` (`0001` → `0005`). Due modi per applicarlo:

- **SQL Editor (più semplice):** apri il SQL Editor su Supabase e incolla il
  contenuto di **`supabase/schema.sql`** (è l'unione delle 5 migrazioni) ed esegui.
  In alternativa esegui i 5 file in ordine.
- **Supabase CLI:** `supabase link` e poi `supabase db push`.

Lo schema crea tabelle, RLS, trigger di onboarding, dati di default (categorie/conti)
e una famiglia "Famiglia Rovellini" con gli inviti iniziali.

### 3. Autenticazione (note)

- L'accesso ai dati è governato da una **allow-list** (`family_invites`): chi si
  registra con un'email invitata viene agganciato automaticamente alla famiglia; gli
  altri vedono la schermata "Nessuna famiglia associata".
- In seed è già invitato l'admin **mrovellini@hortus.it**. Aggiorna le email reali di
  Stefano/Sabina/Sara nella tabella `family_invites` (o dal SQL Editor).
- Per provare velocemente: in **Authentication → Providers → Email** puoi disattivare
  *"Confirm email"* così il login funziona subito dopo la registrazione (in
  produzione lascialo attivo). In alternativa conferma l'utente dalla dashboard.

## Script

| Comando           | Azione                                       |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Server di sviluppo                           |
| `npm run build`   | Type-check (`vue-tsc`) + build di produzione |
| `npm run preview` | Anteprima della build                        |
| `npm run lint`    | ESLint                                       |

---

## Architettura

Layer separati, con un **confine di sostituzione del backend** ben definito: oggi i
dati arrivano da Supabase, domani da un backend ASP.NET Core **senza toccare UI/store**.

```
src/
  types/         Modelli di dominio puri (nessun tipo Supabase)
  services/
    ports/       INTERFACCE (il contratto): Auth, repository CRUD, Family, Realtime
    supabase/    ADAPTERS: unico punto che importa @supabase/supabase-js
    http/         (futuro) adapters ASP.NET Core, stessa shape
    index.ts     Factory + service locator (createSupabaseDataLayer / useServices)
  stores/        Pinia: dipendono SOLO dalle interfacce (via useServices)
  composables/   useCurrency, useFrequency, useRealtimeSync
  components/
    ui/          shadcn-vue
    app/         componenti dell'app (AppShell, BottomNav, card, form…)
  views/         schermate (Login, Dashboard, Conti, Categorie, Ricorrenti…)
  router/        rotte + guardie (auth + famiglia)
  lib/           icone, colori, date, cn()
supabase/migrations/  schema SQL (init, RLS, onboarding, seed, realtime)
```

### Sostituire il backend (in futuro)

1. Implementa gli adapter in `src/services/http/` rispettando le interfacce di
   `src/services/ports/`.
2. Aggiungi `createHttpDataLayer()` in `src/services/index.ts`.
3. Cambia **una riga** in `src/main.ts`:
   `provideDataLayer(createHttpDataLayer())`.

Nessuno store o componente importa Supabase direttamente.

## Sicurezza

- **Row Level Security** su tutte le tabelle: ogni utente accede solo ai dati delle
  famiglie di cui è membro. I controlli di appartenenza usano funzioni
  `SECURITY DEFINER` (schema `app`) per evitare la ricorsione nelle policy.
- Le chiavi stanno in `.env.local` (ignorato da git).

## Funzionalità (Fase 1)

- Autenticazione email/password + onboarding via allow-list
- CRUD **Conti**, **Categorie**, **Spese ricorrenti**
- Sincronizzazione **Realtime** tra dispositivi
- Dashboard con stima mensile delle spese ricorrenti
- PWA installabile (offline app-shell)

## Roadmap

Fase 1 (questa) → Fase 2 spese variabili · Fase 3 dashboard avanzata · Fase 4
statistiche · Fase 5 notifiche · Fase 6 allegati · Fase 7 export Excel · Fase 8 budget
· Fase 9 patrimonio netto · Fase 10 investimenti.

## Note di progetto

- **Una categoria per spesa** (`category_id`): totali "per categoria" corretti e UX
  semplice. Lo schema è estendibile a righe di spesa per il multi-categoria in futuro.
- Le spese variabili (`expenses`) hanno già schema e RLS pronti per la Fase 2.
