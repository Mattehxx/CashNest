<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogOutIcon, UsersIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'

const router = useRouter()
const auth = useAuthStore()
const family = useFamilyStore()

async function retry(): Promise<void> {
  await family.load()
  if (family.hasFamily) await router.push({ name: 'dashboard' })
}

async function logout(): Promise<void> {
  await auth.signOut()
  family.reset()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 px-6 text-center">
    <div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <UsersIcon class="size-8" />
    </div>
    <div>
      <h1 class="text-xl font-bold">Nessuna famiglia associata</h1>
      <p class="mt-2 max-w-xs text-muted-foreground">
        Il tuo account non è ancora collegato a una famiglia. Chiedi all’amministratore di
        invitarti, poi riprova.
      </p>
    </div>
    <div class="w-full max-w-xs space-y-2">
      <Button class="h-12 w-full" @click="retry">Riprova</Button>
      <Button variant="outline" class="h-11 w-full" @click="logout">
        <LogOutIcon class="size-4" />
        Esci
      </Button>
    </div>
  </div>
</template>
