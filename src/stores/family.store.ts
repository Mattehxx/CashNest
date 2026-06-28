import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useServices } from '@/services'
import type { CurrentFamily } from '@/services'
import type { FamilyMember } from '@/types'

export const useFamilyStore = defineStore('family', () => {
  const current = ref<CurrentFamily | null>(null)
  const members = ref<FamilyMember[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const familyId = computed(() => current.value?.family.id ?? null)
  const familyName = computed(() => current.value?.family.name ?? null)
  const hasFamily = computed(() => current.value !== null)
  const isAdmin = computed(() => current.value?.role === 'admin')

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { family } = useServices()
      current.value = await family.getCurrent()
      members.value = current.value ? await family.getMembers(current.value.family.id) : []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    current.value = null
    members.value = []
    loaded.value = false
  }

  return { current, members, loading, loaded, familyId, familyName, hasFamily, isAdmin, load, reset }
})
