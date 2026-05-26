<template>
  <div
    v-if="loading || safeProspects.length > 0"
    class="overflow-hidden rounded-lg border border-[#2f3d67] bg-[#0b1433]/70"
  >
    <div v-if="loading" class="p-6 text-sm text-[#9ba3bd]">Chargement...</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[1340px] text-left text-sm">
        <thead class="border-b border-[#2f3d67] text-xs text-[#9ba3bd] uppercase">
          <tr>
            <th class="px-4 py-3">Prospect</th>
            <th class="px-4 py-3">Poste</th>
            <th class="px-4 py-3">Entreprise</th>
            <th class="px-4 py-3">Ville</th>
            <th class="px-4 py-3">Region</th>
            <th class="px-4 py-3">Secteur</th>
            <th class="px-4 py-3">Statut</th>
            <th class="px-4 py-3">Prochaine action</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="prospect in safeProspects"
            :key="prospect.id"
            class="cursor-pointer border-b border-[#1a2747] text-[#dfe6ff] last:border-0 hover:bg-[#111c35]"
            @click="openProspect(prospect.id)"
          >
            <td class="px-4 py-3">
              <span class="font-medium text-white">{{ prospect.firstName }} {{ prospect.lastName }}</span>
            </td>
            <td class="px-4 py-3 text-[#c7d0ea]">{{ prospect.position ?? '-' }}</td>
            <td class="px-4 py-3">
              {{ prospect.company ?? '-' }}
            </td>
            <td class="px-4 py-3 text-[#c7d0ea]">{{ prospect.city ?? '-' }}</td>
            <td class="px-4 py-3 text-[#c7d0ea]">{{ prospect.region ?? '-' }}</td>
            <td class="px-4 py-3 text-[#c7d0ea]">{{ prospect.industry ?? '-' }}</td>
            <td class="px-4 py-3" @click.stop>
              <USelect
                :model-value="normalizeStatusForSelect(prospect.status)"
                :items="statusItems"
                variant="none"
                :ui="selectUi"
                @update:model-value="(status: string) => updateStatus(prospect, status)"
              />
            </td>
            <td class="px-4 py-3 text-[#9ba3bd]">{{ getNextActionLabel(prospect) }}</td>
            <td class="px-4 py-3" @click.stop>
              <LinkedinQuickActionsCell
                :prospect="prospect"
                :refreshing="isUpdating(prospect.id)"
                :deleting="isUpdating(prospect.id)"
                @refresh="refreshProspect(prospect)"
                @delete="requestDelete(prospect)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <ConfirmDialog
    v-model="deleteDialogOpen"
    title="Supprimer le prospect"
    :message="deleteDialogMessage"
    confirm-label="Supprimer"
    :loading="prospectPendingDeletion ? isUpdating(prospectPendingDeletion.id) : false"
    @confirm="confirmDelete"
  />
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import {
  buildLinkedinStatusSelectItems,
  linkedinSelectableStatusLabels,
  linkedinRelanceOnlyStatuses,
  linkedinTerminalNextActionLabels,
} from '#src-core/constants/linkedinSelectableStatuses'
import { LinkedinProspectStatus } from '#src-core/types/enums/linkedin.enums'
import type { LinkedinProspectSummary } from '#src-core/types/response/linkedin.types'
import { useLinkedinProspectsStore } from '#src-nuxt/app/stores/linkedinProspects.store'

/**
 * Props de la table prospects.
 */
type LinkedinProspectsTableProps = {
  prospects?: LinkedinProspectSummary[]
  loading?: boolean
}

/**
 *
 */
type StatusItem = {
  label: string
  value: LinkedinProspectStatus
}

const props: LinkedinProspectsTableProps = withDefaults(defineProps<LinkedinProspectsTableProps>(), {
  /**
   * Retourne la liste vide par defaut.
   * @returns {LinkedinProspectSummary[]} Liste vide.
   */
  prospects: (): LinkedinProspectSummary[] => [],
  loading: false,
})
const store: ReturnType<typeof useLinkedinProspectsStore> = useLinkedinProspectsStore()
const router: ReturnType<typeof useRouter> = useRouter()
const toast: ReturnType<typeof useToast> = useToast()
const updatingIds: Ref<Set<number>> = ref(new Set<number>())
const deleteDialogOpen: Ref<boolean> = ref(false)
const prospectPendingDeletion: Ref<LinkedinProspectSummary | undefined> = ref(undefined)

/** Configuration UI du select de statut. */
type SelectUiConfig = {
  base: string
  trailingIcon: string
  content: string
  viewport: string
  item: string
  itemWrapper: string
  itemLabel: string
  itemTrailingIcon: string
}
const selectUi: SelectUiConfig = {
  base: 'h-10 cursor-pointer rounded-md border border-[#2f3d67] bg-[rgba(5,9,23,0.86)] px-3 text-[#f7f8ff] shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none transition hover:border-[#485780] focus:border-[#9a65d5]',
  trailingIcon: 'text-[#9ba3bd]',
  content:
    'w-max min-w-full max-h-60 rounded-md border border-[#2f3d67] bg-[#071022] shadow-[0_18px_48px_rgba(0,0,0,0.35)] ring-0',
  viewport: 'relative divide-y divide-[#152247] scroll-py-1 overflow-y-auto flex-1',
  item: 'group relative flex w-full items-start gap-1.5 rounded-md p-1.5 text-sm !text-[#c7d0ea] outline-none transition-colors hover:bg-[#111c3f] hover:!text-white data-[highlighted]:bg-[#111c3f] data-[highlighted]:!text-white data-[state=checked]:bg-[#16234f] data-[state=checked]:!text-white',
  itemWrapper: 'min-w-0 flex-1 !text-current',
  itemLabel: '!text-current group-data-[highlighted]:!text-white group-data-[state=checked]:!text-white',
  itemTrailingIcon: 'text-[#9a65d5] group-data-[highlighted]:text-[#c7a8f2] group-data-[state=checked]:text-[#c7a8f2]',
} as const
const statusItems: StatusItem[] = buildLinkedinStatusSelectItems()
const statusLabels: Record<LinkedinProspectStatus, string> = linkedinSelectableStatusLabels

const safeProspects: ComputedRef<LinkedinProspectSummary[]> = computed(
  (): LinkedinProspectSummary[] => props.prospects ?? [],
)
const relanceLegacyStatuses: LinkedinProspectStatus[] = linkedinRelanceOnlyStatuses

/**
 * Normalise un statut legacy de relance vers message 1 envoye pour le select.
 * @param {LinkedinProspectStatus} status - Statut courant.
 * @returns {LinkedinProspectStatus} Statut affiche dans le select.
 */
const normalizeStatusForSelect: (status: LinkedinProspectStatus) => LinkedinProspectStatus = (
  status: LinkedinProspectStatus,
): LinkedinProspectStatus => {
  if (relanceLegacyStatuses.includes(status)) {
    return LinkedinProspectStatus.MESSAGE_1_ENVOYE
  }

  return status
}

const deleteDialogMessage: ComputedRef<string> = computed((): string => {
  const prospect: LinkedinProspectSummary | undefined = prospectPendingDeletion.value
  if (!prospect) {
    return 'Ce prospect sera supprime definitivement.'
  }
  return `Supprimer definitivement ${prospect.firstName} ${prospect.lastName} ?`
})

/**
 * Navigue vers la fiche d'un prospect.
 * @param {number} id - Identifiant du prospect.
 * @returns {Promise<void>}
 */
const openProspect: (id: number) => Promise<void> = async (id: number): Promise<void> => {
  await router.push(`/home/linkedin/${id}`)
}

/**
 * Marque ou supprime un prospect comme en cours de mise a jour.
 * @param {number} id - Identifiant du prospect.
 * @param {boolean} value - Valeur.
 * @returns {void}
 */
const setUpdating: (id: number, value: boolean) => void = (id: number, value: boolean): void => {
  const next: Set<number> = new Set(updatingIds.value)
  if (value) {
    next.add(id)
  } else {
    next.delete(id)
  }
  updatingIds.value = next
}

/**
 * Indique si un prospect est en cours de mise a jour.
 * @param {number} id - Identifiant du prospect.
 * @returns {boolean} True si le prospect est en cours de mise a jour.
 */
const isUpdating: (id: number) => boolean = (id: number): boolean => updatingIds.value.has(id)

/**
 * Met a jour le statut d'un prospect.
 * @param {LinkedinProspectSummary} prospect - Prospect LinkedIn.
 * @param {string} status - Statut du prospect.
 * @returns {Promise<void>}
 */
const updateStatus: (prospect: LinkedinProspectSummary, status: string) => Promise<void> = async (
  prospect: LinkedinProspectSummary,
  status: string,
): Promise<void> => {
  if (status === prospect.status) {
    return
  }

  setUpdating(prospect.id, true)
  try {
    await store.update(prospect.id, { status: status as LinkedinProspectStatus })
    toast.add({
      title: 'Statut mis à jour',
      description: statusLabels[status as LinkedinProspectStatus],
      color: 'success',
      duration: 3000,
    })
  } finally {
    setUpdating(prospect.id, false)
  }
}

/**
 * Relance l'enrichissement n8n et met a jour la fiche du prospect.
 * @param {LinkedinProspectSummary} prospect - Prospect LinkedIn.
 * @returns {Promise<void>}
 */
const refreshProspect: (prospect: LinkedinProspectSummary) => Promise<void> = async (
  prospect: LinkedinProspectSummary,
): Promise<void> => {
  if (!prospect.linkedinUrl) {
    toast.add({
      title: 'URL LinkedIn manquante',
      description: 'Ajoute une URL LinkedIn avant de rafraichir ce prospect.',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  setUpdating(prospect.id, true)
  try {
    await store.refresh(prospect.id)
    toast.add({
      title: 'Prospect mis a jour',
      description: `${prospect.firstName} ${prospect.lastName} a ete rafraichi depuis LinkedIn.`,
      color: 'success',
      duration: 3000,
    })
  } finally {
    setUpdating(prospect.id, false)
  }
}

/**
 * Ouvre la confirmation de suppression.
 * @param {LinkedinProspectSummary} prospect - Prospect a supprimer.
 * @returns {void}
 */
const requestDelete: (prospect: LinkedinProspectSummary) => void = (prospect: LinkedinProspectSummary): void => {
  prospectPendingDeletion.value = prospect
  deleteDialogOpen.value = true
}

/**
 * Supprime le prospect selectionne apres confirmation.
 * @returns {Promise<void>} Promesse resolue apres suppression.
 */
const confirmDelete: () => Promise<void> = async (): Promise<void> => {
  const prospect: LinkedinProspectSummary | undefined = prospectPendingDeletion.value
  if (!prospect) {
    deleteDialogOpen.value = false
    return
  }

  setUpdating(prospect.id, true)
  try {
    await store.destroy(prospect.id)
    toast.add({
      title: 'Prospect supprime',
      description: `${prospect.firstName} ${prospect.lastName} a ete retire de la liste.`,
      color: 'success',
      duration: 3000,
    })
    deleteDialogOpen.value = false
    prospectPendingDeletion.value = undefined
  } finally {
    setUpdating(prospect.id, false)
  }
}

/**
 * Retourne le libelle de la prochaine action d'un prospect.
 * @param {LinkedinProspectSummary} prospect - Prospect LinkedIn.
 * @returns {string} Libelle affiche pour la prochaine action.
 */
const getNextActionLabel: (prospect: LinkedinProspectSummary) => string = (prospect: LinkedinProspectSummary): string =>
  prospect.nextAction ?? linkedinTerminalNextActionLabels[prospect.status] ?? 'A definir'
</script>
