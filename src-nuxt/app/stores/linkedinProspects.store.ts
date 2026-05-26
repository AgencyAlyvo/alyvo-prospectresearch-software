import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { LinkedinProspectApiService } from '#src-core/services/LinkedinProspectApiService'
import type {
  CreateLinkedinProspectPayload,
  ListLinkedinProspectsQuery,
  MarkLinkedinActionPayload,
  UpdateLinkedinProspectPayload,
} from '#src-core/types/payload/linkedin.types'
import type {
  LinkedinProspectFull,
  LinkedinProspectEnrichmentResponse,
  LinkedinProspectListResponse,
  LinkedinProspectResponse,
  LinkedinProspectSummary,
  PaginationMeta,
} from '#src-core/types/response/linkedin.types'

/**
 * Store unwrap Pinia des prospects LinkedIn.
 */
type LinkedinProspectsStore = {
  prospects: LinkedinProspectSummary[]
  weekly: LinkedinProspectSummary[]
  current: LinkedinProspectFull | undefined
  filters: ListLinkedinProspectsQuery
  pagination: PaginationMeta | undefined
  isLoading: boolean
  fetchList: (query?: ListLinkedinProspectsQuery) => Promise<void>
  fetchAll: (query?: Omit<ListLinkedinProspectsQuery, 'page' | 'perPage'>) => Promise<void>
  fetchWeekly: (week?: string) => Promise<void>
  fetchOne: (id: number) => Promise<void>
  enrich: (linkedinUrl: string) => Promise<Partial<CreateLinkedinProspectPayload>>
  create: (payload: CreateLinkedinProspectPayload) => Promise<void>
  update: (id: number, payload: UpdateLinkedinProspectPayload, options?: { refreshCurrent?: boolean }) => Promise<void>
  refresh: (id: number) => Promise<void>
  destroy: (id: number) => Promise<void>
  markAction: (id: number, payload: MarkLinkedinActionPayload) => Promise<void>
  setFilters: (query: ListLinkedinProspectsQuery) => void
}

/**
 * Store setup interne des prospects LinkedIn.
 */
type LinkedinProspectsStoreSetup = {
  prospects: Ref<LinkedinProspectSummary[]>
  weekly: Ref<LinkedinProspectSummary[]>
  current: Ref<LinkedinProspectFull | undefined>
  filters: Ref<ListLinkedinProspectsQuery>
  pagination: Ref<PaginationMeta | undefined>
  isLoading: Ref<boolean>
  fetchList: (query?: ListLinkedinProspectsQuery) => Promise<void>
  fetchAll: (query?: Omit<ListLinkedinProspectsQuery, 'page' | 'perPage'>) => Promise<void>
  fetchWeekly: (week?: string) => Promise<void>
  fetchOne: (id: number) => Promise<void>
  enrich: (linkedinUrl: string) => Promise<Partial<CreateLinkedinProspectPayload>>
  create: (payload: CreateLinkedinProspectPayload) => Promise<void>
  update: (id: number, payload: UpdateLinkedinProspectPayload, options?: { refreshCurrent?: boolean }) => Promise<void>
  refresh: (id: number) => Promise<void>
  destroy: (id: number) => Promise<void>
  markAction: (id: number, payload: MarkLinkedinActionPayload) => Promise<void>
  setFilters: (query: ListLinkedinProspectsQuery) => void
}

/**
 * Type callable du store prospects.
 */
type UseLinkedinProspectsStore = () => LinkedinProspectsStore

export const useLinkedinProspectsStore: UseLinkedinProspectsStore = defineStore(
  'linkedinProspects',
  (): LinkedinProspectsStoreSetup => {
    const prospects: Ref<LinkedinProspectSummary[]> = ref([])
    const weekly: Ref<LinkedinProspectSummary[]> = ref([])
    const current: Ref<LinkedinProspectFull | undefined> = ref(undefined)
    const filters: Ref<ListLinkedinProspectsQuery> = ref({
      page: 1,
      perPage: 50,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })
    const pagination: Ref<PaginationMeta | undefined> = ref(undefined)
    const isLoading: Ref<boolean> = ref(false)

    /**
     * Injecte un prospect compact dans les listes locales.
     * @param {LinkedinProspectSummary} prospect - Prospect synchronise.
     * @returns {void}
     */
    const upsertLocal: (prospect: LinkedinProspectSummary) => void = (prospect: LinkedinProspectSummary): void => {
      prospects.value = [
        prospect,
        ...prospects.value.filter((item: LinkedinProspectSummary): boolean => item.id !== prospect.id),
      ]
      const weekList: LinkedinProspectSummary[] = weekly.value
      const existsInWeekly: boolean = weekList.some((item: LinkedinProspectSummary): boolean => item.id === prospect.id)
      weekly.value = existsInWeekly
        ? weekList.map(
            (item: LinkedinProspectSummary): LinkedinProspectSummary => (item.id === prospect.id ? prospect : item),
          )
        : weekList
    }

    /**
     * Definit les filtres courants.
     * @param {ListLinkedinProspectsQuery} query - Filtres a fusionner.
     * @returns {void}
     */
    const setFilters: (query: ListLinkedinProspectsQuery) => void = (query: ListLinkedinProspectsQuery): void => {
      filters.value = { ...filters.value, ...query }
    }

    /**
     * Charge la liste paginee.
     * @param {ListLinkedinProspectsQuery | undefined} query - Filtres optionnels.
     * @returns {Promise<void>}
     */
    const fetchList: (query?: ListLinkedinProspectsQuery) => Promise<void> = async (
      query?: ListLinkedinProspectsQuery,
    ): Promise<void> => {
      isLoading.value = true
      try {
        setFilters(query ?? {})
        const response: LinkedinProspectListResponse = await LinkedinProspectApiService.list(filters.value)
        prospects.value = response.data
        pagination.value = response.meta
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Charge tous les prospects (paginations cumulees), utile pour le calendrier d'appels.
     * @param {Omit<ListLinkedinProspectsQuery, 'page' | 'perPage'> | undefined} query - Filtres optionnels (hors pagination).
     * @returns {Promise<void>}
     */
    const fetchAll: (query?: Omit<ListLinkedinProspectsQuery, 'page' | 'perPage'>) => Promise<void> = async (
      query?: Omit<ListLinkedinProspectsQuery, 'page' | 'perPage'>,
    ): Promise<void> => {
      isLoading.value = true
      try {
        const perPage: number = 200
        const accumulated: LinkedinProspectSummary[] = []
        let page: number = 1
        let lastPage: number = 1
        let meta: PaginationMeta | undefined

        do {
          const response: LinkedinProspectListResponse = await LinkedinProspectApiService.list({
            ...(query ?? {}),
            page,
            perPage,
          })
          accumulated.push(...response.data)
          lastPage = response.meta.lastPage
          meta = response.meta
          page += 1
        } while (page <= lastPage)

        prospects.value = accumulated
        pagination.value = meta
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Charge les prospects de la semaine.
     * @param {string | undefined} week - Semaine ISO optionnelle.
     * @returns {Promise<void>}
     */
    const fetchWeekly: (week?: string) => Promise<void> = async (week?: string): Promise<void> => {
      isLoading.value = true
      try {
        const response: { data: LinkedinProspectSummary[] } | LinkedinProspectSummary[] =
          await LinkedinProspectApiService.weekly(week)
        let items: LinkedinProspectSummary[] = []
        if (Array.isArray(response)) {
          items = response
        } else if (Array.isArray(response.data)) {
          items = response.data
        }
        weekly.value = items
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Charge une fiche prospect.
     * @param {number} id - Identifiant prospect.
     * @returns {Promise<void>}
     */
    const fetchOne: (id: number) => Promise<void> = async (id: number): Promise<void> => {
      isLoading.value = true
      try {
        const response: LinkedinProspectResponse = await LinkedinProspectApiService.show(id)
        current.value = response.data
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Enrichit un prospect depuis son URL LinkedIn.
     * @param {string} linkedinUrl - URL LinkedIn a analyser.
     * @returns {Promise<Partial<CreateLinkedinProspectPayload>>} Donnees detectees.
     */
    const enrich: (linkedinUrl: string) => Promise<Partial<CreateLinkedinProspectPayload>> = async (
      linkedinUrl: string,
    ): Promise<Partial<CreateLinkedinProspectPayload>> => {
      const response: LinkedinProspectEnrichmentResponse = await LinkedinProspectApiService.enrich(linkedinUrl)
      return response.data
    }

    /**
     * Cree un prospect puis recharge la liste locale.
     * @param {CreateLinkedinProspectPayload} payload - Donnees prospect.
     * @returns {Promise<void>}
     */
    const create: (payload: CreateLinkedinProspectPayload) => Promise<void> = async (
      payload: CreateLinkedinProspectPayload,
    ): Promise<void> => {
      const response: { data: LinkedinProspectSummary } = await LinkedinProspectApiService.create(payload)
      upsertLocal(response.data)
    }

    /**
     * Met a jour un prospect.
     * @param {number} id - Identifiant prospect.
     * @param {UpdateLinkedinProspectPayload} payload - Donnees partielles.
     * @param {{ refreshCurrent?: boolean } | undefined} options - Options de synchronisation locale.
     * @param {boolean} [options.refreshCurrent] - Met a jour la fiche courante si elle correspond au prospect.
     * @returns {Promise<void>}
     */
    const update: (
      id: number,
      payload: UpdateLinkedinProspectPayload,
      options?: { refreshCurrent?: boolean },
    ) => Promise<void> = async (
      id: number,
      payload: UpdateLinkedinProspectPayload,
      options?: { refreshCurrent?: boolean },
    ): Promise<void> => {
      const response: LinkedinProspectResponse = await LinkedinProspectApiService.update(id, payload)
      upsertLocal(response.data)
      if (options?.refreshCurrent && current.value?.id === id) {
        current.value = response.data
      }
    }

    /**
     * Rafraichit un prospect depuis n8n.
     * @param {number} id - Identifiant prospect.
     * @returns {Promise<void>}
     */
    const refresh: (id: number) => Promise<void> = async (id: number): Promise<void> => {
      const response: { data: LinkedinProspectSummary } = await LinkedinProspectApiService.refresh(id)
      upsertLocal(response.data)
      if (current.value?.id === id) {
        await fetchOne(id)
      }
    }

    /**
     * Supprime un prospect localement et cote API.
     * @param {number} id - Identifiant prospect.
     * @returns {Promise<void>}
     */
    const destroy: (id: number) => Promise<void> = async (id: number): Promise<void> => {
      await LinkedinProspectApiService.destroy(id)
      prospects.value = prospects.value.filter((item: LinkedinProspectSummary): boolean => item.id !== id)
      weekly.value = weekly.value.filter((item: LinkedinProspectSummary): boolean => item.id !== id)
    }

    /**
     * Marque une action rapide.
     * @param {number} id - Identifiant prospect.
     * @param {MarkLinkedinActionPayload} payload - Action rapide.
     * @returns {Promise<void>}
     */
    const markAction: (id: number, payload: MarkLinkedinActionPayload) => Promise<void> = async (
      id: number,
      payload: MarkLinkedinActionPayload,
    ): Promise<void> => {
      const response: { data: LinkedinProspectSummary } = await LinkedinProspectApiService.markAction(id, payload)
      upsertLocal(response.data)
    }

    return {
      prospects,
      weekly,
      current,
      filters,
      pagination,
      isLoading,
      fetchList,
      fetchAll,
      fetchWeekly,
      fetchOne,
      enrich,
      create,
      update,
      refresh,
      destroy,
      markAction,
      setFilters,
    }
  },
)
