<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { PencilIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PageHeader from '@/components/app/PageHeader.vue'
import ListTransition from '@/components/app/ListTransition.vue'
import DeleteFamilyDialog from '@/components/app/DeleteFamilyDialog.vue'
import { MEMBER_ROLES } from '@/types'
import type { FamilyMember, MemberRole } from '@/types'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'
import { useInvitesStore } from '@/stores/invites.store'

const auth = useAuthStore()
const family = useFamilyStore()
const invites = useInvitesStore()

const ROLE_LABELS: Record<MemberRole, string> = { admin: 'Admin', member: 'Membro' }

const router = useRouter()
const deleteOpen = ref(false)
function onFamilyDeleted(): void {
  void router.push({ name: 'dashboard' })
}

onMounted(() => {
  if (family.familyId) {
    void family.reloadMembers()
    void invites.fetchAll(family.familyId)
  }
})

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Operazione non riuscita.'
}

/* ---------- Famiglia ---------- */
const editingName = ref(false)
const nameDraft = ref('')
function startRename(): void {
  nameDraft.value = family.familyName ?? ''
  editingName.value = true
}
async function saveName(): Promise<void> {
  if (!nameDraft.value.trim()) {
    toast.error('Inserisci un nome.')
    return
  }
  try {
    await family.rename(nameDraft.value.trim())
    editingName.value = false
    toast.success('Nome famiglia aggiornato.')
  } catch (e) {
    toast.error(errMsg(e))
  }
}

/* ---------- Membri ---------- */
function isSelf(profileId: string): boolean {
  return profileId === auth.user?.id
}
function memberName(m: FamilyMember): string {
  return m.profile?.fullName || m.profile?.email || 'Utente'
}
function memberInitial(m: FamilyMember): string {
  return memberName(m).charAt(0).toUpperCase()
}
const confirmRemoveMemberId = ref<string | null>(null)

async function toggleRole(m: FamilyMember): Promise<void> {
  const role: MemberRole = m.role === 'admin' ? 'member' : 'admin'
  try {
    await family.updateMemberRole(m.id, role)
    toast.success('Ruolo aggiornato.')
  } catch (e) {
    toast.error(errMsg(e))
  }
}
async function removeMember(memberId: string): Promise<void> {
  try {
    await family.removeMember(memberId)
    confirmRemoveMemberId.value = null
    toast.success('Membro rimosso.')
  } catch (e) {
    toast.error(errMsg(e))
  }
}

/* ---------- Inviti ---------- */
const pendingInvites = computed(() => invites.items.filter((i) => !i.acceptedAt))
const inviteForm = reactive<{ email: string; role: MemberRole }>({ email: '', role: 'member' })
const addingInvite = ref(false)
const confirmRemoveInviteId = ref<string | null>(null)

async function addInvite(): Promise<void> {
  if (!inviteForm.email.trim()) {
    toast.error('Inserisci un’email.')
    return
  }
  if (!family.familyId) return
  addingInvite.value = true
  try {
    await invites.create(family.familyId, { email: inviteForm.email.trim(), role: inviteForm.role })
    inviteForm.email = ''
    inviteForm.role = 'member'
    toast.success('Invito aggiunto. La persona può ora registrarsi.')
  } catch (e) {
    toast.error(errMsg(e))
  } finally {
    addingInvite.value = false
  }
}
async function removeInvite(id: string): Promise<void> {
  try {
    await invites.remove(id)
    confirmRemoveInviteId.value = null
    toast.success('Invito rimosso.')
  } catch (e) {
    toast.error(errMsg(e))
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader title="Gestione" subtitle="Famiglia, membri e inviti" />

    <!-- Famiglia -->
    <section class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Famiglia</h2>
      <div class="rounded-2xl border border-border bg-card p-3">
        <div v-if="!editingName" class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">Nome</p>
            <p class="truncate font-semibold">{{ family.familyName }}</p>
          </div>
          <Button variant="ghost" size="icon" class="size-10" aria-label="Rinomina" @click="startRename">
            <PencilIcon class="size-5" />
          </Button>
        </div>
        <div v-else class="space-y-2">
          <Label for="family-name">Nome famiglia</Label>
          <Input id="family-name" v-model="nameDraft" class="h-11" />
          <div class="flex gap-2">
            <Button class="h-11 flex-1" @click="saveName">Salva</Button>
            <Button variant="outline" class="h-11" @click="editingName = false">Annulla</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Membri -->
    <section class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Membri</h2>
      <ListTransition>
        <div
          v-for="m in family.members"
          :key="m.id"
          class="rounded-2xl border border-border bg-card p-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground"
            >
              {{ memberInitial(m) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">
                {{ memberName(m) }}
                <span v-if="isSelf(m.profileId)" class="text-muted-foreground">(tu)</span>
              </p>
              <p
                v-if="m.profile?.email && m.profile.email !== memberName(m)"
                class="truncate text-sm text-muted-foreground"
              >
                {{ m.profile.email }}
              </p>
            </div>
            <Badge :variant="m.role === 'admin' ? 'default' : 'secondary'">
              {{ ROLE_LABELS[m.role] }}
            </Badge>
          </div>

          <div v-if="!isSelf(m.profileId)" class="mt-3 flex gap-2">
            <template v-if="confirmRemoveMemberId !== m.id">
              <Button variant="outline" size="sm" class="flex-1" @click="toggleRole(m)">
                {{ m.role === 'admin' ? 'Rendi membro' : 'Rendi admin' }}
              </Button>
              <Button variant="destructive" size="sm" @click="confirmRemoveMemberId = m.id">
                Rimuovi
              </Button>
            </template>
            <template v-else>
              <Button variant="destructive" size="sm" class="flex-1" @click="removeMember(m.id)">
                Conferma rimozione
              </Button>
              <Button variant="outline" size="sm" @click="confirmRemoveMemberId = null">
                Annulla
              </Button>
            </template>
          </div>
        </div>
      </ListTransition>
    </section>

    <!-- Inviti -->
    <section class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Inviti in attesa
      </h2>

      <div class="space-y-2 rounded-2xl border border-border bg-card p-3">
        <Label for="invite-email">Aggiungi una persona</Label>
        <Input
          id="invite-email"
          v-model="inviteForm.email"
          type="email"
          inputmode="email"
          placeholder="email@esempio.it"
          class="h-11"
        />
        <div class="flex gap-2">
          <Select
            :model-value="inviteForm.role"
            @update:model-value="inviteForm.role = $event as MemberRole"
          >
            <SelectTrigger class="h-11 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="r in MEMBER_ROLES" :key="r" :value="r">
                {{ ROLE_LABELS[r] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button class="h-11" :disabled="addingInvite" @click="addInvite">Aggiungi</Button>
        </div>
        <p class="text-xs text-muted-foreground">
          La persona riceverà accesso registrandosi con questa email.
        </p>
      </div>

      <ListTransition v-if="pendingInvites.length">
        <div
          v-for="inv in pendingInvites"
          :key="inv.id"
          class="rounded-2xl border border-border bg-card p-3"
        >
          <div class="flex items-center gap-3">
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">{{ inv.email }}</p>
              <p class="text-sm text-muted-foreground">In attesa di registrazione</p>
            </div>
            <Badge :variant="inv.role === 'admin' ? 'default' : 'secondary'">
              {{ ROLE_LABELS[inv.role] }}
            </Badge>
          </div>
          <div class="mt-3 flex gap-2">
            <template v-if="confirmRemoveInviteId !== inv.id">
              <Button
                variant="destructive"
                size="sm"
                class="flex-1"
                @click="confirmRemoveInviteId = inv.id"
              >
                Rimuovi invito
              </Button>
            </template>
            <template v-else>
              <Button variant="destructive" size="sm" class="flex-1" @click="removeInvite(inv.id)">
                Conferma
              </Button>
              <Button variant="outline" size="sm" @click="confirmRemoveInviteId = null">
                Annulla
              </Button>
            </template>
          </div>
        </div>
      </ListTransition>
      <p v-else class="px-1 text-sm text-muted-foreground">Nessun invito in attesa.</p>
    </section>

    <!-- Zona pericolo -->
    <section class="space-y-3">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-destructive">Zona pericolo</h2>
      <div class="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
        <p class="text-sm text-muted-foreground">
          Elimina definitivamente questa famiglia e tutti i suoi dati. L'operazione non è
          reversibile.
        </p>
        <Button variant="destructive" class="mt-3 h-11 w-full" @click="deleteOpen = true">
          Elimina famiglia
        </Button>
      </div>
    </section>

    <DeleteFamilyDialog v-model:open="deleteOpen" @deleted="onFamilyDeleted" />
  </div>
</template>
