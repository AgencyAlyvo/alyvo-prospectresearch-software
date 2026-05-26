<template>
  <main class="grid gap-6">
    <header>
      <p class="text-xs font-semibold tracking-[0.2em] text-[#9a65d5] uppercase">LINKEDIN</p>
      <h1 class="mt-2 text-2xl font-semibold text-white">Objectif LinkedIn de la semaine</h1>
      <p class="mt-1 text-sm text-[#9ba3bd]">{{ weekLabel }}</p>
    </header>

    <WeeklyObjectiveBanner :objective="objectiveStore.current" />

    <section class="grid gap-4">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-base font-semibold text-white">Prospects ajoutes cette semaine</h2>
          <p class="mt-1 text-xs text-[#9ba3bd]">
            {{ weeklyProspectsCountLabel }}
          </p>
        </div>
      </div>

      <div
        v-if="prospectsStore.isLoading"
        class="rounded-lg border border-[#2f3d67] bg-[#0b1433]/70 p-6 text-sm text-[#9ba3bd]"
      >
        Chargement...
      </div>

      <LinkedinProspectsTable v-else-if="weeklyProspects.length > 0" :prospects="weeklyProspects" :loading="false" />

      <div v-else class="rounded-lg border border-[#2f3d67] bg-[#0b1433]/70 py-16 text-center">
        <UIcon name="i-heroicons-user-group" class="mx-auto mb-3 h-10 w-10 text-[#2f3d67]" />
        <p class="text-sm font-medium text-[#8f9abc]">Aucun prospect ajoute cette semaine</p>
        <p class="mt-1 text-xs text-[#9ba3bd]">Les nouveaux prospects apparaitront ici des leur creation.</p>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import type { LinkedinProspectSummary } from '#src-core/types/response/linkedin.types'
import { useLinkedinProspectsStore } from '#src-nuxt/app/stores/linkedinProspects.store'
import { useWeeklyObjectiveStore } from '#src-nuxt/app/stores/weeklyObjective.store'
import { formatIsoWeekDisplayLabel } from '#src-nuxt/app/utils/isoWeekLabel'

definePageMeta({ layout: 'home' })

const objectiveStore: ReturnType<typeof useWeeklyObjectiveStore> = useWeeklyObjectiveStore()
const prospectsStore: ReturnType<typeof useLinkedinProspectsStore> = useLinkedinProspectsStore()

const weekLabel: ComputedRef<string> = computed((): string => formatIsoWeekDisplayLabel(objectiveStore.current?.week))

const weeklyProspects: ComputedRef<LinkedinProspectSummary[]> = computed(
  (): LinkedinProspectSummary[] => prospectsStore.weekly ?? [],
)

const weeklyProspectsCountLabel: ComputedRef<string> = computed((): string => {
  const count: number = weeklyProspects.value.length
  if (count === 0) {
    return 'Aucun prospect pour le moment'
  }

  if (count === 1) {
    return '1 prospect identifie sur la semaine'
  }

  return `${count} prospects identifies sur la semaine`
})

/**
 * Charge la page semaine.
 * @returns {Promise<void>}
 */
const loadPage: () => Promise<void> = async (): Promise<void> => {
  await objectiveStore.fetchCurrent()
  await prospectsStore.fetchWeekly(objectiveStore.current?.week)
}

onMounted((): void => {
  void loadPage()
})
</script>
