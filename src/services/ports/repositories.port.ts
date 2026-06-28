import type {
  Account,
  AccountInput,
  Category,
  CategoryInput,
  Expense,
  ExpenseInput,
  RecurringExpense,
  RecurringExpenseInput,
} from '@/types'

/**
 * Repository CRUD generico per le entità con ambito famiglia.
 * Tutte le operazioni sono limitate dalla RLS lato database alla famiglia
 * dell'utente; `familyId` viene comunque passato esplicitamente per chiarezza
 * e per la futura compatibilità multi-famiglia.
 */
export interface CrudRepository<T, TInput> {
  list(familyId: string): Promise<T[]>
  create(familyId: string, input: TInput): Promise<T>
  update(id: string, input: Partial<TInput>): Promise<T>
  remove(id: string): Promise<void>
}

export type AccountsRepository = CrudRepository<Account, AccountInput>
export type CategoriesRepository = CrudRepository<Category, CategoryInput>
export type RecurringExpensesRepository = CrudRepository<RecurringExpense, RecurringExpenseInput>
export type ExpensesRepository = CrudRepository<Expense, ExpenseInput>
