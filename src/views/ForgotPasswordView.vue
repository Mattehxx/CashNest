<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { LoaderCircleIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit(): Promise<void> {
  if (!email.value.trim()) {
    toast.error('Inserisci la tua email.')
    return
  }
  loading.value = true
  try {
    await auth.resetPassword(email.value.trim())
    sent.value = true
    toast.success('Email inviata! Controlla la posta.')
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
        <h1 class="text-2xl font-bold tracking-tight">Password dimenticata</h1>
        <p class="mt-1 text-sm text-muted-foreground">Ti invieremo un link per reimpostarla.</p>
      </div>

      <div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <form v-if="!sent" class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1.5">
            <Label for="fp-email">Email</Label>
            <Input
              id="fp-email"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="nome@email.it"
              class="h-12"
            />
          </div>
          <Button type="submit" class="h-12 w-full text-base" :disabled="loading">
            <LoaderCircleIcon v-if="loading" class="size-5 animate-spin" />
            <span v-else>Invia link</span>
          </Button>
        </form>
        <p v-else class="text-center text-sm text-muted-foreground">
          Se l'email è registrata riceverai un link per reimpostare la password.
        </p>

        <p class="mt-5 text-center text-sm">
          <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">
            Torna all'accesso
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
