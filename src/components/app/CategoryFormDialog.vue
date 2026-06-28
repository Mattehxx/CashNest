<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
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
import ColorPicker from './ColorPicker.vue'
import IconPicker from './IconPicker.vue'
import type { Category, CategoryInput } from '@/types'
import { DEFAULT_COLOR } from '@/lib/colors'
import { DEFAULT_CATEGORY_ICON } from '@/lib/icons'
import { useCategoriesStore } from '@/stores/categories.store'
import { useFamilyStore } from '@/stores/family.store'

const props = defineProps<{ open: boolean; category: Category | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const categories = useCategoriesStore()
const family = useFamilyStore()

const saving = ref(false)
const confirmingDelete = ref(false)

const form = reactive<CategoryInput>({
  name: '',
  color: DEFAULT_COLOR,
  icon: DEFAULT_CATEGORY_ICON,
})

const isEdit = () => props.category !== null

watch(
  () => props.open,
  (open) => {
    if (!open) return
    confirmingDelete.value = false
    const c = props.category
    form.name = c?.name ?? ''
    form.color = c?.color ?? DEFAULT_COLOR
    form.icon = c?.icon ?? DEFAULT_CATEGORY_ICON
  },
)

function close(): void {
  emit('update:open', false)
}

async function save(): Promise<void> {
  if (!form.name.trim()) {
    toast.error('Inserisci un nome.')
    return
  }
  if (!family.familyId) return
  saving.value = true
  try {
    const input: CategoryInput = { name: form.name.trim(), color: form.color, icon: form.icon }
    if (props.category) {
      await categories.update(props.category.id, input)
      toast.success('Categoria aggiornata.')
    } else {
      await categories.create(family.familyId, input)
      toast.success('Categoria creata.')
    }
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  if (!props.category) return
  saving.value = true
  try {
    await categories.remove(props.category.id)
    toast.success('Categoria eliminata.')
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Modifica categoria' : 'Nuova categoria' }}</DialogTitle>
        <DialogDescription>Usata per classificare le spese.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label for="category-name">Nome</Label>
          <Input id="category-name" v-model="form.name" placeholder="Es. Alimentari" class="h-11" />
        </div>

        <div class="space-y-2">
          <Label>Colore</Label>
          <ColorPicker v-model="form.color" />
        </div>

        <div class="space-y-2">
          <Label>Icona</Label>
          <IconPicker v-model="form.icon" />
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <template v-if="!confirmingDelete">
          <Button class="h-12 w-full text-base" :disabled="saving" @click="save">
            {{ isEdit() ? 'Salva modifiche' : 'Crea categoria' }}
          </Button>
          <Button
            v-if="isEdit()"
            variant="destructive"
            class="h-11 w-full"
            :disabled="saving"
            @click="confirmingDelete = true"
          >
            Elimina
          </Button>
        </template>
        <template v-else>
          <p class="text-center text-sm text-muted-foreground">
            Eliminare definitivamente questa categoria?
          </p>
          <Button variant="destructive" class="h-11 w-full" :disabled="saving" @click="remove">
            Sì, elimina
          </Button>
          <Button
            variant="outline"
            class="h-11 w-full"
            :disabled="saving"
            @click="confirmingDelete = false"
          >
            Annulla
          </Button>
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>
