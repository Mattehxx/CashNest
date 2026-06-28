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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ColorPicker from './ColorPicker.vue'
import IconPicker from './IconPicker.vue'
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '@/types'
import type { Account, AccountInput, AccountType } from '@/types'
import { DEFAULT_COLOR } from '@/lib/colors'
import { DEFAULT_ACCOUNT_ICON } from '@/lib/icons'
import { useAccountsStore } from '@/stores/accounts.store'
import { useFamilyStore } from '@/stores/family.store'

const props = defineProps<{ open: boolean; account: Account | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const accounts = useAccountsStore()
const family = useFamilyStore()

const saving = ref(false)
const confirmingDelete = ref(false)

const form = reactive<AccountInput>({
  name: '',
  type: 'conto_corrente',
  color: DEFAULT_COLOR,
  icon: DEFAULT_ACCOUNT_ICON,
})

const isEdit = () => props.account !== null

watch(
  () => props.open,
  (open) => {
    if (!open) return
    confirmingDelete.value = false
    const a = props.account
    form.name = a?.name ?? ''
    form.type = a?.type ?? 'conto_corrente'
    form.color = a?.color ?? DEFAULT_COLOR
    form.icon = a?.icon ?? DEFAULT_ACCOUNT_ICON
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
    const input: AccountInput = {
      name: form.name.trim(),
      type: form.type,
      color: form.color,
      icon: form.icon,
    }
    if (props.account) {
      await accounts.update(props.account.id, input)
      toast.success('Conto aggiornato.')
    } else {
      await accounts.create(family.familyId, input)
      toast.success('Conto creato.')
    }
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  if (!props.account) return
  saving.value = true
  try {
    await accounts.remove(props.account.id)
    toast.success('Conto eliminato.')
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
        <DialogTitle>{{ isEdit() ? 'Modifica conto' : 'Nuovo conto' }}</DialogTitle>
        <DialogDescription>Metodo di pagamento usato per le spese.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label for="account-name">Nome</Label>
          <Input id="account-name" v-model="form.name" placeholder="Es. Conto corrente" class="h-11" />
        </div>

        <div class="space-y-1.5">
          <Label>Tipo</Label>
          <Select
            :model-value="form.type"
            @update:model-value="form.type = $event as AccountType"
          >
            <SelectTrigger class="h-11 w-full">
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in ACCOUNT_TYPES" :key="t" :value="t">
                {{ ACCOUNT_TYPE_LABELS[t] }}
              </SelectItem>
            </SelectContent>
          </Select>
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
            {{ isEdit() ? 'Salva modifiche' : 'Crea conto' }}
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
            Eliminare definitivamente questo conto?
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
