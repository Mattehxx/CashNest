import type { Account, AccountInput } from '@/types'
import { createCrudStore } from './createCrudStore'

export const useAccountsStore = createCrudStore<Account, AccountInput>(
  'accounts',
  (services) => services.accounts,
  'accounts',
)
