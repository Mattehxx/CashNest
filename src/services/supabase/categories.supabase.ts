import type { Category, CategoryInput } from '@/types'
import type { CategoriesRepository } from '../ports'
import type { CategoryRow } from './database.types'
import { createCrudRepository } from './crud'
import { categoryInsert, categoryUpdate, toCategory } from './mappers'

export function createSupabaseCategoriesRepository(): CategoriesRepository {
  return createCrudRepository<Category, CategoryInput, CategoryRow>({
    table: 'categories',
    toDomain: toCategory,
    toInsert: categoryInsert,
    toUpdate: categoryUpdate,
    orderColumn: 'name',
  })
}
