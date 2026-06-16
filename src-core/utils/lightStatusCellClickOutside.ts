/**
 * Indique si un clic doit fermer le panneau de statut leger.
 * @param {HTMLElement | null} root - Conteneur du trigger.
 * @param {HTMLElement | null} panel - Panneau teleporte.
 * @param {Node | null} target - Cible du clic.
 * @returns {boolean} True si le panneau doit se fermer.
 */
export const shouldCloseLightStatusPanel: (
  root: HTMLElement | null,
  panel: HTMLElement | null,
  target: Node | null,
) => boolean = (root: HTMLElement | null, panel: HTMLElement | null, target: Node | null): boolean => {
  if (!root) return false
  if (!target) return true
  if (root.contains(target) || panel?.contains(target)) return false
  return true
}
