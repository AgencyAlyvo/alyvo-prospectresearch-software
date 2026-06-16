import { invoke } from '@tauri-apps/api/core'
import type { LinkedinProspectSummary, LinkedinProspectListResponse } from '#src-core/types/response/linkedin.types'
import type { ListLinkedinProspectsQuery } from '#src-core/types/payload/linkedin.types'

/**
 * Evenement de calendrier d'appels (LinkedIn).
 */
export type LinkedinCallEvent = {
  prospect: LinkedinProspectSummary
  callType: 'discovery' | 'sales'
  dateIso: string
  hasTime: boolean
  timeLabel: string
}

let cachedAvailability: boolean | undefined

/**
 * Service de cache prospects natif (Tauri/Rust) avec fallback navigateur.
 */
export class ProspectsCacheService {
  /**
   * Indique si le cache natif Tauri est disponible.
   * @returns {boolean} True si on tourne dans Tauri.
   */
  public static isAvailable(): boolean {
    if (cachedAvailability !== undefined) {
      return cachedAvailability
    }
    if (typeof window === 'undefined') {
      cachedAvailability = false
      return false
    }
    const tauriGlobal: unknown = (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__
    cachedAvailability = tauriGlobal !== undefined && tauriGlobal !== null
    return cachedAvailability
  }

  /**
   * Tente d'executer une commande Tauri en encapsulant les erreurs.
   */
  private static async tryInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T | undefined> {
    if (!this.isAvailable()) {
      return undefined
    }
    try {
      return await invoke<T>(command, args)
    } catch (error) {
      console.error(`[ProspectsCacheService] ${command} failed`, error)
      return undefined
    }
  }

  public static async linkedinSetAll(prospects: readonly LinkedinProspectSummary[]): Promise<void> {
    await this.tryInvoke<void>('linkedin_set_all', { prospects })
  }

  public static async linkedinUpsert(prospect: LinkedinProspectSummary): Promise<void> {
    await this.tryInvoke<void>('linkedin_upsert', { prospect })
  }

  public static async linkedinUpsertMany(prospects: readonly LinkedinProspectSummary[]): Promise<void> {
    await this.tryInvoke<void>('linkedin_upsert_many', { prospects })
  }

  public static async linkedinRemove(id: number): Promise<void> {
    await this.tryInvoke<void>('linkedin_remove', { id })
  }

  public static async linkedinClear(): Promise<void> {
    await this.tryInvoke<void>('linkedin_clear')
  }

  public static async linkedinCount(): Promise<number> {
    const value: number | undefined = await this.tryInvoke<number>('linkedin_count')
    return value ?? 0
  }

  public static async linkedinQuery(
    filters: ListLinkedinProspectsQuery,
  ): Promise<LinkedinProspectListResponse | undefined> {
    return await this.tryInvoke<LinkedinProspectListResponse>('linkedin_query', {
      filters: {
        search: filters.search,
        statuses: filters.status,
        isFavorite: filters.isFavorite,
        week: filters.week,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: filters.page,
        perPage: filters.perPage,
      },
    })
  }

  public static async linkedinCallsByDay(dateIso: string): Promise<LinkedinCallEvent[]> {
    const value: LinkedinCallEvent[] | undefined = await this.tryInvoke<LinkedinCallEvent[]>('linkedin_calls_by_day', {
      dateIso,
    })
    return value ?? []
  }

  public static async linkedinTasksDue(horizonDays: number, nowIso: string): Promise<LinkedinProspectSummary[]> {
    const value: LinkedinProspectSummary[] | undefined = await this.tryInvoke<LinkedinProspectSummary[]>(
      'linkedin_tasks_due',
      { horizonDays, nowIso },
    )
    return value ?? []
  }
}
