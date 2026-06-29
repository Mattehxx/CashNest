import type { MemberRole } from './enums'

export interface Profile {
  id: string
  fullName: string | null
  email: string | null
  avatar: string | null
  createdAt: string
}

export interface FamilyMember {
  id: string
  familyId: string
  profileId: string
  role: MemberRole
  profile: Profile | null
}
