import type { FamilyInvite, FamilyInviteInput } from '@/types'
import { createCrudStore } from './createCrudStore'

// Nessuna tabella realtime: gli inviti sono admin-only e a bassa frequenza.
export const useInvitesStore = createCrudStore<FamilyInvite, FamilyInviteInput>(
  'invites',
  (services) => services.invites,
)
