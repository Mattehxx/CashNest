import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRecurringStore } from '@/stores/recurring.store'

/**
 * Coordina le sottoscrizioni Realtime di tutte le entità della famiglia.
 * Da avviare quando la famiglia è nota e da fermare al logout / unmount.
 */
export function useRealtimeSync() {
  const accounts = useAccountsStore()
  const categories = useCategoriesStore()
  const recurring = useRecurringStore()

  let unsubscribers: Array<() => void> = []

  function start(familyId: string): void {
    stop()
    unsubscribers = [
      accounts.subscribeRealtime(familyId),
      categories.subscribeRealtime(familyId),
      recurring.subscribeRealtime(familyId),
    ]
  }

  function stop(): void {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
    unsubscribers = []
  }

  return { start, stop }
}
