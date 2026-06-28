import type { Category, CategoryInput } from '@/types'
import { createCrudStore } from './createCrudStore'

export const useCategoriesStore = createCrudStore<Category, CategoryInput>(
  'categories',
  (services) => services.categories,
  'categories',
)
