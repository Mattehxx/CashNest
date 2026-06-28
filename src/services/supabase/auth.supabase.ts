import type { User } from '@supabase/supabase-js'
import { supabase } from './client'
import type { AuthPort, AuthUser } from '../ports'

function toUser(u: User | null | undefined): AuthUser | null {
  return u ? { id: u.id, email: u.email ?? null } : null
}

/** Traduce i messaggi d'errore più comuni di Supabase Auth in italiano. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o password non corretti.'
  if (m.includes('email not confirmed')) return 'Email non ancora confermata. Controlla la posta.'
  if (m.includes('user already registered')) return 'Esiste già un account con questa email.'
  if (m.includes('password should be at least')) return 'La password deve avere almeno 6 caratteri.'
  if (m.includes('unable to validate email address')) return 'Indirizzo email non valido.'
  if (m.includes('signups not allowed')) return 'Le registrazioni sono disabilitate. Contatta l’amministratore.'
  return message
}

export function createSupabaseAuth(): AuthPort {
  return {
    async getCurrentUser() {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw new Error(error.message)
      return toUser(data.session?.user)
    },

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(translateAuthError(error.message))
      const user = toUser(data.session?.user)
      if (!user) throw new Error('Accesso non riuscito.')
      return user
    },

    async signUp({ email, password, fullName }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName ?? null } },
      })
      if (error) throw new Error(translateAuthError(error.message))
      // Con la conferma email attiva, data.session è null: registrazione riuscita,
      // ma l'utente deve confermare l'email prima di poter accedere.
      return toUser(data.session?.user)
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
    },

    onAuthChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(toUser(session?.user))
      })
      return () => data.subscription.unsubscribe()
    },
  }
}
