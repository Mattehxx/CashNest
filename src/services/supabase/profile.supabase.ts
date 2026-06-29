import { supabase } from './client'
import type { ProfileRepository } from '../ports'

export function createSupabaseProfileRepository(): ProfileRepository {
  return {
    async updateName(fullName) {
      const { data, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error(userError.message)
      const user = data.user
      if (!user) throw new Error('Sessione non valida.')
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (error) throw new Error(error.message)
    },
  }
}
