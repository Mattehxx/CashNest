import type {
  Account,
  AccountInput,
  AccountType,
  Category,
  CategoryInput,
  Expense,
  ExpenseFrequency,
  ExpenseInput,
  FamilyInvite,
  FamilyInviteInput,
  MemberRole,
  RecurringExpense,
  RecurringExpenseInput,
} from '@/types'
import type {
  AccountRow,
  CategoryRow,
  ExpenseRow,
  FamilyInviteRow,
  RecurringExpenseRow,
} from './database.types'

/* ---------- Accounts ---------- */
export function toAccount(r: AccountRow): Account {
  return {
    id: r.id,
    familyId: r.family_id,
    name: r.name,
    type: r.type as AccountType,
    color: r.color,
    icon: r.icon,
    createdAt: r.created_at,
  }
}

export function accountInsert(familyId: string, i: AccountInput): Record<string, unknown> {
  return { family_id: familyId, name: i.name, type: i.type, color: i.color, icon: i.icon }
}

export function accountUpdate(i: Partial<AccountInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (i.name !== undefined) p.name = i.name
  if (i.type !== undefined) p.type = i.type
  if (i.color !== undefined) p.color = i.color
  if (i.icon !== undefined) p.icon = i.icon
  return p
}

/* ---------- Categories ---------- */
export function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    familyId: r.family_id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    createdAt: r.created_at,
  }
}

export function categoryInsert(familyId: string, i: CategoryInput): Record<string, unknown> {
  return { family_id: familyId, name: i.name, icon: i.icon, color: i.color }
}

export function categoryUpdate(i: Partial<CategoryInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (i.name !== undefined) p.name = i.name
  if (i.icon !== undefined) p.icon = i.icon
  if (i.color !== undefined) p.color = i.color
  return p
}

/* ---------- Recurring expenses ---------- */
export function toRecurringExpense(r: RecurringExpenseRow): RecurringExpense {
  return {
    id: r.id,
    familyId: r.family_id,
    name: r.name,
    amount: Number(r.amount),
    frequency: r.frequency as ExpenseFrequency,
    accountId: r.account_id,
    categoryId: r.category_id,
    startDate: r.start_date,
    isActive: r.is_active,
    createdAt: r.created_at,
  }
}

export function recurringInsert(familyId: string, i: RecurringExpenseInput): Record<string, unknown> {
  return {
    family_id: familyId,
    name: i.name,
    amount: i.amount,
    frequency: i.frequency,
    account_id: i.accountId,
    category_id: i.categoryId,
    start_date: i.startDate,
    is_active: i.isActive,
  }
}

export function recurringUpdate(i: Partial<RecurringExpenseInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (i.name !== undefined) p.name = i.name
  if (i.amount !== undefined) p.amount = i.amount
  if (i.frequency !== undefined) p.frequency = i.frequency
  if (i.accountId !== undefined) p.account_id = i.accountId
  if (i.categoryId !== undefined) p.category_id = i.categoryId
  if (i.startDate !== undefined) p.start_date = i.startDate
  if (i.isActive !== undefined) p.is_active = i.isActive
  return p
}

/* ---------- Expenses (schema pronto per la Fase 2) ---------- */
export function toExpense(r: ExpenseRow): Expense {
  return {
    id: r.id,
    familyId: r.family_id,
    amount: Number(r.amount),
    accountId: r.account_id,
    categoryId: r.category_id,
    date: r.date,
    notes: r.notes,
    createdBy: r.created_by,
    createdAt: r.created_at,
  }
}

export function expenseInsert(familyId: string, i: ExpenseInput): Record<string, unknown> {
  return {
    family_id: familyId,
    amount: i.amount,
    account_id: i.accountId,
    category_id: i.categoryId,
    date: i.date,
    notes: i.notes,
  }
}

export function expenseUpdate(i: Partial<ExpenseInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (i.amount !== undefined) p.amount = i.amount
  if (i.accountId !== undefined) p.account_id = i.accountId
  if (i.categoryId !== undefined) p.category_id = i.categoryId
  if (i.date !== undefined) p.date = i.date
  if (i.notes !== undefined) p.notes = i.notes
  return p
}

/* ---------- Family invites ---------- */
export function toFamilyInvite(r: FamilyInviteRow): FamilyInvite {
  return {
    id: r.id,
    familyId: r.family_id,
    email: r.email,
    role: r.role as MemberRole,
    acceptedAt: r.accepted_at,
    createdAt: r.created_at,
  }
}

export function familyInviteInsert(familyId: string, i: FamilyInviteInput): Record<string, unknown> {
  return { family_id: familyId, email: i.email.trim().toLowerCase(), role: i.role }
}

export function familyInviteUpdate(i: Partial<FamilyInviteInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (i.email !== undefined) p.email = i.email.trim().toLowerCase()
  if (i.role !== undefined) p.role = i.role
  return p
}
