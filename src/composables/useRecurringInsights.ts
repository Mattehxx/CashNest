import { computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRecurringStore } from '@/stores/recurring.store'
import { toMonthlyAmount } from './useFrequency'

export interface BreakdownRow {
  id: string | null
  name: string
  icon: string | null
  color: string | null
  amount: number
  percent: number
}

interface ResolvedEntity {
  name: string
  icon: string | null
  color: string | null
}

/**
 * Aggregazioni mensili basate sulle spese ricorrenti ATTIVE.
 * NB: riflette gli impegni ricorrenti (stime), non la spesa reale (Fase 2).
 */
export function useRecurringInsights() {
  const recurring = useRecurringStore()
  const accounts = useAccountsStore()
  const categories = useCategoriesStore()

  const activeItems = computed(() => recurring.items.filter((r) => r.isActive))

  const totalMonthly = computed(() =>
    activeItems.value.reduce((sum, r) => sum + toMonthlyAmount(r.amount, r.frequency), 0),
  )

  /** Mappa accountId → totale mensile (solo conti assegnati). */
  const monthlyByAccountId = computed(() => {
    const map = new Map<string, number>()
    for (const r of activeItems.value) {
      if (!r.accountId) continue
      map.set(r.accountId, (map.get(r.accountId) ?? 0) + toMonthlyAmount(r.amount, r.frequency))
    }
    return map
  })

  function buildBreakdown(
    keyOf: (r: (typeof activeItems.value)[number]) => string | null,
    resolve: (id: string) => ResolvedEntity | undefined,
    noneLabel: string,
  ): BreakdownRow[] {
    const totals = new Map<string | null, number>()
    for (const r of activeItems.value) {
      const key = keyOf(r)
      totals.set(key, (totals.get(key) ?? 0) + toMonthlyAmount(r.amount, r.frequency))
    }
    const total = totalMonthly.value || 1
    const rows: BreakdownRow[] = []
    for (const [id, amount] of totals) {
      const entity = id ? resolve(id) : undefined
      rows.push({
        id,
        name: entity?.name ?? noneLabel,
        icon: entity?.icon ?? null,
        color: entity?.color ?? null,
        amount,
        percent: Math.round((amount / total) * 100),
      })
    }
    return rows.sort((a, b) => b.amount - a.amount)
  }

  const categoryBreakdown = computed(() =>
    buildBreakdown(
      (r) => r.categoryId,
      (id) => categories.items.find((c) => c.id === id),
      'Senza categoria',
    ),
  )

  const accountBreakdown = computed(() =>
    buildBreakdown(
      (r) => r.accountId,
      (id) => accounts.items.find((a) => a.id === id),
      'Senza conto',
    ),
  )

  return { activeItems, totalMonthly, monthlyByAccountId, categoryBreakdown, accountBreakdown }
}
