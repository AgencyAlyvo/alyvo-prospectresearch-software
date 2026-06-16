<template>
  <form
    class="grid gap-3 rounded-lg border border-[#2f3d67] bg-[#0b1433]/70 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end"
    @submit.prevent="applyFilters"
  >
    <AlyvoListFilterField
      label="Recherche texte"
      hint="Prenom, nom, entreprise ou poste LinkedIn (contient le texte saisi)"
    >
      <UInput
        v-model="localSearch"
        icon="i-heroicons-magnifying-glass"
        placeholder="Ex. Dupont, Alyvo, Directeur commercial"
        variant="none"
        class="w-full"
        :ui="inputUi"
      />
    </AlyvoListFilterField>

    <AlyvoListFilterField label="Statut" hint="Etape commerciale du prospect">
      <div class="min-w-[220px]">
        <LightStatusCell v-model="localStatus" :items="statusItems" />
      </div>
    </AlyvoListFilterField>

    <AlyvoListFilterField label="Favoris" hint="Afficher uniquement les prospects marques en favori">
      <div class="min-w-[200px]">
        <LightStatusCell v-model="localFavorite" :items="favoriteItems" />
      </div>
    </AlyvoListFilterField>

    <UButton
      type="submit"
      icon="i-heroicons-funnel"
      label="Filtrer"
      class="h-11 rounded-md bg-[linear-gradient(135deg,#102766_0%,#7446a6_100%)] px-4 py-2 font-semibold text-white shadow-[0_14px_30px_rgba(5,9,23,0.35)] transition hover:bg-[linear-gradient(135deg,#17337c_0%,#9a65d5_100%)]"
    />
  </form>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { buildLinkedinStatusSelectItems } from '#src-core/constants/linkedinSelectableStatuses'
import type { LinkedinProspectStatus } from '#src-core/types/enums/linkedin.enums'
import type { ListLinkedinProspectsQuery } from '#src-core/types/payload/linkedin.types'
import { isFavoriteOnlyFilter } from '#src-core/utils/queryFilters'

/**
 * Evenements du filtre de prospects.
 */
type LinkedinProspectsFiltersEmits = {
  submit: [query: ListLinkedinProspectsQuery]
}

/**
 * Signature de l'emetteur.
 */
type LinkedinProspectsFiltersEmit = (event: 'submit', query: ListLinkedinProspectsQuery) => void

/**
 * Item de select.
 */
type SelectItem = {
  label: string
  value: string
}

const allStatusesValue: string = 'all'
const allFavoritesValue: string = 'all'
const emit: LinkedinProspectsFiltersEmit = defineEmits<LinkedinProspectsFiltersEmits>()
const localSearch: Ref<string> = ref('')
const localStatus: Ref<string> = ref(allStatusesValue)
const localFavorite: Ref<string> = ref(allFavoritesValue)
/** Configuration UI de l'input de recherche. */
type InputUiConfig = { base: string; leadingIcon: string }
const inputUi: InputUiConfig = {
  base: 'h-11 w-full rounded-md border border-[#2f3d67] bg-[rgba(5,9,23,0.86)] px-3 text-[#f7f8ff] placeholder:text-[#626d90] shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none transition hover:border-[#485780] focus:border-[#9a65d5] focus:shadow-[0_0_0_1px_rgba(154,101,213,0.28),0_10px_24px_rgba(0,0,0,0.18)]',
  leadingIcon: 'text-[#9ba3bd]',
} as const

const statusItems: SelectItem[] = [
  { label: 'Tous les statuts', value: allStatusesValue },
  ...buildLinkedinStatusSelectItems().map(
    (item: { label: string; value: LinkedinProspectStatus }): SelectItem => ({
      label: item.label,
      value: item.value,
    }),
  ),
]

const favoriteItems: SelectItem[] = [
  { label: 'Tous les prospects', value: allFavoritesValue },
  { label: 'Favoris uniquement', value: 'true' },
]

/**
 * Emet les filtres actifs.
 * @returns {void}
 */
const applyFilters: () => void = (): void => {
  emit('submit', {
    search: localSearch.value || undefined,
    status:
      localStatus.value !== allStatusesValue ? [localStatus.value as LinkedinProspectStatus] : undefined,
    isFavorite: isFavoriteOnlyFilter(localFavorite.value) ? true : undefined,
    page: 1,
  })
}
</script>
