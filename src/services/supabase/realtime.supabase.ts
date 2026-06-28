import { supabase } from './client'
import type { RealtimeChange, RealtimePort, RealtimeTable } from '../ports'
import type { AccountRow, CategoryRow, ExpenseRow, RecurringExpenseRow } from './database.types'
import { toAccount, toCategory, toExpense, toRecurringExpense } from './mappers'

type RowMapper = (row: Record<string, unknown>) => unknown

const MAPPERS: Record<RealtimeTable, RowMapper> = {
  accounts: (r) => toAccount(r as unknown as AccountRow),
  categories: (r) => toCategory(r as unknown as CategoryRow),
  recurring_expenses: (r) => toRecurringExpense(r as unknown as RecurringExpenseRow),
  expenses: (r) => toExpense(r as unknown as ExpenseRow),
}

export function createSupabaseRealtime(): RealtimePort {
  return {
    subscribe<T>(
      table: RealtimeTable,
      familyId: string,
      onChange: (change: RealtimeChange<T>) => void,
    ): () => void {
      const map = MAPPERS[table]
      const channel = supabase
        .channel(`rt:${table}:${familyId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `family_id=eq.${familyId}` },
          (payload) => {
            const hasNew = payload.new && Object.keys(payload.new).length > 0
            const old = payload.old as { id?: string } | null
            onChange({
              type: payload.eventType as RealtimeChange<T>['type'],
              row: hasNew ? (map(payload.new as Record<string, unknown>) as T) : null,
              oldId: old && typeof old.id === 'string' ? old.id : null,
            })
          },
        )
        .subscribe()

      return () => {
        void supabase.removeChannel(channel)
      }
    },
  }
}
