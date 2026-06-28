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
import { Switch } from '@/components/ui/switch'
import { EXPENSE_FREQUENCIES, EXPENSE_FREQUENCY_LABELS } from '@/types'
import type { ExpenseFrequency, RecurringExpense, RecurringExpenseInput } from '@/types'
import { todayISO } from '@/lib/date'
import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useFamilyStore } from '@/stores/family.store'
import { useRecurringStore } from '@/stores/recurring.store'

/** Valore sentinella per "nessuna selezione" (i Select non accettano stringa vuota). */
const NONE = 'none'

const props = defineProps<{ open: boolean; item: RecurringExpense | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const recurring = useRecurringStore()
const accounts = useAccountsStore()
const categories = useCategoriesStore()
const family = useFamilyStore()

const saving = ref(false)
const confirmingDelete = ref(false)

const form = reactive({
  name: '',
  amountText: '',
  frequency: 'mensile' as ExpenseFrequency,
  accountId: NONE,
  categoryId: NONE,
  startDate: todayISO(),
  isActive: true,
})

const isEdit = () => props.item !== null

watch(
  () => props.open,
  (open) => {
    if (!open) return
    confirmingDelete.value = false
    const it = props.item
    form.name = it?.name ?? ''
    form.amountText = it ? String(it.amount).replace('.', ',') : ''
    form.frequency = it?.frequency ?? 'mensile'
    form.accountId = it?.accountId ?? NONE
    form.categoryId = it?.categoryId ?? NONE
    form.startDate = it?.startDate ?? todayISO()
    form.isActive = it?.isActive ?? true
  },
)

function close(): void {
  emit('update:open', false)
}

function parseAmount(text: string): number {
  return Number.parseFloat(text.replace(',', '.'))
}

async function save(): Promise<void> {
  if (!form.name.trim()) {
    toast.error('Inserisci un nome.')
    return
  }
  const amount = parseAmount(form.amountText)
  if (!Number.isFinite(amount) || amount < 0) {
    toast.error('Inserisci un importo valido.')
    return
  }
  if (!family.familyId) return
  saving.value = true
  try {
    const input: RecurringExpenseInput = {
      name: form.name.trim(),
      amount,
      frequency: form.frequency,
      accountId: form.accountId === NONE ? null : form.accountId,
      categoryId: form.categoryId === NONE ? null : form.categoryId,
      startDate: form.startDate,
      isActive: form.isActive,
    }
    if (props.item) {
      await recurring.update(props.item.id, input)
      toast.success('Spesa ricorrente aggiornata.')
    } else {
      await recurring.create(family.familyId, input)
      toast.success('Spesa ricorrente creata.')
    }
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  if (!props.item) return
  saving.value = true
  try {
    await recurring.remove(props.item.id)
    toast.success('Spesa ricorrente eliminata.')
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
        <DialogTitle>{{ isEdit() ? 'Modifica spesa ricorrente' : 'Nuova spesa ricorrente' }}</DialogTitle>
        <DialogDescription>Pagamenti che si ripetono nel tempo.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label for="rec-name">Nome</Label>
          <Input id="rec-name" v-model="form.name" placeholder="Es. Affitto" class="h-11" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label for="rec-amount">Importo (€)</Label>
            <Input
              id="rec-amount"
              v-model="form.amountText"
              inputmode="decimal"
              placeholder="0,00"
              class="h-11"
            />
          </div>
          <div class="space-y-1.5">
            <Label>Frequenza</Label>
            <Select
              :model-value="form.frequency"
              @update:model-value="form.frequency = $event as ExpenseFrequency"
            >
              <SelectTrigger class="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="f in EXPENSE_FREQUENCIES" :key="f" :value="f">
                  {{ EXPENSE_FREQUENCY_LABELS[f] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label>Metodo di pagamento</Label>
          <Select
            :model-value="form.accountId"
            @update:model-value="form.accountId = String($event)"
          >
            <SelectTrigger class="h-11 w-full">
              <SelectValue placeholder="Nessuno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="NONE">Nessuno</SelectItem>
              <SelectItem v-for="a in accounts.items" :key="a.id" :value="a.id">
                {{ a.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label>Categoria</Label>
          <Select
            :model-value="form.categoryId"
            @update:model-value="form.categoryId = String($event)"
          >
            <SelectTrigger class="h-11 w-full">
              <SelectValue placeholder="Nessuna" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="NONE">Nessuna</SelectItem>
              <SelectItem v-for="c in categories.items" :key="c.id" :value="c.id">
                {{ c.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label for="rec-date">Data di inizio</Label>
          <Input id="rec-date" v-model="form.startDate" type="date" class="h-11" />
        </div>

        <div class="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div>
            <p class="font-medium">Attiva</p>
            <p class="text-sm text-muted-foreground">Conteggiala nelle spese ricorrenti.</p>
          </div>
          <Switch v-model="form.isActive" />
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <template v-if="!confirmingDelete">
          <Button class="h-12 w-full text-base" :disabled="saving" @click="save">
            {{ isEdit() ? 'Salva modifiche' : 'Crea spesa ricorrente' }}
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
            Eliminare definitivamente questa spesa ricorrente?
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
