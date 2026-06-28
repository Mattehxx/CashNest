import type { RecurringExpense, RecurringExpenseInput } from '@/types'
import type { RecurringExpensesRepository } from '../ports'
import type { RecurringExpenseRow } from './database.types'
import { createCrudRepository } from './crud'
import { recurringInsert, recurringUpdate, toRecurringExpense } from './mappers'

export function createSupabaseRecurringExpensesRepository(): RecurringExpensesRepository {
  return createCrudRepository<RecurringExpense, RecurringExpenseInput, RecurringExpenseRow>({
    table: 'recurring_expenses',
    toDomain: toRecurringExpense,
    toInsert: recurringInsert,
    toUpdate: recurringUpdate,
  })
}
