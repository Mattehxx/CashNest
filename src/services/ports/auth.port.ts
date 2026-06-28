export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends AuthCredentials {
  fullName?: string
}

export interface AuthUser {
  id: string
  email: string | null
}

/**
 * Contratto di autenticazione, indipendente dal provider.
 * L'implementazione Supabase vive in `services/supabase/auth.supabase.ts`;
 * un futuro backend ASP.NET Core fornirà un'altra implementazione con la
 * stessa interfaccia, senza toccare store o UI.
 */
export interface AuthPort {
  getCurrentUser(): Promise<AuthUser | null>
  signIn(credentials: AuthCredentials): Promise<AuthUser>
  /** Restituisce l'utente se la sessione è attiva, oppure null se serve confermare l'email. */
  signUp(credentials: SignUpCredentials): Promise<AuthUser | null>
  signOut(): Promise<void>
  /** Registra un listener sui cambi di sessione. Restituisce la funzione di disiscrizione. */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void
}
