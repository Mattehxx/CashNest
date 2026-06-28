/**
 * Spesa variabile.
 *
 * Lo schema è già definito per la Fase 2 (le schermate arrivano dopo).
 * Scelta di modellazione: UNA categoria per spesa (`categoryId`), per avere
 * "totale per categoria" corretto e una UX semplice. Vedi piano di progetto.
 */
export interface Expense {
  id: string
  familyId: string
  amount: number
  accountId: string | null
  categoryId: string | null
  /** Data in formato ISO `yyyy-mm-dd`. */
  date: string
  notes: string | null
  createdBy: string | null
  createdAt: string
}

export interface ExpenseInput {
  amount: number
  accountId: string | null
  categoryId: string | null
  date: string
  notes: string | null
}
