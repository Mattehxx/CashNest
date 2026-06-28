import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'

/**
 * Guardia di navigazione:
 *  - rotte pubbliche (login) accessibili solo da non autenticati;
 *  - rotte protette richiedono sessione valida;
 *  - utenti autenticati ma senza famiglia vengono inviati a /no-family.
 */
export const authGuard: NavigationGuard = async (to) => {
  const auth = useAuthStore()
  await auth.init()

  const isPublic = to.meta.public === true

  if (!auth.isAuthenticated) {
    return isPublic ? true : { name: 'login' }
  }

  if (isPublic) {
    return { name: 'dashboard' }
  }

  const family = useFamilyStore()
  if (!family.loaded) {
    await family.load()
  }

  if (!family.hasFamily) {
    return to.name === 'no-family' ? true : { name: 'no-family' }
  }

  if (to.name === 'no-family') {
    return { name: 'dashboard' }
  }

  return true
}
