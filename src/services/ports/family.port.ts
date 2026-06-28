import type { Family, FamilyMember, MemberRole } from '@/types'

export interface CurrentFamily {
  family: Family
  role: MemberRole
}

export interface FamilyRepository {
  /** La famiglia dell'utente corrente, oppure null se non è associato ad alcuna famiglia. */
  getCurrent(): Promise<CurrentFamily | null>
  getMembers(familyId: string): Promise<FamilyMember[]>
}
