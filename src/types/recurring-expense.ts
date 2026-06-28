import type { ExpenseFrequency } from './enums'

export interface RecurringExpense {
  id: string
  familyId: string
  name: string
  amount: number
  frequency: ExpenseFrequency
  accountId: string | null
  categoryId: string | null
  /** Data di inizio in formato ISO `yyyy-mm-dd`. */
  startDate: string
  isActive: boolean
  createdAt: string
}

export interface RecurringExpenseInput {
  name: string
  amount: number
  frequency: ExpenseFrequency
  accountId: string | null
  categoryId: string | null
  startDate: string
  isActive: boolean
}
