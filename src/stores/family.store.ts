import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useServices } from '@/services'
import type { CurrentFamily } from '@/services'
import type { FamilyMember, MemberRole } from '@/types'

const ACTIVE_KEY = 'cashnest:activeFamilyId'

function readActive(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

function persistActive(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* localStorage non disponibile */
  }
}

export const useFamilyStore = defineStore('family', () => {
  const families = ref<CurrentFamily[]>([])
  const activeFamilyId = ref<string | null>(null)
  const members = ref<FamilyMember[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const current = computed(
    () => families.value.find((f) => f.family.id === activeFamilyId.value) ?? null,
  )
  const familyId = computed(() => current.value?.family.id ?? null)
  const familyName = computed(() => current.value?.family.name ?? null)
  const hasFamily = computed(() => families.value.length > 0)
  const isAdmin = computed(() => current.value?.role === 'admin')

  async function reloadMembers(): Promise<void> {
    members.value = familyId.value ? await useServices().family.getMembers(familyId.value) : []
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { family } = useServices()
      await family.claimInvites()
      families.value = await family.listMine()

      const saved = readActive()
      const valid = saved !== null && families.value.some((f) => f.family.id === saved)
      activeFamilyId.value = valid ? saved : (families.value[0]?.family.id ?? null)
      persistActive(activeFamilyId.value)

      await reloadMembers()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function setActiveFamily(id: string): Promise<void> {
    if (!families.value.some((f) => f.family.id === id)) return
    activeFamilyId.value = id
    persistActive(id)
    await reloadMembers()
  }

  async function createFamily(name: string): Promise<void> {
    const { family } = useServices()
    const created = await family.create(name)
    families.value = await family.listMine()
    await setActiveFamily(created.id)
  }

  async function deleteFamily(id: string): Promise<void> {
    await useServices().family.delete(id)
    families.value = await useServices().family.listMine()
    const stillValid = families.value.some((f) => f.family.id === activeFamilyId.value)
    if (!stillValid) {
      const next = families.value[0]?.family.id ?? null
      activeFamilyId.value = next
      persistActive(next)
    }
    await reloadMembers()
  }

  async function rename(name: string): Promise<void> {
    if (!familyId.value) return
    await useServices().family.renameFamily(familyId.value, name)
    const entry = families.value.find((f) => f.family.id === familyId.value)
    if (entry) entry.family = { ...entry.family, name }
  }

  async function updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
    await useServices().family.updateMemberRole(memberId, role)
    await reloadMembers()
  }

  async function removeMember(memberId: string): Promise<void> {
    await useServices().family.removeMember(memberId)
    await reloadMembers()
  }

  async function updateMyName(fullName: string): Promise<void> {
    await useServices().profile.updateName(fullName)
    await reloadMembers()
  }

  function reset(): void {
    families.value = []
    activeFamilyId.value = null
    members.value = []
    loaded.value = false
  }

  return {
    families,
    activeFamilyId,
    members,
    loading,
    loaded,
    current,
    familyId,
    familyName,
    hasFamily,
    isAdmin,
    load,
    reloadMembers,
    setActiveFamily,
    createFamily,
    deleteFamily,
    rename,
    updateMemberRole,
    removeMember,
    updateMyName,
    reset,
  }
})
