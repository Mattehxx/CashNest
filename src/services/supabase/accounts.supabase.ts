import type { Account, AccountInput } from '@/types'
import type { AccountsRepository } from '../ports'
import type { AccountRow } from './database.types'
import { createCrudRepository } from './crud'
import { accountInsert, accountUpdate, toAccount } from './mappers'

export function createSupabaseAccountsRepository(): AccountsRepository {
  return createCrudRepository<Account, AccountInput, AccountRow>({
    table: 'accounts',
    toDomain: toAccount,
    toInsert: accountInsert,
    toUpdate: accountUpdate,
  })
}
