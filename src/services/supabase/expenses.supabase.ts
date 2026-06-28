import type { Expense, ExpenseInput } from '@/types'
import type { ExpensesRepository } from '../ports'
import type { ExpenseRow } from './database.types'
import { createCrudRepository } from './crud'
import { expenseInsert, expenseUpdate, toExpense } from './mappers'

export function createSupabaseExpensesRepository(): ExpensesRepository {
  return createCrudRepository<Expense, ExpenseInput, ExpenseRow>({
    table: 'expenses',
    toDomain: toExpense,
    toInsert: expenseInsert,
    toUpdate: expenseUpdate,
    orderColumn: 'date',
    ascending: false,
  })
}
