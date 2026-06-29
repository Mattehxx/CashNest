export interface ProfileRepository {
  /** Aggiorna il nome visualizzato del profilo dell'utente corrente. */
  updateName(fullName: string): Promise<void>
}
