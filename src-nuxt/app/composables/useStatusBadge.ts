import {
  linkedinSelectableStatusLabels,
  linkedinStatusBadgeStyles,
  type LinkedinStatusBadgeColor,
} from '#src-core/constants/linkedinSelectableStatuses'
import { LinkedinProspectStatus } from '#src-core/types/enums/linkedin.enums'

/**
 * Configuration visuelle d'un badge de statut.
 */
export type StatusBadgeConfig = {
  label: string
  className: string
  color: LinkedinStatusBadgeColor
}

const defaultBadge: StatusBadgeConfig = {
  label: linkedinSelectableStatusLabels[LinkedinProspectStatus.A_INVITER],
  color: 'primary',
  className: 'bg-purple-700',
}

/**
 * Libelles et couleurs des statuts LinkedIn.
 * @returns {{ getStatusBadge: (status?: LinkedinProspectStatus | string | null) => StatusBadgeConfig }} Helpers de badge.
 */
export const useStatusBadge: () => {
  getStatusBadge: (status?: LinkedinProspectStatus | string | null) => StatusBadgeConfig
} = (): { getStatusBadge: (status?: LinkedinProspectStatus | string | null) => StatusBadgeConfig } => {
  /**
   * Retourne la configuration d'un statut.
   * @param {LinkedinProspectStatus | string | null | undefined} status - Statut brut.
   * @returns {StatusBadgeConfig} Configuration visuelle.
   */
  const getStatusBadge: (status?: LinkedinProspectStatus | string | null) => StatusBadgeConfig = (
    status?: LinkedinProspectStatus | string | null,
  ): StatusBadgeConfig => {
    const key: string = String(status ?? '')
    const styles: { color: LinkedinStatusBadgeColor; className: string } | undefined =
      linkedinStatusBadgeStyles[key as LinkedinProspectStatus]
    const label: string | undefined = linkedinSelectableStatusLabels[key as LinkedinProspectStatus]

    if (!styles || !label) {
      return defaultBadge
    }

    return { label, ...styles }
  }

  return { getStatusBadge }
}
