import { supabase } from './client'
import type { CrudRepository } from '../ports'

interface CrudConfig<T, TInput, TRow> {
  table: string
  toDomain: (row: TRow) => T
  toInsert: (familyId: string, input: TInput) => Record<string, unknown>
  toUpdate: (input: Partial<TInput>) => Record<string, unknown>
  orderColumn?: string
  ascending?: boolean
}

/**
 * Fabbrica di repository CRUD su Supabase, condivisa da tutte le entità con
 * ambito famiglia. La RLS lato DB garantisce l'isolamento; qui filtriamo
 * comunque per `family_id` per coerenza e performance.
 */
export function createCrudRepository<T, TInput, TRow>(
  cfg: CrudConfig<T, TInput, TRow>,
): CrudRepository<T, TInput> {
  const orderColumn = cfg.orderColumn ?? 'created_at'
  const ascending = cfg.ascending ?? true

  return {
    async list(familyId) {
      const { data, error } = await supabase
        .from(cfg.table)
        .select('*')
        .eq('family_id', familyId)
        .order(orderColumn, { ascending })
      if (error) throw new Error(error.message)
      return ((data ?? []) as TRow[]).map(cfg.toDomain)
    },

    async create(familyId, input) {
      const { data, error } = await supabase
        .from(cfg.table)
        .insert(cfg.toInsert(familyId, input))
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return cfg.toDomain(data as TRow)
    },

    async update(id, input) {
      const { data, error } = await supabase
        .from(cfg.table)
        .update(cfg.toUpdate(input))
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return cfg.toDomain(data as TRow)
    },

    async remove(id) {
      const { error } = await supabase.from(cfg.table).delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
  }
}
