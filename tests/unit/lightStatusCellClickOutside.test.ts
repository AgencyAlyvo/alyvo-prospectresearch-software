// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { shouldCloseLightStatusPanel } from '#src-core/utils/lightStatusCellClickOutside'

describe('shouldCloseLightStatusPanel', () => {
  it('ne ferme pas quand le clic est sur le trigger', () => {
    const root: HTMLDivElement = document.createElement('div')
    const button: HTMLButtonElement = document.createElement('button')
    root.appendChild(button)

    expect(shouldCloseLightStatusPanel(root, null, button)).toBe(false)
  })

  it('ne ferme pas quand le clic est sur le panneau teleporte', () => {
    const root: HTMLDivElement = document.createElement('div')
    const panel: HTMLDivElement = document.createElement('div')
    const option: HTMLButtonElement = document.createElement('button')
    panel.appendChild(option)

    expect(shouldCloseLightStatusPanel(root, panel, option)).toBe(false)
  })

  it('ferme quand le clic est en dehors du trigger et du panneau', () => {
    const root: HTMLDivElement = document.createElement('div')
    const panel: HTMLDivElement = document.createElement('div')
    const outside: HTMLDivElement = document.createElement('div')

    expect(shouldCloseLightStatusPanel(root, panel, outside)).toBe(true)
  })
})
