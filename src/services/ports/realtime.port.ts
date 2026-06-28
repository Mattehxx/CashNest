export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export type RealtimeTable = 'accounts' | 'categories' | 'recurring_expenses' | 'expenses'

export interface RealtimeChange<T> {
  type: RealtimeEventType
  /** Riga nuova già mappata a dominio (INSERT/UPDATE); null su DELETE. */
  row: T | null
  /** Id della riga rimossa/precedente (DELETE/UPDATE); null altrimenti. */
  oldId: string | null
}

/**
 * Sincronizzazione in tempo reale, indipendente dal provider.
 * Restituisce una funzione di disiscrizione da chiamare al teardown.
 */
export interface RealtimePort {
  subscribe<T>(
    table: RealtimeTable,
    familyId: string,
    onChange: (change: RealtimeChange<T>) => void,
  ): () => void
}
