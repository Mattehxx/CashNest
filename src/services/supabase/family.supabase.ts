import type { FamilyMember, MemberRole } from '@/types'
import { supabase } from './client'
import type { CurrentFamily, FamilyRepository } from '../ports'

interface CurrentFamilyJoinRow {
  role: string
  families: { id: string; name: string; created_at: string } | null
}

interface MemberJoinRow {
  id: string
  family_id: string
  profile_id: string
  role: string
  profiles: { id: string; full_name: string | null; avatar: string | null; created_at: string } | null
}

export function createSupabaseFamilyRepository(): FamilyRepository {
  return {
    async getCurrent(): Promise<CurrentFamily | null> {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return null

      const { data, error } = await supabase
        .from('family_members')
        .select('role, families(*)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw new Error(error.message)

      const row = data as unknown as CurrentFamilyJoinRow | null
      if (!row || !row.families) return null
      return {
        family: { id: row.families.id, name: row.families.name, createdAt: row.families.created_at },
        role: row.role as MemberRole,
      }
    },

    async getMembers(familyId: string): Promise<FamilyMember[]> {
      const { data, error } = await supabase
        .from('family_members')
        .select('id, family_id, profile_id, role, profiles(*)')
        .eq('family_id', familyId)
      if (error) throw new Error(error.message)

      return ((data ?? []) as unknown as MemberJoinRow[]).map((m) => ({
        id: m.id,
        familyId: m.family_id,
        profileId: m.profile_id,
        role: m.role as MemberRole,
        profile: m.profiles
          ? {
              id: m.profiles.id,
              fullName: m.profiles.full_name,
              avatar: m.profiles.avatar,
              createdAt: m.profiles.created_at,
            }
          : null,
      }))
    },
  }
}
