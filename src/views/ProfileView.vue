<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageHeader from '@/components/app/PageHeader.vue'
import FamilyList from '@/components/app/FamilyList.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'

const auth = useAuthStore()
const family = useFamilyStore()

const myMember = computed(() => family.members.find((m) => m.profileId === auth.user?.id) ?? null)
const name = ref('')
const saving = ref(false)

onMounted(async () => {
  if (!family.members.length) await family.reloadMembers()
  name.value = myMember.value?.profile?.fullName ?? ''
})

async function save(): Promise<void> {
  if (!name.value.trim()) {
    toast.error('Inserisci un nome.')
    return
  }
  saving.value = true
  try {
    await family.updateMyName(name.value.trim())
    toast.success('Profilo aggiornato.')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Operazione non riuscita.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Profilo" subtitle="Il tuo account" />

    <section class="space-y-2 rounded-2xl border border-border bg-card p-4">
      <Label for="profile-name">Nome</Label>
      <Input id="profile-name" v-model="name" placeholder="Il tuo nome" class="h-11" />
      <Button class="mt-2 h-11 w-full" :disabled="saving" @click="save">Salva</Button>
    </section>

    <section class="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-muted-foreground">Email</span>
        <span class="truncate text-sm font-medium">{{ auth.user?.email }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-muted-foreground">Famiglia</span>
        <span class="truncate text-sm font-medium">{{ family.familyName }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-muted-foreground">Ruolo</span>
        <Badge :variant="family.isAdmin ? 'default' : 'secondary'">
          {{ family.isAdmin ? 'Admin' : 'Membro' }}
        </Badge>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Le mie famiglie
      </h2>
      <FamilyList />
    </section>
  </div>
</template>
