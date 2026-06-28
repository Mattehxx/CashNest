import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[CashNest] Configurazione Supabase mancante. ' +
      'Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env.local',
  )
}

/**
 * Unico punto in cui viene creato il client Supabase.
 * Nessun file fuori da `services/supabase/` deve importare questo modulo
 * o `@supabase/supabase-js`: in questo modo il backend è sostituibile.
 */
// Fallback innocui per evitare il crash di createClient quando l'ambiente non è
// ancora configurato: l'app si avvia comunque (le chiamate falliranno con un
// messaggio chiaro finché non vengono inserite le credenziali reali).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
