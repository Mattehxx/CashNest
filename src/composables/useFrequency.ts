import { EXPENSE_FREQUENCY_LABELS, FREQUENCY_TO_MONTHLY } from '@/types'
import type { ExpenseFrequency } from '@/types'

export function frequencyLabel(frequency: ExpenseFrequency): string {
  return EXPENSE_FREQUENCY_LABELS[frequency]
}

/** Converte un importo a frequenza arbitraria nel suo equivalente mensile. */
export function toMonthlyAmount(amount: number, frequency: ExpenseFrequency): number {
  return amount * FREQUENCY_TO_MONTHLY[frequency]
}

export function useFrequency() {
  return { frequencyLabel, toMonthlyAmount }
}
