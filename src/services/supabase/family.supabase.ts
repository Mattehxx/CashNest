import type { Family, FamilyMember, MemberRole } from '@/types'
import { supabase } from './client'
import type { CurrentFamily, FamilyRepository } from '../ports'
import type { FamilyRow } from './database.types'

interface CurrentFamilyJoinRow {
  role: string
  families: { id: string; name: string; created_at: string } | null
}

interface MemberJoinRow {
  id: string
  family_id: string
  profile_id: string
  role: string
  profiles: {
    id: string
    full_name: string | null
    email: string | null
    avatar: string | null
    created_at: string
  } | null
}

export function createSupabaseFamilyRepository(): FamilyRepository {
  return {
    async listMine(): Promise<CurrentFamily[]> {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return []

      const { data, error } = await supabase
        .from('family_members')
        .select('role, families(*)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)

      return ((data ?? []) as unknown as CurrentFamilyJoinRow[])
        .map((row) =>
          row.families
            ? {
                family: {
                  id: row.families.id,
                  name: row.families.name,
                  createdAt: row.families.created_at,
                },
                role: row.role as MemberRole,
              }
            : null,
        )
        .filter((x): x is CurrentFamily => x !== null)
    },

    async create(name: string): Promise<Family> {
      const { data, error } = await supabase.rpc('create_family', { p_name: name })
      if (error) throw new Error(error.message)
      const id = data as string
      const { data: famData, error: famError } = await supabase
        .from('families')
        .select('*')
        .eq('id', id)
        .single()
      if (famError) throw new Error(famError.message)
      const fam = famData as FamilyRow
      return { id: fam.id, name: fam.name, createdAt: fam.created_at }
    },

    async claimInvites(): Promise<void> {
      const { error } = await supabase.rpc('claim_pending_invites')
      if (error) throw new Error(error.message)
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
              email: m.profiles.email,
              avatar: m.profiles.avatar,
              createdAt: m.profiles.created_at,
            }
          : null,
      }))
    },

    async renameFamily(familyId, name) {
      const { error } = await supabase.from('families').update({ name }).eq('id', familyId)
      if (error) throw new Error(error.message)
    },

    async updateMemberRole(memberId, role) {
      const { error } = await supabase
        .from('family_members')
        .update({ role })
        .eq('id', memberId)
      if (error) throw new Error(error.message)
    },

    async removeMember(memberId) {
      const { error } = await supabase.from('family_members').delete().eq('id', memberId)
      if (error) throw new Error(error.message)
    },

    async delete(familyId) {
      const { error } = await supabase.from('families').delete().eq('id', familyId)
      if (error) throw new Error(error.message)
    },
  }
}
