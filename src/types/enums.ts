/**
 * Enumerazioni di dominio.
 *
 * Niente `enum` TypeScript: il progetto usa `erasableSyntaxOnly`, quindi
 * modelliamo le enumerazioni come union di stringhe + array `as const`
 * (iterabili a runtime) + mappe di etichette in italiano per la UI.
 * I valori coincidono ESATTAMENTE con gli enum PostgreSQL (vedi migrazioni).
 */

/** Tipo di conto / metodo di pagamento. */
export const ACCOUNT_TYPES = [
  'conto_corrente',
  'carta',
  'bancomat',
  'contanti',
] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  conto_corrente: 'Conto corrente',
  carta: 'Carta',
  bancomat: 'Bancomat',
  contanti: 'Contanti',
}

/** Frequenza di una spesa ricorrente. */
export const EXPENSE_FREQUENCIES = [
  'giornaliera',
  'settimanale',
  'mensile',
  'bimestrale',
  'trimestrale',
  'semestrale',
  'annuale',
] as const
export type ExpenseFrequency = (typeof EXPENSE_FREQUENCIES)[number]

export const EXPENSE_FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  giornaliera: 'Giornaliera',
  settimanale: 'Settimanale',
  mensile: 'Mensile',
  bimestrale: 'Bimestrale',
  trimestrale: 'Trimestrale',
  semestrale: 'Semestrale',
  annuale: 'Annuale',
}

/**
 * Fattore di conversione di un importo verso la base MENSILE.
 * Serve per stimare la spesa ricorrente mensile in dashboard.
 */
export const FREQUENCY_TO_MONTHLY: Record<ExpenseFrequency, number> = {
  giornaliera: 365 / 12,
  settimanale: 52 / 12,
  mensile: 1,
  bimestrale: 1 / 2,
  trimestrale: 1 / 3,
  semestrale: 1 / 6,
  annuale: 1 / 12,
}

/** Ruolo di un membro all'interno della famiglia. */
export const MEMBER_ROLES = ['admin', 'member'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]
