<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { CheckIcon, PlusIcon, UsersIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFamilyStore } from '@/stores/family.store'

const family = useFamilyStore()
const emit = defineEmits<{ switched: [] }>()

const creating = ref(false)
const newName = ref('')
const busy = ref(false)

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Operazione non riuscita.'
}

async function choose(id: string): Promise<void> {
  if (id === family.familyId) {
    emit('switched')
    return
  }
  busy.value = true
  try {
    await family.setActiveFamily(id)
    toast.success('Famiglia cambiata.')
    emit('switched')
  } catch (e) {
    toast.error(errMsg(e))
  } finally {
    busy.value = false
  }
}

async function create(): Promise<void> {
  if (!newName.value.trim()) {
    toast.error('Inserisci un nome.')
    return
  }
  busy.value = true
  try {
    await family.createFamily(newName.value.trim())
    newName.value = ''
    creating.value = false
    toast.success('Famiglia creata.')
    emit('switched')
  } catch (e) {
    toast.error(errMsg(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <button
      v-for="f in family.families"
      :key="f.family.id"
      type="button"
      class="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.99]"
      :class="f.family.id === family.familyId ? 'ring-2 ring-primary' : ''"
      :disabled="busy"
      @click="choose(f.family.id)"
    >
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <UsersIcon class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold">{{ f.family.name }}</p>
        <p class="text-xs text-muted-foreground">{{ f.role === 'admin' ? 'Admin' : 'Membro' }}</p>
      </div>
      <CheckIcon v-if="f.family.id === family.familyId" class="size-5 shrink-0 text-primary" />
    </button>

    <div v-if="!creating" class="pt-1">
      <Button variant="outline" class="h-11 w-full" :disabled="busy" @click="creating = true">
        <PlusIcon class="size-4" />
        Crea nuova famiglia
      </Button>
    </div>
    <div v-else class="space-y-2 pt-1">
      <Input v-model="newName" placeholder="Nome famiglia" class="h-11" />
      <div class="flex gap-2">
        <Button class="h-11 flex-1" :disabled="busy" @click="create">Crea</Button>
        <Button variant="outline" class="h-11" :disabled="busy" @click="creating = false">
          Annulla
        </Button>
      </div>
    </div>
  </div>
</template>
