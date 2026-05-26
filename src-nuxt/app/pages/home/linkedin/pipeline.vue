<template>
  <main class="grid gap-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-semibold tracking-[0.2em] text-[#9a65d5] uppercase">LINKEDIN</p>
        <h1 class="mt-2 text-2xl font-semibold text-white">Pipeline LinkedIn</h1>
        <p class="mt-2 max-w-2xl text-sm text-[#9ba3bd]">
          Vue kanban des prospects par statut courant, pour suivre ou chacun en est maintenant.
        </p>
      </div>

      <UButton
        label="Rafraichir"
        icon="i-heroicons-arrow-path"
        :loading="store.isLoading"
        class="rounded-md bg-[linear-gradient(135deg,#102766_0%,#7446a6_100%)] px-4 py-2 font-semibold text-white shadow-[0_14px_30px_rgba(5,9,23,0.35)] transition hover:bg-[linear-gradient(135deg,#17337c_0%,#9a65d5_100%)]"
        @click="refresh(true)"
      />
    </header>

    <section class="overflow-x-auto pb-4">
      <div class="flex min-h-[calc(100vh-220px)] gap-4">
        <article
          v-for="column in columns"
          :key="column.title"
          class="flex w-[340px] min-w-[340px] shrink-0 flex-col rounded-lg border border-[#2f3d67] bg-[#0b1433]/70"
        >
          <header class="border-b border-[#2f3d67] p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-sm leading-snug font-semibold break-words text-white">{{ column.title }}</h2>
                <p class="mt-1 text-xs leading-relaxed break-words text-[#9ba3bd]">{{ column.description }}</p>
              </div>
              <span class="shrink-0 rounded-md bg-[#101c3f] px-2 py-1 text-xs font-semibold text-[#cbb6ff]">
                {{ column.prospects.length }}
              </span>
            </div>
          </header>

          <div class="grid gap-3 p-3">
            <NuxtLink
              v-for="prospect in column.prospects"
              :key="prospect.id"
              :to="`/home/linkedin/${prospect.id}`"
              class="grid min-w-0 gap-3 overflow-hidden rounded-md border border-[#2f3d67] bg-[#071022] p-3 transition hover:border-[#9a65d5] hover:bg-[#0f1a3d]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-white">
                    {{ prospect.firstName }} {{ prospect.lastName }}
                  </p>
                  <p class="mt-1 truncate text-xs text-[#9fb0d0]">
                    {{ prospect.position || 'Poste non renseigne' }}
                  </p>
                </div>
              </div>

              <p v-if="prospect.company" class="truncate text-xs text-[#9ba3bd]">{{ prospect.company }}</p>
              <StatusBadge :status="prospect.status" wrap />

              <div v-if="prospect.nextAction || prospect.nextActionAt" class="min-w-0 rounded-md bg-[#101c3f] p-2">
                <p v-if="prospect.nextAction" class="text-xs leading-relaxed break-words text-[#d7def3]">
                  {{ prospect.nextAction }}
                </p>
                <p v-if="prospect.nextActionAt" class="mt-1 text-[11px] font-medium text-[#9a65d5]">
                  {{ formatDate(prospect.nextActionAt) }}
                </p>
              </div>
            </NuxtLink>

            <div
              v-if="!column.prospects.length"
              class="rounded-md border border-dashed border-[#2f3d67] p-4 text-center text-xs text-[#9ba3bd]"
            >
              Aucun prospect
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import {
  linkedinPipelineColumnDefinitions,
  type LinkedinPipelineColumnDefinition,
} from '#src-core/constants/linkedinSelectableStatuses'
import type { LinkedinProspectSummary } from '#src-core/types/response/linkedin.types'
import { useLinkedinProspectsStore } from '#src-nuxt/app/stores/linkedinProspects.store'
import { formatParisDate } from '#src-nuxt/app/utils/parisTime'

definePageMeta({ layout: 'home' })

/**
 *
 */
type PipelineColumn = LinkedinPipelineColumnDefinition & {
  prospects: LinkedinProspectSummary[]
}

const store: ReturnType<typeof useLinkedinProspectsStore> = useLinkedinProspectsStore()
const toast: ReturnType<typeof useToast> = useToast()

const columns: ComputedRef<PipelineColumn[]> = computed((): PipelineColumn[] =>
  linkedinPipelineColumnDefinitions.map(
    (column: LinkedinPipelineColumnDefinition): PipelineColumn => ({
      ...column,
      prospects: store.prospects.filter((prospect: LinkedinProspectSummary): boolean =>
        column.statuses.includes(prospect.status),
      ),
    }),
  ),
)

/**
 * Recharge la liste des prospects du pipeline.
 * @param {boolean} [notify] - Indique si un toast doit être affiché.
 * @returns {Promise<void>}
 */
const refresh: (notify?: boolean) => Promise<void> = async (notify: boolean = false): Promise<void> => {
  await store.fetchList({
    page: 1,
    perPage: 200,
    sortBy: 'createdAt',
    sortDir: 'desc',
  })
  if (notify) {
    toast.add({ title: 'Pipeline mis à jour', color: 'success', duration: 3000 })
  }
}

/**
 * Formate une date ISO en format court francais en fuseau Paris.
 * @param {string} date - Date ISO.
 * @returns {string} Date formatee en format court.
 */
const formatDate: (date: string) => string = (date: string): string =>
  formatParisDate(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) ?? '-'

onMounted((): void => {
  void refresh()
})
</script>
