import type { AccountType } from './enums'

export interface Account {
  id: string
  familyId: string
  name: string
  type: AccountType
  color: string | null
  icon: string | null
  createdAt: string
}

/** Dati modificabili dall'utente per creare/aggiornare un conto. */
export interface AccountInput {
  name: string
  type: AccountType
  color: string | null
  icon: string | null
}
