export interface Category {
  id: string
  familyId: string
  name: string
  icon: string | null
  color: string | null
  createdAt: string
}

export interface CategoryInput {
  name: string
  icon: string | null
  color: string | null
}
