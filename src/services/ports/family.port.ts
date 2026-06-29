import type { Family, FamilyMember, MemberRole } from '@/types'

export interface CurrentFamily {
  family: Family
  role: MemberRole
}

export interface FamilyRepository {
  /** Tutte le famiglie di cui l'utente corrente è membro. */
  listMine(): Promise<CurrentFamily[]>
  /** Crea una nuova famiglia e rende l'utente admin di essa. */
  create(name: string): Promise<Family>
  /** Aggancia l'utente agli inviti in attesa per la sua email. */
  claimInvites(): Promise<void>
  getMembers(familyId: string): Promise<FamilyMember[]>
  /** Operazioni riservate all'admin (la RLS le impone a livello DB). */
  renameFamily(familyId: string, name: string): Promise<void>
  updateMemberRole(memberId: string, role: MemberRole): Promise<void>
  removeMember(memberId: string): Promise<void>
  /** Elimina una famiglia (solo admin). Cancella a cascata tutti i dati collegati. */
  delete(familyId: string): Promise<void>
}
