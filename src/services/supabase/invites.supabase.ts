import type { FamilyInvite, FamilyInviteInput } from '@/types'
import type { InvitesRepository } from '../ports'
import type { FamilyInviteRow } from './database.types'
import { createCrudRepository } from './crud'
import { familyInviteInsert, familyInviteUpdate, toFamilyInvite } from './mappers'

export function createSupabaseInvitesRepository(): InvitesRepository {
  return createCrudRepository<FamilyInvite, FamilyInviteInput, FamilyInviteRow>({
    table: 'family_invites',
    toDomain: toFamilyInvite,
    toInsert: familyInviteInsert,
    toUpdate: familyInviteUpdate,
    orderColumn: 'email',
  })
}
