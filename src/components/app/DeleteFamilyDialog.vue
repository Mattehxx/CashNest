<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFamilyStore } from '@/stores/family.store'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; deleted: [] }>()

const family = useFamilyStore()
const step = ref<1 | 2>(1)
const confirmName = ref('')
const deleting = ref(false)

const familyName = computed(() => family.familyName ?? '')
const canDelete = computed(() => confirmName.value.trim() === familyName.value && familyName.value !== '')

watch(
  () => props.open,
  (open) => {
    if (open) {
      step.value = 1
      confirmName.value = ''
    }
  },
)

function close(): void {
  emit('update:open', false)
}

async function confirmDelete(): Promise<void> {
  if (!canDelete.value || !family.familyId) return
  deleting.value = true
  try {
    await family.deleteFamily(family.familyId)
    toast.success('Famiglia eliminata.')
    emit('deleted')
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Operazione non riuscita.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-destructive">Elimina famiglia</DialogTitle>
        <DialogDescription>
          Azione irreversibile: verranno eliminati conti, categorie, spese ricorrenti, inviti e
          tutti i membri di «{{ familyName }}».
        </DialogDescription>
      </DialogHeader>

      <div v-if="step === 1" class="mt-2 space-y-2">
        <Button variant="destructive" class="h-11 w-full" @click="step = 2">Continua</Button>
        <Button variant="outline" class="h-11 w-full" @click="close">Annulla</Button>
      </div>

      <div v-else class="mt-2 space-y-3">
        <div class="space-y-1.5">
          <Label for="confirm-family-name">Scrivi «{{ familyName }}» per confermare</Label>
          <Input
            id="confirm-family-name"
            v-model="confirmName"
            :placeholder="familyName"
            autocomplete="off"
            class="h-11"
          />
        </div>
        <Button
          variant="destructive"
          class="h-11 w-full"
          :disabled="!canDelete || deleting"
          @click="confirmDelete"
        >
          Elimina definitivamente
        </Button>
        <Button variant="outline" class="h-11 w-full" :disabled="deleting" @click="close">
          Annulla
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
