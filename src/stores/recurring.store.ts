import type { RecurringExpense, RecurringExpenseInput } from '@/types'
import { createCrudStore } from './createCrudStore'

export const useRecurringStore = createCrudStore<RecurringExpense, RecurringExpenseInput>(
  'recurring',
  (services) => services.recurringExpenses,
  'recurring_expenses',
)
