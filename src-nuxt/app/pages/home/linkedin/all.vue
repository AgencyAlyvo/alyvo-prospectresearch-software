<template>
  <main class="grid gap-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-semibold tracking-[0.2em] text-[#9a65d5] uppercase">LINKEDIN</p>
        <h1 class="mt-2 text-2xl font-semibold text-white">Tous les prospects Linkedin</h1>
      </div>
      <UButton
        label="Ajouter un prospect"
        icon="i-heroicons-plus"
        class="rounded-md bg-[linear-gradient(135deg,#102766_0%,#7446a6_100%)] px-4 py-2 font-semibold text-white shadow-[0_14px_30px_rgba(5,9,23,0.35)] transition hover:bg-[linear-gradient(135deg,#17337c_0%,#9a65d5_100%)]"
        @click="isCreateOpen = true"
      />
    </header>

    <LinkedinProspectsFilters @submit="fetchWithFilters" />
    <LinkedinProspectsTable :prospects="store.prospects" :loading="store.isLoading" />

    <UModal
      v-model:open="isCreateOpen"
      :ui="{
        overlay: 'bg-[#020617]/80 backdrop-blur-sm',
        content:
          'max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto rounded-lg border border-[#2f3d67] bg-[#071022] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-0 divide-y-0',
        close: 'text-[#9ba3bd] hover:text-white hover:bg-[#111c3f]',
      }"
    >
      <template #content>
        <div class="bg-[radial-gradient(circle_at_top_right,rgba(154,101,213,0.18),transparent_34%),#071022] p-6">
          <p class="text-xs font-semibold tracking-[0.2em] text-[#9a65d5] uppercase">LINKEDIN</p>
          <h2 class="mt-2 mb-1 text-xl font-semibold text-white">Nouveau prospect LinkedIn</h2>
          <p class="mb-5 text-sm text-[#9ba3bd]">Ajoute les informations principales du prospect.</p>
          <LinkedinCreateForm @created="handleCreated" @cancel="isCreateOpen = false" />
        </div>
      </template>
    </UModal>
  </main>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { useLinkedinProspectsStore } from '#src-nuxt/app/stores/linkedinProspects.store'
import type { ListLinkedinProspectsQuery } from '#src-core/types/payload/linkedin.types'

definePageMeta({ layout: 'home' })

const store: ReturnType<typeof useLinkedinProspectsStore> = useLinkedinProspectsStore()
const toast: ReturnType<typeof useToast> = useToast()
const isCreateOpen: Ref<boolean> = ref(false)

/**
 * Charge la liste avec filtres.
 * @param {ListLinkedinProspectsQuery} query - Filtres a appliquer.
 * @returns {Promise<void>}
 */
const fetchWithFilters: (query: ListLinkedinProspectsQuery) => Promise<void> = async (
  query: ListLinkedinProspectsQuery,
): Promise<void> => {
  await store.fetchList(query)
}

/**
 * Ferme la modale puis recharge la liste.
 * @returns {Promise<void>}
 */
const handleCreated: () => Promise<void> = async (): Promise<void> => {
  isCreateOpen.value = false
  await store.fetchList()
  toast.add({
    title: 'Prospect ajouté',
    description: 'Le nouveau prospect a été ajouté à votre liste.',
    color: 'success',
    duration: 3000,
  })
}

onMounted((): void => {
  void store.fetchList()
})
</script>
