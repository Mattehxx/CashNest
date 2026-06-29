<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function submit(): Promise<void> {
  if (password.value.length < 6) {
    toast.error('La password deve avere almeno 6 caratteri.')
    return
  }
  loading.value = true
  try {
    await auth.updatePassword(password.value)
    toast.success('Password aggiornata!')
    await router.push({ name: 'dashboard' })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Operazione non riuscita.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh flex-col justify-center bg-muted/30 px-5 py-10">
    <div class="mx-auto w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center text-center">
        <img src="/logo.svg" alt="CashNest" class="mb-4 size-14 rounded-2xl shadow-sm" />
        <h1 class="text-2xl font-bold tracking-tight">Nuova password</h1>
        <p class="mt-1 text-sm text-muted-foreground">Scegli una nuova password per il tuo account.</p>
      </div>

      <div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1.5">
            <Label for="rp-password">Password</Label>
            <div class="relative">
              <Input
                id="rp-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="h-12 pr-11"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                :aria-label="showPassword ? 'Nascondi password' : 'Mostra password'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOffIcon : EyeIcon" class="size-5" />
              </button>
            </div>
          </div>
          <Button type="submit" class="h-12 w-full text-base" :disabled="loading">
            <LoaderCircleIcon v-if="loading" class="size-5 animate-spin" />
            <span v-else>Aggiorna password</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
