<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const fullName = ref('')
const showPassword = ref(false)

async function submit(): Promise<void> {
  const mail = email.value.trim()
  if (!mail) {
    toast.error('Inserisci la tua email.')
    return
  }
  if (!password.value) {
    toast.error('Inserisci la password.')
    return
  }
  if (mode.value === 'signup' && password.value.length < 6) {
    toast.error('La password deve avere almeno 6 caratteri.')
    return
  }
  try {
    if (mode.value === 'signin') {
      await auth.signIn(mail, password.value)
      toast.success('Bentornato!')
      await router.push({ name: 'dashboard' })
    } else {
      const user = await auth.signUp(mail, password.value, fullName.value.trim() || undefined)
      if (user) {
        toast.success('Account creato. Benvenuto in CashNest!')
        await router.push({ name: 'dashboard' })
      } else {
        toast.success('Registrazione completata! Conferma l’email, poi accedi.')
        mode.value = 'signin'
        password.value = ''
      }
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Operazione non riuscita.')
  }
}

function toggleMode(): void {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
}
</script>

<template>
  <div class="flex min-h-svh flex-col justify-center bg-muted/30 px-5 py-10">
    <div class="mx-auto w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center text-center">
        <img src="/logo.svg" alt="CashNest" class="mb-4 size-16 rounded-2xl shadow-sm" />
        <h1 class="text-3xl font-bold tracking-tight">CashNest</h1>
        <p class="mt-1 text-muted-foreground">Le spese di famiglia, semplici.</p>
      </div>

      <div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 class="mb-5 text-lg font-semibold">
          {{ mode === 'signin' ? 'Accedi' : 'Crea il tuo account' }}
        </h2>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="mode === 'signup'" class="space-y-1.5">
            <Label for="name">Nome</Label>
            <Input id="name" v-model="fullName" autocomplete="name" placeholder="Come ti chiami?" class="h-12" />
          </div>

          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="nome@email.it"
              class="h-12"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
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

          <div v-if="mode === 'signin'" class="text-right">
            <RouterLink
              :to="{ name: 'forgot-password' }"
              class="text-sm font-medium text-primary"
            >
              Password dimenticata?
            </RouterLink>
          </div>

          <Button type="submit" class="h-12 w-full text-base" :disabled="auth.loading">
            <LoaderCircleIcon v-if="auth.loading" class="size-5 animate-spin" />
            <span v-else>{{ mode === 'signin' ? 'Accedi' : 'Registrati' }}</span>
          </Button>
        </form>

        <p class="mt-5 text-center text-sm text-muted-foreground">
          {{ mode === 'signin' ? 'Non hai un account?' : 'Hai già un account?' }}
          <button type="button" class="font-semibold text-primary" @click="toggleMode">
            {{ mode === 'signin' ? 'Registrati' : 'Accedi' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
