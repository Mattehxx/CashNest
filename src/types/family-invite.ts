import type { MemberRole } from './enums'

export interface FamilyInvite {
  id: string
  familyId: string
  email: string
  role: MemberRole
  /** Data di accettazione (null se l'invito è ancora in attesa di registrazione). */
  acceptedAt: string | null
  createdAt: string
}

export interface FamilyInviteInput {
  email: string
  role: MemberRole
}
