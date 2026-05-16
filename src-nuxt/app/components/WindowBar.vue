<template>
  <div class="relative flex h-9 items-center justify-between bg-black text-center select-none" data-tauri-drag-region>
    <div class="w-[96px]"></div>

    <div class="absolute left-1/2 flex h-full -translate-x-1/2 items-center justify-center" data-tauri-drag-region>
      <slot></slot>
    </div>

    <div class="flex h-full flex-shrink-0 items-center space-x-1">
      <button
        id="titlebar-minimize"
        class="titlebar-button flex h-full w-8 items-center justify-center hover:bg-gray-800"
        type="button"
        aria-label="Minimize"
        @click="btnMinimizeWindow"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#85868a"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button
        id="titlebar-close"
        class="titlebar-button ml-1 flex h-full w-8 items-center justify-center hover:bg-gray-800"
        type="button"
        aria-label="Close"
        @click="btnCloseWindow"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#85868a"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Window as TauriWindow } from '@tauri-apps/api/window'

const appWindow: TauriWindow = getCurrentWindow()

/**
 * Minimise la fenetre.
 * @returns {Promise<void>}
 */
const btnMinimizeWindow: () => Promise<void> = (): Promise<void> => appWindow.minimize()

/**
 * Cache la fenetre comme dans le launcher de reference.
 * @returns {Promise<void>}
 */
const btnCloseWindow: () => Promise<void> = (): Promise<void> => appWindow.hide()
</script>

<style scoped>
#titlebar-minimize:hover svg,
#titlebar-close:hover svg {
  stroke: #fff;
}
</style>
