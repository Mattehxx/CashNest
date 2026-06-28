import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useServices } from '@/services'
import type { AuthUser } from '@/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  let unsubscribe: (() => void) | null = null

  /** Recupera la sessione esistente e si mette in ascolto dei cambi di stato. */
  async function init(): Promise<void> {
    if (initialized.value) return
    const { auth } = useServices()
    user.value = await auth.getCurrentUser()
    unsubscribe = auth.onAuthChange((u) => {
      user.value = u
    })
    initialized.value = true
  }

  async function signIn(email: string, password: string): Promise<void> {
    loading.value = true
    try {
      user.value = await useServices().auth.signIn({ email, password })
    } finally {
      loading.value = false
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<AuthUser | null> {
    loading.value = true
    try {
      const result = await useServices().auth.signUp({ email, password, fullName })
      user.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    await useServices().auth.signOut()
    user.value = null
  }

  function dispose(): void {
    unsubscribe?.()
    unsubscribe = null
    initialized.value = false
  }

  return { user, initialized, loading, isAuthenticated, init, signIn, signUp, signOut, dispose }
})
