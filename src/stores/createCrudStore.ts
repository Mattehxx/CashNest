import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useServices } from '@/services'
import type { CrudRepository, DataLayer, RealtimeTable } from '@/services'

interface Identifiable {
  id: string
}

/**
 * Fabbrica di store Pinia per le entità CRUD con ambito famiglia.
 * Condivide stato (items/loading/error), operazioni e sottoscrizione Realtime
 * tra Conti, Categorie e Spese ricorrenti.
 */
export function createCrudStore<T extends Identifiable, TInput>(
  id: string,
  selectRepo: (services: DataLayer) => CrudRepository<T, TInput>,
  table?: RealtimeTable,
) {
  return defineStore(id, () => {
    const items = ref<T[]>([]) as Ref<T[]>
    const loading = ref(false)
    const loaded = ref(false)
    const error = ref<string | null>(null)

    function upsert(item: T): void {
      const index = items.value.findIndex((x) => x.id === item.id)
      if (index >= 0) items.value[index] = item
      else items.value.push(item)
    }

    function removeLocal(itemId: string): void {
      items.value = items.value.filter((x) => x.id !== itemId)
    }

    async function fetchAll(familyId: string): Promise<void> {
      loading.value = true
      error.value = null
      try {
        items.value = await selectRepo(useServices()).list(familyId)
        loaded.value = true
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Errore di caricamento.'
        throw e
      } finally {
        loading.value = false
      }
    }

    async function create(familyId: string, input: TInput): Promise<T> {
      const created = await selectRepo(useServices()).create(familyId, input)
      upsert(created)
      return created
    }

    async function update(itemId: string, input: Partial<TInput>): Promise<T> {
      const updated = await selectRepo(useServices()).update(itemId, input)
      upsert(updated)
      return updated
    }

    async function remove(itemId: string): Promise<void> {
      await selectRepo(useServices()).remove(itemId)
      removeLocal(itemId)
    }

    /** Si abbona alle modifiche Realtime della tabella. Restituisce la disiscrizione. */
    function subscribeRealtime(familyId: string): () => void {
      if (!table) return () => {}
      return useServices().realtime.subscribe<T>(table, familyId, (change) => {
        if (change.type === 'DELETE') {
          if (change.oldId) removeLocal(change.oldId)
        } else if (change.row) {
          upsert(change.row)
        }
      })
    }

    function reset(): void {
      items.value = []
      loaded.value = false
      error.value = null
    }

    return {
      items,
      loading,
      loaded,
      error,
      fetchAll,
      create,
      update,
      remove,
      upsert,
      removeLocal,
      subscribeRealtime,
      reset,
    }
  })
}
