import type {
  AccountsRepository,
  AuthPort,
  CategoriesRepository,
  ExpensesRepository,
  FamilyRepository,
  RealtimePort,
  RecurringExpensesRepository,
} from './ports'
import { createSupabaseAccountsRepository } from './supabase/accounts.supabase'
import { createSupabaseAuth } from './supabase/auth.supabase'
import { createSupabaseCategoriesRepository } from './supabase/categories.supabase'
import { createSupabaseExpensesRepository } from './supabase/expenses.supabase'
import { createSupabaseFamilyRepository } from './supabase/family.supabase'
import { createSupabaseRealtime } from './supabase/realtime.supabase'
import { createSupabaseRecurringExpensesRepository } from './supabase/recurring-expenses.supabase'

/**
 * Aggregato di tutti i servizi dati dell'app.
 * Store e composable dipendono SOLO da questa interfaccia, mai dalle
 * implementazioni concrete: è il "confine di swap" verso un futuro backend.
 */
export interface DataLayer {
  auth: AuthPort
  family: FamilyRepository
  accounts: AccountsRepository
  categories: CategoriesRepository
  recurringExpenses: RecurringExpensesRepository
  expenses: ExpensesRepository
  realtime: RealtimePort
}

/** Implementazione basata su Supabase. */
export function createSupabaseDataLayer(): DataLayer {
  return {
    auth: createSupabaseAuth(),
    family: createSupabaseFamilyRepository(),
    accounts: createSupabaseAccountsRepository(),
    categories: createSupabaseCategoriesRepository(),
    recurringExpenses: createSupabaseRecurringExpensesRepository(),
    expenses: createSupabaseExpensesRepository(),
    realtime: createSupabaseRealtime(),
  }
}

let dataLayer: DataLayer | null = null

/** Configura il data layer attivo (chiamato una volta in `main.ts`). */
export function provideDataLayer(layer: DataLayer): void {
  dataLayer = layer
}

/** Accede al data layer attivo. Lancia un errore se non inizializzato. */
export function useServices(): DataLayer {
  if (!dataLayer) {
    throw new Error('Data layer non inizializzato: chiamare provideDataLayer() in main.ts')
  }
  return dataLayer
}

export * from './ports'
