import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { LinkedinStatsApiService } from '#src-core/services/LinkedinStatsApiService'
import type { LinkedinStatsQuery } from '#src-core/types/payload/stats.types'
import type { LinkedinStats, LinkedinStatsResponse } from '#src-core/types/response/stats.types'

/**
 * Store statistiques expose.
 */
type StatsStore = {
  linkedinStats: LinkedinStats | undefined
  isLoading: boolean
  fetchLinkedin: (query?: LinkedinStatsQuery) => Promise<void>
}

/**
 * Store setup statistiques.
 */
type StatsStoreSetup = {
  linkedinStats: Ref<LinkedinStats | undefined>
  isLoading: Ref<boolean>
  fetchLinkedin: (query?: LinkedinStatsQuery) => Promise<void>
}

/**
 * Type callable du store statistiques.
 */
type UseStatsStore = () => StatsStore

export const useStatsStore: UseStatsStore = defineStore('stats', (): StatsStoreSetup => {
  const linkedinStats: Ref<LinkedinStats | undefined> = ref(undefined)
  const isLoading: Ref<boolean> = ref(false)

  /**
   * Charge les stats LinkedIn.
   * @param {LinkedinStatsQuery} [query] - Filtre de periode optionnel.
   * @returns {Promise<void>}
   */
  const fetchLinkedin: (query?: LinkedinStatsQuery) => Promise<void> = async (
    query?: LinkedinStatsQuery,
  ): Promise<void> => {
    isLoading.value = true
    try {
      const response: LinkedinStatsResponse = await LinkedinStatsApiService.linkedin(query)
      linkedinStats.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  return {
    linkedinStats,
    isLoading,
    fetchLinkedin,
  }
})
