/**
 * Forma delle righe restituite da PostgREST/Supabase (snake_case).
 * Mantenute separate dai tipi di dominio: la conversione avviene in `mappers.ts`.
 * NB: le colonne `numeric` arrivano come stringa dal client → convertite con Number().
 */
export interface FamilyRow {
  id: string
  name: string
  created_at: string
}

export interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  avatar: string | null
  created_at: string
}

export interface FamilyInviteRow {
  id: string
  family_id: string
  email: string
  role: string
  accepted_at: string | null
  created_at: string
}

export interface FamilyMemberRow {
  id: string
  family_id: string
  profile_id: string
  role: string
  created_at: string
}

export interface AccountRow {
  id: string
  family_id: string
  name: string
  type: string
  color: string | null
  icon: string | null
  created_at: string
}

export interface CategoryRow {
  id: string
  family_id: string
  name: string
  icon: string | null
  color: string | null
  created_at: string
}

export interface RecurringExpenseRow {
  id: string
  family_id: string
  name: string
  amount: number | string
  frequency: string
  account_id: string | null
  category_id: string | null
  start_date: string
  is_active: boolean
  created_at: string
}

export interface ExpenseRow {
  id: string
  family_id: string
  amount: number | string
  account_id: string | null
  category_id: string | null
  date: string
  notes: string | null
  created_by: string | null
  created_at: string
}
